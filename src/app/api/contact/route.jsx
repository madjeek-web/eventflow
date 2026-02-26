/**
 * @fileoverview API Route pour la gestion des messages de contact
 * Fournit les endpoints GET (liste) et POST (création) pour les messages.
 *
 * @module api/contact
 * @requires next/server
 * @requires fs/promises
 * @requires path
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Chemin vers le fichier JSON de stockage des messages
 * @constant {string}
 */
export const contactFilePath = path.join(process.cwd(), 'src', 'data', 'contacts.json');

/**
 * Génère un identifiant unique pour un message
 * Format : contact-{timestamp}-{random}
 *
 * @function generateId
 * @returns {string} ID unique
 */
const generateId = () => {
    return `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Lit les messages depuis le fichier JSON
 * Crée le fichier s'il n'existe pas
 *
 * @async
 * @function readContacts
 * @returns {Promise<Array>} Liste des messages
 */
const readContacts = async () => {
    try {
        const data = await fs.readFile(contactFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si le fichier n'existe pas, retourner un tableau vide
        if (error.code === 'ENOENT') {
            await fs.writeFile(contactFilePath, '[]');
            return [];
        }
        throw error;
    }
};

/**
 * GET /api/contact
 * Récupère tous les messages de contact
 *
 * @async
 * @function GET
 * @param {Request} _request - Requête HTTP (non utilisée)
 * @returns {Promise<NextResponse>} Liste des messages de contact
 *
 * @example
 * // GET /api/contact
 * // Réponse 200:
 * [
 *   { "id": "contact-123", "name": "Jean", "email": "...", "subject": "...", "message": "...", "createdAt": "..." },
 *   ...
 * ]
 */
export async function GET(_request) {
    try {
        const contacts = await readContacts();
        return NextResponse.json(contacts);
    } catch (error) {
        return NextResponse.json(
            { message: 'Erreur lors de la lecture des messages' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/contact
 * Crée un nouveau message de contact
 *
 * @async
 * @function POST
 * @param {Request} request - Requête HTTP avec les données du message
 * @returns {Promise<NextResponse>} Message créé (201) ou erreur (400/500)
 *
 * @example
 * // Body de la requête
 * {
 *   "name": "Jean Dupont",
 *   "email": "jean@example.com",
 *   "subject": "Question sur un événement",
 *   "message": "Bonjour, j'aimerais savoir..."
 * }
 *
 * @example
 * // Réponse succès (201)
 * {
 *   "id": "contact-1702...",
 *   "name": "Jean Dupont",
 *   "email": "jean@example.com",
 *   "subject": "Question sur un événement",
 *   "message": "Bonjour, j'aimerais savoir...",
 *   "createdAt": "2024-12-12T10:30:00.000Z",
 *   "status": "new"
 * }
 */
export async function POST(request) {
    try {
        // Extraction des données du body
        const body = await request.json();
        const { name, email, subject, message } = body;

        // ==================== VALIDATION ====================
        const errors = [];

        if (!name || name.trim().length < 2) {
            errors.push('Le nom est requis (min 2 caractères)');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Email invalide');
        }

        if (!subject || subject.trim().length < 5) {
            errors.push('Le sujet est requis (min 5 caractères)');
        }

        if (!message || message.trim().length < 20) {
            errors.push('Le message est requis (min 20 caractères)');
        }

        if (message && message.length > 2000) {
            errors.push('Le message ne peut pas dépasser 2000 caractères');
        }

        // Si erreurs de validation, retourner 400
        if (errors.length > 0) {
            return NextResponse.json(
                { message: 'Données invalides', errors },
                { status: 400 }
            );
        }

        // ==================== CRÉATION DU MESSAGE ====================
        const contacts = await readContacts();

        // Création du nouveau message avec métadonnées
        const newContact = {
            id: generateId(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            createdAt: new Date().toISOString(),
            status: 'new', // new, read, replied, archived
        };

        // Ajout au début de la liste (plus récent en premier)
        contacts.unshift(newContact);

        // Sauvegarde dans le fichier
        await fs.writeFile(contactFilePath, JSON.stringify(contacts, null, 4));


        // TODO: send a mail
        

        // Retourne le message créé avec status 201
        return NextResponse.json(newContact, { status: 201 });

    } catch (error) {
        console.error('Erreur création contact:', error);
        return NextResponse.json(
            { message: 'Erreur lors de l\'envoi du message' },
            { status: 500 }
        );
    }
}
