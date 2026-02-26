'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

/**
 * Context pour la gestion des événements
 * @type {React.Context}
 */
export const EventsContext = createContext();

/**
 * Provider pour le context des événements
 * Gère le state global des événements et les opérations CRUD
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Provider avec les événements
 */
export const EventsProvider = ({ children }) => {
    // Liste des événements
    const [events, setEvents] = useState([]);
    // État de chargement
    const [isLoading, setIsLoading] = useState(true);
    // Erreur éventuelle
    const [error, setError] = useState(null);

    // Chargement initial des événements
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/events');

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des événements');
                }

                const data = await response.json();
                setEvents(data);
            } catch (err) {
                setError(err);
                console.error('Erreur fetch events:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    /**
     * Récupère un événement par son ID
     * @param {string} id - ID de l'événement
     * @returns {Object|undefined} L'événement trouvé ou undefined
     */
    const getEvent = useCallback((id) => {
        return events.find(event => event.id === id);
    }, [events]);

    /**
     * Ajoute un nouvel événement
     * @param {Object} event - Données de l'événement à créer
     * @param {string} event.title - Titre de l'événement
     * @param {string} event.description - Description de l'événement
     * @param {string} event.date - Date de l'événement
     * @param {string} event.time - Heure de l'événement
     * @param {string} event.location - Lieu de l'événement
     * @param {string} event.category - ID de la catégorie
     * @param {number} event.maxParticipants - Nombre max de participants
     * @param {string} [event.image] - URL de l'image (optionnel)
     * @returns {Promise<Object>} L'événement créé avec son ID
     * @throws {Error} Erreur si la création échoue
     */
    const addEvent = useCallback(async (event) => {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de l\'événement');
        }

        const data = await response.json();
        setEvents(prevEvents => [...prevEvents, data]);
        return data;
    }, []);

    /**
     * Supprime un événement par son ID
     * @param {string} id - ID de l'événement à supprimer
     * @returns {Promise<Object>} Réponse de l'API
     * @throws {Error} Erreur si la suppression échoue
     */
    const removeEvent = useCallback(async (id) => {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'événement');
        }

        const data = await response.json();
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
        return data;
    }, []);

    // Valeur exposée par le context
    const value = {
        events,
        isLoading,
        error,
        getEvent,
        addEvent,
        removeEvent,
    };

    return (
        <EventsContext.Provider value={value}>
            {children}
        </EventsContext.Provider>
    );
};
