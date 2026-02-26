'use client';

import { useCategories } from "@/hooks/useCategory";
import { useEvent } from "@/hooks/useEvent";
import { useInscriptions } from "@/hooks/useInscription";
import { useLogin } from "@/hooks/useLogin";
import { useUsers } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EventPage({ params }) {
    const { id } = use(params);
    const { user } = useLogin();
    const { event, isLoading, error } = useEvent(id);
    const { getCategory } = useCategories();
    const { getUser } = useUsers();
    const { addInscription, getInscriptionByEvent, removeInscription } = useInscriptions();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Skeleton className="h-96 w-full rounded-none" />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription className="mt-2">
                        {error.message}
                        <Button asChild variant="link" className="p-0 h-auto mt-2 block">
                            <Link href="/">Retour à l&apos;accueil</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!event) return null;


    const eventDate = new Date(`${event.date} ${event.time}`);
    const dateTimeStamp = eventDate.getTime();
    const now = (new Date()).getTime();
    const isPastEvent = dateTimeStamp < now;


    const category = getCategory(event.category);
    const inscriptions = getInscriptionByEvent(id);
    const isInscrit = user ? inscriptions.find(inscription => inscription.user == user.id) : false;

    const spotsLeft = event.maxParticipants - inscriptions.length;
    const isFull = spotsLeft <= 0;

    const handleRegisterClick = async () => {
        if (!user) {
            return;
        }

        await addInscription({
            user: user.id,
            event: id,
        });
        toast.success("Inscription confirmée !");
    };


    const handleUnregisterClick = async () => {
        if (!user) {
            return;
        }

        const inscription = inscriptions.find(inscription => inscription.user == user.id);
        if (!inscription) return;

        await removeInscription(inscription.id);
        toast.info("Désinscription confirmée");
    };



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="relative h-96 w-full">
                {/* Affichage de l'image ou d'un placeholder si pas d'image */}
                {event.image ? (
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                        loading="eager"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <svg className="w-32 h-32 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />



                {/* Back button */}
                <Button asChild variant="secondary" className="absolute top-6 left-6 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white border-0">
                    <Link href="/" className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </Link>
                </Button>

                {/* Category badge */}
                <Badge
                    className="absolute top-6 right-6 text-white text-sm px-4 py-2"
                    style={{ backgroundColor: category ? category.color : "#000000" }}
                >
                    {category ? category.name : ""}
                </Badge>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>À propos de cet événement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Location details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lieu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-indigo-100 rounded-lg">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{event.location}</p>
                                        <p className="text-gray-500 text-sm mt-1">Voir sur la carte</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Registration card */}
                        <Card className="sticky top-6">
                            <CardContent className="p-6">
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {inscriptions.length}
                                        <span className="text-lg font-normal text-gray-500"> / {event.maxParticipants}</span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <Progress
                                    value={Math.min((inscriptions.length / event.maxParticipants) * 100, 100)}
                                    className={`mb-4 ${isFull ? '[&>div]:bg-red-500' : ''}`}
                                />

                                {isFull ? (
                                    <p className="text-center text-sm text-gray-500 mb-4">
                                        <span className="font-semibold text-red-700">Complet</span>
                                    </p>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 mb-4">
                                        Plus que <span className="font-semibold text-indigo-600">{spotsLeft}</span> place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''}
                                    </p>
                                )}

                                {!isPastEvent && (
                                    user ? (
                                        isInscrit ? (
                                            <Button onClick={handleUnregisterClick} className="w-full">
                                                Se désinscrire à l&apos;événement
                                            </Button>
                                        ) : (
                                            !isFull && (
                                                <Button onClick={handleRegisterClick} className="w-full">
                                                    S&apos;inscrire à l&apos;événement
                                                </Button>
                                            )
                                        )
                                    ) : (
                                        <Button asChild className="w-full">
                                            <Link href="/login">S&apos;authentifier</Link>
                                        </Button>
                                    )
                                )}
                                
                            </CardContent>
                        </Card>

                        {/* Participants card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Participants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {inscriptions.map((inscription, index) => {
                                        const user = getUser(inscription.user);
                                        if (!user) return null;
                                        return (
                                            <div key={index} className="text-gray-500 text-sm">
                                                <Link href={`/users/${user.id}`} className="hover:text-indigo-600">{user.firstname} {user.lastname}</Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date & Time card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Date et heure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">{event.time}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}