'use client';

/**
 * @fileoverview Composant carte d'événement pour affichage en grille
 * Affiche un aperçu complet d'un événement avec image, catégorie,
 * description et métadonnées (lieu, date, participants).
 *
 * @module components/EventCard
 * @requires next/image - Optimisation des images
 * @requires next/link - Navigation côté client
 * @requires hooks/useEvent - Données de l'événement
 * @requires hooks/useCategory - Données de la catégorie
 * @requires hooks/useInscription - Comptage des participants
 */

import { useCategories } from "@/hooks/useCategory";
import { useEvent } from "@/hooks/useEvent";
import { useInscriptions } from "@/hooks/useInscription";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Carte d'événement - Affichage complet pour grilles et listes
 *
 * Affiche :
 * - Image de couverture (ou placeholder)
 * - Badge catégorie coloré
 * - Titre et description (tronqués)
 * - Lieu, date/heure
 * - Nombre de participants / maximum
 * - Bouton "Voir l'événement"
 *
 * @function EventCard
 * @param {Object} props - Props du composant
 * @param {string|number} props.id - ID de l'événement à afficher
 * @returns {JSX.Element|null} Carte d'événement ou null si non trouvé
 *
 * @example
 * // Affichage simple
 * <EventCard id="event-123" />
 *
 * @example
 * // Dans une grille
 * <div className="grid grid-cols-3 gap-4">
 *   {events.map(e => <EventCard key={e.id} id={e.id} />)}
 * </div>
 */
export default function EventCard({ id }) {
    // ==================== HOOKS ====================
    // Récupération des données de l'événement par ID
    const { event, isLoading, error } = useEvent(id);

    // Accès à la fonction de recherche de catégorie
    const { getCategory } = useCategories();

    // Accès aux inscriptions pour compter les participants
    const { getInscriptionByEvent } = useInscriptions();

    // Récupération des inscriptions pour cet événement (O(1) avec index)
    const inscriptions = getInscriptionByEvent(id);

    // ==================== ÉTATS DE CHARGEMENT ====================

    // Affichage du squelette pendant le chargement
    if (isLoading) {
        return (
            <Card className="overflow-hidden py-0 gap-0">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                </CardContent>
            </Card>
        );
    }

    // Affichage de l'erreur si échec du chargement
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>Erreur: {error.message}</AlertDescription>
            </Alert>
        );
    }

    // Pas d'affichage si événement non trouvé
    if (!event) return null;

    // ==================== DONNÉES DÉRIVÉES ====================
    // Récupération de la catégorie pour le badge coloré
    const category = getCategory(event.category);

    // ==================== RENDU JSX ====================
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full py-0 gap-0">
            {/* ==================== IMAGE / HEADER ==================== */}
            <div className="relative h-48 w-full flex-shrink-0">
                {/* Image de l'événement ou placeholder si absente */}
                {event.image ? (
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    /* Placeholder gradient avec icône image */
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Badge catégorie - positionné en haut à gauche */}
                <Badge
                    className="absolute top-3 left-3 text-white"
                    style={{ backgroundColor: category ? category.color : "#000000" }}
                >
                    {category ? category.name : ""}
                </Badge>
            </div>

            {/* ==================== CONTENU ==================== */}
            <CardContent className="p-5 flex flex-col flex-1">
                {/* Titre de l'événement - tronqué à 1 ligne */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {event.title}
                </h2>

                {/* Description - tronquée à 2 lignes */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>

                {/* ==================== MÉTADONNÉES ==================== */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                    {/* Lieu */}
                    <div className="flex items-center gap-2">
                        {/* Icône localisation */}
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{event.location}</span>
                    </div>

                    {/* Date et heure */}
                    <div className="flex items-center gap-2">
                        {/* Icône calendrier */}
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{event.date} à {event.time}</span>
                    </div>

                    {/* Compteur de participants */}
                    <div className="flex items-center gap-2">
                        {/* Icône groupe */}
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{inscriptions.length} / {event.maxParticipants} participants</span>
                    </div>
                </div>

                {/* ==================== BOUTON CTA ==================== */}
                {/* mt-auto pousse le bouton vers le bas pour aligner les cartes */}
                <div className="mt-auto">
                    <Button asChild className="w-full">
                        <Link href={`/events/${event.id}`}>
                            Voir l&apos;événement
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
