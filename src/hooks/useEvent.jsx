'use client';

/**
 * @fileoverview Hooks personnalisés pour la gestion des événements
 * Ce module fournit des utilitaires React pour accéder, filtrer et rechercher des événements.
 * Il utilise le pattern Context + Hooks pour un state management efficace.
 *
 * @module hooks/useEvent
 * @requires react
 * @requires contexts/EventsContext
 */

import { useContext, useMemo, useState } from "react";
import { EventsContext } from "../contexts/EventsContext";

/**
 * Hook principal pour accéder au context des événements.
 * C'est le point d'entrée pour toutes les opérations sur les événements.
 *
 * @function useEvents
 * @returns {Object} Context des événements avec toutes les données et méthodes
 * @returns {Array<Object>} returns.events - Liste complète des événements
 * @returns {boolean} returns.isLoading - true pendant le chargement initial des données
 * @returns {Error|null} returns.error - Erreur de chargement ou null si succès
 * @returns {Function} returns.getEvent - Récupère un événement par ID (déprécié, utiliser useEvent)
 * @returns {Function} returns.addEvent - Crée un nouvel événement (async)
 * @returns {Function} returns.removeEvent - Supprime un événement par ID (async)
 *
 * @example
 * // Utilisation basique
 * const { events, isLoading } = useEvents();
 *
 * @example
 * // Création d'un événement
 * const { addEvent } = useEvents();
 * await addEvent({ title: 'Mon événement', date: '2025-01-15', ... });
 */
export const useEvents = () => useContext(EventsContext);

/**
 * Hook optimisé pour récupérer un événement spécifique par son ID.
 * Utilise useMemo pour éviter les re-renders inutiles lors des changements de state parent.
 *
 * @function useEvent
 * @param {string} id - ID unique de l'événement à récupérer (UUID)
 * @returns {Object} État de l'événement
 * @returns {Object|null} returns.event - L'événement trouvé ou null si non trouvé
 * @returns {boolean} returns.isLoading - true pendant le chargement initial
 * @returns {Error|null} returns.error - Erreur de chargement ou null
 *
 * @example
 * // Dans un composant de détail d'événement
 * function EventDetail({ eventId }) {
 *   const { event, isLoading, error } = useEvent(eventId);
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!event) return <NotFound />;
 *
 *   return <div>{event.title}</div>;
 * }
 */
export const useEvent = (id) => {
    // Récupération des données du context parent
    const { events, isLoading, error } = useEvents();

    // Recherche memoïsée - ne recalcule que si events ou id changent
    // Complexité : O(n) où n = nombre d'événements
    const event = useMemo(() => {
        // Guard clause : pas d'ID ou pas d'événements chargés
        if (!id || !events) return null;

        // Conversion en string pour gérer les IDs numériques et string
        return events.find(e => String(e.id) === String(id)) || null;
    }, [events, id]);

    return { event, isLoading, error };
};

/**
 * Hook avancé pour filtrer et rechercher des événements.
 * Combine plusieurs filtres (catégorie, texte, date) avec tri automatique.
 * Utilise useMemo pour des performances optimales sur de grandes listes.
 *
 * @function useEventsFiltered
 * @returns {Object} État des filtres et résultats
 * @returns {Array<Object>} returns.filteredEvents - Événements filtrés, triés par date
 * @returns {string|undefined} returns.categoryFilter - ID de catégorie ou undefined (toutes)
 * @returns {Function} returns.setCategoryFilter - Setter pour le filtre catégorie
 * @returns {string} returns.searchFilter - Texte de recherche actuel
 * @returns {Function} returns.setSearchFilter - Setter pour la recherche
 * @returns {boolean} returns.includePastEvent - true = inclure les événements passés
 * @returns {Function} returns.setIncludePastEvent - Toggle pour les événements passés
 * @returns {boolean} returns.isLoading - true pendant le chargement initial
 *
 * @example
 * // Page de liste d'événements avec filtres
 * function EventsPage() {
 *   const {
 *     filteredEvents,
 *     setCategoryFilter,
 *     setSearchFilter,
 *     setIncludePastEvent
 *   } = useEventsFiltered();
 *
 *   return (
 *     <>
 *       <SearchBar onChange={setSearchFilter} />
 *       <CategoryFilter onChange={setCategoryFilter} />
 *       <Checkbox onChange={setIncludePastEvent} label="Inclure passés" />
 *       <EventList events={filteredEvents} />
 *     </>
 *   );
 * }
 */
