'use client';

/**
 * @fileoverview Hooks personnalisés pour la gestion des utilisateurs
 * Fournit des utilitaires pour accéder aux données utilisateurs.
 *
 * @module hooks/useUser
 * @requires react
 * @requires contexts/UsersContext
 */

import { useContext, useMemo } from "react";
import { UsersContext } from "../contexts/UsersContext";

/**
 * Hook pour accéder au context des utilisateurs.
 * Expose la liste de tous les utilisateurs et les méthodes de recherche.
 *
 * @function useUsers
 * @returns {Object} Context des utilisateurs
 * @returns {Array<Object>} returns.users - Liste de tous les utilisateurs
 * @returns {boolean} returns.isLoading - true pendant le chargement initial
 * @returns {Error|null} returns.error - Erreur de chargement ou null
 * @returns {Function} returns.getUser - Récupère un utilisateur par ID (O(1) avec index)
 *
 * @example
 * // Affichage de tous les utilisateurs
 * const { users, isLoading } = useUsers();
 * if (isLoading) return <Spinner />;
 * return users.map(u => <UserCard key={u.id} user={u} />);
 */
export const useUsers = () => useContext(UsersContext);

/**
 * Hook optimisé pour récupérer un utilisateur spécifique par son ID.
 * Utilise useMemo pour éviter les re-renders inutiles.
 *
 * @function useUser
 * @param {string|number} id - ID de l'utilisateur à récupérer
 * @returns {Object} État de l'utilisateur
 * @returns {Object|null} returns.user - L'utilisateur trouvé ou null
 * @returns {string} returns.user.id - ID unique de l'utilisateur
 * @returns {string} returns.user.firstname - Prénom
 * @returns {string} returns.user.lastname - Nom de famille
 * @returns {string} returns.user.email - Adresse email
 * @returns {boolean} returns.isLoading - true pendant le chargement
 * @returns {Error|null} returns.error - Erreur éventuelle
 *
 * @example
 * // Page profil utilisateur
 * function UserProfile({ userId }) {
 *   const { user, isLoading, error } = useUser(userId);
 *
 *   if (isLoading) return <ProfileSkeleton />;
 *   if (error) return <Error message={error.message} />;
 *   if (!user) return <NotFound message="Utilisateur introuvable" />;
 *
 *   return (
 *     <div>
 *       <h1>{user.firstname} {user.lastname}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 */
export const useUser = (id) => {
    // Récupération du context avec tous les utilisateurs
    const { users, isLoading, error } = useUsers();

    // Recherche memoïsée de l'utilisateur par ID
    // Complexité : O(n) - Note: le context utilise un index O(1)
    const user = useMemo(() => {
        // Guard clause : pas d'ID ou pas de données
        if (!id || !users) return null;

        // Recherche avec conversion string pour compatibilité types mixtes
        return users.find(u => String(u.id) === String(id)) || null;
    }, [users, id]);

    return { user, isLoading, error };
};
