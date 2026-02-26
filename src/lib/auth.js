/**
 * @fileoverview Authentication utilities for JWT creation, verification, and cookie management.
 *
 * This module is the single source of truth for all token-related operations.
 * Every function that needs to sign a token, verify a token, or touch the session
 * cookie imports from here. This means if the token strategy ever changes, only
 * this file needs to be updated.
 *
 * @module lib/auth
 * @requires jsonwebtoken
 * @requires next/headers
 */

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The name of the HTTP-only cookie that stores the session token.
 * Using a constant prevents typos when reading and writing the cookie.
 * @constant {string}
 */
export const SESSION_COOKIE_NAME = 'eventflow_session';

/**
 * The secret key used to sign and verify JWT tokens.
 * Read from the JWT_SECRET environment variable.
 * The application throws at startup if this variable is not set.
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    // This error is intentionally thrown at module load time, not at request time.
    // It means the application will refuse to start without a secret,
    // rather than silently using an undefined key and creating invalid tokens.
    throw new Error('JWT_SECRET environment variable is not set. See .env.example for setup instructions.');
}

/**
 * How long a token remains valid after it is created.
 * Reads from JWT_EXPIRES_IN environment variable, defaults to 7 days.
 * @constant {string}
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


// ─────────────────────────────────────────────────────────────────────────────
// TOKEN OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a signed JWT token containing the user's ID and email.
 *
 * The token payload is minimal : only the data needed to identify the user
 * on subsequent requests. Sensitive data (password, full profile) is never
 * included in the token.
 *
 * @function signToken
 * @param {Object} payload - Data to embed in the token
 * @param {string} payload.userId - The user's unique identifier
 * @param {string} payload.email - The user's email address
 * @returns {string} The signed JWT string
 *
 * @example
 * const token = signToken({ userId: 'abc-123', email: 'user@example.com' });
 */
export function signToken({ userId, email }) {
    return jwt.sign(
        { userId, email },   // Payload embedded in the token
        JWT_SECRET,          // Secret used to sign the payload
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verifies a JWT token string and returns its decoded payload.
 *
 * This function checks both the signature (was this token created with our secret ?)
 * and the expiry (has the token expired ?). If either check fails, it returns null
 * instead of throwing, so callers can handle the invalid state gracefully.
 *
 * @function verifyToken
 * @param {string} token - The JWT string to verify
 * @returns {Object|null} The decoded payload if valid, or null if invalid/expired
 *
 * @example
 * const payload = verifyToken(tokenString);
 * if (!payload) {
 *     // Token is invalid or expired — redirect to login
 * }
 * console.log(payload.userId); // The ID embedded when the token was created
 */
export function verifyToken(token) {
    try {
        // jwt.verify throws if the token is invalid, expired, or tampered with.
        // We catch all errors and return null to give callers a clean boolean-like result.
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// COOKIE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sets the session cookie with the given token.
 *
 * The cookie is configured with security flags that make it safe to use as
 * a session mechanism :
 * - httpOnly: JavaScript cannot read or modify this cookie
 * - secure: the cookie is only sent over HTTPS (enabled in production)
 * - sameSite: the cookie is not sent with cross-site requests (CSRF protection)
 * - path: the cookie is sent with every request to this domain
 * - maxAge: the browser will delete the cookie when it expires
 *
 * @async
 * @function setSessionCookie
 * @param {string} token - The signed JWT string to store
 * @returns {Promise<void>}
 *
 * @example
 * const token = signToken({ userId: user.id, email: user.email });
 * await setSessionCookie(token);
 */
export async function setSessionCookie(token) {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    // Parse the expiry string (e.g. "7d") into a number of seconds for the MaxAge flag.
    const maxAgeSeconds = parseExpiryToSeconds(JWT_EXPIRES_IN);

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,                // Not accessible from JavaScript
        secure: isProduction,          // HTTPS only in production
        sameSite: 'strict',            // No cross-site requests
        path: '/',                     // Available on all routes
        maxAge: maxAgeSeconds,
    });
}

/**
 * Reads and verifies the session cookie from the current request.
 *
 * Returns the decoded JWT payload if the cookie is present and the token is valid.
 * Returns null in all other cases (no cookie, invalid token, expired token).
 *
 * @async
 * @function getSessionFromCookie
 * @returns {Promise<Object|null>} Decoded payload or null
 *
 * @example
 * const session = await getSessionFromCookie();
 * if (!session) {
 *     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
 * }
 * const { userId } = session;
 */
export async function getSessionFromCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);

    // No cookie present — user is not logged in
    if (!cookie) return null;

    // Cookie present — verify the token inside it
    return verifyToken(cookie.value);
}

/**
 * Deletes the session cookie, effectively logging the user out.
 *
 * Setting maxAge to 0 tells the browser to delete the cookie immediately.
 * This is the correct way to log out in a cookie-based session system :
 * the server instructs the browser to discard the token, rather than just
 * removing it from client state.
 *
 * @async
 * @function clearSessionCookie
 * @returns {Promise<void>}
 */
export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,  // Instructs the browser to delete the cookie immediately
    });
}


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a JWT expiry string (e.g. "7d", "24h", "60m") to a number of seconds.
 * Used to set the MaxAge attribute on the session cookie.
 *
 * @function parseExpiryToSeconds
 * @param {string} expiry - Expiry string in the format used by jsonwebtoken
 * @returns {number} Number of seconds
 *
 * @example
 * parseExpiryToSeconds('7d')  // -> 604800
 * parseExpiryToSeconds('24h') // -> 86400
 * parseExpiryToSeconds('30m') // -> 1800
 */
function parseExpiryToSeconds(expiry) {
    const unit = expiry.slice(-1);       // Last character : 'd', 'h', 'm', 's'
    const value = parseInt(expiry, 10);  // Numeric part

    const multipliers = { d: 86400, h: 3600, m: 60, s: 1 };
    return value * (multipliers[unit] || 86400);  // Default to days if unit is unknown
}
