'use client';

/**
 * @fileoverview Hooks personnalisés pour l'authentification
 * Fournit des utilitaires pour gérer la connexion/déconnexion des utilisateurs.
 *
 * @module hooks/useLogin
 * @requires react
 * @requires contexts/LoginContext
 */

import { useContext } from "react";
import { LoginContext } from "@/contexts/LoginContext";

/**
 * Hook principal pour accéder au context d'authentification.
 * Gère l'état de connexion et fournit les méthodes login/logout.
 *
 * @function useLogin
 * @returns {Object} Context d'authentification
 * @returns {Object|null} returns.user - Utilisateur connecté ou null si déconnecté
 * @returns {string} returns.user.id - ID unique de l'utilisateur
 * @returns {string} returns.user.firstname - Prénom
 * @returns {string} returns.user.lastname - Nom
 * @returns {string} returns.user.email - Email
 * @returns {boolean} returns.isLoading - true pendant la vérification de session initiale
 * @returns {Error|null} returns.error - Dernière erreur d'authentification ou null
 * @returns {Function} returns.login - Connecte un utilisateur (email, password) -> Promise
 * @returns {Function} returns.logout - Déconnecte l'utilisateur (synchrone)
 * @returns {Function} returns.setUser - Met à jour l'utilisateur manuellement
 *
 * @example
 * // Formulaire de connexion
 * function LoginForm() {
 *   const { login, error } = useLogin();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     try {
 *       await login(email, password);
 *       router.push('/');
 *     } catch (err) {
 *       // L'erreur est aussi stockée dans error
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 *
 * @example
 * // Bouton de déconnexion
 * function LogoutButton() {
 *   const { logout } = useLogin();
 *   return <button onClick={logout}>Déconnexion</button>;
 * }
 *
 * @example
 * // Affichage conditionnel selon l'état de connexion
 * function Header() {
 *   const { user, isLoading } = useLogin();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return user
 *     ? <UserMenu user={user} />
 *     : <LoginButton />;
 * }
 */
export const useLogin = () => useContext(LoginContext);

/**
 * Hook utilitaire pour vérifier rapidement si un utilisateur est connecté.
 * Retourne un simple booléen, idéal pour les conditions d'affichage.
 *
 * @function useIsLoggedIn
 * @returns {boolean} true si un utilisateur est connecté, false sinon
 *
 * @example
 * // Protection de route simple
 * function ProtectedPage() {
 *   const isLoggedIn = useIsLoggedIn();
 *   const router = useRouter();
 *
 *   useEffect(() => {
 *     if (!isLoggedIn) router.push('/login');
 *   }, [isLoggedIn]);
 *
 *   if (!isLoggedIn) return null;
 *   return <SecureContent />;
 * }
 *
 * @example
 * // Affichage conditionnel d'un bouton
 * function RegisterButton({ eventId }) {
 *   const isLoggedIn = useIsLoggedIn();
 *
 *   return isLoggedIn
 *     ? <Button onClick={register}>S'inscrire</Button>
 *     : <Link href="/login">Connectez-vous pour vous inscrire</Link>;
 * }
 */
export const useIsLoggedIn = () => {
    // Récupération de l'utilisateur depuis le context
    const { user } = useLogin();

    // Conversion en booléen (!! force la conversion)
    return !!user;
};
