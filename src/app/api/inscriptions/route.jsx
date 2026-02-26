/**
 * @fileoverview API Route pour la gestion des inscriptions aux événements
 * Fournit les endpoints GET (liste) et POST (création) pour les inscriptions.
 * Une inscription représente le lien entre un utilisateur et un événement.
 *
 * @module api/inscriptions
 * @requires next/server
 * @requires uuid
 * @requires fs/promises
 * @requires path
 */

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Chemin vers le fichier JSON de stockage des inscriptions
 * @constant {string}
 */
export const inscriptionsFilePath = path.join(process.cwd(), 'src', 'data', 'inscriptions.json');

/**
 * GET /api/inscriptions
 * Récupère la liste complète des inscriptions
 *
 * @async
 * @function GET
 * @param {Request} request - Requête HTTP entrante (non utilisée)
 * @returns {Promise<NextResponse>} Réponse JSON contenant le tableau d'inscriptions
 *
 * @example
 * // Réponse type
 * [
 *   {
 *     "id": "insc-123",
 *     "user": "user-456",
 *     "event": "event-789"
 *   }
 * ]
 */
export async function GET(request) {
    // Lecture du fichier JSON de données
    const dataJsonString = await fs.readFile(inscriptionsFilePath, 'utf-8');

    // Parse des données JSON
    const inscriptions = JSON.parse(dataJsonString);

    // Retourne la liste complète des inscriptions
    return NextResponse.json(inscriptions);
}

/**
 * POST /api/inscriptions
 * Crée une nouvelle inscription (utilisateur -> événement)
 * Vérifie les doublons pour éviter les inscriptions multiples
 *
 * @async
 * @function POST
 * @param {Request} request - Requête HTTP avec le body JSON
 * @returns {Promise<NextResponse>} Inscription créée (201) ou erreur doublon (409)
 *
 * @example
 * // Body de la requête
 * {
 *   "user": "user-456",
 *   "event": "event-789"
 * }
 *
 * @example
 * // Réponse succès (201 implicite via 200)
 * {
 *   "id": "generated-uuid",
 *   "user": "user-456",
 *   "event": "event-789"
 * }
 *
 * @example
 * // Réponse erreur doublon (409)
 * { "message": "Inscription already exists" }
 */
export async function POST(request) {
    // Lecture des inscriptions existantes
    const dataJsonString = await fs.readFile(inscriptionsFilePath, 'utf-8');
    const inscriptions = JSON.parse(dataJsonString);

    // Extraction du body de la requête
    const newInscription = await request.json();

    // ─────────────────────────────────────────────────────────
    // VÉRIFICATION DE DOUBLON
    // Un utilisateur ne peut s'inscrire qu'une fois à un événement
    // ─────────────────────────────────────────────────────────
    const existing = inscriptions.find(inscription =>
        inscription.user == newInscription.user &&
        inscription.event == newInscription.event
    );

    // Si doublon détecté -> erreur 409 Conflict
    if (existing) {
        return NextResponse.json(
            { message: 'Inscription already exists' },
            { status: 409 }
        );
    }

    // ─────────────────────────────────────────────────────────
    // CRÉATION DE L'INSCRIPTION
    // ─────────────────────────────────────────────────────────

    // Génération d'un ID unique
    newInscription.id = uuidv4();

    // Ajout à la liste
    inscriptions.push(newInscription);

    // Sauvegarde dans le fichier JSON
    await fs.writeFile(inscriptionsFilePath, JSON.stringify(inscriptions, null, 4));

    // Retourne l'inscription créée
    return NextResponse.json(newInscription);
}