export const useEventsFiltered = () => {
    // Récupération des événements bruts depuis le context
    const { events, isLoading: eventsLoading } = useEvents();

    // ═══════════════════════════════════════════════════════════
    // ÉTATS DES FILTRES
    // ═══════════════════════════════════════════════════════════

    /**
     * Filtre par catégorie
     * @type {string|undefined} - ID de catégorie ou undefined pour "toutes"
     */
    const [categoryFilter, setCategoryFilter] = useState(undefined);

    /**
     * Filtre par recherche textuelle
     * @type {string} - Texte à rechercher dans titre/description
     */
    const [searchFilter, setSearchFilter] = useState('');

    /**
     * Inclure les événements passés
     * @type {boolean} - false = uniquement futurs, true = tous
     */
    const [includePastEvent, setIncludePastEvent] = useState(false);

    // ═══════════════════════════════════════════════════════════
    // CALCUL DES ÉVÉNEMENTS FILTRÉS (memoïsé)
    // ═══════════════════════════════════════════════════════════

    const filteredEvents = useMemo(() => {
        // Cas de base : pas de données
        if (!events || events.length === 0) {
            return [];
        }

        // Pipeline de filtres - chaque .filter() réduit la liste
        const result = events
            // ─────────────────────────────────────────────────────
            // FILTRE 1 : Par date (passé/futur)
            // ─────────────────────────────────────────────────────
            .filter((event) => {
                // Si on inclut les passés, on garde tout
                if (includePastEvent) return true;

                // Parse de la date+heure de l'événement
                const eventDate = new Date(`${event.date} ${event.time}`);
                const now = new Date();

                // Garder uniquement les événements futurs
                return eventDate.getTime() > now.getTime();
            })

            // ─────────────────────────────────────────────────────
            // FILTRE 2 : Par catégorie
            // ─────────────────────────────────────────────────────
            .filter((event) => {
                // Pas de filtre sélectionné = on garde tout
                if (!categoryFilter) return true;

                // Comparaison stricte (string vs string)
                return String(event.category) === String(categoryFilter);
            })

            // ─────────────────────────────────────────────────────
            // FILTRE 3 : Par recherche textuelle
            // ─────────────────────────────────────────────────────
            .filter((event) => {
                // Pas de texte = on garde tout
                if (!searchFilter) return true;

                // Recherche case-insensitive
                const searchText = searchFilter.toLowerCase();
                const title = event.title.toLowerCase();
                const description = event.description.toLowerCase();

                // Match dans titre OU description
                return title.includes(searchText) || description.includes(searchText);
            });

        // ─────────────────────────────────────────────────────────
        // TRI : Par date croissante (les plus proches en premier)
        // ─────────────────────────────────────────────────────────
        result.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });

        return result;
    }, [events, categoryFilter, searchFilter, includePastEvent]);

    // Retourne les données filtrées et les contrôles
    return {
        filteredEvents,        // Résultats filtrés
        categoryFilter,        // État actuel du filtre catégorie
        setCategoryFilter,     // Modifier le filtre catégorie
        searchFilter,          // État actuel de la recherche
        setSearchFilter,       // Modifier la recherche
        includePastEvent,      // État actuel include passés
        setIncludePastEvent,   // Toggle include passés
        isLoading: eventsLoading,
    };
};
