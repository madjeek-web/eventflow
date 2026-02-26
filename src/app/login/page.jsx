'use client';

/**
 * @fileoverview Page de connexion utilisateur
 * Formulaire simple email/password avec redirection après login.
 *
 * @module app/login/page
 * @requires react - useState pour le state local
 * @requires next/navigation - Redirection après connexion
 * @requires hooks/useLogin - Hook d'authentification
 *
 * @security Cette page transmet les credentials au LoginContext
 * qui effectue l'appel API. Voir api/login pour les considérations
 * de sécurité (pas de hash, pas de JWT en dev).
 */

import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page de connexion - Formulaire d'authentification
 *
 * Fonctionnalités :
 * - Saisie email et mot de passe
 * - Soumission vers l'API de login
 * - Redirection vers l'accueil après connexion réussie
 *
 * @function LoginPage
 * @returns {JSX.Element} Formulaire de connexion
 *
 * @example
 * // Route: /login
 * // Affiche le formulaire de connexion
 *
 * @todo Amélioration possible : Afficher les erreurs de connexion
 * @todo Amélioration possible : Ajouter validation des champs
 * @todo Amélioration possible : Gérer le cas "déjà connecté"
 */
export default function LoginPage() {
    // Hook d'authentification - fournit la fonction login()
    const { login } = useLogin();

    // Router Next.js pour la redirection post-login
    const router = useRouter();

    // ==================== STATE LOCAL ====================
    // Email saisi par l'utilisateur
    const [email, setEmail] = useState('');

    // Mot de passe saisi
    const [password, setPassword] = useState('');

    // Messages d'erreur (non utilisé actuellement)
    // eslint-disable-next-line no-unused-vars
    const [errors, setErrors] = useState('');

    /**
     * Gestionnaire de soumission du formulaire
     * Authentifie l'utilisateur et redirige vers l'accueil
     *
     * @async
     * @function handleSubmit
     * @param {React.FormEvent} event - Événement de soumission
     */
    const handleSubmit = async (event) => {
        // Empêche le rechargement de la page
        event.preventDefault();


        // TODO: verifier si le login a fonctionner et afficher les erreurs eventuelles
        // Appel API de connexion via le context
        await login(email, password);

        // Redirection vers la page d'accueil
        router.push('/');
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Formulaire de connexion */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ==================== CHAMP EMAIL ==================== */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email"
                            />
                        </div>

                        {/* ==================== CHAMP PASSWORD ==================== */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                        </div>

                        {/* ==================== BOUTON SUBMIT ==================== */}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
