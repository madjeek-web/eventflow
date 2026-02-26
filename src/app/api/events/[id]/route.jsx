/**
 * @fileoverview API Route pour les opérations sur un événement spécifique
 * Fournit les endpoints GET (détail) et DELETE (suppression) par ID.
 *
 * @module api/events/[id]
 * @requires next/server
 * @requires fs/promises
 * @requires api/events/route - Pour le chemin du fichier
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { eventsFilePath } from '../route';

/**
 * GET /api/events/:id
 * Récupère un événement spécifique par son ID
 *
 * @async
 * @function GET
 * @param {Request} _request - Requête HTTP entrante (non utilisée)
 * @param {Object} context - Contexte Next.js avec les paramètres de route
 * @param {Object} context.params - Paramètres de la route dynamique
 * @param {string} context.params.id - ID de l'événement à récupérer
 * @returns {Promise<NextResponse>} Événement trouvé ou erreur 404
 *
 * @example
 * // GET /api/events/abc-123
 * // Réponse 200:
 * { "id": "abc-123", "title": "Concert Jazz", ... }
 *
 * // Réponse 404:
 * { "message": "Event not found" }
 */
export async function GET(_request, { params }) {
    // Extraction de l'ID depuis les paramètres de route (Next.js 15+)
    const { id } = await params;

    // Lecture du fichier de données
    const dataJsonString = await fs.readFile(eventsFilePath, 'utf-8');
    const eventsData = JSON.parse(dataJsonString);

    // Recherche de l'événement par ID
    const founded = eventsData.find(event => event.id == id);

    // Événement non trouvé -> 404
    if (!founded) {
        return NextResponse.json(
            { message: 'Event not found' },
            { status: 404 }
        );
    }

    // Retourne l'événement trouvé
    return NextResponse.json(founded);
}

/**
 * DELETE /api/events/:id
 * Supprime un événement par son ID
 *
 * @async
 * @function DELETE
 * @param {Request} _request - Requête HTTP entrante (non utilisée)
 * @param {Object} context - Contexte Next.js avec les paramètres de route
 * @param {Object} context.params - Paramètres de la route dynamique
 * @param {string} context.params.id - ID de l'événement à supprimer
 * @returns {Promise<NextResponse>} Liste des événements restants après suppression
 *
 * @example
 * // DELETE /api/events/abc-123
 * // Réponse 200: Liste des événements restants
 */
export async function DELETE(_request, { params }) {
    // Extraction de l'ID depuis les paramètres
    const { id } = await params;

    // Lecture des événements actuels
    const dataJsonString = await fs.readFile(eventsFilePath, 'utf-8');
    const events = JSON.parse(dataJsonString);

    // Filtrage pour exclure l'événement à supprimer
    const newEvents = events.filter(event => event.id != id);

    // Sauvegarde de la liste mise à jour
    await fs.writeFile(eventsFilePath, JSON.stringify(newEvents, null, 4));

    // Retourne la liste mise à jour
    return NextResponse.json(newEvents);
}
