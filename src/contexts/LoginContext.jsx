'use client';

/**
 * @fileoverview Context and Provider for user authentication state.
 *
 * This module manages the client-side view of the authentication state.
 * The actual session is stored in an HTTP-only cookie on the server — this
 * context only stores the user's public profile data (id, firstname, lastname, email)
 * so the UI can display it without making extra API calls.
 *
 * Key change from a localStorage approach :
 * The session token itself is never accessible from JavaScript. Only the public
 * user profile is stored in React state (and optionally persisted in sessionStorage
 * for page reload recovery). This means even if an attacker can run JavaScript
 * in the page (XSS), they cannot steal the authentication token.
 *
 * @module contexts/LoginContext
 * @requires react
 */

import { createContext, useCallback, useEffect, useState } from 'react';

/**
 * The context object. Consumed by the useLogin hook.
 * @type {React.Context}
 */
export const LoginContext = createContext();

/**
 * Provider component that wraps the application and makes authentication
 * state available to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The LoginContext.Provider
 */
export const LoginProvider = ({ children }) => {
    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────

    /** The authenticated user's public profile, or null if not logged in */
    const [user, _setUser] = useState(null);

    /** The last authentication error (wrong credentials, network error, etc.) */
    const [error, setError] = useState(null);

    /**
     * true while we are checking sessionStorage for a cached user on mount.
     * The UI should not render gated content until this resolves.
     */
    const [isLoading, setIsLoading] = useState(true);

    // ─────────────────────────────────────────────────────────────────────────
    // SESSION RECOVERY ON PAGE RELOAD
    //
    // sessionStorage is used here (not localStorage) because it is scoped to
    // the browser tab and cleared when the tab is closed. This matches the
    // behavior of the HTTP-only session cookie which also has a finite lifetime.
    //
    // We store only the user's public profile, not the token.
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('eventflow_user');
            if (storedUser) {
                _setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            // sessionStorage may be unavailable in some browser configurations.
            // Log the error but do not crash — the user will just need to log in again.
            console.error('Could not read session from sessionStorage:', err);
            sessionStorage.removeItem('eventflow_user');
        } finally {
            // Loading is complete regardless of whether we found a stored user
            setIsLoading(false);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Updates the user state and keeps sessionStorage in sync.
     * This is the only place where _setUser should be called.
     *
     * @function setUser
     * @param {Object|null} userData - User profile or null to clear
     */
    const setUser = useCallback((userData) => {
        _setUser(userData);
        if (userData) {
            sessionStorage.setItem('eventflow_user', JSON.stringify(userData));
        } else {
            sessionStorage.removeItem('eventflow_user');
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Authenticates a user by calling POST /api/login.
     * On success, the server sets an HTTP-only cookie and returns the user profile.
     * The profile is stored in React state and sessionStorage for UI use.
     *
     * @async
     * @function login
     * @param {string} email - The user's email address
     * @param {string} password - The user's plain-text password
     * @returns {Promise<Object>} The authenticated user profile
     * @throws {Error} If the login fails (wrong credentials, network error, rate limit)
     */
    const login = useCallback(async (email, password) => {
        try {
            setError(null);

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                // credentials: 'same-origin' ensures cookies are sent and received
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle rate limiting specifically so the UI can show a useful message
                if (response.status === 429) {
                    throw new Error('Too many login attempts. Please wait and try again.');
                }

                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            setUser(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, [setUser]);

    /**
     * Logs out the current user by calling POST /api/logout.
     * The server clears the session cookie. React state is cleared client-side.
     *
     * @async
     * @function logout
     * @returns {Promise<void>}
     */
    const logout = useCallback(async () => {
        try {
            // Ask the server to clear the HTTP-only cookie
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'same-origin',
            });
        } catch {
            // Even if the network call fails, clear the client state.
            // The server-side cookie will expire on its own.
            console.error('Logout request failed — clearing client state anyway');
        } finally {
            setUser(null);
            setError(null);
        }
    }, [setUser]);

    // ─────────────────────────────────────────────────────────────────────────
    // CONTEXT VALUE
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <LoginContext.Provider value={{
            user,        // The authenticated user's public profile, or null
            error,       // Last authentication error, or null
            isLoading,   // true while checking stored session on mount
            login,       // Function to log in
            logout,      // Function to log out
        }}>
            {children}
        </LoginContext.Provider>
    );
};
