'use client';

/**
 * @fileoverview Composant ligne d'événement pour affichage compact
 * Version minimaliste d'EventCard pour les listes et sidebars.
 *
 * @module components/EventLine
 * @requires next/image - Optimisation des images
 * @requires next/link - Navigation côté client
 * @requires date-fns - Formatage de dates
 * @requires hooks/useEvent - Données de l'événement
 */

import { useEvent } from "@/hooks/useEvent";
import Image from "next/image";
import Link from "next/link";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Ligne d'événement - Affichage compact pour listes
 *
 * Affiche sur une seule ligne :
 * - Miniature 48x48 (ou placeholder)
 * - Titre de l'événement
 * - Date formatée en français
 * - Lieu
 *
 * Idéal pour :
 * - Sidebars "Événements similaires"
 * - Listes "Mes inscriptions"
 * - Résultats de recherche compacts
 *
 * @function EventLine
 * @param {Object} props - Props du composant
 * @param {string|number} props.id - ID de l'événement à afficher
 * @returns {JSX.Element|null} Ligne d'événement cliquable ou null si non trouvé
 *
 * @example
 * // Affichage simple
 * <EventLine id="event-123" />
 *
 * @example
 * // Liste d'événements
 * <ul className="divide-y">
 *   {eventIds.map(id => (
 *     <li key={id}><EventLine id={id} /></li>
 *   ))}
 * </ul>
 */
export default function EventLine({ id }) {
    // ==================== HOOKS ====================
    // Récupération des données de l'événement par ID
    const { event, isLoading, error } = useEvent(id);

    // ==================== ÉTATS DE CHARGEMENT ====================

    // Squelette de chargement - version compacte
    if (isLoading) {
        return (
            <div className="flex items-center gap-3 p-2 animate-pulse">
                {/* Placeholder miniature */}
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                {/* Placeholder texte */}
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    // Message d'erreur compact
    if (error) {
        return <div className="text-red-500 text-sm p-2">Erreur: {error.message}</div>;
    }

    // Pas d'affichage si événement non trouvé
    if (!event) return null;

    // ==================== RENDU JSX ====================
    return (
        <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
            {/* ==================== MINIATURE ==================== */}
            {/* Image carrée 48x48 avec coins arrondis */}
            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                {event.image ? (
                    /* Image de l'événement optimisée */
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                ) : (
                    /* Placeholder si pas d'image */
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        {/* Icône image miniature */}
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ==================== INFORMATIONS ==================== */}
            {/* min-w-0 permet au texte de se tronquer correctement */}
            <div className="flex-1 min-w-0">
                {/* Ligne 1 : Titre + Date */}
                <div className="flex justify-between items-start gap-2">
                    {/* Titre tronqué si trop long */}
                    <span className="text-gray-900 font-medium truncate">{event.title}</span>
                    {/* Date formatée en français (ex: "15 janv. 2025 à 14:00") */}
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                        {format(new Date(`${event.date} ${event.time}`), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                </div>

                {/* Ligne 2 : Lieu tronqué */}
                <div className="text-gray-500 text-sm truncate">{event.location}</div>
            </div>
        </Link>
    );
}
