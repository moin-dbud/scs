import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Page Imports
import Home from '../pages/Home';
import About from '../pages/About';
import Blogs from '../pages/Blogs';
import Dashboard from '../pages/Dashboard';
import Course from '../pages/Course';
import Task from '../pages/Task';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Courses from '../pages/Courses';
import NotFound from '../pages/NotFound';

const API = 'http://localhost:5000/api';

/* ──────────────────────────────────────────
   Maintenance Page
────────────────────────────────────────── */
function MaintenancePage() {
    return (
        <div style={{
            minHeight: '100vh', background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px', fontFamily: 'outfit, Arial, sans-serif',
            textAlign: 'center',
        }}>
            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
            `}</style>

            {/* Animated gear icon */}
            <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '28px', boxShadow: '0 0 50px rgba(245,158,11,0.12)',
                animation: 'fadeUp 0.5s ease',
            }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
            </div>

            <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '10px', letterSpacing: '-0.5px' }}>
                    Under Maintenance
                </h1>
                <p style={{ fontSize: '15px', color: '#71717a', maxWidth: '440px', lineHeight: 1.7, marginBottom: '32px' }}>
                    We're performing scheduled maintenance to improve your experience.
                    We'll be back shortly — hang tight!
                </p>
            </div>

            {/* Animated progress bar */}
            <div style={{
                width: '260px', height: '3px', background: '#1a1a1a',
                borderRadius: '99px', overflow: 'hidden', marginBottom: '28px',
                animation: 'fadeUp 0.5s ease 0.2s both',
            }}>
                <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    borderRadius: '99px',
                    animation: 'pulse 2s ease-in-out infinite',
                    width: '60%',
                }} />
            </div>

            {/* Info card */}
            <div style={{
                background: '#111', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: '14px', padding: '16px 24px', maxWidth: '380px', width: '100%',
                animation: 'fadeUp 0.5s ease 0.3s both',
            }}>
                <p style={{ fontSize: '12px', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Maintenance in progress — LevelUp.dev</span>
                </div>
            </div>

            <p style={{ marginTop: '32px', fontSize: '11px', color: '#2a2a2a', animation: 'fadeUp 0.5s ease 0.4s both' }}>
                If this persists, contact <a href="mailto:hello@moinsheikh.in" style={{ color: '#555', textDecoration: 'none' }}>hello@moinsheikh.in</a>
            </p>
        </div>
    );
}

/* ──────────────────────────────────────────
   Maintenance Guard — wraps entire app
────────────────────────────────────────── */
function MaintenanceGuard({ children }) {
    const [maintenance, setMaintenance] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const check = () =>
            fetch(`${API}/admin/settings/public`)
                .then(r => r.json())
                .then(d => setMaintenance(!!d.maintenanceMode))
                .catch(() => { })
                .finally(() => setChecked(true));

        check();
        const tid = setInterval(check, 15_000); // re-check every 15 s
        return () => clearInterval(tid);
    }, []);

    // Wait for first check before rendering anything (avoids flash)
    if (!checked) return null;

    if (maintenance) return <MaintenancePage />;
    return children;
}

/* ──────────────────────────────────────────
   Route Guards
────────────────────────────────────────── */

function FullPageLoader() {
    return (
        <div style={{
            minHeight: '100vh', background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '16px',
            fontFamily: 'outfit, Arial, sans-serif',
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '3px solid rgba(60,131,246,0.2)',
                borderTopColor: '#3C83F6',
                animation: 'spin 0.75s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Loading…</p>
        </div>
    );
}

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <FullPageLoader />;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
}

/**
 * Blocks deactivated users from all routes except /dashboard.
 */
function ActiveRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <FullPageLoader />;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if ((user.status || 'active') === 'inactive') return <Navigate to="/dashboard" replace />;
    return children;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <FullPageLoader />;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}

/* ──────────────────────────────────────────
   Routes
────────────────────────────────────────── */
const AppRoutes = () => {
    return (
        <MaintenanceGuard>
            <Routes>
                {/* ── Public Routes ── */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/blogs" element={<Blogs />} />

                {/* ── Guest-only ── */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                {/* ── Dashboard: all logged-in users ── */}
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                {/* ── Active users only ── */}
                <Route path="/profile" element={<ActiveRoute><Profile /></ActiveRoute>} />
                <Route path="/courses" element={<ActiveRoute><Courses /></ActiveRoute>} />
                <Route path="/course/:id" element={<ActiveRoute><Course /></ActiveRoute>} />
                <Route path="/task/:id" element={<ActiveRoute><Task /></ActiveRoute>} />

                {/* ── 404 ── */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </MaintenanceGuard>
    );
};

export default AppRoutes;
