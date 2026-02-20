import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronDown, ChevronRight, ChevronLeft,
    FileText, HelpCircle, ClipboardList, Code2,
    CheckCircle2, Circle, BookOpen, Users, Clock,
    PlayCircle, Lock, Loader2, AlertCircle, Trophy,
    Check, X, LayoutList, Bell, Medal, PanelRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_API = 'http://localhost:5000/api/admin';
const AUTH_API = 'http://localhost:5000/api/auth';

/* ── colour tokens ── */
const C = {
    bg: '#0a0a0a', sidebar: '#111', card: '#181818',
    raised: '#1e1e1e', border: 'rgba(255,255,255,0.07)',
    borderS: 'rgba(255,255,255,0.05)',
    accent: '#3C83F6', muted: '#a1a1aa', dim: '#555',
    green: '#22c55e', amber: '#f59e0b', purple: '#a855f7',
    text: '#fff',
};

/* ── lesson type config ── */
const TYPES = {
    article: { Icon: FileText, color: C.accent, label: 'Article' },
    quiz: { Icon: HelpCircle, color: C.amber, label: 'Quiz' },
    assignment: { Icon: ClipboardList, color: C.green, label: 'Assignment' },
    coding: { Icon: Code2, color: C.purple, label: 'Coding' },
};
const tInfo = t => TYPES[t] || TYPES.article;

/* ─── auth fetch helper ─── */
const apiFetch = async (url, opts = {}) => {
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opts.headers || {}),
        },
    });
    return res.json();
};

/* ────────────────────────────────────────────
   Markdown-ish renderer (no external deps)
──────────────────────────────────────────── */
function ArticleViewer({ content }) {
    if (!content?.trim()) return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.dim }}>
            <FileText size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '14px' }}>No content added for this lesson yet.</p>
        </div>
    );

    const lines = content.split('\n');
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        if (ln.startsWith('# ')) { elements.push(<h1 key={key++} style={{ fontSize: '26px', fontWeight: 900, margin: '28px 0 12px', lineHeight: 1.3, color: C.text }}>{ln.slice(2)}</h1>); continue; }
        if (ln.startsWith('## ')) { elements.push(<h2 key={key++} style={{ fontSize: '20px', fontWeight: 800, margin: '24px 0 10px', color: C.text }}>{ln.slice(3)}</h2>); continue; }
        if (ln.startsWith('### ')) { elements.push(<h3 key={key++} style={{ fontSize: '16px', fontWeight: 700, margin: '20px 0 8px', color: C.muted }}>{ln.slice(4)}</h3>); continue; }
        if (ln.startsWith('```')) {
            const lang = ln.slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
            elements.push(
                <div key={key++} style={{ margin: '16px 0', background: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                    {lang && <div style={{ padding: '6px 14px', background: '#151515', borderBottom: `1px solid ${C.border}`, fontSize: '11px', fontWeight: 700, color: C.accent, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{lang}</div>}
                    <pre style={{ margin: 0, padding: '16px', fontFamily: 'monospace', fontSize: '13.5px', lineHeight: 1.7, overflowX: 'auto', color: '#e2e8f0' }}>{codeLines.join('\n')}</pre>
                </div>
            );
            continue;
        }
        if (ln.startsWith('- ') || ln.startsWith('* ')) {
            elements.push(
                <li key={key++} style={{ marginLeft: '20px', marginBottom: '6px', fontSize: '15px', lineHeight: 1.75, color: '#ccc', listStyle: 'disc' }}>
                    {renderInline(ln.slice(2))}
                </li>
            );
            continue;
        }
        if (ln.startsWith('> ')) {
            elements.push(
                <blockquote key={key++} style={{ margin: '14px 0', padding: '12px 18px', borderLeft: `3px solid ${C.accent}`, background: 'rgba(60,131,246,0.06)', borderRadius: '0 8px 8px 0', color: C.muted, fontStyle: 'italic', fontSize: '15px' }}>
                    {ln.slice(2)}
                </blockquote>
            );
            continue;
        }
        if (ln.trim() === '') { elements.push(<div key={key++} style={{ height: '10px' }} />); continue; }
        if (ln.startsWith('---')) { elements.push(<hr key={key++} style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '24px 0' }} />); continue; }
        elements.push(
            <p key={key++} style={{ fontSize: '15px', lineHeight: 1.85, color: '#ccc', margin: '6px 0' }}>
                {renderInline(ln)}
            </p>
        );
    }
    return <div style={{ maxWidth: '100%' }}>{elements}</div>;
}

