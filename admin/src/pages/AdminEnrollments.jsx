import React, { useMemo, useState } from 'react';
import { ShoppingBag, CheckCircle, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { usePlatform } from '../context/PlatformStore';

const C = {
    accent: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#f59e0b',
    muted: '#a1a1aa', dim: '#555', card: '#111',
    border: 'rgba(255,255,255,0.08)', borderS: 'rgba(255,255,255,0.05)',
};

/* Format price: course.price is a Number stored in DB */
const fmt = (price) =>
    price != null ? `₹${Number(price).toLocaleString('en-IN')}` : '—';

/* Relative date */
const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AdminEnrollments() {
    const { users, usersLoading, courses, fetchUsers } = usePlatform();
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    /* ── Derive flat enrollment rows from users ── */
    const enrollments = useMemo(() => {
        const rows = [];
        users.forEach(u => {
            (u.enrolledCourses || []).forEach(ec => {
                /* Find matching course from catalog for price */
                const catalogCourse = courses.find(c => c._id === ec.courseId || c.id === ec.courseId);
                rows.push({
                    key: `${u._id}-${ec.courseId}`,
                    userName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                    email: u.email,
                    course: ec.title,
                    courseId: ec.courseId,
                    price: catalogCourse ? fmt(catalogCourse.price) : '—',
                    progress: ec.progress || 0,
                    enrolledAt: ec.enrolledAt,
                    status: (u.status || 'active') === 'active' ? 'active' : 'inactive',
                });
            });
        });
        /* Sort newest first */
        return rows.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
    }, [users, courses]);

    /* Search filter */
    const filtered = useMemo(() =>
        enrollments.filter(e =>
            e.userName.toLowerCase().includes(search.toLowerCase()) ||
            e.course.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase())
        ), [enrollments, search]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    };

    /* Summary counts */
    const totalEnrollments = enrollments.length;
    const activeCount = enrollments.filter(e => e.status === 'active').length;
    const avgProgress = totalEnrollments
        ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / totalEnrollments)
        : 0;

    return (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Enrollments</h1>
                    <p style={{ fontSize: '14px', color: C.muted }}>All course enrollments — live from the database</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || usersLoading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', background: '#1a1a1a',
                        border: `1px solid ${C.border}`, borderRadius: '9px',
                        color: C.muted, fontSize: '12px', fontWeight: 600,
                        cursor: refreshing ? 'wait' : 'pointer', fontFamily: 'inherit',
                        opacity: refreshing ? 0.6 : 1, transition: 'all 0.15s',
                    }}
                >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {/* Summary pills */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Enrollments', val: totalEnrollments, color: C.blue, icon: <ShoppingBag size={14} /> },
                    { label: 'Active Users', val: activeCount, color: C.green, icon: <CheckCircle size={14} /> },
                    { label: 'Avg Progress', val: `${avgProgress}%`, color: C.yellow, icon: <TrendingUp size={14} /> },
                ].map(({ label, val, color, icon }) => (
                    <div key={label} style={{
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: '10px', padding: '12px 20px',
                        display: 'flex', gap: '10px', alignItems: 'center',
                    }}>
                        <span style={{ color }}>{icon}</span>
                        <span style={{ fontSize: '20px', fontWeight: 800, color }}>{val}</span>
                        <span style={{ fontSize: '12px', color: C.muted }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '16px' }}>
                <Search size={14} color={C.dim} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder="Search by user, email, or course…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%', boxSizing: 'border-box', background: '#0d0d0d',
                        border: `1px solid ${C.border}`, borderRadius: '10px',
                        padding: '10px 12px 10px 36px', fontSize: '13px',
                        color: '#fff', fontFamily: 'inherit', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                />
            </div>

            {/* Table */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${C.borderS}` }}>
                                {['Student', 'Course', 'Price', 'Progress', 'Enrolled', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: '11px', color: C.dim, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                /* Loading skeleton */
                                [1, 2, 3].map(i => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${C.borderS}` }}>
                                        {[1, 2, 3, 4, 5, 6].map(j => (
                                            <td key={j} style={{ padding: '14px 20px' }}>
                                                <div style={{ height: '12px', background: '#1e1e1e', borderRadius: '6px', width: j === 1 ? '70%' : '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                                        <ShoppingBag size={28} color={C.dim} style={{ margin: '0 auto 10px', display: 'block' }} />
                                        <p style={{ color: C.dim, fontSize: '14px' }}>
                                            {search ? 'No results for your search.' : 'No enrollments found yet.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(e => (
                                    <tr key={e.key} style={{ borderBottom: `1px solid ${C.borderS}` }}
                                        onMouseEnter={el => el.currentTarget.style.background = '#161616'}
                                        onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Student */}
                                        <td style={{ padding: '13px 20px' }}>
                                            <p style={{ fontWeight: 600, marginBottom: '2px' }}>{e.userName}</p>
                                            <p style={{ fontSize: '11px', color: C.dim }}>{e.email}</p>
                                        </td>

                                        {/* Course */}
                                        <td style={{ padding: '13px 20px', color: C.muted, maxWidth: '180px' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{e.course}</span>
                                        </td>

                                        {/* Price */}
                                        <td style={{ padding: '13px 20px', fontWeight: 700, color: C.green }}>{e.price}</td>

                                        {/* Progress */}
                                        <td style={{ padding: '13px 20px', minWidth: '130px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '4px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${e.progress}%`, height: '100%', background: C.blue, borderRadius: '99px' }} />
                                                </div>
                                                <span style={{ fontSize: '11px', color: C.muted, flexShrink: 0 }}>{e.progress}%</span>
                                            </div>
                                        </td>

                                        {/* Enrolled date */}
                                        <td style={{ padding: '13px 20px', color: C.muted }}>{fmtDate(e.enrolledAt)}</td>

                                        {/* Status */}
                                        <td style={{ padding: '13px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                                                background: e.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: e.status === 'active' ? C.green : C.accent,
                                            }}>
                                                <CheckCircle size={10} />
                                                {e.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.borderS}`, fontSize: '12px', color: C.dim, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Showing {filtered.length} of {totalEnrollments} enrollments</span>
                    {search && filtered.length !== totalEnrollments && (
                        <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                            Clear filter
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
