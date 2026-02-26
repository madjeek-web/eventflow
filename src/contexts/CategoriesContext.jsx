'use client';

import { createContext, useCallback, useEffect, useState } from 'react';

/**
 * Context pour la gestion des catégories d'événements
 * @type {React.Context}
 */
export const CategoriesContext = createContext();

/**
 * Provider pour le context des catégories
 * Gère le state global des catégories
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Provider avec les catégories
 */
export const CategoriesProvider = ({ children }) => {
    // Liste des catégories
    const [categories, setCategories] = useState([]);
    // État de chargement
    const [isLoading, setIsLoading] = useState(true);
    // Erreur éventuelle
    const [error, setError] = useState(null);

    // Chargement initial des catégories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/categories');

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des catégories');
                }

                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError(err);
                console.error('Erreur fetch categories:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    /**
     * Récupère une catégorie par son ID
     * @param {string|number} id - ID de la catégorie
     * @returns {Object|undefined} La catégorie trouvée ou undefined
     */
    const getCategory = useCallback((id) => {
        // Conversion en nombre pour comparaison stricte si nécessaire
        return categories.find(category => String(category.id) === String(id));
    }, [categories]);

    // Valeur exposée par le context
    const value = {
        categories,
        isLoading,
        error,
        getCategory,
    };

    return (
        <CategoriesContext.Provider value={value}>
            {children}
        </CategoriesContext.Provider>
    );
};
