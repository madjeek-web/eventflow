'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

/**
 * Context pour la gestion des inscriptions aux événements
 * @type {React.Context}
 */
export const InscriptionsContext = createContext();

/**
 * Provider pour le context des inscriptions
 * Gère le state global des inscriptions et les opérations CRUD
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Provider avec les inscriptions
 */
export const InscriptionsProvider = ({ children }) => {
    // Liste des inscriptions
    const [inscriptions, setInscriptions] = useState([]);
    // État de chargement
    const [isLoading, setIsLoading] = useState(true);
    // Erreur éventuelle
    const [error, setError] = useState(null);

    // Index pour recherches O(1) par utilisateur et événement
    const [inscriptionsByUser, setInscriptionsByUser] = useState({});
    const [inscriptionsByEvent, setInscriptionsByEvent] = useState({});

    // Reconstruction des index quand les inscriptions changent
    useEffect(() => {
        const byUser = {};
        const byEvent = {};

        inscriptions.forEach(inscription => {
            const userId = String(inscription.user);
            const eventId = String(inscription.event);

            // Index par utilisateur
            if (!byUser[userId]) byUser[userId] = [];
            byUser[userId].push(inscription);

            // Index par événement
            if (!byEvent[eventId]) byEvent[eventId] = [];
            byEvent[eventId].push(inscription);
        });

        setInscriptionsByUser(byUser);
        setInscriptionsByEvent(byEvent);
    }, [inscriptions]);

    // Chargement initial des inscriptions
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/inscriptions');

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des inscriptions');
                }

                const data = await response.json();
                setInscriptions(data);
            } catch (err) {
                setError(err);
                console.error('Erreur fetch inscriptions:', err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    /**
     * Ajoute une nouvelle inscription
     * @param {Object} inscription - Données de l'inscription
     * @param {string} inscription.user - ID de l'utilisateur
     * @param {string} inscription.event - ID de l'événement
     * @returns {Promise<Object>} L'inscription créée avec son ID
     * @throws {Error} Erreur si la création échoue
     */
    const addInscription = useCallback(async (inscription) => {
        const response = await fetch('/api/inscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inscription),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de l\'inscription');
        }

        const data = await response.json();
        setInscriptions(prevInscriptions => [...prevInscriptions, data]);
        return data;
    }, []);

    /**
     * Supprime une inscription par son ID
     * @param {string} id - ID de l'inscription à supprimer
     * @returns {Promise<Object>} Réponse de l'API
     * @throws {Error} Erreur si la suppression échoue
     */
    const removeInscription = useCallback(async (id) => {
        const response = await fetch(`/api/inscriptions/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'inscription');
        }

        const data = await response.json();
        // Bug corrigé : utilisation de 'inscription' au lieu de 'event'
        setInscriptions(prevInscriptions => prevInscriptions.filter(inscription => inscription.id !== id));
        return data;
    }, []);

    /**
     * Récupère toutes les inscriptions d'un utilisateur (O(1) avec index)
     * @param {string|number} id - ID de l'utilisateur
     * @returns {Array<Object>} Liste des inscriptions de l'utilisateur
     */
    const getInscriptionByUser = useCallback((id) => {
        return inscriptionsByUser[String(id)] || [];
    }, [inscriptionsByUser]);

    /**
     * Récupère toutes les inscriptions d'un événement (O(1) avec index)
     * @param {string|number} id - ID de l'événement
     * @returns {Array<Object>} Liste des inscriptions à l'événement
     */
    const getInscriptionByEvent = useCallback((id) => {
        return inscriptionsByEvent[String(id)] || [];
    }, [inscriptionsByEvent]);

    // Valeur exposée par le context
    return (
        <InscriptionsContext.Provider value={{
            inscriptions,
            isLoading,
            error,
            addInscription,
            removeInscription,
            getInscriptionByUser,
            getInscriptionByEvent,
        }}>
            {children}
        </InscriptionsContext.Provider>
    );
};
