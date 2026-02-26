/**
 * @fileoverview Next.js Middleware for route protection.
 *
 * This middleware runs on the server before any page or API route handler.
 * Its job is simple : check whether the incoming request has a valid session,
 * and redirect to the login page if it does not.
 *
 * Why middleware instead of checking inside each route ?
 *
 * If authentication were checked inside each protected route, it would be easy
 * to forget to add the check to a new route. Middleware is applied automatically
 * based on the URL pattern, so any new protected route is covered without
 * any additional code.
 *
 * How it works :
 * 1. The request URL is matched against the patterns in the `config` export.
 * 2. If the URL is public (login page, public API endpoints), the request
 *    passes through immediately.
 * 3. Otherwise, the middleware reads the session cookie and verifies the JWT.
 * 4. If the token is valid, the request proceeds.
 * 5. If the token is missing or invalid, the browser is redirected to /login.
 *
 * @module middleware
 * @requires next/server
 * @requires lib/auth
 */

import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifyToken } from '@/lib/auth';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// These routes are accessible without a session.
// Everything else requires a valid JWT cookie.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List of URL paths that do not require authentication.
 *
 * The check uses `startsWith` so that sub-paths are also covered.
 * For example, '/login' covers '/login' and '/login?redirect=...'
 *
 * @constant {string[]}
 */
const PUBLIC_PATHS = [
    '/',              // Home page (event listing is public)
    '/login',         // Login page
    '/mentions-legales',
    '/api/login',     // Login API endpoint
    '/api/logout',    // Logout must be accessible to clear the cookie
    '/api/events',    // Reading events is public
    '/api/categories',// Reading categories is public
    '/api/contact',   // Contact form is public
    '/api/users',     // User registration is public (POST without auth)
    '/_next',         // Next.js internal assets
    '/favicon.ico',
    '/events/',       // Individual event pages are public to read
];

/**
 * Determines whether a given path is public (no auth required).
 *
 * @param {string} pathname - The URL pathname to check
 * @returns {boolean} true if the path is public
 */
function isPublicPath(pathname) {
    return PUBLIC_PATHS.some(publicPath => pathname.startsWith(publicPath));
}


// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Next.js Middleware function. Called automatically on every matched request.
 *
 * @function middleware
 * @param {import('next/server').NextRequest} request - The incoming request object
 * @returns {NextResponse} Either NextResponse.next() to proceed, or a redirect response
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1 : If this is a public path, let the request through immediately.
    // ─────────────────────────────────────────────────────────────────────────
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2 : Read the session cookie from the request headers.
    // ─────────────────────────────────────────────────────────────────────────
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    // No cookie at all — user is definitely not logged in
    if (!sessionCookie) {
        return redirectToLogin(request);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3 : Verify the JWT inside the cookie.
    // ─────────────────────────────────────────────────────────────────────────
    const payload = verifyToken(sessionCookie.value);

    // Token is invalid or expired — treat the same as no session
    if (!payload) {
        return redirectToLogin(request);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4 : Session is valid. Pass the request through.
    // Optionally forward user identity in a custom header for use in API routes.
    // ─────────────────────────────────────────────────────────────────────────
    const response = NextResponse.next();
    // Make the userId available to route handlers without them re-verifying the token
    response.headers.set('x-user-id', payload.userId);
    return response;
}

/**
 * Builds a redirect response pointing to the login page.
 * Preserves the original URL in a `redirect` query parameter so the login
 * page can send the user back to where they were after successful login.
 *
 * @param {import('next/server').NextRequest} request - The original request
 * @returns {NextResponse} A redirect response to /login
 */
function redirectToLogin(request) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}


// ─────────────────────────────────────────────────────────────────────────────
// MATCHER CONFIG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configures which URLs this middleware runs on.
 *
 * The negative lookahead excludes Next.js static files, images, and
 * the favicon from middleware processing. These never need authentication.
 *
 * @see https://nextjs.org/docs/app/building-with-nextjs/routing/middleware
 */
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
