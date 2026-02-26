'use client';

/**
 * @fileoverview Page d'accueil de l'application EventHub
 * Landing page avec hero section, catégories et événements à venir.
 *
 * @module app/page
 * @requires next/link - Navigation côté client
 * @requires hooks/useEvent - Accès aux événements
 * @requires hooks/useCategory - Accès aux catégories
 * @requires components/EventCard - Carte d'événement
 */

import Link from "next/link";
import { useEvents } from "@/hooks/useEvent";
import { useCategories } from "@/hooks/useCategory";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Page d'accueil - Landing page de l'application
 *
 * Sections :
 * 1. Hero - Présentation et CTA principaux
 * 2. Catégories - Grille de navigation par catégorie
 * 3. Événements à venir - Les 3 prochains événements
 * 4. CTA final - Invitation à créer un événement
 *
 * @function Home
 * @returns {JSX.Element} Page d'accueil complète
 *
 * @example
 * // Route: /
 * // Affiche la landing page avec les sections hero, catégories et événements
 */
export default function Home() {
    // Récupération des événements depuis le context
    const { events, isLoading } = useEvents();

    // Récupération des catégories pour la section de filtrage
    const { categories } = useCategories();

    /**
     * Filtre et trie les événements pour afficher les 3 prochains
     * - Filtre : date >= aujourd'hui (événements futurs uniquement)
     * - Tri : par date croissante (le plus proche en premier)
     * - Limite : 3 événements maximum
     */
    const upcomingEvents = events
        ?.filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    return (
        <div className="min-h-screen">
            {/* ==================== HERO SECTION ==================== */}
            {/* Section principale avec gradient et CTA */}
            <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
                {/* Pattern de grille décoratif en arrière-plan */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                {/* Contenu du hero */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="text-center">
                        {/* Titre principal avec accent coloré */}
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Découvrez et participez aux
                            <span className="block text-indigo-200">événements du collectif</span>
                        </h1>

                        {/* Sous-titre descriptif */}
                        <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                            Rejoignez notre communauté et ne manquez plus aucun événement.
                            Ateliers, concerts, conférences et bien plus encore.
                        </p>

                        {/* Boutons CTA - Responsive : colonne sur mobile, ligne sur desktop */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {/* CTA primaire - Voir les événements */}
                            <Button asChild size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                                <Link href="/events" className="inline-flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Voir les événements
                                </Link>
                            </Button>

                            {/* CTA secondaire - Créer un événement */}
                            <Button asChild size="lg" variant="outline" className="bg-indigo-500 text-white hover:bg-indigo-400 border-indigo-400">
                                <Link href="/events/new" className="inline-flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Créer un événement
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Vague décorative pour transition fluide vers la section suivante */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
                    </svg>
                </div>
            </section>

            {/* ==================== CATEGORIES SECTION ==================== */}
            {/* Grille de catégories cliquables pour filtrer les événements */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête de section */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Explorez par catégorie</h2>
                        <p className="text-gray-600">Trouvez les événements qui vous correspondent</p>
                    </div>

                    {/* Grille responsive : 2 colonnes mobile, 5 colonnes desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {categories?.map(category => (
                            <Card key={category.id} className="hover:shadow-lg transition-shadow group">
                                <Link href={`/events?category=${category.id}`}>
                                    <CardContent className="p-6 text-center">
                                        {/* Icône colorée de la catégorie */}
                                        <div
                                            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: category.color + '20' }}
                                        >
                                            {/* Cercle de couleur pleine */}
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                        </div>
                                        {/* Nom de la catégorie */}
                                        <span className="font-medium text-gray-900">{category.name}</span>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== UPCOMING EVENTS SECTION ==================== */}
            {/* Les 3 prochains événements à venir */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête avec titre et lien "Voir tous" */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Prochains événements</h2>
                            <p className="text-gray-600">Ne manquez pas ces événements à venir</p>
                        </div>
                        {/* Lien vers la liste complète */}
                        <Link
                            href="/events"
                            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
                        >
                            Voir tous les événements
                            {/* Icône flèche */}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Contenu conditionnel : loading / événements / état vide */}
                    {isLoading ? (
                        /* État de chargement - Squelettes animés */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <Skeleton className="h-48 w-full rounded-none" />
                                    <CardContent className="p-5 space-y-3">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : upcomingEvents && upcomingEvents.length > 0 ? (
                        /* Grille des événements à venir */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => (
                                <EventCard key={event.id} id={event.id} />
                            ))}
                        </div>
                    ) : (
                        /* État vide - Aucun événement à venir */
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            {/* Icône calendrier */}
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun événement à venir</h3>
                            <p className="mt-1 text-gray-500">Soyez le premier à créer un événement !</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== CTA SECTION ==================== */}
            {/* Appel à l'action final pour inciter à créer un événement */}
            <section className="bg-indigo-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à organiser votre événement ?
                    </h2>
                    <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Créez votre événement en quelques clics et partagez-le avec la communauté.
                    </p>
                    {/* Bouton CTA */}
                    <Button asChild size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                        <Link href="/events/new" className="inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Créer un événement
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
