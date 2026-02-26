'use client';

import Link from "next/link";
import { useEventsFiltered } from "@/hooks/useEvent";
import { useCategories } from "@/hooks/useCategory";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EventsPage() {
    const {
        filteredEvents: events,
        categoryFilter,
        setCategoryFilter,
        isLoading,
        searchFilter,
        setSearchFilter,
        includePastEvent,
        setIncludePastEvent
    } = useEventsFiltered();

    const { categories } = useCategories();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
                        <p className="mt-1 text-gray-600">Découvrez tous les événements à venir</p>
                    </div>
                    <Button asChild className="mt-4 sm:mt-0">
                        <Link href="/events/new" className="inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouvel événement
                        </Link>
                    </Button>
                </div>

                {/* Filtres */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* Recherche */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Recherche</Label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <Input
                                        type="text"
                                        id="search"
                                        value={searchFilter}
                                        onChange={e => setSearchFilter(e.target.value)}
                                        placeholder="Rechercher un événement..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Catégorie */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les catégories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {categories?.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Événements passés */}
                            <div className="space-y-2">
                                <Label>Événements passés</Label>
                                <div className="flex items-center justify-between h-10 px-3 border rounded-md">
                                    <span className="text-sm">{includePastEvent ? 'Inclus' : 'Exclus'}</span>
                                    <Switch
                                        checked={includePastEvent}
                                        onCheckedChange={setIncludePastEvent}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading state */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
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
                )}

                {/* Events grid */}
                {!isLoading && events && events.length > 0 && (
                    <>
                        <p className="text-sm text-gray-500 mb-4">{events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <EventCard key={event.id} id={event.id} />
                            ))}
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!isLoading && (!events || events.length === 0) && (
                    <div className="text-center py-16">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
                        <p className="mt-1 text-gray-500">Essayez de modifier vos filtres ou créez un nouvel événement.</p>
                        <Button asChild className="mt-6">
                            <Link href="/events/new" className="inline-flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Créer un événement
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
