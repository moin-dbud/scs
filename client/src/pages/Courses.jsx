import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, Clock, Users, Star, ChevronRight, Search,
    Zap, Filter, CheckCircle, Play, X, Shield, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Design tokens ── */
const C = {
    bg: '#000', nav: '#171717', surface: '#171717', card: '#1a1a1a',
    raised: '#232323', border: 'rgba(255,255,255,0.10)', borderS: 'rgba(255,255,255,0.06)',
    accent: '#3C83F6', grad: 'linear-gradient(135deg,#3b82f6,#7c3aed)',
    text: '#fff', muted: '#a1a1aa', dim: '#555',
};

/* ── Category filter list (dynamically built from API) ── */

export default function Courses() {
    const { user, enrollCourse, getEnrolledCourses } = useAuth();
    const navigate = useNavigate();

    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [hoveredId, setHoveredId] = useState(null);

    /* ── enrollment state ── */
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [modal, setModal] = useState(null);
    const [termsChecked, setTermsChecked] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [justEnrolled, setJustEnrolled] = useState(null);

    const initials = user
        ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'U'
        : null;

    /* Fetch published courses from the backend */
    useEffect(() => {
        setCatalogLoading(true);
        fetch('http://localhost:5000/api/admin/courses/public')
            .then(r => r.json())
            .then(d => {
                setCatalog(d.courses || []);
                setCatalogLoading(false);
            })
            .catch(() => {
                setCatalogError('Failed to load courses. Please try again later.');
                setCatalogLoading(false);
            });
    }, []);

    /* Load already-enrolled courses on mount */
    useEffect(() => {
        if (!user) return;
        getEnrolledCourses()
            .then(d => {
                if (d?.enrolledCourses) {
                    setEnrolledIds(new Set(d.enrolledCourses.map(c => c.courseId)));
                }
            })
            .catch(() => { });
    }, [user]);

    /* Build category list dynamically from real data */
    const categories = ['All', ...new Set(catalog.map(c => c.category).filter(Boolean))];

    const filtered = catalog.filter(c => {
        const matchCat = activeCategory === 'All' || c.category === activeCategory;
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            (c.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchSearch;
    });

    /* open confirmation modal */
    const openEnroll = (course) => {
        if (!user) { navigate('/login'); return; }
        setTermsChecked(false);
        setEnrollError('');
        setModal(course);
    };

    /* confirm enrollment */
    const confirmEnroll = async () => {
        if (!termsChecked) { setEnrollError('Please accept the terms & conditions to continue.'); return; }
        setEnrolling(true);
        setEnrollError('');
        try {
            const courseId = modal._id || modal.id;
            await enrollCourse(courseId, modal.title, modal.image);
            setEnrolledIds(prev => new Set([...prev, courseId]));
            setJustEnrolled(courseId);
            setModal(null);
            /* go to dashboard after a short moment */
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            setEnrollError(err.message || 'Enrollment failed. Please try again.');
        } finally {
            setEnrolling(false);
        }
    };

    /* close modal on backdrop click */
    const closeModal = () => { if (!enrolling) setModal(null); };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'outfit, outfit Fallback, Arial, sans-serif', color: C.text }}>

            {/* ── ENROLLMENT MODAL ── */}
            {modal && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                        animation: 'fadeIn 0.18s ease',
                    }}
                >
                    <style>{`
                        @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
                        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
                    `}</style>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#111', border: `1px solid ${C.border}`,
                            borderRadius: '20px', width: '100%', maxWidth: '500px',
                            overflow: 'hidden', animation: 'slideUp 0.22s ease',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{ position: 'relative', background: C.raised, padding: '22px 24px', borderBottom: `1px solid ${C.borderS}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(60,131,246,0.15)', border: `1px solid rgba(60,131,246,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <BookOpen size={20} color={C.accent} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>Confirm Enrollment</h3>
                                    <p style={{ fontSize: '12px', color: C.muted, margin: '3px 0 0' }}>Review details before enrolling</p>
                                </div>
                            </div>
                            <button onClick={closeModal} disabled={enrolling} style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Course preview */}
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderS}` }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                <img src={modal.image} alt={modal.title} style={{ width: '80px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>{modal.title}</p>
                                    <p style={{ fontSize: '12px', color: C.muted, margin: '0 0 8px', lineHeight: 1.5 }}>{modal.subtitle}</p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <span style={{ fontSize: '11px', color: C.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} color={C.dim} /> {modal.duration}
                                        </span>
                                        <span style={{ fontSize: '11px', color: C.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <BookOpen size={11} color={C.dim} /> {modal.modules} modules
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Price row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', padding: '12px 14px', background: 'rgba(60,131,246,0.08)', borderRadius: '10px', border: `1px solid rgba(60,131,246,0.2)` }}>
                                <span style={{ fontSize: '13px', color: C.muted }}>Enrollment Price</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: C.dim, textDecoration: 'line-through' }}>{modal.originalPrice}</span>
                                    <span style={{ fontSize: '20px', fontWeight: 900, color: C.accent }}>{modal.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderS}` }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: C.raised, borderRadius: '12px', padding: '16px' }}>
                                <Shield size={16} color={C.accent} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 8px' }}>Terms & Conditions</p>
                                    <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: C.muted, lineHeight: 1.8 }}>
                                        <li>Access is granted only to the enrolled user and is non-transferable.</li>
                                        <li>Course content is for personal learning only — redistribution is prohibited.</li>
                                        <li>Completion of modules is required to obtain a certificate.</li>
                                        <li>The platform reserves the right to update course material at any time.</li>
                                        <li>No refunds after 7 days of enrollment.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '14px' }}>
                                <div
                                    onClick={() => setTermsChecked(p => !p)}
                                    style={{
                                        width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
                                        background: termsChecked ? C.accent : 'transparent',
                                        border: `2px solid ${termsChecked ? C.accent : 'rgba(255,255,255,0.25)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s', cursor: 'pointer',
                                    }}
                                >
                                    {termsChecked && <CheckCircle size={13} color="#fff" fill="#fff" />}
                                </div>
                                <span style={{ fontSize: '13px', color: C.muted, lineHeight: 1.5 }}>
                                    I have read and agree to the <span style={{ color: C.accent, fontWeight: 600 }}>Terms & Conditions</span> and understand the enrollment policy.
                                </span>
                            </label>

                            {/* Inline error */}
                            {enrollError && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)`, borderRadius: '8px' }}>
                                    <AlertCircle size={14} color='#ef4444' />
                                    <span style={{ fontSize: '13px', color: '#ef4444' }}>{enrollError}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '18px 24px', display: 'flex', gap: '10px' }}>
                            <button onClick={closeModal} disabled={enrolling} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Cancel
                            </button>
                            <button
                                onClick={confirmEnroll}
                                disabled={enrolling}
                                style={{
                                    flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                                    background: termsChecked ? C.accent : '#282828',
                                    color: termsChecked ? '#fff' : C.dim,
                                    fontSize: '14px', fontWeight: 700, cursor: termsChecked ? 'pointer' : 'not-allowed',
                                    fontFamily: 'inherit', transition: 'all 0.18s',
                                    boxShadow: termsChecked && !enrolling ? '0 4px 20px rgba(60,131,246,0.35)' : 'none',
                                }}
                            >
                                {enrolling ? 'Enrolling…' : `Enroll Now — ${modal.price}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NAVBAR ── */}
            <nav style={{ background: C.nav, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '65px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 900, color: C.text, margin: 0 }}>
                            LevelUp<span style={{ color: C.accent }}>.dev</span>
                        </h1>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link to="/dashboard" style={{ color: C.muted, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Dashboard</Link>
                        {user ? (
                            <Link to="/profile" style={{ textDecoration: 'none' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                                    {initials}
                                </div>
                            </Link>
                        ) : (
                            <Link to="/login" style={{ padding: '8px 18px', background: C.accent, borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <div style={{ background: 'linear-gradient(180deg,#0a0a1a 0%,#000 100%)', borderBottom: `1px solid ${C.borderS}`, padding: '56px 24px 48px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(60,131,246,0.12)', border: `1px solid rgba(60,131,246,0.3)`, borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 600, color: C.accent, marginBottom: '20px' }}>
                    <Zap size={13} /> {catalog.length} courses available
                </div>
                <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, marginBottom: '14px', lineHeight: 1.15 }}>
                    Level up your career with<br />
                    <span style={{ background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        industry-ready courses
                    </span>
                </h1>
                <p style={{ color: C.muted, fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.7 }}>
                    Learn from industry experts. Build real projects. Get hired faster.
                </p>
                <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                    <Search size={16} color={C.dim} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="text" placeholder="Search courses or technologies…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', background: C.raised, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px 14px 14px 40px', fontSize: '14px', color: C.text, outline: 'none', fontFamily: 'inherit' }}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border}
                    />
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px 60px' }}>

                {/* Category filter */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Filter size={14} color={C.dim} />
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                            padding: '7px 18px', borderRadius: '20px', border: `1px solid ${activeCategory === cat ? C.accent : C.border}`,
                            background: activeCategory === cat ? 'rgba(60,131,246,0.15)' : 'transparent',
                            color: activeCategory === cat ? C.accent : C.muted,
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}>
                            {cat}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '13px', color: C.dim }}>
                        {filtered.length} course{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Course grid */}
                {catalogLoading ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: C.muted }}>
                        <p style={{ fontSize: '16px' }}>Loading courses…</p>
                    </div>
                ) : catalogError ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#ef4444' }}>
                        <p style={{ fontSize: '16px' }}>{catalogError}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: C.muted }}>
                        <BookOpen size={48} color={C.dim} style={{ marginLeft: '530px', marginBottom: '16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 700 }}>{catalog.length === 0 ? 'No courses available yet' : 'No courses found'}</p>
                        <p style={{ fontSize: '14px', marginTop: '8px' }}>{catalog.length === 0 ? 'Check back soon for new courses.' : 'Try a different search or category.'}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))', gap: '20px' }}>
                        {filtered.map(course => {
                            const cid = course._id || course.id;
                            const isHovered = hoveredId === cid;
                            const enrolled = enrolledIds.has(cid);
                            const justDone = justEnrolled === cid;
                            return (
                                <div key={cid}
                                    onMouseEnter={() => setHoveredId(cid)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        background: C.surface, borderRadius: '16px',
                                        border: `1px solid ${enrolled ? 'rgba(34,197,94,0.35)' : isHovered ? 'rgba(60,131,246,0.4)' : C.borderS}`,
                                        overflow: 'hidden', transition: 'all 0.22s',
                                        boxShadow: enrolled ? '0 4px 20px rgba(34,197,94,0.08)' : isHovered ? '0 8px 40px rgba(60,131,246,0.12)' : 'none',
                                        transform: isHovered && !enrolled ? 'translateY(-2px)' : 'none',
                                    }}
                                >
                                    {/* Card image */}
                                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                        <img src={course.image} alt={course.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: isHovered ? 'scale(1.04)' : 'scale(1)' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%)' }} />
                                        {/* Badge */}
                                        <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: course.badgeColor, color: '#fff' }}>
                                            {course.badge}
                                        </span>
                                        {/* Enrolled badge */}
                                        {enrolled && (
                                            <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={11} /> Enrolled
                                            </span>
                                        )}
                                        {/* Play overlay */}
                                        {!enrolled && (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
                                                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(60,131,246,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                                                    <Play size={20} color="#fff" fill="#fff" />
                                                </div>
                                            </div>
                                        )}
                                        <span style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                                            {course.level}
                                        </span>
                                    </div>

                                    {/* Card body */}
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                            {course.tags.slice(0, 4).map(t => (
                                                <span key={t} style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '20px', background: 'rgba(60,131,246,0.12)', color: C.accent, border: `1px solid rgba(60,131,246,0.25)` }}>{t}</span>
                                            ))}
                                        </div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', lineHeight: 1.35 }}>{course.title}</h3>
                                        <p style={{ fontSize: '13px', color: C.muted, marginBottom: '14px', lineHeight: 1.6 }}>{course.subtitle}</p>

                                        {/* Stats */}
                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted }}>
                                                <Star size={12} color="#f59e0b" fill="#f59e0b" /> <b style={{ color: '#f59e0b' }}>{course.rating ?? 0}</b>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted }}>
                                                <Users size={12} color={C.dim} /> {(course.students ?? 0).toLocaleString()} students
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted }}>
                                                <Clock size={12} color={C.dim} /> {course.duration || '—'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted }}>
                                                <BookOpen size={12} color={C.dim} /> {course.modules ?? 0} modules
                                            </span>
                                        </div>

                                        {/* Features */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                                            {course.features.map(f => (
                                                <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: C.muted }}>
                                                    <CheckCircle size={12} color='#22c55e' /> {f}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Price + CTA */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: `1px solid ${C.borderS}`, paddingTop: '16px' }}>
                                            <div>
                                                <span style={{ fontSize: '22px', fontWeight: 900, color: C.text }}>{course.price}</span>
                                                <span style={{ fontSize: '13px', color: C.dim, textDecoration: 'line-through', marginLeft: '8px' }}>{course.originalPrice}</span>
                                            </div>
                                            {enrolled ? (
                                                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                                                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', borderRadius: '10px', border: `1px solid rgba(34,197,94,0.4)`, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                        <CheckCircle size={15} /> Go to Dashboard
                                                    </button>
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => openEnroll(course)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '11px 22px', borderRadius: '10px', border: 'none',
                                                        background: isHovered ? '#2563eb' : C.accent,
                                                        color: '#fff', fontSize: '14px', fontWeight: 700,
                                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                                                        boxShadow: isHovered ? '0 4px 20px rgba(60,131,246,0.4)' : 'none',
                                                    }}
                                                >
                                                    Enroll Now <ChevronRight size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
