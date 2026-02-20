import React, { useState } from 'react';
import { Search, Filter, UserCheck, UserX, Mail } from 'lucide-react';
import { usePlatform } from '../context/PlatformStore';

const C = {
    accent: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#f59e0b',
    muted: '#a1a1aa', dim: '#555', card: '#111',
    border: 'rgba(255,255,255,0.08)', borderS: 'rgba(255,255,255,0.05)',
};

export default function AdminUsers() {
    const { users, usersLoading, usersError, toggleUserStatus } = usePlatform();
    const [search, setSearch] = useState('');

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Users</h1>
                <p style={{ fontSize: '14px', color: C.muted }}>Manage all registered users on the platform</p>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} color={C.dim} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text" placeholder="Search users…" value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', background: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px 10px 36px', fontSize: '13px', color: '#fff', fontFamily: 'inherit', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e => e.target.style.borderColor = C.border}
                    />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#111', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Filter size={13} /> Filter
                </button>
            </div>

            {/* Table */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${C.borderS}` }}>
                                {['User', 'Email', 'Role', 'Courses', 'Joined', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', color: C.dim, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <tr><td colSpan={7} style={{ padding: '30px 20px', textAlign: 'center', color: C.dim, fontSize: '13px' }}>Loading users from server…</td></tr>
                            ) : usersError ? (
                                <tr><td colSpan={7} style={{ padding: '30px 20px', textAlign: 'center', color: C.accent, fontSize: '13px' }}>{usersError}</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '30px 20px', textAlign: 'center', color: C.dim, fontSize: '13px' }}>No users found.</td></tr>
                            ) : filtered.map(u => (
                                <tr key={u._id}
                                    style={{ borderBottom: `1px solid ${C.borderS}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '13px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                                                {(u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 20px', color: C.muted }}>{u.email}</td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <span style={{ background: u.role === 'ADMIN' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)', color: u.role === 'ADMIN' ? C.accent : C.blue, borderRadius: '20px', padding: '2px 10px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 20px', fontWeight: 600 }}>{u.enrolledCount ?? 0}</td>
                                    <td style={{ padding: '13px 20px', color: C.muted }}>
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <span style={{ background: (u.status || 'active') === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(85,85,85,0.2)', color: (u.status || 'active') === 'active' ? C.green : C.dim, borderRadius: '20px', padding: '3px 10px', fontWeight: 600, fontSize: '11px' }}>
                                            {u.status || 'active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            {/* ── Mail button: opens system email client directly ── */}
                                            <a
                                                href={`mailto:${u.email}?subject=${encodeURIComponent('LevelUp.dev — Message from Admin')}&body=${encodeURIComponent(`Hi ${u.name},\n\n`)}`}
                                                title={`Email ${u.name} (${u.email})`}
                                                style={{
                                                    padding: '6px', background: 'transparent',
                                                    border: `1px solid ${C.borderS}`, borderRadius: '7px',
                                                    color: C.blue, cursor: 'pointer', display: 'flex',
                                                    textDecoration: 'none', transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = C.blue; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.borderS; }}
                                            >
                                                <Mail size={13} />
                                            </a>

                                            {/* ── Activate / Deactivate button ── */}
                                            <button
                                                title={(u.status || 'active') === 'active' ? `Deactivate ${u.name}` : `Reactivate ${u.name}`}
                                                onClick={() => toggleUserStatus(u._id, u.status || 'active')}
                                                style={{
                                                    padding: '6px 10px', background: 'transparent',
                                                    border: `1px solid ${C.borderS}`, borderRadius: '7px',
                                                    color: (u.status || 'active') === 'active' ? C.yellow : C.green,
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    gap: '4px', fontSize: '11px', fontFamily: 'inherit',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => {
                                                    const isActive = (u.status || 'active') === 'active';
                                                    e.currentTarget.style.background = isActive ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)';
                                                    e.currentTarget.style.borderColor = isActive ? C.yellow : C.green;
                                                }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.borderS; }}
                                            >
                                                {(u.status || 'active') === 'active'
                                                    ? <><UserX size={12} /> Deactivate</>
                                                    : <><UserCheck size={12} /> Activate</>
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.borderS}`, fontSize: '12px', color: C.dim }}>
                    Showing {filtered.length} of {users.length} users
                </div>
            </div>
        </div>
    );
}
