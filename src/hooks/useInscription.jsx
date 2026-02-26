'use client';

/**
 * @fileoverview Hooks personnalisés pour la gestion des inscriptions aux événements
 * Fournit des utilitaires pour gérer les inscriptions utilisateur/événement.
 *
 * @module hooks/useInscription
 * @requires react
 * @requires contexts/InscriptionsContext
 * @requires hooks/useLogin
 */

import { useContext, useMemo } from "react";
import { InscriptionsContext } from "../contexts/InscriptionsContext";
import { useLogin } from "./useLogin";

/**
 * Hook principal pour accéder au context des inscriptions.
 * Une inscription lie un utilisateur à un événement.
 *
 * @function useInscriptions
 * @returns {Object} Context des inscriptions
 * @returns {Array<Object>} returns.inscriptions - Liste de toutes les inscriptions
 * @returns {string} returns.inscriptions[].id - ID unique de l'inscription
 * @returns {string} returns.inscriptions[].user - ID de l'utilisateur inscrit
 * @returns {string} returns.inscriptions[].event - ID de l'événement
 * @returns {boolean} returns.isLoading - true pendant le chargement initial
 * @returns {Error|null} returns.error - Erreur de chargement ou null
 * @returns {Function} returns.addInscription - Crée une nouvelle inscription
 * @returns {Function} returns.removeInscription - Supprime une inscription par ID
 * @returns {Function} returns.getInscriptionByUser - Inscriptions d'un utilisateur (O(1))
 * @returns {Function} returns.getInscriptionByEvent - Inscriptions à un événement (O(1))
 *
 * @example
 * // Inscription à un événement
 * const { addInscription } = useInscriptions();
 * await addInscription({ user: userId, event: eventId });
 *
 * @example
 * // Liste des participants d'un événement
 * const { getInscriptionByEvent } = useInscriptions();
 * const participants = getInscriptionByEvent(eventId);
 */
export const useInscriptions = () => useContext(InscriptionsContext);

/**
 * Hook utilitaire pour récupérer les inscriptions de l'utilisateur connecté.
 * Permet d'afficher "Mes événements" facilement.
 *
 * @function useMyInscriptions
 * @returns {Array<Object>} Liste des inscriptions de l'utilisateur connecté
 *
 * @example
 * // Page "Mes événements"
 * function MyEventsPage() {
 *   const myInscriptions = useMyInscriptions();
 *
 *   return (
 *     <div>
 *       <h1>Mes événements ({myInscriptions.length})</h1>
 *       {myInscriptions.map(insc => (
 *         <EventCard key={insc.id} eventId={insc.event} />
 *       ))}
 *     </div>
 *   );
 * }
 */
export const useMyInscriptions = () => {
    // Récupération de l'utilisateur connecté
    const { user } = useLogin();

    // Récupération de toutes les inscriptions
    const { inscriptions } = useInscriptions();

    // Filtrage memoïsé des inscriptions de l'utilisateur
    return useMemo(() => {
        // Pas d'utilisateur connecté = pas d'inscriptions
        if (!user) return [];

        // Filtre les inscriptions appartenant à l'utilisateur courant
        return inscriptions.filter(i => String(i.user) === String(user.id));
    }, [inscriptions, user]);
};

/**
 * Hook utilitaire pour vérifier si l'utilisateur connecté est inscrit à un événement.
 * Idéal pour afficher le bon bouton (S'inscrire / Se désinscrire).
 *
 * @function useIsUserInscribed
 * @param {string|number} eventId - ID de l'événement à vérifier
 * @returns {boolean} true si l'utilisateur est inscrit, false sinon
 *
 * @example
 * // Bouton d'inscription conditionnel
 * function InscriptionButton({ eventId }) {
 *   const isInscribed = useIsUserInscribed(eventId);
 *   const { addInscription, removeInscription } = useInscriptions();
 *
 *   return (
 *     <button onClick={handleClick}>
 *       {isInscribed ? 'Se désinscrire' : "S'inscrire"}
 *     </button>
 *   );
 * }
 */
export const useIsUserInscribed = (eventId) => {
    // Récupération de l'utilisateur connecté
    const { user } = useLogin();

    // Récupération de toutes les inscriptions
    const { inscriptions } = useInscriptions();

    // Vérification memoïsée de l'inscription
    return useMemo(() => {
        // Pas d'utilisateur ou pas d'événement = pas inscrit
        if (!user || !eventId) return false;

        // Recherche d'une inscription correspondante
        return inscriptions.some(i =>
            String(i.user) === String(user.id) &&
            String(i.event) === String(eventId)
        );
    }, [inscriptions, user, eventId]);
};
