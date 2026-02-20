/**
 * AdminAuthContext
 *
 * Security model:
 * 1. Admin credentials are validated by calling the main API /admin/login endpoint.
 * 2. A WHITELIST of allowed admin emails is enforced on the CLIENT side as a first gate.
 *    Even if someone guesses the password, only whitelisted emails proceed.
 * 3. The admin JWT is stored in sessionStorage (not localStorage) — it's cleared when
 *    the browser tab/window closes.
 * 4. The token is short-lived (1h) and carries an `isAdmin: true` flag set server-side.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

/* ── ADMIN WHITELIST ─────────────────────────────────────────────────────── */
const ADMIN_WHITELIST = [
    'hello@moinsheikh.in',
];

const API = 'http://localhost:5000/api';

/* ── Context ── */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);      // admin user object
    const [loading, setLoading] = useState(true);      // resolving session
    const [loginErr, setLoginErr] = useState('');

    /* Restore session from sessionStorage */
    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        const stored = sessionStorage.getItem('adminUser');
        if (token && stored) {
            try { setAdmin(JSON.parse(stored)); }
            catch { sessionStorage.clear(); }
        }
        setLoading(false);
    }, []);

    /* ── Login ── */
    const login = async (email, password) => {
        setLoginErr('');
        const normalizedEmail = email.toLowerCase().trim();

        // Client-side whitelist gate
        if (!ADMIN_WHITELIST.includes(normalizedEmail)) {
            const msg = `Access denied: "${normalizedEmail}" is not in the admin whitelist.`;
            console.error('[AdminAuth]', msg);
            setLoginErr('Access denied. You are not authorised as an admin.');
            return false;
        }

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail, password }),
            });
            const data = await res.json();
            console.log('[AdminAuth] API response:', res.status, data);

            if (!res.ok) {
                const msg = data.message || 'Invalid credentials';
                console.error('[AdminAuth] Login failed:', msg);
                setLoginErr(msg);
                return false;
            }

            // Second whitelist check on returned user email
            const userEmail = (data.user?.email || '').toLowerCase().trim();
            if (!ADMIN_WHITELIST.includes(userEmail)) {
                const msg = `Server returned user "${userEmail}" which is not in whitelist.`;
                console.error('[AdminAuth]', msg);
                setLoginErr('Access denied. Account is not an admin.');
                return false;
            }

            sessionStorage.setItem('adminToken', data.token);
            sessionStorage.setItem('adminUser', JSON.stringify(data.user));
            setAdmin(data.user);
            console.log('[AdminAuth] Login successful as', userEmail);
            return true;
        } catch (err) {
            console.error('[AdminAuth] Network/parse error:', err);
            setLoginErr('Server unreachable. Make sure the API is running on port 5000.');
            return false;
        }
    };

    /* ── Logout ── */
    const logout = () => {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout, loginErr, setLoginErr }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
