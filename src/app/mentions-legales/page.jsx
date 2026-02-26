'use client';

/**
 * @fileoverview Page des mentions légales
 * Informations juridiques obligatoires pour un site web français.
 *
 * @module app/mentions-legales/page
 */

import Link from "next/link";

/**
 * Page Mentions Légales
 *
 * Contient les informations obligatoires :
 * - Éditeur du site
 * - Hébergeur
 * - Propriété intellectuelle
 * - Protection des données (RGPD)
 * - Cookies
 * - Limitation de responsabilité
 *
 * @function MentionsLegalesPage
 * @returns {JSX.Element} Page des mentions légales
 */
export default function MentionsLegalesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* ==================== HEADER ==================== */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

            {/* Date de mise à jour */}
            <p className="text-gray-500 mb-8">Dernière mise à jour : Décembre 2024</p>

            {/* ==================== ÉDITEUR DU SITE ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Éditeur du site</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                    <p><span className="font-medium">Raison sociale :</span> EventHub</p>
                    <p><span className="font-medium">Forme juridique :</span> Association loi 1901</p>
                    <p><span className="font-medium">Siège social :</span> 123 Rue de l'Événement, 75001 Paris</p>
                    <p><span className="font-medium">Email :</span> contact@eventhub.fr</p>
                    <p><span className="font-medium">Directeur de la publication :</span> Le Président de l'association</p>
                </div>
            </section>

            {/* ==================== HÉBERGEUR ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Hébergeur</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                    <p><span className="font-medium">Raison sociale :</span> Vercel Inc.</p>
                    <p><span className="font-medium">Adresse :</span> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                    <p><span className="font-medium">Site web :</span> vercel.com</p>
                </div>
            </section>

            {/* ==================== PROPRIÉTÉ INTELLECTUELLE ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Propriété intellectuelle</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                        L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, etc.)
                        est la propriété exclusive d'EventHub ou de ses partenaires et est protégé par
                        les lois françaises et internationales relatives à la propriété intellectuelle.
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4">
                        Toute reproduction, représentation, modification, publication ou adaptation de
                        tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé,
                        est interdite sans autorisation écrite préalable d'EventHub.
                    </p>
                </div>
            </section>

            {/* ==================== PROTECTION DES DONNÉES ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Protection des données personnelles (RGPD)</h2>
                <div className="prose prose-gray max-w-none space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                        Conformément au Règlement Général sur la Protection des Données (RGPD) et à la
                        loi Informatique et Libertés, vous disposez des droits suivants concernant vos
                        données personnelles :
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                        <li>Droit d'accès à vos données</li>
                        <li>Droit de rectification</li>
                        <li>Droit à l'effacement (droit à l'oubli)</li>
                        <li>Droit à la limitation du traitement</li>
                        <li>Droit à la portabilité des données</li>
                        <li>Droit d'opposition</li>
                    </ul>
                    <p className="text-gray-600 leading-relaxed">
                        Pour exercer ces droits, vous pouvez nous contacter à l'adresse :
                        <a href="mailto:rgpd@eventhub.fr" className="text-indigo-600 hover:underline ml-1">
                            rgpd@eventhub.fr
                        </a>
                    </p>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mt-4">
                        <p className="text-indigo-800 text-sm">
                            <strong>Données collectées :</strong> nom, prénom, email, inscriptions aux événements.
                            Ces données sont utilisées uniquement pour la gestion de votre compte et des inscriptions.
                        </p>
                    </div>
                </div>
            </section>

            {/* ==================== COOKIES ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cookies</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                        Ce site utilise des cookies techniques nécessaires à son bon fonctionnement.
                        Ces cookies ne collectent aucune donnée personnelle à des fins publicitaires.
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4">
                        Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines
                        fonctionnalités du site pourraient ne plus être disponibles.
                    </p>
                </div>
            </section>

            {/* ==================== LIMITATION DE RESPONSABILITÉ ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Limitation de responsabilité</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                        EventHub s'efforce de fournir des informations exactes et à jour sur ce site.
                        Toutefois, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité
                        des informations diffusées.
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4">
                        EventHub ne saurait être tenu responsable des dommages directs ou indirects
                        résultant de l'accès ou de l'utilisation de ce site, y compris l'inaccessibilité,
                        les pertes de données, détériorations ou virus qui pourraient affecter votre
                        équipement informatique.
                    </p>
                </div>
            </section>

            {/* ==================== DROIT APPLICABLE ==================== */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Droit applicable</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                        Les présentes mentions légales sont régies par le droit français. En cas de
                        litige, les tribunaux français seront seuls compétents.
                    </p>
                </div>
            </section>

            {/* ==================== CONTACT ==================== */}
            <section className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Une question ?</h2>
                <p className="text-gray-600 mb-4">
                    Pour toute question concernant ces mentions légales ou le fonctionnement du site,
                    n'hésitez pas à nous contacter.
                </p>
                <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Nous contacter
                </Link>
            </section>
        </div>
    );
}
