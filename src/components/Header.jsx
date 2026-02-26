'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useLogin();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Accueil", href: "/" },
        { name: "Événements", href: "/events" },
        { name: "Créer un événement", href: "/events/new" },
    ];

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        if (href === "/events") return pathname === "/events";
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">EventHub</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(item.href)
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User / Login */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 focus:outline-none">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-medium">
                                                {user.firstname[0]}{user.lastname[0]}
                                            </span>
                                        </div>
                                        <span>{user.firstname}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/users/${user.id}`} className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Mon profil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild>
                                <Link href="/login">Connexion</Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col gap-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(item.href)
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Separator className="my-2" />
                            {user ? (
                                <>
                                    <Link
                                        href={`/users/${user.id}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 text-xs font-medium">
                                                {user.firstname[0]}{user.lastname[0]}
                                            </span>
                                        </div>
                                        Mon profil
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Déconnexion
                                    </button>
                                </>
                            ) : (
                                <Button asChild className="mx-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        Connexion
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
