'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

/**
 * Context pour la gestion des utilisateurs
 * @type {React.Context}
 */
export const UsersContext = createContext();

/**
 * Provider pour le context des utilisateurs
 * Gère le state global des utilisateurs
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Provider avec les utilisateurs
 */
export const UsersProvider = ({ children }) => {
    // Liste des utilisateurs
    const [users, setUsers] = useState([]);
    // État de chargement
    const [isLoading, setIsLoading] = useState(true);
    // Erreur éventuelle
    const [error, setError] = useState(null);

    // Index pour recherche O(1) par ID
    const [usersIndex, setUsersIndex] = useState({});

    // Reconstruction de l'index quand les utilisateurs changent
    useEffect(() => {
        const index = {};
        users.forEach(user => {
            index[String(user.id)] = user; // Support string et number
        });
        setUsersIndex(index);
    }, [users]);

    // Chargement initial des utilisateurs
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/users');

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des utilisateurs');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err);
                console.error('Erreur fetch users:', err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    /**
     * Récupère un utilisateur par son ID (O(1) avec index)
     * @param {string|number} id - ID de l'utilisateur
     * @returns {Object|undefined} L'utilisateur trouvé ou undefined
     */
    const getUser = useCallback((id) => {
        return usersIndex[String(id)] || undefined;
    }, [usersIndex]);

    // Valeur exposée par le context
    return (
        <UsersContext.Provider value={{
            users,
            isLoading,
            error,
            getUser,
        }}>
            {children}
        </UsersContext.Provider>
    );
};
