'use client';

import { useEvents } from "@/hooks/useEvent";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function NewEvent() {

    const { addEvent } = useEvents();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [image, setImage] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Titre: Min 5, max 100 caractères
        if (!title.trim()) {
            newErrors.title = 'Le titre est requis';
        } else if (title.trim().length < 5) {
            newErrors.title = 'Le titre doit contenir au moins 5 caractères';
        } else if (title.trim().length > 100) {
            newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
        }

        // Catégorie: Valeur parmi la liste
        if (!category) {
            newErrors.category = 'La catégorie est requise';
        }

        // Date: Date future uniquement
        if (!date) {
            newErrors.date = 'La date est requise';
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.date = 'La date doit être dans le futur';
            }
        }

        // Heure: Format HH:MM
        if (!time) {
            newErrors.time = "L'heure est requise";
        }

        // Lieu: Min 3, max 150 caractères
        if (!location.trim()) {
            newErrors.location = 'Le lieu est requis';
        } else if (location.trim().length < 3) {
            newErrors.location = 'Le lieu doit contenir au moins 3 caractères';
        } else if (location.trim().length > 150) {
            newErrors.location = 'Le lieu ne peut pas dépasser 150 caractères';
        }

        // Description: Min 20, max 2000 caractères
        if (!description.trim()) {
            newErrors.description = 'La description est requise';
        } else if (description.trim().length < 20) {
            newErrors.description = 'La description doit contenir au moins 20 caractères';
        } else if (description.trim().length > 2000) {
            newErrors.description = 'La description ne peut pas dépasser 2000 caractères';
        }

        // Capacité max: Entier > 0, max 10000
        const capacity = parseInt(maxParticipants, 10);
        if (!maxParticipants) {
            newErrors.maxParticipants = 'La capacité est requise';
        } else if (isNaN(capacity) || capacity <= 0) {
            newErrors.maxParticipants = 'La capacité doit être un nombre supérieur à 0';
        } else if (capacity > 10000) {
            newErrors.maxParticipants = 'La capacité ne peut pas dépasser 10000';
        }

        // Image URL: URL valide ou vide (optionnel)
        if (image.trim()) {
            try {
                new URL(image);
            } catch {
                newErrors.image = "L'URL de l'image n'est pas valide";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await addEvent({
                title,
                category,
                date,
                time,
                location,
                description,
                maxParticipants,
                image,
            });

            toast.success('Événement créé avec succès !', {
                description: 'Redirection en cours...'
            });

            setTimeout(() => {
                router.push('/events');
            }, 1500);
        } catch (error) {
            toast.error('Une erreur est survenue lors de la création');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Créer un événement</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Titre</Label>
                            <Input
                                type="text"
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={errors.title ? 'border-red-500' : ''}
                                placeholder="Nom de votre événement"
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Atelier</SelectItem>
                                    <SelectItem value="2">Concert</SelectItem>
                                    <SelectItem value="3">Conférence</SelectItem>
                                    <SelectItem value="4">Sortie</SelectItem>
                                    <SelectItem value="5">Sport</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className={errors.date ? 'border-red-500' : ''}
                                />
                                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Heure</Label>
                                <Input
                                    type="time"
                                    id="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className={errors.time ? 'border-red-500' : ''}
                                />
                                {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Lieu</Label>
                            <Input
                                type="text"
                                id="location"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className={errors.location ? 'border-red-500' : ''}
                                placeholder="Adresse ou nom du lieu"
                            />
                            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className={errors.description ? 'border-red-500' : ''}
                                placeholder="Décrivez votre événement..."
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxParticipants">Capacité max</Label>
                            <Input
                                type="number"
                                id="maxParticipants"
                                value={maxParticipants}
                                onChange={e => setMaxParticipants(e.target.value)}
                                className={errors.maxParticipants ? 'border-red-500' : ''}
                                placeholder="Nombre de participants"
                                min="1"
                            />
                            {errors.maxParticipants && <p className="text-red-500 text-sm">{errors.maxParticipants}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">
                                Image URL <span className="text-gray-400 font-normal">(optionnel)</span>
                            </Label>
                            <Input
                                type="text"
                                id="image"
                                value={image}
                                onChange={e => setImage(e.target.value)}
                                className={errors.image ? 'border-red-500' : ''}
                                placeholder="https://exemple.com/image.jpg"
                            />
                            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création en cours...
                                </>
                            ) : (
                                "Créer l'événement"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}