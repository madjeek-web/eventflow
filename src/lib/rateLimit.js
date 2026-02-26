/**
 * @fileoverview In-memory rate limiter for the login endpoint.
 *
 * Rate limiting prevents brute-force attacks by limiting how many times
 * a single IP address can attempt to log in within a given time window.
 *
 * How it works :
 * - A Map stores one entry per IP address.
 * - Each entry tracks the request count and the time when the window started.
 * - When a request comes in, the entry is checked. If the window has expired,
 *   the count is reset. If the count exceeds the maximum, the request is blocked.
 *
 * Limitation :
 * - The Map lives in server memory. If the process restarts, all rate limit
 *   counters reset. If the application runs on multiple instances (clustered
 *   deployment), each instance has its own independent Map and they do not
 *   share state. For multi-instance deployments, replace the Map with a
 *   shared Redis store.
 *
 * @module lib/rateLimit
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The time window in milliseconds during which requests are counted.
 * Reads from RATE_LIMIT_WINDOW_MS environment variable.
 * Default : 900000 (15 minutes).
 * @constant {number}
 */
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

/**
 * Maximum number of requests allowed per IP per window.
 * Reads from RATE_LIMIT_MAX environment variable.
 * Default : 10.
 * @constant {number}
 */
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);


// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In-memory store mapping IP addresses to their request records.
 *
 * Each value is an object with :
 * - count : number of requests made in the current window
 * - windowStart : timestamp (ms) when the current window started
 *
 * @type {Map<string, { count: number, windowStart: number }>}
 */
const store = new Map();


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether a given IP address has exceeded the rate limit.
 *
 * Increments the request count for the IP and returns an object describing
 * whether the request is allowed and how many attempts remain.
 *
 * @function checkRateLimit
 * @param {string} ip - The IP address of the requester (e.g. '192.168.1.1')
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }} Rate limit status
 *
 * @property {boolean} allowed - true if the request is within the allowed limit
 * @property {number} remaining - How many more requests are allowed in this window
 * @property {number} resetAt - Unix timestamp (ms) when the window will reset
 *
 * @example
 * const { allowed, remaining } = checkRateLimit('192.168.1.1');
 *
 * if (!allowed) {
 *     return NextResponse.json(
 *         { message: 'Too many attempts. Please wait before trying again.' },
 *         { status: 429 }
 *     );
 * }
 */
export function checkRateLimit(ip) {
    const now = Date.now();

    // Retrieve the existing record for this IP, or undefined if this is the first request
    const record = store.get(ip);

    // ─────────────────────────────────────────────────────────────────────────
    // Case 1 : No existing record, or the window has expired.
    // Start a fresh window for this IP.
    // ─────────────────────────────────────────────────────────────────────────
    if (!record || now - record.windowStart > WINDOW_MS) {
        store.set(ip, { count: 1, windowStart: now });
        return {
            allowed: true,
            remaining: MAX_REQUESTS - 1,
            resetAt: now + WINDOW_MS,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Case 2 : Active window, increment the count.
    // ─────────────────────────────────────────────────────────────────────────
    record.count += 1;
    store.set(ip, record);

    const remaining = Math.max(0, MAX_REQUESTS - record.count);
    const resetAt = record.windowStart + WINDOW_MS;

    if (record.count > MAX_REQUESTS) {
        // Request count exceeds the limit — block this request
        return { allowed: false, remaining: 0, resetAt };
    }

    return { allowed: true, remaining, resetAt };
}

/**
 * Resets the rate limit counter for a given IP address.
 *
 * This can be called after a successful login to give the user a clean slate,
 * preventing lockout for legitimate users who may have made typos.
 *
 * @function resetRateLimit
 * @param {string} ip - The IP address to reset
 * @returns {void}
 *
 * @example
 * // After a successful login, clear the counter for this IP
 * resetRateLimit('192.168.1.1');
 */
export function resetRateLimit(ip) {
    store.delete(ip);
}
