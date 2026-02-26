'use client';

/**
 * @fileoverview Hook personnalisé pour la gestion des catégories d'événements
 * Fournit un accès simplifié au CategoriesContext.
 *
 * @module hooks/useCategory
 * @requires react
 * @requires contexts/CategoriesContext
 */

import { useContext } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";

/**
 * Hook pour accéder au context des catégories d'événements.
 * Les catégories permettent de classifier et filtrer les événements
 * (ex: Musique, Sport, Conférence, Atelier...).
 *
 * @function useCategories
 * @returns {Object} Context des catégories
 * @returns {Array<Object>} returns.categories - Liste des catégories disponibles
 * @returns {string} returns.categories[].id - ID unique de la catégorie
 * @returns {string} returns.categories[].name - Nom affiché de la catégorie
 * @returns {string} returns.categories[].color - Couleur hex pour l'affichage (ex: "#FF5733")
 * @returns {boolean} returns.isLoading - true pendant le chargement initial
 * @returns {Error|null} returns.error - Erreur de chargement ou null
 * @returns {Function} returns.getCategory - Récupère une catégorie par son ID
 *
 * @example
 * // Affichage d'un sélecteur de catégories
 * function CategorySelect({ value, onChange }) {
 *   const { categories, isLoading } = useCategories();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <select value={value} onChange={e => onChange(e.target.value)}>
 *       <option value="">Toutes les catégories</option>
 *       {categories.map(cat => (
 *         <option key={cat.id} value={cat.id}>{cat.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 *
 * @example
 * // Récupérer le nom d'une catégorie pour affichage
 * const { getCategory } = useCategories();
 * const category = getCategory(event.category);
 * console.log(category?.name); // "Musique"
 */
export const useCategories = () => useContext(CategoriesContext);
