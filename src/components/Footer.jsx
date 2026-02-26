import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Logo et nom */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold">EventHub</span>
                    </div>

                    {/* Mentions */}
                    <div className="text-center text-gray-400 text-sm">
                        <p>Projet réalisé par le collectif EventHub</p>
                        <p className="mt-1">&copy; {new Date().getFullYear()} EventHub. Tous droits réservés.</p>
                    </div>

                    {/* Liens */}
                    <div className="flex gap-4 text-sm text-gray-400">
                        <Link href="/mentions-legales" className="hover:text-white transition-colors">
                            Mentions légales
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