function renderInline(text) {
    // **bold** and *italic* and `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ color: C.text, fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('*') && p.endsWith('*')) return <em key={i} style={{ fontStyle: 'italic', color: '#ddd' }}>{p.slice(1, -1)}</em>;
        if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{ fontFamily: 'monospace', fontSize: '13px', background: '#1e1e1e', color: '#93c5fd', padding: '1px 6px', borderRadius: '4px' }}>{p.slice(1, -1)}</code>;
        return p;
    });
}

/* ────────────────────────────────────────────
   Quiz Player
──────────────────────────────────────────── */
function QuizPlayer({ questions = [], onAllCorrect }) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState({});
    const [score, setScore] = useState(null);

    if (!questions.length) return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.dim }}>
            <HelpCircle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '14px' }}>No quiz questions set yet.</p>
        </div>
    );

    const submit = () => {
        const newSub = {};
        questions.forEach((_, i) => { newSub[i] = true; });
        setSubmitted(newSub);
        const correct = questions.filter((q, i) => answers[i] === q.correct).length;
        setScore(correct);
        if (correct === questions.length) onAllCorrect?.();
    };

    const allAnswered = questions.every((_, i) => answers[i] !== undefined);

    return (
        <div>
            {questions.map((q, qi) => {
                const isSubmitted = submitted[qi];
                const chosen = answers[qi];
                return (
                    <div key={qi} style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px 20px', marginBottom: '14px' }}>
                        <p style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 14px', color: C.text }}>
                            <span style={{ color: C.amber, marginRight: '8px' }}>Q{qi + 1}.</span>
                            {q.question}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options.map((opt, oi) => {
                                const isChosen = chosen === oi;
                                const isCorrect = q.correct === oi;
                                let bg = '#1a1a1a', border = C.border, col = '#ccc';
                                if (isSubmitted) {
                                    if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.4)'; col = C.green; }
                                    else if (isChosen) { bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; col = '#f87171'; }
                                } else if (isChosen) { bg = 'rgba(60,131,246,0.12)'; border = 'rgba(60,131,246,0.4)'; col = C.accent; }
                                return (
                                    <button key={oi} onClick={() => !isSubmitted && setAnswers(p => ({ ...p, [qi]: oi }))}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color: col, fontSize: '14px', cursor: isSubmitted ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%', transition: 'all 0.15s' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {isSubmitted && isCorrect && <Check size={11} />}
                                            {isSubmitted && isChosen && !isCorrect && <X size={11} />}
                                        </div>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {isSubmitted && q.explanation && (
                            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '13px', color: C.amber, lineHeight: 1.6 }}>
                                💡 {q.explanation}
                            </div>
                        )}
                    </div>
                );
            })}
            {score === null ? (
                <button onClick={submit} disabled={!allAnswered}
                    style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: allAnswered ? C.amber : '#1a1a1a', color: allAnswered ? '#000' : C.dim, fontWeight: 800, fontSize: '14px', cursor: allAnswered ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    Submit Quiz
                </button>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: score === questions.length ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${score === questions.length ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '12px' }}>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: score === questions.length ? C.green : C.amber, margin: '0 0 4px' }}>
                        {score === questions.length ? '🎉 Perfect!' : `${score}/${questions.length} Correct`}
                    </p>
                    <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
                        {score === questions.length ? 'You can mark this lesson as complete.' : 'Review the answers above and try again.'}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────
   Assignment Viewer
