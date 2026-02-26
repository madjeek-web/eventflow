/**
 * @fileoverview API Route for event collection operations.
 *
 * Provides :
 * - GET /api/events  — returns the full list of events (public, no auth required)
 * - POST /api/events — creates a new event (requires authentication)
 *
 * @module api/events
 * @requires next/server
 * @requires uuid
 * @requires zod
 * @requires fs/promises
 * @requires path
 * @requires lib/auth
 */

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { getSessionFromCookie } from '@/lib/auth';

/**
 * Path to the events data file.
 * @constant {string}
 */
export const eventsFilePath = path.join(process.cwd(), 'src', 'data', 'events.json');

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zod schema for a new event request body.
 * All fields are validated for type, presence, and length before any write occurs.
 *
 * @constant {z.ZodObject}
 */
const createEventSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must not exceed 100 characters')
        .trim(),

    description: z
        .string({ required_error: 'Description is required' })
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must not exceed 1000 characters')
        .trim(),

    date: z
        .string({ required_error: 'Date is required' })
        // Validates YYYY-MM-DD format
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

    time: z
        .string({ required_error: 'Time is required' })
        // Validates HH:MM format
        .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),

    location: z
        .string({ required_error: 'Location is required' })
        .min(5, 'Location must be at least 5 characters')
        .max(200, 'Location must not exceed 200 characters')
        .trim(),

    category: z
        .number({ required_error: 'Category is required' })
        .int('Category must be a whole number')
        .positive('Category must be a positive number'),

    maxParticipants: z
        .number({ required_error: 'Maximum participants is required' })
        .int('Maximum participants must be a whole number')
        .min(1, 'At least 1 participant is required')
        .max(10000, 'Maximum participants cannot exceed 10000'),

    image: z
        .string()
        .max(500, 'Image path is too long')
        .optional(),
});


// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/events
 * Returns the full list of events.
 * This endpoint is public — no authentication required.
 *
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} Array of event objects (200) or server error (500)
 *
 * @example
 * // Response type
 * [
 *   {
 *     "id": "uuid",
 *     "title": "Workshop on pottery",
 *     "category": 1,
 *     "date": "2026-03-15",
 *     "time": "14:00",
 *     "location": "The Ceramics Studio, Paris",
 *     "description": "...",
 *     "maxParticipants": 12,
 *     "image": "/events/poterie.jpg"
 *   }
 * ]
 */
export async function GET() {
    try {
        // Read the data file and parse it
        const dataJsonString = await fs.readFile(eventsFilePath, 'utf-8');
        const events = JSON.parse(dataJsonString);

        return NextResponse.json(events);
    } catch {
        // Return a generic error — do not expose the file path or system details
        return NextResponse.json(
            { message: 'Could not load events' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/events
 * Creates a new event with a generated UUID.
 * Requires a valid session cookie.
 *
 * @async
 * @function POST
 * @param {Request} request - The incoming HTTP request with event data in the body
 * @returns {Promise<NextResponse>}
 *   - 201 with the new event on success
 *   - 400 if validation fails
 *   - 401 if not authenticated
 *   - 500 if the data file cannot be read or written
 *
 * @example
 * // Request body
 * {
 *   "title": "Acoustic Concert",
 *   "description": "An intimate evening with local artists.",
 *   "date": "2026-06-20",
 *   "time": "20:00",
 *   "location": "Le Petit Théâtre, Nantes",
 *   "category": 2,
 *   "maxParticipants": 50
 * }
 *
 * @example
 * // Response body (201)
 * { "id": "generated-uuid", "title": "Acoustic Concert", ... }
 */
export async function POST(request) {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1 : Verify authentication
    // The middleware handles route-level protection, but we also check here
    // for API requests that bypass the middleware (e.g. direct API calls from
    // external clients that do not go through the Next.js frontend).
    // ─────────────────────────────────────────────────────────────────────────
    const session = await getSessionFromCookie();

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2 : Parse and validate the request body
    // ─────────────────────────────────────────────────────────────────────────
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
        const errors = validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3 : Read, update, and write the events file
    // ─────────────────────────────────────────────────────────────────────────
    try {
        const dataJsonString = await fs.readFile(eventsFilePath, 'utf-8');
        const events = JSON.parse(dataJsonString);

        // Build the new event object from the validated body and a fresh UUID
        const newEvent = {
            ...validation.data,    // Use the validated (and trimmed) data, not the raw body
            id: uuidv4(),          // Generate a unique identifier for this event
        };

        // Append to the list and persist
        events.push(newEvent);
        await fs.writeFile(eventsFilePath, JSON.stringify(events, null, 4));

        // Return 201 Created with the new event
        return NextResponse.json(newEvent, { status: 201 });
    } catch {
        return NextResponse.json(
            { message: 'Could not save the event' },
            { status: 500 }
        );
    }
}
