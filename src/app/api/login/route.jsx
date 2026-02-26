/**
 * @fileoverview API Route for user authentication.
 *
 * Handles POST /api/login. Verifies the user's credentials using bcrypt
 * and returns a signed JWT stored in an HTTP-only session cookie.
 *
 * Security measures applied here :
 * - Rate limiting per IP (10 attempts per 15 minutes)
 * - Input validation with Zod before any processing
 * - Password comparison with bcrypt (timing-safe)
 * - Generic error message that does not reveal whether the email or password was wrong
 * - Password field excluded from all responses
 * - Rate limit counter reset on successful login
 *
 * @module api/login
 * @requires next/server
 * @requires zod
 * @requires bcryptjs
 * @requires fs/promises
 * @requires path
 * @requires lib/auth
 * @requires lib/rateLimit
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import { signToken, setSessionCookie } from '@/lib/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';

/**
 * Path to the users data file.
 * @constant {string}
 */
export const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zod schema that describes what a valid login request body looks like.
 *
 * If the body does not match this shape, the route returns 400 immediately
 * without touching the database or performing any password comparison.
 *
 * @constant {z.ZodObject}
 */
const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .max(255, 'Email is too long'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password cannot be empty')
        .max(128, 'Password is too long'),
});


// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/login
 * Authenticates a user with email and password.
 * On success, sets a signed JWT in an HTTP-only session cookie.
 *
 * @async
 * @function POST
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<NextResponse>}
 *   - 200 with user data (no password field) on success
 *   - 400 if the request body is invalid
 *   - 401 if credentials are incorrect (same message for wrong email or wrong password)
 *   - 429 if the IP has exceeded the login rate limit
 *   - 500 if the data file cannot be read
 *
 * @example
 * // Request body
 * { "email": "user@example.com", "password": "mysecretpassword" }
 *
 * @example
 * // Response body (200)
 * { "id": "uuid", "firstname": "Jean", "lastname": "Dupont", "email": "user@example.com" }
 */
export async function POST(request) {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1 : Rate limiting
    // Read the client IP from the X-Forwarded-For header (set by proxies/load balancers)
    // Fall back to '127.0.0.1' in development where no proxy is present.
    // ─────────────────────────────────────────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const { allowed, remaining, resetAt } = checkRateLimit(ip);

    if (!allowed) {
        // Return 429 Too Many Requests with headers that tell the client when to retry
        return NextResponse.json(
            { message: 'Too many login attempts. Please wait before trying again.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Limit': String(10),
                    'X-RateLimit-Remaining': String(remaining),
                    'X-RateLimit-Reset': String(resetAt),
                },
            }
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2 : Parse and validate the request body
    // ─────────────────────────────────────────────────────────────────────────
    let body;
    try {
        body = await request.json();
    } catch {
        // The request body was not valid JSON at all
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Run the Zod schema against the parsed body
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
        // Format Zod errors into a consistent shape and return 400
        const errors = validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 });
    }

    // Extract the validated values (type-safe after Zod passes)
    const { email, password } = validation.data;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3 : Read the user database and find the user by email
    // ─────────────────────────────────────────────────────────────────────────
    let users;
    try {
        const dataJsonString = await fs.readFile(usersFilePath, 'utf-8');
        users = JSON.parse(dataJsonString);
    } catch {
        // Data file is missing or unreadable — server error, not a client error
        return NextResponse.json(
            { message: 'Authentication service unavailable' },
            { status: 500 }
        );
    }

    // Look up the user by email (case-insensitive comparison for usability)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4 : Verify the password
    //
    // IMPORTANT : We return the same error message whether the email is not found
    // or the password is wrong. This is intentional — different messages for each
    // case would allow an attacker to enumerate valid email addresses.
    // ─────────────────────────────────────────────────────────────────────────
    if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // bcrypt.compare is timing-safe. It takes the same amount of time regardless
    // of how similar the submitted password is to the stored hash.
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5 : Login successful
    // Create the JWT, set the session cookie, and reset the rate limit counter.
    // ─────────────────────────────────────────────────────────────────────────

    // Create a signed JWT containing only the user's ID and email
    const token = signToken({ userId: user.id, email: user.email });

    // Write the token to an HTTP-only cookie (inaccessible from JavaScript)
    await setSessionCookie(token);

    // Clear the rate limit counter for this IP — a successful login resets the window
    resetRateLimit(ip);

    // Return the user data, explicitly excluding the password field
    const { password: _excluded, ...safeUser } = user;
    return NextResponse.json(safeUser);
}