──────────────────────────────────────────── */
function AssignmentViewer({ lesson }) {
    const { assignmentBrief, assignmentRequirements = [], assignmentDeadlineDays } = lesson;
    if (!assignmentBrief) return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.dim }}>
            <ClipboardList size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No assignment details yet.</p>
        </div>
    );
    return (
        <div>
            {assignmentDeadlineDays && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '99px', fontSize: '12px', color: C.green, fontWeight: 700, marginBottom: '20px' }}>
                    <Clock size={12} /> Submit within {assignmentDeadlineDays} days
                </div>
            )}
            <div style={{ fontSize: '15px', lineHeight: 1.85, color: '#ccc', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                {assignmentBrief}
            </div>
            {assignmentRequirements.length > 0 && (
                <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px 20px' }}>
                    <p style={{ fontWeight: 800, fontSize: '14px', margin: '0 0 14px', color: C.green }}>✅ Acceptance Criteria</p>
                    {assignmentRequirements.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                <span style={{ fontSize: '10px', color: C.green, fontWeight: 800 }}>{i + 1}</span>
                            </div>
                            <span style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>{r}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────
   Coding Viewer
──────────────────────────────────────────── */
function CodingViewer({ lesson }) {
    const { problemStatement, starterCode, language = 'javascript', testCases = [] } = lesson;
    if (!problemStatement) return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.dim }}>
            <Code2 size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No problem statement yet.</p>
        </div>
    );
    return (
        <div>
            <div style={{ fontSize: '15px', lineHeight: 1.85, color: '#ccc', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                {problemStatement}
            </div>
            {starterCode && (
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Starter Code · {language}</p>
                    <pre style={{ margin: 0, padding: '16px', background: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '10px', fontFamily: 'monospace', fontSize: '13.5px', lineHeight: 1.7, overflowX: 'auto', color: '#e2e8f0' }}>
                        {starterCode}
                    </pre>
                </div>
            )}
            {testCases.length > 0 && (
                <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px' }}>
                    <p style={{ fontWeight: 800, fontSize: '13px', color: C.purple, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Test Cases</p>
                    {testCases.map((tc, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px', padding: '10px', background: '#151515', borderRadius: '8px' }}>
                            <div>
                                <p style={{ fontSize: '10px', color: C.dim, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>Input</p>
                                <code style={{ fontFamily: 'monospace', fontSize: '13px', color: '#93c5fd' }}>{tc.input || '—'}</code>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', color: C.dim, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>Expected Output</p>
                                <code style={{ fontFamily: 'monospace', fontSize: '13px', color: '#86efac' }}>{tc.expectedOutput || '—'}</code>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════
   MAIN COURSE PAGE
════════════════════════════════════════════ */
export default function CoursePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    /* ── Remote data ── */
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [enrolledCount, setEnrolledCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* ── Progress ── */
    const [completedLessons, setCompletedLessons] = useState([]);
    const [progress, setProgress] = useState(0);
    const [marking, setMarking] = useState(false);

    /* ── UI ── */
    const [activeLesson, setActiveLesson] = useState(null);
    const [expandedMods, setExpandedMods] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [rightTab, setRightTab] = useState('leaderboard'); // 'leaderboard' | 'announcements'

    /* flattened lesson list for prev/next */
    const flatLessons = modules.flatMap((m, mi) =>
        (m.lessons || []).map((l, li) => ({ mod: m, lesson: l, modIdx: mi, lesIdx: li }))
    );
    const activeFlatIdx = activeLesson
        ? flatLessons.findIndex(fl => fl.lesson._id === activeLesson.lesson._id)
        : -1;

    const enrollment = user?.enrolledCourses?.find(
        e => String(e.courseId) === String(id)
    );
    const isEnrolled = !!enrollment;
    const totalLessons = modules.reduce((s, m) => s + (m.lessons?.length || 0), 0);

    /* ── Fetch course ── */
    useEffect(() => {
        fetch(`${ADMIN_API}/courses/public/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.message) { setError(d.message); return; }
                setCourse(d.course);
                setModules(d.modules || []);
                setEnrolledCount(d.enrolledCount || 0);
                if ((d.modules || []).length > 0) {
                    setExpandedMods({ [d.modules[0]._id]: true });
                }
            })
            .catch(() => setError('Failed to load course'))
            .finally(() => setLoading(false));
    }, [id]);

    /* ── Fetch lesson progress ── */
    useEffect(() => {
        if (!isEnrolled) return;
        apiFetch(`${AUTH_API}/lesson-progress/${id}`)
            .then(d => {
                setCompletedLessons(d.completedLessons || []);
                setProgress(d.progress || 0);
            })
            .catch(() => { });
    }, [id, isEnrolled]);

    /* ── Fetch announcements ── */
    useEffect(() => {
        fetch(`${ADMIN_API}/announcements/public`)
            .then(r => r.json()).then(d => setAnnouncements(d.announcements || []))
            .catch(() => { });
    }, []);

    /* ── Fetch leaderboard ── */
    useEffect(() => {
        if (!id) return;
        fetch(`${ADMIN_API}/courses/public/${id}/leaderboard`)
            .then(r => r.json()).then(d => setLeaderboard(d.leaderboard || []))
            .catch(() => { });
    }, [id]);

    /* ── Mark complete ── */
    const markComplete = useCallback(async () => {
        if (!activeLesson || !isEnrolled) return;
        const lessonId = activeLesson.lesson._id;
        if (completedLessons.includes(String(lessonId))) return;
        setMarking(true);
        try {
            const data = await apiFetch(`${AUTH_API}/complete-lesson`, {
                method: 'POST',
                body: JSON.stringify({ courseId: id, lessonId, totalLessons }),
            });
            setCompletedLessons(data.completedLessons || []);
            setProgress(data.progress || 0);
        } catch (err) { console.error(err); }
        finally { setMarking(false); }
    }, [activeLesson, isEnrolled, completedLessons, id, totalLessons]);

    /* ── Navigation ── */
    const goToLesson = (fl) => {
        setActiveLesson(fl);
        setExpandedMods(p => ({ ...p, [fl.mod._id]: true }));
    };
    const goNext = () => { if (activeFlatIdx < flatLessons.length - 1) goToLesson(flatLessons[activeFlatIdx + 1]); };
    const goPrev = () => { if (activeFlatIdx > 0) goToLesson(flatLessons[activeFlatIdx - 1]); };

    // ── Loading / Error ──
    if (loading) return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', fontFamily: 'Outfit, sans-serif' }}>
            <Loader2 size={36} color={C.accent} style={{ animation: 'spin 0.75s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <p style={{ color: C.muted }}>Loading course…</p>
        </div>
    );
    if (error) return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', fontFamily: 'Outfit, sans-serif' }}>
            <AlertCircle size={36} color="#ef4444" />
            <p style={{ color: '#f87171' }}>{error}</p>
            <button onClick={() => navigate(-1)} style={{ padding: '9px 20px', borderRadius: '8px', background: '#1a1a1a', border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', fontFamily: 'inherit' }}>Go back</button>
        </div>
    );

    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';
    const isCompleted = l => completedLessons.includes(String(l._id));

    /* ═══════════════════════════════════════
       RENDER
    ═══════════════════════════════════════ */
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: 'Outfit, Outfit Fallback, Arial, sans-serif', color: C.text, overflow: 'hidden' }}>
            <style>{`
                @keyframes spin    { to { transform:rotate(360deg); } }
                @keyframes fadeIn  { from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;} }
                .lesson-btn:hover  { background: rgba(255,255,255,0.04) !important; }
                .nav-btn:hover     { opacity: 0.8; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
            `}</style>

            {/* ══ TOPBAR ══ */}
            <header style={{ height: '56px', background: C.sidebar, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', padding: '6px 10px', borderRadius: '7px', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.raised; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'none'; }}>
                        <ArrowLeft size={15} /> Dashboard
                    </button>
                    <span style={{ color: C.border }}>|</span>
                    <Link to="/" style={{ fontWeight: 900, fontSize: '17px', textDecoration: 'none', color: C.text }}>
                        LevelUp<span style={{ color: C.accent }}>.dev</span>
                    </Link>
                </div>

                {/* Progress pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {isEnrolled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '120px', height: '4px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#3C83F6,#639CF8)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: C.accent, fontWeight: 700, minWidth: '36px' }}>{progress}%</span>
                        </div>
                    )}
                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#3C83F6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                            {initials}
                        </div>
                    </Link>
                </div>
            </header>

            {/* ══ BODY (sidebar + content) ══ */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ══ LEFT SIDEBAR ══ */}
                <aside style={{ width: sidebarOpen ? '280px' : '0', minWidth: sidebarOpen ? '280px' : '0', background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.25s ease, min-width 0.25s ease', flexShrink: 0 }}>
                    {/* Course info */}
                    <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: '14px', margin: '0 0 2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course?.title}</p>
                        <p style={{ fontSize: '11px', color: C.dim, margin: '0 0 12px' }}>{course?.instructor || 'LevelUp.dev'}</p>
                        {/* Mini progress */}
                        {isEnrolled && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.dim, marginBottom: '5px' }}>
                                    <span>{completedLessons.length}/{totalLessons} lessons</span>
                                    <span style={{ color: C.accent, fontWeight: 700 }}>{progress}%</span>
                                </div>
                                <div style={{ height: '3px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: C.accent, transition: 'width 0.5s' }} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Module / Lesson tree */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                        {modules.map((mod, mi) => {
                            const isExpanded = !!expandedMods[mod._id];
                            const lessons = mod.lessons || [];
                            const doneCount = lessons.filter(l => isCompleted(l)).length;
                            return (
                                <div key={mod._id}>
                                    {/* Module header */}
                                    <button onClick={() => setExpandedMods(p => ({ ...p, [mod._id]: !p[mod._id] }))}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: C.text, textAlign: 'left', fontFamily: 'inherit', position: 'relative' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(60,131,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 800, color: C.accent }}>
                                            {String(mi + 1).padStart(2, '0')}
                                        </div>
                                        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</span>
                                        <span style={{ fontSize: '10px', color: C.dim, flexShrink: 0 }}>{doneCount}/{lessons.length}</span>
                                        {isExpanded ? <ChevronDown size={13} color={C.dim} style={{ flexShrink: 0 }} /> : <ChevronRight size={13} color={C.dim} style={{ flexShrink: 0 }} />}
                                    </button>

                                    {/* Lessons */}
                                    {isExpanded && lessons.map((lesson, li) => {
                                        const { Icon, color } = tInfo(lesson.type);
                                        const done = isCompleted(lesson);
                                        const active = activeLesson?.lesson._id === lesson._id;
                                        const canOpen = isEnrolled || lesson.free;
                                        return (
                                            <button key={li} className="lesson-btn" onClick={() => canOpen && goToLesson({ mod, lesson, modIdx: mi, lesIdx: li })}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px 8px 38px', background: active ? 'rgba(60,131,246,0.1)' : 'transparent', border: 'none', cursor: canOpen ? 'pointer' : 'not-allowed', color: active ? C.text : C.muted, textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s', borderLeft: active ? `2px solid ${C.accent}` : '2px solid transparent' }}>
                                                {done
                                                    ? <CheckCircle2 size={13} color={C.green} style={{ flexShrink: 0 }} />
                                                    : canOpen
                                                        ? <Icon size={13} color={active ? color : C.dim} style={{ flexShrink: 0 }} />
                                                        : <Lock size={12} color={C.dim} style={{ flexShrink: 0 }} />
                                                }
                                                <span style={{ flex: 1, fontSize: '12px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</span>
                                                {lesson.free && !isEnrolled && (
                                                    <span style={{ fontSize: '9px', fontWeight: 800, color: C.green, background: 'rgba(34,197,94,0.12)', borderRadius: '99px', padding: '1px 6px', flexShrink: 0 }}>FREE</span>
                                                )}
                                                {lesson.duration && <span style={{ fontSize: '10px', color: C.dim, flexShrink: 0 }}>{lesson.duration}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* ══ MAIN CONTENT ══ */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                    {/* sidebar toggle */}
                    <button onClick={() => setSidebarOpen(p => !p)}
                        style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, width: '28px', height: '28px', borderRadius: '6px', background: C.raised, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LayoutList size={14} />
                    </button>

                    {activeLesson ? (
                        /* ══ LESSON VIEW ══ */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>

                            {/* Lesson header bar */}
                            <div style={{ padding: '14px 50px 14px 50px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, minHeight: '58px' }}>
                                <button onClick={() => setActiveLesson(null)}
                                    title="Back to overview"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '7px', border: `1px solid ${C.border}`, background: C.raised, color: C.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s', flexShrink: 0 }}
                                    onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                                    <ArrowLeft size={14} /> Overview
                                </button>
                                <span style={{ color: C.border }}>|</span>
                                {(() => {
                                    const { Icon, color, label } = tInfo(activeLesson.lesson.type);
                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: '99px', color, fontSize: '12px', fontWeight: 700 }}>
                                            <Icon size={13} /> {label}
                                        </div>
                                    );
                                })()}
                                <h2 style={{ flex: 1, fontSize: '15px', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {activeLesson.lesson.title}
                                </h2>
                                {isCompleted(activeLesson.lesson) ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.green, fontWeight: 700 }}>
                                        <CheckCircle2 size={15} /> Completed
                                    </div>
                                ) : isEnrolled ? (
                                    <button onClick={markComplete} disabled={marking}
                                        style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: C.green, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: marking ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s', opacity: marking ? 0.7 : 1 }}>
                                        {marking ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <CheckCircle2 size={14} />}
                                        Mark as Complete
                                    </button>
                                ) : null}

                            </div>

                            {/* Lesson content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
                                {activeLesson.lesson.type === 'article' && (
                                    <ArticleViewer content={activeLesson.lesson.content} />
                                )}
                                {activeLesson.lesson.type === 'quiz' && (
                                    <QuizPlayer
                                        questions={activeLesson.lesson.questions || []}
                                        onAllCorrect={markComplete}
                                    />
                                )}
                                {activeLesson.lesson.type === 'assignment' && (
                                    <AssignmentViewer lesson={activeLesson.lesson} />
                                )}
                                {activeLesson.lesson.type === 'coding' && (
                                    <CodingViewer lesson={activeLesson.lesson} />
                                )}
                            </div>

                            {/* Bottom nav bar */}
                            <div style={{ padding: '12px 48px', background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                <button onClick={goPrev} disabled={activeFlatIdx <= 0} className="nav-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#1a1a1a', color: activeFlatIdx <= 0 ? C.dim : C.text, fontWeight: 600, fontSize: '13px', cursor: activeFlatIdx <= 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}>
                                    <ChevronLeft size={15} /> Previous
                                </button>
                                <span style={{ fontSize: '12px', color: C.dim }}>
                                    Lesson {activeFlatIdx + 1} / {flatLessons.length}
                                </span>
                                <button onClick={goNext} disabled={activeFlatIdx >= flatLessons.length - 1} className="nav-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', border: 'none', background: activeFlatIdx >= flatLessons.length - 1 ? '#1a1a1a' : C.accent, color: activeFlatIdx >= flatLessons.length - 1 ? C.dim : '#fff', fontWeight: 700, fontSize: '13px', cursor: activeFlatIdx >= flatLessons.length - 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }}>
                                    Next <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ══ COURSE OVERVIEW — 2 column ══ */
                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>

                            {/* Left: modules */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px 36px 60px' }}>
                                {/* Hero */}
                                <div style={{ display: 'flex', gap: '18px', marginBottom: '24px', alignItems: 'flex-start' }}>
                                    {course?.image ? (
                                        <img src={course.image} alt={course.title} style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
                                    ) : (
                                        <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: 'rgba(60,131,246,0.1)', border: `1px solid rgba(60,131,246,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <BookOpen size={28} color={C.accent} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h1 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 5px', lineHeight: 1.3 }}>{course?.title}</h1>
                                        <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>
                                            {[course?.instructor, course?.category, course?.level].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>

                                </div>

                                {/* Stats pills */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                                    {[
                                        { Icon: BookOpen, label: `${modules.length} Modules` },
                                        { Icon: PlayCircle, label: `${totalLessons} Lessons` },
                                        { Icon: Users, label: `${enrolledCount} Students` },
                                        ...(course?.duration ? [{ Icon: Clock, label: course.duration }] : []),
                                    ].map(({ Icon, label }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 13px', background: C.raised, borderRadius: '99px', border: `1px solid ${C.border}`, fontSize: '12px', color: C.muted }}>
                                            <Icon size={12} color={C.accent} /> {label}
                                        </div>
                                    ))}
                                </div>

                                {/* Module cards */}
                                <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Course Content</h2>
                                {modules.map((mod, mi) => {
                                    const lessons = mod.lessons || [];
                                    const doneCount = lessons.filter(l => isCompleted(l)).length;
                                    const firstLesson = lessons[0];
                                    return (
                                        <div key={mod._id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', marginBottom: '8px', overflow: 'hidden' }}>
                                            <button onClick={() => firstLesson && (isEnrolled || firstLesson.free) && goToLesson({ mod, lesson: firstLesson, modIdx: mi, lesIdx: 0 })}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', color: C.text, textAlign: 'left', fontFamily: 'inherit' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(60,131,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: C.accent, flexShrink: 0 }}>
                                                    {String(mi + 1).padStart(2, '0')}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>{mod.title}</p>
                                                    <p style={{ fontSize: '11px', color: C.dim, margin: 0 }}>
                                                        {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                                                        {isEnrolled && ` · ${doneCount} done`}
                                                    </p>
                                                </div>
                                                {isEnrolled && doneCount === lessons.length && lessons.length > 0 && <CheckCircle2 size={16} color={C.green} />}
                                                <ChevronRight size={15} color={C.dim} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* CTA */}
                                {flatLessons.length > 0 && (
                                    <div style={{ marginTop: '24px' }}>
                                        {isEnrolled ? (
                                            <button onClick={() => { const next = flatLessons.find(fl => !isCompleted(fl.lesson)) || flatLessons[0]; goToLesson(next); }}
                                                style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: C.accent, color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                {completedLessons.length > 0 ? '▶ Resume Course' : '▶ Start Learning'}
                                            </button>
                                        ) : (
                                            <Link to="/courses" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: C.accent, color: '#fff', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
                                                Enroll to Get Started
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ══ RIGHT PANEL — always fixed on the right ══ */}
                <aside style={{ width: '320px', minWidth: '320px', borderLeft: `1px solid ${C.border}`, background: C.sidebar, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                    {/* tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                        {[
                            { key: 'leaderboard', label: 'Leaderboard', Icon: Trophy, activeColor: C.amber },
                            { key: 'announcements', label: 'Announcements', Icon: Bell, activeColor: C.accent },
                        ].map(({ key, label, Icon, activeColor }) => (
                            <button key={key} onClick={() => setRightTab(key)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px 8px', background: 'none', border: 'none', borderBottom: rightTab === key ? `2px solid ${activeColor}` : '2px solid transparent', color: rightTab === key ? activeColor : C.dim, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                <Icon size={13} /> {label}
                                {key === 'announcements' && announcements.length > 0 && (
                                    <span style={{ fontSize: '9px', fontWeight: 800, background: C.accent, color: '#fff', borderRadius: '99px', padding: '1px 5px' }}>{announcements.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Leaderboard tab ── */}
                    {rightTab === 'leaderboard' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {leaderboard.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px 16px', color: C.dim }}>
                                    <Trophy size={28} style={{ margin: '0 auto 10px', display: 'block' }} />
                                    <p style={{ fontSize: '13px' }}>No students enrolled yet.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Podium top 3 */}
                                    {leaderboard.length >= 1 && (
                                        <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
                                            {[1, 0, 2].map(i => {
                                                if (!leaderboard[i]) return null;
                                                const p = leaderboard[i];
                                                const rank = i === 0 ? 1 : i === 1 ? 2 : 3;
                                                const heights = { 1: 74, 2: 55, 3: 44 };
                                                const colors = { 1: '#f59e0b', 2: '#94a3b8', 3: '#cd7c4a' };
                                                const sizes = { 1: 38, 2: 32, 3: 30 };
                                                const hue = [...p.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                                                const initials = p.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                                const isMe = String(p._id) === String(user?._id);
                                                return (
                                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: '0 0 auto' }}>
                                                        <div style={{ width: `${sizes[rank]}px`, height: `${sizes[rank]}px`, borderRadius: '50%', background: `hsl(${hue},50%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: `${rank === 1 ? 13 : 11}px`, border: isMe ? `2px solid ${C.accent}` : rank === 1 ? `2px solid ${colors[rank]}` : 'none', boxSizing: 'border-box' }}>
                                                            {initials}
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '10px', color: '#ddd', maxWidth: '64px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]}</p>
                                                        <div style={{ width: '68px', height: `${heights[rank]}px`, background: colors[rank], borderRadius: '5px 5px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                                            {rank === 1 && <Trophy size={12} color="rgba(0,0,0,0.6)" />}
                                                            <span style={{ color: '#000', fontWeight: 900, fontSize: '12px' }}>{rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}</span>
                                                            <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '9px', fontWeight: 700 }}>{p.progress}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Full list */}
                                    <div style={{ padding: '12px' }}>
                                        {leaderboard.map((p, i) => {
                                            const hue = [...p.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                                            const initials = p.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                            const isMe = String(p._id) === String(user?._id);
                                            const rankColors = ['#f59e0b', '#94a3b8', '#cd7c4a'];
                                            return (
                                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '9px', marginBottom: '4px', background: isMe ? 'rgba(60,131,246,0.08)' : 'transparent', border: isMe ? `1px solid rgba(60,131,246,0.2)` : '1px solid transparent', transition: 'background 0.15s' }}>
                                                    <span style={{ width: '18px', fontSize: '11px', fontWeight: 800, color: i < 3 ? rankColors[i] : C.dim, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `hsl(${hue},50%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>{initials}</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {p.name} {isMe && <span style={{ fontSize: '10px', color: C.accent }}>(you)</span>}
                                                        </p>
                                                        <div style={{ height: '3px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${p.progress}%`, height: '100%', background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c4a' : C.accent, borderRadius: '99px' }} />
                                                        </div>
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: 800, color: i < 3 ? rankColors[i] : C.muted, flexShrink: 0 }}>{p.progress}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Announcements tab ── */}
                    {rightTab === 'announcements' && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                            {announcements.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px 16px', color: C.dim }}>
                                    <Bell size={28} style={{ margin: '0 auto 10px', display: 'block' }} />
                                    <p style={{ fontSize: '13px' }}>No announcements yet.</p>
                                </div>
                            ) : announcements.map((a, i) => (
                                <div key={a._id || i} style={{ padding: '12px 14px', borderRadius: '10px', background: C.card, border: `1px solid ${C.border}`, marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(60,131,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                            <Bell size={12} color={C.accent} />
                                        </div>
                                        <p style={{ fontWeight: 700, fontSize: '13px', margin: 0, lineHeight: 1.4, flex: 1 }}>{a.title}</p>
                                    </div>
                                    {a.description && <p style={{ fontSize: '12px', color: C.muted, margin: '0 0 8px', lineHeight: 1.6, paddingLeft: '34px' }}>{a.description}</p>}
                                    <p style={{ fontSize: '10px', color: C.dim, margin: 0, paddingLeft: '34px' }}>
                                        {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
