'use client';

/**
 * @fileoverview Page de contact avec formulaire
 * Permet aux utilisateurs d'envoyer un message à l'équipe EventHub.
 *
 * @module app/contact/page
 * @requires react - useState pour le state local
 * @requires hooks/useLogin - Pour pré-remplir l'email si connecté
 */

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/useLogin";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page Contact - Formulaire de contact
 *
 * Fonctionnalités :
 * - Formulaire avec validation côté client
 * - Pré-remplissage de l'email si utilisateur connecté
 * - Message de succès après envoi
 * - Informations de contact alternatives
 *
 * @function ContactPage
 * @returns {JSX.Element} Page de contact avec formulaire
 */
export default function ContactPage() {
    // ==================== HOOKS ====================
    // Récupération de l'utilisateur connecté pour pré-remplir l'email
    const { user } = useLogin();

    // ==================== STATE LOCAL ====================
    // Champs du formulaire
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // États UI
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==================== EFFECTS ====================
    // Pré-remplissage si utilisateur connecté
    useEffect(() => {
        if (user) {
            setName(`${user.firstname} ${user.lastname}`);
            setEmail(user.email);
        }
    }, [user]);

    // ==================== VALIDATION ====================
    /**
     * Valide les champs du formulaire
     * @returns {boolean} true si le formulaire est valide
     */
    const validateForm = () => {
        const newErrors = {};

        // Nom : requis, min 2 caractères
        if (!name.trim()) {
            newErrors.name = 'Le nom est requis';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Le nom doit contenir au moins 2 caractères';
        }

        // Email : requis, format valide
        if (!email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        // Sujet : requis, min 5 caractères
        if (!subject.trim()) {
            newErrors.subject = 'Le sujet est requis';
        } else if (subject.trim().length < 5) {
            newErrors.subject = 'Le sujet doit contenir au moins 5 caractères';
        }

        // Message : requis, min 20 caractères, max 2000
        if (!message.trim()) {
            newErrors.message = 'Le message est requis';
        } else if (message.trim().length < 20) {
            newErrors.message = 'Le message doit contenir au moins 20 caractères';
        } else if (message.trim().length > 2000) {
            newErrors.message = 'Le message ne peut pas dépasser 2000 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ==================== SOUMISSION ====================
    /**
     * Gestionnaire de soumission du formulaire
     * @param {React.FormEvent} event - Événement de soumission
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validation avant envoi
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Appel API pour enregistrer le message
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi');
            }

            // Succès - reset du formulaire
            toast.success('Message envoyé !', {
                description: 'Nous vous répondrons dans les plus brefs délais.'
            });
            setSubject('');
            setMessage('');

            // Si non connecté, reset aussi nom et email
            if (!user) {
                setName('');
                setEmail('');
            }

        } catch (error) {
            toast.error('Erreur lors de l\'envoi', {
                description: 'Veuillez réessayer.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* ==================== HEADER ==================== */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Une question, une suggestion ou besoin d'aide ?
                    Notre équipe est là pour vous répondre.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* ==================== FORMULAIRE ==================== */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nom et Email sur la même ligne */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Champ Nom */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom complet</Label>
                                        <Input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                            placeholder="Jean Dupont"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                    </div>

                                    {/* Champ Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className={errors.email ? 'border-red-500' : ''}
                                            placeholder="jean.dupont@email.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Champ Sujet */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Sujet</Label>
                                    <Input
                                        type="text"
                                        id="subject"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className={errors.subject ? 'border-red-500' : ''}
                                        placeholder="Objet de votre message"
                                    />
                                    {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                                </div>

                                {/* Champ Message */}
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={6}
                                        className={errors.message ? 'border-red-500' : ''}
                                        placeholder="Décrivez votre demande en détail..."
                                    />
                                    <div className="flex justify-between items-center">
                                        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                                        <span className={`text-sm ml-auto ${message.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {message.length}/2000
                                        </span>
                                    </div>
                                </div>

                                {/* Bouton Submit */}
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Envoyer le message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* ==================== SIDEBAR INFOS ==================== */}
                <div className="space-y-6">
                    {/* Carte Email */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email</h3>
                                    <a href="mailto:contact@eventhub.fr" className="text-indigo-600 hover:underline">
                                        contact@eventhub.fr
                                    </a>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Réponse sous 24-48h ouvrées
                            </p>
                        </CardContent>
                    </Card>

                    {/* Carte Adresse */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                                    <p className="text-gray-600">123 Rue de l&apos;Événement</p>
                                    <p className="text-gray-600">75001 Paris</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carte Horaires */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Horaires</h3>
                                    <p className="text-gray-600">Lun - Ven : 9h - 18h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lien Mentions légales */}
                    <Card className="bg-gray-50 border-0">
                        <CardContent className="p-6">
                            <p className="text-gray-600 text-sm mb-3">
                                En soumettant ce formulaire, vous acceptez que vos données soient traitées
                                conformément à notre politique de confidentialité.
                            </p>
                            <Link href="/mentions-legales" className="text-indigo-600 text-sm hover:underline">
                                Voir les mentions légales →
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
