'use client';

import EventLine from "@/components/EventLine";
import { useEvents } from "@/hooks/useEvent";
import { useInscriptions } from "@/hooks/useInscription";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { use } from "react";

export default function UserPage({ params }) {
    const { id } = use(params);
    const { getEvent } = useEvents();
    const { user, isLoading, error } = useUser(id);
    const { getInscriptionByUser } = useInscriptions();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="h-96 bg-gray-200 animate-pulse" />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                        <div className="h-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                    <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
                    <p className="text-red-600">{error.message}</p>
                    <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium">
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const inscriptionByUser = getInscriptionByUser(id);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="relative h-96 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Back button */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour
                </Link>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {user.firstname} {user.lastname}
                        </h1>
                        <p>{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                Description
                            </p>
                        </div>

                        {/* Participera à */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Participera à</h2>
                            <div className="space-y-2">
                                {inscriptionByUser.filter((inscription) => {
                                    const event = getEvent(inscription.event);
                                    return new Date(event.date) >= new Date();
                                }).length > 0 ? (
                                    inscriptionByUser.map((inscription, index) => {
                                        const event = getEvent(inscription.event);
                                        return new Date(event.date) >= new Date() ? (
                                            <EventLine key={index} id={event.id} />
                                        ) : null;
                                    })
                                ) : (
                                    <p className="text-gray-600">Aucun événement à venir</p>
                                )}
                            </div>
                        </div>

                        {/* A participé à */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">A participé à</h2>
                            <div className="space-y-2">
                                {inscriptionByUser.filter((inscription) => {
                                    const event = getEvent(inscription.event);
                                    return new Date(event.date) < new Date();
                                }).length > 0 ? (
                                    inscriptionByUser.map((inscription, index) => {
                                        const event = getEvent(inscription.event);
                                        return new Date(event.date) < new Date() ? (
                                            <EventLine key={index} id={event.id} />
                                        ) : null;
                                    })
                                ) : (
                                    <p className="text-gray-600">Aucun événement passé</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        VIDE
                    </div>
                </div>
            </div>
        </div>
    );
}
