/**
 * @fileoverview API Route for user logout.
 *
 * Handles POST /api/logout. Clears the session cookie by setting it to an
 * empty value with MaxAge=0, which instructs the browser to delete it immediately.
 *
 * Why a dedicated endpoint instead of just clearing a localStorage value ?
 * Because the session token is stored in an HTTP-only cookie. JavaScript cannot
 * access or delete HTTP-only cookies. The server must explicitly clear it.
 *
 * @module api/logout
 * @requires next/server
 * @requires lib/auth
 */

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/**
 * POST /api/logout
 * Clears the session cookie and ends the user's session.
 *
 * @async
 * @function POST
 * @returns {Promise<NextResponse>} 200 with a confirmation message
 *
 * @example
 * // No request body needed
 * await fetch('/api/logout', { method: 'POST' });
 */
export async function POST() {
    // Clear the session cookie server-side
    await clearSessionCookie();

    return NextResponse.json({ message: 'Logged out successfully' });
}
