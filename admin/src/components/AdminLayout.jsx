import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, ShoppingBag,
    Settings, LogOut, Shield, Menu, X, ChevronRight, Megaphone, Layers,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const C = {
    bg: '#000', nav: '#0d0d0d', border: 'rgba(255,255,255,0.07)',
    accent: '#ef4444', muted: '#a1a1aa', dim: '#555',
    text: '#fff', card: '#111',
};

const NAV = [
    { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/users', label: 'Users', Icon: Users },
    { to: '/courses', label: 'Courses', Icon: BookOpen },
    { to: '/course-modules', label: 'Course Modules', Icon: Layers },
    { to: '/enrollments', label: 'Enrollments', Icon: ShoppingBag },
    { to: '/announcements', label: 'Announcements', Icon: Megaphone },
    { to: '/settings', label: 'Settings', Icon: Settings },
];

export default function AdminLayout({ children }) {
    const { admin, logout } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const initials = admin?.firstName
        ? `${admin.firstName[0]}${admin.lastName?.[0] || ''}`.toUpperCase()
        : 'A';

    const sideW = collapsed ? '64px' : '230px';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>

            {/* ══ SIDEBAR ══ */}
            <aside style={{
                width: sideW, minHeight: '100vh', background: C.nav,
                borderRight: `1px solid ${C.border}`, position: 'fixed', top: 0, left: 0, bottom: 0,
                display: 'flex', flexDirection: 'column',
                transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', overflow: 'hidden', zIndex: 50,
            }}>
                {/* Logo */}
                <div style={{ padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                    {!collapsed && (
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={14} color={C.accent} />
                            </div>
                            <span style={{ fontWeight: 900, fontSize: '15px' }}>
                                LevelUp<span style={{ color: C.accent }}>.dev</span>
                                <span style={{ display: 'block', fontSize: '9px', color: C.dim, letterSpacing: '1.5px', fontWeight: 600 }}>ADMIN</span>
                            </span>
                        </Link>
                    )}
                    <button onClick={() => setCollapsed(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: '4px', display: 'flex', borderRadius: '6px' }}>
                        {collapsed ? <Menu size={18} /> : <X size={18} />}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                    {NAV.map(({ to, label, Icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link key={to} to={to} title={collapsed ? label : undefined} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '10px' : '10px 12px', marginBottom: '2px', borderRadius: '9px', justifyContent: collapsed ? 'center' : 'flex-start', background: active ? 'rgba(239,68,68,0.12)' : 'transparent', color: active ? C.accent : C.muted, fontWeight: active ? 700 : 500, fontSize: '13px', transition: 'all 0.15s', position: 'relative' }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(239,68,68,0.12)' : 'transparent'; e.currentTarget.style.color = active ? C.accent : C.muted; }}
                            >
                                {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: C.accent, borderRadius: '0 3px 3px 0' }} />}
                                <Icon size={16} />
                                {!collapsed && <span>{label}</span>}
                                {!collapsed && active && <ChevronRight size={13} style={{ marginLeft: 'auto' }} />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin user */}
                <div style={{ padding: '10px 8px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '9px', marginBottom: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                            {initials}
                        </div>
                        {!collapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.firstName} {admin?.lastName}</p>
                                <p style={{ fontSize: '10px', color: C.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.email}</p>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', padding: collapsed ? '10px' : '10px 12px', background: 'none', border: 'none', borderRadius: '9px', color: C.dim, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = C.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.dim; }}
                    >
                        <LogOut size={15} />
                        {!collapsed && 'Sign Out'}
                    </button>
                </div>
            </aside>

            {/* ══ MAIN CONTENT ══ */}
            <main style={{ flex: 1, marginLeft: sideW, transition: 'margin-left 0.25s cubic-bezier(.4,0,.2,1)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Topbar */}
                <header style={{ height: '60px', background: C.nav, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.dim }}>
                        <span>Admin</span>
                        <ChevronRight size={12} />
                        <span style={{ color: C.muted, fontWeight: 600, textTransform: 'capitalize' }}>
                            {location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '4px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '20px', fontSize: '11px', color: C.accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Shield size={10} /> ADMIN
                        </div>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div style={{ flex: 1, padding: '28px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
