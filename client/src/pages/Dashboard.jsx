import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, Bell, LogOut, ShieldOff, Mail,
    PlayCircle, ChevronRight, Loader2, TrendingUp,
    Megaphone, Zap, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── shared colour tokens (same as Course.jsx) ── */
const C = {
    bg: '#0a0a0a',
    nav: '#0f0f0f',
    card: '#141414',
    raised: '#1a1a1a',
    border: 'rgba(255,255,255,0.07)',
    borderH: 'rgba(255,255,255,0.12)',
    accent: '#3C83F6',
    muted: '#a1a1aa',
    dim: '#555',
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
    text: '#fff',
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
@keyframes spin     { to { transform: rotate(360deg); } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius:4px; }
.card-hover { transition: border-color 0.2s, background 0.2s; }
.card-hover:hover { border-color: rgba(255,255,255,0.12) !important; background: #1c1c1c !important; }
.btn-primary { transition: opacity 0.15s, transform 0.15s; }
.btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
.nav-link { transition: color 0.15s; }
.nav-link:hover { color: #fff !important; }
`;

/* ──────────────────────────────────────────────────
   Deactivated screen
────────────────────────────────────────────────── */
function DeactivatedScreen({ user, onLogout }) {
    const adminEmail = 'hello@moinsheikh.in';
    const subject = encodeURIComponent('Account Reactivation Request — LevelUp.dev');
    const body = encodeURIComponent(
        `Hi Admin,\n\nMy account (${user?.email}) has been deactivated.\nI would like to understand the reason and request reactivation.\n\nThank you.`
    );
    return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 0 40px rgba(239,68,68,0.12)' }}>
                <ShieldOff size={34} color={C.red} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: C.text, marginBottom: '10px' }}>Account Deactivated</h1>
            <p style={{ fontSize: '14px', color: C.muted, maxWidth: '420px', lineHeight: 1.8, marginBottom: '28px' }}>
                Your account has been temporarily deactivated by an admin.<br />
                If you believe this is a mistake, please reach out and we'll review it promptly.
            </p>
            <div style={{ background: C.card, border: `1px solid rgba(239,68,68,0.18)`, borderRadius: '14px', padding: '16px 22px', marginBottom: '28px', maxWidth: '380px', width: '100%', textAlign: 'left' }}>
                {[['Account', user?.email || '—'], ['Status', 'Deactivated'], ['Next step', 'Contact admin']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: '12px', color: C.dim, fontWeight: 600 }}>{k}</span>
                        <span style={{ fontSize: '12px', color: k === 'Status' ? C.red : C.text, fontWeight: 700 }}>{v}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href={`mailto:${adminEmail}?subject=${subject}&body=${body}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: C.red, borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                    <Mail size={14} /> Contact Admin
                </a>
                <button onClick={onLogout}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: C.raised, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Stat pill
────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color = C.accent }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '0' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
            </div>
            <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: C.text, margin: '0 0 2px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>{label}</p>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Main Dashboard
────────────────────────────────────────────────── */
export default function Dashboard() {
    const { user, getEnrolledCourses, logout } = useAuth();
    const navigate = useNavigate();

    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [annoLoading, setAnnoLoading] = useState(true);

    /* Enrolled courses */
    useEffect(() => {
        if (!user || user.status === 'inactive') { setCoursesLoading(false); return; }
        Promise.all([
            getEnrolledCourses(),
            fetch('http://localhost:5000/api/admin/courses/public').then(r => r.json()),
        ])
            .then(([enrolled, catalog]) => {
                const live = enrolled?.enrolledCourses || [];
                const ids = new Set((catalog?.courses || []).map(c => c._id));
                setEnrolledCourses(live.filter(c => ids.has(c.courseId)));
            })
            .catch(() => { })
            .finally(() => setCoursesLoading(false));
    }, [user]);

    /* Announcements — poll every 30 s */
    useEffect(() => {
        const load = () =>
            fetch('http://localhost:5000/api/admin/announcements/public')
                .then(r => r.json())
                .then(d => setAnnouncements(d.announcements || []))
                .catch(() => { })
                .finally(() => setAnnoLoading(false));
        load();
        const tid = setInterval(load, 30_000);
        return () => clearInterval(tid);
    }, []);

    /* ── deactivated ── */
    if (user && user.status === 'inactive')
        return <DeactivatedScreen user={user} onLogout={logout} />;

    const overallProgress = enrolledCourses.length
        ? Math.round(enrolledCourses.reduce((a, c) => a + (c.progress || 0), 0) / enrolledCourses.length)
        : 0;
    const completedCount = enrolledCourses.filter(c => (c.progress || 0) >= 100).length;
    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';

    const timeAgo = (iso) => {
        const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Outfit, Arial, sans-serif', color: C.text }}>
            <style>{css}</style>

            {/* ══ TOPBAR ══ */}
            <nav style={{ background: C.nav, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontWeight: 900, fontSize: '20px', color: C.text }}>LevelUp<span style={{ color: C.accent }}>.dev</span></span>
                    </Link>

                    {/* Nav links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[['/', 'Home'], ['/courses', 'Courses'], ['/blogs', 'Blogs']].map(([to, label]) => (
                            <Link key={to} to={to} className="nav-link"
                                style={{ padding: '7px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: C.muted, textDecoration: 'none' }}>
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{user ? `${user.firstName} ${user.lastName}`.trim() : ''}</span>
                            <span style={{ fontSize: '11px', color: C.muted }}>Student</span>
                        </div>
                        <Link to="/profile" style={{ textDecoration: 'none' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#3C83F6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
                                {initials}
                            </div>
                        </Link>
                        <button onClick={logout}
                            title="Sign out"
                            style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'transparent', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.dim }}>
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ══ PAGE BODY ══ */}
            <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Welcome row */}
                <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 4px', lineHeight: 1.2 }}>
                        Welcome back, <span style={{ color: C.accent }}>{user?.firstName || '…'}</span> 👋🏻
                    </h1>
                    <p style={{ fontSize: '14px', color: C.muted, margin: 0 }}>
                        {enrolledCourses.length === 0
                            ? 'Start your learning journey — browse courses below.'
                            : 'Pick up where you left off.'}
                    </p>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', animation: 'fadeUp 0.45s ease' }}>
                    <StatCard icon={BookOpen} label="Enrolled Courses" value={enrolledCourses.length} color={C.accent} />
                    <StatCard icon={TrendingUp} label="Avg. Progress" value={`${overallProgress}%`} color="#a855f7" />
                    <StatCard icon={CheckCircle2} label="Completed" value={completedCount} color={C.green} />
                    <StatCard icon={Zap} label="Announcements" value={announcements.length} color={C.amber} />
                </div>

                {/* Main 2-column */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start', animation: 'fadeUp 0.5s ease' }}>

                    {/* ── LEFT: Enrolled courses ── */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(60,131,246,0.12)', border: '1px solid rgba(60,131,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={15} color={C.accent} />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '15px' }}>My Courses</span>
                            </div>
                            <Link to="/courses"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.accent, fontWeight: 700, textDecoration: 'none' }}>
                                Browse all <ChevronRight size={13} />
                            </Link>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '300px' }}>
                            {coursesLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} style={{ background: C.raised, borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', animation: 'pulse 1.5s infinite' }}>
                                        <div style={{ width: '88px', height: '56px', borderRadius: '8px', background: '#222', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ height: '13px', background: '#222', borderRadius: '6px', marginBottom: '8px', width: '60%' }} />
                                            <div style={{ height: '10px', background: '#222', borderRadius: '6px', width: '40%', marginBottom: '12px' }} />
                                            <div style={{ height: '4px', background: '#222', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                ))
                            ) : enrolledCourses.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', gap: '14px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(60,131,246,0.1)', border: '1px solid rgba(60,131,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={26} color={C.accent} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 5px' }}>No courses yet</p>
                                        <p style={{ fontSize: '13px', color: C.muted, margin: 0, maxWidth: '240px' }}>Pick a course and start building real skills today.</p>
                                    </div>
                                    <Link to="/courses" className="btn-primary"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: C.accent, borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                                        Browse Courses <ChevronRight size={14} />
                                    </Link>
                                </div>
                            ) : (
                                enrolledCourses.map(course => {
                                    const prog = course.progress || 0;
                                    const enrolledLabel = course.enrolledAt
                                        ? `Enrolled ${new Date(course.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        : 'Recently enrolled';
                                    const isComplete = prog >= 100;
                                    return (
                                        <div key={course.courseId} className="card-hover"
                                            style={{ background: C.raised, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
                                                {/* Thumbnail */}
                                                <div style={{ width: '88px', height: '58px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#1e1e1e' }}>
                                                    {course.image
                                                        ? <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={20} color={C.dim} /></div>
                                                    }
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</p>
                                                    <p style={{ fontSize: '11px', color: C.dim, margin: '0 0 10px' }}>{enrolledLabel}</p>
                                                    {/* Progress bar */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, height: '4px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${prog}%`, height: '100%', background: isComplete ? C.green : C.accent, borderRadius: '99px', transition: 'width 0.5s' }} />
                                                        </div>
                                                        <span style={{ fontSize: '11px', fontWeight: 700, color: isComplete ? C.green : C.accent, flexShrink: 0 }}>{prog}%</span>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <Link to={`/course/${course.courseId}`} className="btn-primary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: isComplete ? 'rgba(34,197,94,0.1)' : C.accent, color: isComplete ? C.green : '#fff', fontWeight: 700, fontSize: '12px', textDecoration: 'none', flexShrink: 0, border: isComplete ? '1px solid rgba(34,197,94,0.25)' : 'none', whiteSpace: 'nowrap' }}>
                                                    {isComplete ? <><CheckCircle2 size={13} /> Review</> : <><PlayCircle size={13} /> Resume</>}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Announcements ── */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Megaphone size={15} color={C.amber} />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '15px' }}>Announcements</span>
                            </div>
                            {announcements.length > 0 && (
                                <span style={{ fontSize: '10px', fontWeight: 800, background: C.amber, color: '#000', borderRadius: '99px', padding: '2px 8px' }}>{announcements.length}</span>
                            )}
                        </div>

                        {/* Body */}
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                            {annoLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} style={{ background: C.raised, borderRadius: '10px', padding: '13px', animation: 'pulse 1.5s infinite' }}>
                                        <div style={{ height: '12px', background: '#222', borderRadius: '6px', marginBottom: '7px', width: '60%' }} />
                                        <div style={{ height: '10px', background: '#222', borderRadius: '6px', width: '85%' }} />
                                    </div>
                                ))
                            ) : announcements.length === 0 ? (
                                <div style={{ padding: '48px 16px', textAlign: 'center' }}>
                                    <Bell size={28} color={C.dim} style={{ margin: '0 auto 10px', display: 'block' }} />
                                    <p style={{ fontSize: '13px', color: C.dim, margin: 0 }}>No announcements yet</p>
                                    <p style={{ fontSize: '11px', color: '#333', margin: '4px 0 0' }}>Check back later for updates.</p>
                                </div>
                            ) : (
                                announcements.map((a, i) => (
                                    <div key={a._id || i} className="card-hover"
                                        style={{ background: C.raised, borderRadius: '10px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                        <div style={{ height: '3px', background: `linear-gradient(90deg, ${C.amber}, transparent)` }} />
                                        <div style={{ padding: '11px 13px', display: 'flex', gap: '10px' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                                <Megaphone size={12} color={C.amber} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 3px', lineHeight: 1.3 }}>{a.title}</p>
                                                {a.description && (
                                                    <p style={{ fontSize: '12px', color: C.muted, margin: '0 0 5px', lineHeight: 1.55 }}>{a.description}</p>
                                                )}
                                                <p style={{ fontSize: '10px', color: C.dim, margin: 0, fontWeight: 600 }}>{timeAgo(a.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom: activity heatmap — compact */}
                <div style={{ marginTop: '16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px 18px', animation: 'fadeUp 0.55s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={13} color="#a855f7" />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '13px' }}>Activity Heatmap</span>
                        </div>
                        <span style={{ fontSize: '11px', color: C.dim }}>
                            {enrolledCourses.length === 0 ? '0 activities — start learning!' : 'Your learning streak'}
                        </span>
                    </div>

                    {/* 26 × 7 grid — fixed-height cells so the block stays slim */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(26, 1fr)', gridTemplateRows: 'repeat(7, 10px)', gap: '3px', padding: '8px', background: C.raised, borderRadius: '8px', border: `1px solid ${C.border}` }}>
                        {Array.from({ length: 182 }).map((_, i) => (
                            <div key={i}
                                style={{ borderRadius: '2px', background: '#1e1e1e', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                                onMouseLeave={e => e.currentTarget.style.background = '#1e1e1e'}
                            />
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '10px', color: C.dim }}>
                        <span>Less</span>
                        {['#1e1e1e', '#1e3a5f', '#1d4fc9', '#3C83F6', '#639CF8'].map(bg => (
                            <div key={bg} style={{ width: '11px', height: '11px', borderRadius: '2px', background: bg }} />
                        ))}
                        <span>More</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
