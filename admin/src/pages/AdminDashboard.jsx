import React from 'react';
import {
    Users, BookOpen, ShoppingBag, TrendingUp,
    Activity, AlertCircle, CheckCircle, Clock,
    ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformStore';

const C = {
    accent: '#ef4444', blue: '#3b82f6', green: '#22c55e',
    yellow: '#f59e0b', purple: '#a855f7', muted: '#a1a1aa', dim: '#555',
    card: '#111', raised: '#181818', border: 'rgba(255,255,255,0.08)', borderS: 'rgba(255,255,255,0.05)',
};

function StatCard({ label, value, Icon, color }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: C.muted, fontWeight: 500 }}>{label}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={color} />
                </div>
            </div>
            <div>
                <p style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>{value}</p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const {
        stats, statsLoading, users, usersLoading,
        courses, totalEnrollments, activeCoursesCount, announcements,
    } = usePlatform();

    /* ── Derived values ── */
    const totalUsers = stats?.totalUsers ?? users.length;
    const activeUsers = stats?.activeUsers ?? users.filter(u => (u.status || 'active') === 'active').length;
    const inactiveUsers = stats?.inactiveUsers ?? users.filter(u => u.status === 'inactive').length;
    const recentUsers = stats?.recentUsers ?? [...users].slice(0, 5);
    const enrollments = stats?.totalEnrollments ?? totalEnrollments;
    const activeCourses = activeCoursesCount;
    const recentEnrollments = users
        .flatMap(u => (u.enrolledCourses || []).map(e => ({ user: u.name, course: e.title, enrolledAt: e.enrolledAt })))
        .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
        .slice(0, 5);

    /* Health indicator */
    const health = activeUsers === 0
        ? { label: 'Critical', color: C.accent }
        : inactiveUsers / Math.max(totalUsers, 1) > 0.5
            ? { label: 'Warning', color: C.yellow }
            : { label: 'Good', color: C.green };

    const STATS = [
        { label: 'Total Users', value: statsLoading ? '—' : totalUsers.toLocaleString(), Icon: Users, color: C.blue },
        { label: 'Active Courses', value: statsLoading ? '—' : activeCourses, Icon: BookOpen, color: C.purple },
        { label: 'Enrollments', value: statsLoading ? '—' : enrollments.toLocaleString(), Icon: ShoppingBag, color: C.green },
        { label: 'Announcements', value: announcements.length, Icon: TrendingUp, color: C.yellow },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Dashboard Overview</h1>
                <p style={{ fontSize: '14px', color: C.muted }}>Welcome back — here's what's happening on LevelUp.dev</p>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {STATS.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Two-col row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>

                {/* Recent enrollments */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.borderS}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={15} color={C.accent} />
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>Recent Enrollments</span>
                        </div>
                        <span style={{ fontSize: '12px', color: C.dim }}>Latest</span>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                        {recentEnrollments.length === 0 ? (
                            <p style={{ padding: '20px 22px', fontSize: '13px', color: C.dim }}>No enrollments yet.</p>
                        ) : recentEnrollments.map((e, i) => (
                            <div key={i} style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: i < recentEnrollments.length - 1 ? `1px solid ${C.borderS}` : 'none' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                                    {(e.user || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{e.user}</p>
                                    <p style={{ fontSize: '11px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.12)', color: C.green }}>confirmed</span>
                                    <p style={{ fontSize: '10px', color: C.dim, marginTop: '3px' }}>
                                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* System alerts */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <AlertCircle size={15} color={C.yellow} />
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>System Alerts</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { msg: `Platform health: ${health.label}`, color: health.color, Icon: health.label === 'Good' ? CheckCircle : AlertCircle },
                                { msg: `${activeUsers} active / ${inactiveUsers} inactive users`, color: C.blue, Icon: CheckCircle },
                                { msg: 'Server running on port 5000', color: C.green, Icon: CheckCircle },
                            ].map(({ msg, color, Icon }, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: `${color}0f`, borderRadius: '8px', border: `1px solid ${color}22` }}>
                                    <Icon size={13} color={color} />
                                    <span style={{ fontSize: '12px', color: C.muted }}>{msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Platform health bars */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px 22px' }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>Platform Health</p>
                        {[
                            { label: 'Active Users', val: activeUsers, pct: totalUsers ? Math.round(activeUsers / totalUsers * 100) : 0, color: C.green },
                            { label: 'Active Courses', val: activeCourses, pct: courses.length ? Math.round(activeCourses / courses.length * 100) : 0, color: C.blue },
                            { label: 'Enrollments', val: enrollments, pct: Math.min(100, Math.round(enrollments / 10)), color: C.purple },
                            { label: 'Announcements', val: announcements.length, pct: Math.min(100, announcements.length * 10), color: C.yellow },
                        ].map(({ label, val, pct, color }) => (
                            <div key={label} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '12px', color: C.muted }}>{label}</span>
                                    <span style={{ fontSize: '12px', color, fontWeight: 600 }}>{statsLoading ? '—' : val}</span>
                                </div>
                                <div style={{ height: '4px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Users table */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.borderS}`, display: 'flex', alignItems: 'center' }}>
                    <Users size={15} color={C.blue} style={{ marginRight: '8px' }} />
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Recent Users</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${C.borderS}` }}>
                                {['User', 'Email', 'Courses', 'Joined', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '11px 22px', textAlign: 'left', fontSize: '11px', color: C.dim, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <tr><td colSpan={5} style={{ padding: '24px 22px', textAlign: 'center', color: C.dim, fontSize: '13px' }}>Loading users…</td></tr>
                            ) : recentUsers.map((u, i) => (
                                <tr key={u._id || i}
                                    style={{ borderBottom: i < recentUsers.length - 1 ? `1px solid ${C.borderS}` : 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '13px 22px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>
                                                {(u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 22px', color: C.muted }}>{u.email}</td>
                                    <td style={{ padding: '13px 22px' }}>
                                        <span style={{ background: 'rgba(59,130,246,0.12)', color: C.blue, borderRadius: '20px', padding: '2px 10px', fontWeight: 600, fontSize: '12px' }}>
                                            {u.enrolledCount ?? 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 22px', color: C.muted }}>
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td style={{ padding: '13px 22px' }}>
                                        <span style={{ background: (u.status || 'active') === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(85,85,85,0.2)', color: (u.status || 'active') === 'active' ? C.green : C.dim, borderRadius: '20px', padding: '3px 10px', fontWeight: 600, fontSize: '11px' }}>
                                            {u.status || 'active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
