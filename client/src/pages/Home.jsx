import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu, X, ArrowRight, ArrowUpRight, Github, Twitter, Linkedin,
    MessageCircle, Zap, Trophy, Flame, Star, Shield, Code2, BookOpen,
    Target, Sparkles, TrendingUp, Users, Award, Clock, Brain, Rocket,
    CheckCircle2, ChevronRight, Play, Terminal, Layers, BarChart3
} from 'lucide-react';

/* ── Palette — matching dashboard ── */
const C = {
    bg: '#0a0a0a', surface: '#111', card: '#141414', raised: '#1a1a1a',
    border: 'rgba(255,255,255,0.07)', borderH: 'rgba(255,255,255,0.14)',
    accent: '#3C83F6', accentSoft: 'rgba(60,131,246,0.1)',
    text: '#f0f0f0', muted: '#888', dim: '#555',
    green: '#22c55e', amber: '#f59e0b', red: '#ef4444',
};

/* ── scroll reveal ── */
function useReveal(threshold = 0.12) {
    const ref = useRef(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setV(true); o.disconnect(); }
        }, { threshold });
        o.observe(el); return () => o.disconnect();
    }, []);
    return [ref, v];
}
const reveal = (v, d = 0) => ({
    opacity: v ? 1 : 0,
    transform: v ? 'none' : 'translateY(22px)',
    transition: `opacity 0.55s ${d}s ease, transform 0.55s ${d}s ease`,
});

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const [mob, setMob] = useState(false);
    const path = useLocation().pathname;
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);
    const links = [['Home', '/'], ['Courses', '/courses'], ['Blogs', '/blogs'], ['About', '/about']];
    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
            background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px) saturate(1.3)' : 'none',
            borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
            transition: 'all 0.3s',
        }}>
            <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={14} color="#fff" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'agile, sans-serif', letterSpacing: '-0.02em' }}>
                        LevelUp<span style={{ color: C.accent }}>.dev</span>
                    </span>
                </Link>
                <nav className="hp-dsk" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {links.map(([l, h]) => (
                        <Link key={h} to={h} style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            textDecoration: 'none',
                            color: path === h ? '#fff' : C.muted,
                            background: path === h ? C.accentSoft : 'transparent',
                            transition: 'all 0.15s',
                        }}>{l}</Link>
                    ))}
                    <div style={{ width: 1, height: 20, background: C.border, margin: '0 8px' }} />
                    <Link to="/login" style={{
                        padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                        textDecoration: 'none', color: '#fff', background: C.accent,
                    }}>Sign In</Link>
                </nav>
                <button className="hp-mob" onClick={() => setMob(p => !p)} style={{
                    display: 'none', background: C.raised, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: 8, color: '#fff', cursor: 'pointer',
                }}>{mob ? <X size={18} /> : <Menu size={18} />}</button>
            </div>
            {mob && (
                <div style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${C.border}`, padding: '12px 20px 16px' }}>
                    {links.map(([l, h]) => (
                        <Link key={h} to={h} onClick={() => setMob(false)} style={{
                            display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                            textDecoration: 'none', color: path === h ? '#fff' : C.muted,
                            background: path === h ? C.accentSoft : 'transparent', marginBottom: 2,
                        }}>{l}</Link>
                    ))}
                    <Link to="/login" onClick={() => setMob(false)} style={{
                        display: 'block', textAlign: 'center', padding: 10, borderRadius: 8,
                        fontSize: 14, fontWeight: 700, textDecoration: 'none', color: '#fff',
                        background: C.accent, marginTop: 8,
                    }}>Sign In</Link>
                </div>
            )}
        </header>
    );
}

/* ═══════════════════════════════════════════
   HERO — editorial split layout
═══════════════════════════════════════════ */
function Hero() {
    return (
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 28px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* bg noise */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: `radial-gradient(circle at 70% 30%, rgba(60,131,246,0.08) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(60,131,246,0.05) 0%, transparent 40%)`, pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: 1140, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
                {/* Top chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, animation: 'hpUp .5s ease' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.accent, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: C.accentSoft, border: `1px solid rgba(60,131,246,0.15)` }}>New Platform</span>
                    <span style={{ fontSize: 12, color: C.muted }}>AI-powered developer education that actually works</span>
                </div>

                {/* BIG headline */}
                <h1 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.0, margin: '0 0 0', color: '#fff', letterSpacing: '-0.03em', maxWidth: 800, animation: 'hpUp .6s ease' }}>
                    Don't watch<span style={{ color: C.accent }}>.</span><br />
                    Build<span style={{ color: C.accent }}>.</span>
                </h1>

                {/* Sub + CTA row */}
                <div className="hp-hero-row" style={{ display: 'flex', gap: 60, marginTop: 32, alignItems: 'flex-start', animation: 'hpUp .7s ease' }}>
                    <div style={{ maxWidth: 420 }}>
                        <p style={{ fontSize: 15, lineHeight: 1.75, color: C.muted, margin: '0 0 24px' }}>
                            Every lesson is AI-generated, hands-on, and ends with real output.
                            Earn XP, maintain streaks, compete on leaderboards.
                            This is how developers actually learn.
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <Link to="/register" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '11px 24px', borderRadius: 9, background: C.accent,
                                color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}>
                                Start For Free <ArrowRight size={15} />
                            </Link>
                            <a href="#how" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '11px 20px', borderRadius: 9,
                                background: C.raised, border: `1px solid ${C.border}`,
                                color: C.text, fontWeight: 600, fontSize: 14, textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}>
                                <Play size={13} fill="currentColor" /> See how it works
                            </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 12, color: C.dim }}>
                            <div style={{ display: 'flex' }}>
                                {[C.accent, C.green, C.amber, '#e879f9'].map((c, i) => (
                                    <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid #0a0a0a', marginLeft: i ? -6 : 0, fontSize: 8, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {['A', 'S', 'M', 'E'][i]}
                                    </div>
                                ))}
                            </div>
                            <span>2,400+ devs building right now</span>
                        </div>
                    </div>

                    {/* Bento preview */}
                    <div className="hp-hero-bento" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 10 }}>
                            {/* Main lesson tile */}
                            <div className="hp-tilt" style={{ gridColumn: '1 / -1', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle, rgba(60,131,246,0.08) 0%, transparent 70%)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <span style={{ fontSize: 9, fontWeight: 800, color: C.green, background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 4 }}>BEGINNER</span>
                                        <span style={{ fontSize: 9, fontWeight: 800, color: C.accent, background: C.accentSoft, padding: '2px 8px', borderRadius: 4 }}>PYTHON</span>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>+150 XP</span>
                                </div>
                                <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Iteration Mastery — Python Loops</p>
                                <div style={{ display: 'flex', gap: 14, fontSize: 10, color: C.dim, marginBottom: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> 7 min</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Code2 size={9} /> 3 exercises</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Target size={9} /> Module 3</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ width: '62%', height: '100%', background: C.accent, borderRadius: 99 }} />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>62%</span>
                                </div>
                            </div>
                            {/* Streak */}
                            <div className="hp-tilt" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
                                <Flame size={18} color={C.amber} style={{ marginBottom: 8 }} />
                                <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 2px' }}>7 days</p>
                                <p style={{ fontSize: 10, color: C.dim, margin: 0, fontWeight: 600 }}>Current streak</p>
                            </div>
                            {/* Level */}
                            <div className="hp-tilt" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
                                <TrendingUp size={18} color={C.accent} style={{ marginBottom: 8 }} />
                                <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 2px' }}>Level 4</p>
                                <p style={{ fontSize: 10, color: C.dim, margin: 0, fontWeight: 600 }}>Developer rank</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick stats strip */}
                <div className="hp-strip" style={{ display: 'flex', gap: 1, marginTop: 40, background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                    {[
                        { v: '2,400+', l: 'Active Developers', ic: Users },
                        { v: '150+', l: 'AI Lessons', ic: BookOpen },
                        { v: '98%', l: 'Completion Rate', ic: BarChart3 },
                        { v: '50K+', l: 'XP Earned Daily', ic: Zap },
                    ].map((s, i) => (
                        <div key={i} style={{ flex: 1, padding: '16px 14px', textAlign: 'center', borderLeft: i ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <s.ic size={15} color={C.accent} style={{ flexShrink: 0 }} />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#fff' }}>{s.v}</p>
                                <p style={{ margin: 0, fontSize: 10, color: C.dim, fontWeight: 600 }}>{s.l}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   PROBLEM
═══════════════════════════════════════════ */
function Problem() {
    const [ref, vis] = useReveal();
    return (
        <section ref={ref} style={{ padding: '64px 28px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                <div className="hp-prob-layout" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
                    {/* Left context */}
                    <div style={{ minWidth: 260, maxWidth: 300, ...reveal(vis) }}>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.red, textTransform: 'uppercase' }}>The Problem</span>
                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '10px 0 10px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Courses don't<br />make developers.
                        </h2>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                            The education industry sells you hours of content. We think that's the wrong metric entirely.
                        </p>
                    </div>
                    {/* Right cards */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { n: '01', emoji: '😴', title: 'Tutorial Hell', sub: 'You\'ve watched 200 hours of video. You still Google "how to center a div."' },
                            { n: '02', emoji: '🔁', title: 'Zero Retention', sub: 'Passive learning has a 5% retention rate. You forget everything by Friday.' },
                            { n: '03', emoji: '😵', title: 'Still Unemployable', sub: 'Certificates prove you can sit through videos. Employers need builders.' },
                        ].map((p, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 18,
                                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                                padding: '18px 20px', transition: 'all 0.2s', cursor: 'default',
                                ...reveal(vis, 0.1 + i * 0.08),
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; e.currentTarget.style.background = C.raised; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                                <span style={{ fontSize: 10, fontWeight: 900, color: C.dim, minWidth: 22 }}>{p.n}</span>
                                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                                <div>
                                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 800, color: '#fff' }}>{p.title}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{p.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   HOW IT WORKS — numbered timeline
═══════════════════════════════════════════ */
function HowItWorks() {
    const [ref, vis] = useReveal();
    const steps = [
        { icon: Layers, title: 'Pick your path', desc: 'Python, JavaScript, React, API design, system design — structured modules built for real outcomes. Not random playlists.', detail: '50+ curated modules' },
        { icon: Brain, title: 'AI generates your lesson', desc: 'Fresh content every time. No recycled slides. Our AI engine writes practical, execution-focused lessons adapted to where you are.', detail: 'Zero stale content' },
        { icon: Terminal, title: 'Build, ship, earn', desc: 'Code in the browser. Solve real challenges. Earn XP, maintain your streak, climb the leaderboard. Graduate with a portfolio.', detail: 'Output > hours watched' },
    ];
    return (
        <section id="how" ref={ref} style={{ padding: '64px 28px' }}>
            <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                <div style={{ marginBottom: 36, ...reveal(vis) }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.accent, textTransform: 'uppercase' }}>How It Works</span>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '10px 0 0', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                        Three steps. Real skills.
                    </h2>
                </div>
                <div className="hp-steps" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {steps.map((s, i) => (
                        <div key={i} className="hp-step-card" style={{
                            display: 'flex', alignItems: 'stretch', gap: 0,
                            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                            overflow: 'hidden', transition: 'all 0.2s', cursor: 'default',
                            ...reveal(vis, 0.12 + i * 0.08),
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderH; e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none'; }}>
                            {/* Number strip */}
                            <div style={{ width: 64, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 24, fontWeight: 900, color: C.accent }}>0{i + 1}</span>
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 9, background: C.raised, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <s.icon size={17} color={C.accent} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#fff' }}>{s.title}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{s.desc}</p>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0, border: `1px solid rgba(60,131,246,0.12)` }}>{s.detail}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   FEATURES — bento grid
═══════════════════════════════════════════ */
function Features() {
    const [ref, vis] = useReveal();
    const items = [
        { icon: Brain, title: 'AI Lessons', desc: 'Every lesson is freshly generated by AI. Practical, current, adapted to your skill level.', span: false },
        { icon: Zap, title: 'Gamified XP', desc: 'XP for every action. Daily streaks. Badges. Competitive leaderboards that make learning addictive.', span: false },
        { icon: Code2, title: 'Real Challenges', desc: 'Hands-on coding problems that mirror real job tasks. Build muscle memory, not just theory.', span: true },
        { icon: Target, title: 'Execution First', desc: 'Every lesson ends with something you built. We measure output, not hours watched.', span: false },
        { icon: BarChart3, title: 'Progress Intel', desc: 'Visual progress, skill radars, completion analytics. Always know exactly where you stand.', span: false },
        { icon: Sparkles, title: 'Portfolio Projects', desc: 'Mini projects in every module. Graduate with a portfolio that actually impresses employers.', span: true },
    ];
    return (
        <section ref={ref} style={{ padding: '64px 28px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 20, flexWrap: 'wrap', ...reveal(vis) }}>
                    <div>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.accent, textTransform: 'uppercase' }}>Features</span>
                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '10px 0 0', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Everything a serious dev needs.
                        </h2>
                    </div>
                    <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>
                        Browse Courses <ArrowUpRight size={14} />
                    </Link>
                </div>
                <div className="hp-bento" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {items.map((f, i) => (
                        <div key={i} className={f.span ? 'hp-bento-wide' : ''} style={{
                            gridColumn: f.span ? 'span 1' : undefined,
                            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                            padding: '22px 22px', transition: 'all 0.2s', cursor: 'default',
                            ...reveal(vis, 0.08 + i * 0.05),
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(60,131,246,0.3)'; e.currentTarget.style.background = C.raised; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <f.icon size={16} color={C.accent} />
                            </div>
                            <p style={{ margin: '0 0 5px', fontSize: 14, fontWeight: 800, color: '#fff' }}>{f.title}</p>
                            <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   GAMIFICATION — split layout
═══════════════════════════════════════════ */
function Gamification() {
    const [ref, vis] = useReveal();
    const board = [
        { r: 1, n: 'Alex Chen', xp: '12,480', s: 42, medal: '🥇' },
        { r: 2, n: 'Sara Patel', xp: '11,200', s: 38, medal: '🥈' },
        { r: 3, n: 'Mike Johnson', xp: '10,750', s: 29, medal: '🥉' },
        { r: 4, n: 'Emily Liu', xp: '9,320', s: 21, medal: '' },
        { r: 5, n: 'James Okoro', xp: '8,900', s: 18, medal: '' },
    ];
    return (
        <section ref={ref} style={{ padding: '64px 28px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                <div className="hp-gami-split" style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
                    {/* Left - info */}
                    <div style={{ flex: 1, ...reveal(vis) }}>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.amber, textTransform: 'uppercase' }}>Gamification</span>
                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '10px 0 18px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Learning you won't<br />want to stop.
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { ic: Flame, color: C.amber, t: 'Daily Streaks', d: 'Miss a day, lose your streak. Consistency unlocks bonus content and XP multipliers.' },
                                { ic: Star, color: C.accent, t: 'XP & Leveling', d: 'Every lesson, challenge, and project earns XP. Level up from Newbie to Elite.' },
                                { ic: Award, color: C.green, t: '30+ Badges', d: 'Unlock First Code, Week Warrior, Module Master, Speed Demon, and more.' },
                                { ic: Trophy, color: C.amber, t: 'Leaderboard', d: 'Real-time global rankings. See exactly where you stack up.' },
                            ].map((b, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: 12, alignItems: 'center',
                                    padding: '14px 16px', borderRadius: 10,
                                    background: C.card, border: `1px solid ${C.border}`,
                                    transition: 'all 0.2s', cursor: 'default',
                                    ...reveal(vis, 0.1 + i * 0.06),
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderH; e.currentTarget.style.background = C.raised; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${b.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <b.ic size={15} color={b.color} />
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 800, color: '#fff' }}>{b.t}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{b.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — leaderboard */}
                    <div className="hp-lb" style={{ width: 380, flexShrink: 0, ...reveal(vis, 0.15) }}>
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#fff' }}>
                                    <Trophy size={13} color={C.amber} /> Leaderboard
                                </div>
                                <span style={{ fontSize: 9, color: C.dim, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}>LIVE</span>
                            </div>
                            {board.map((r, i) => (
                                <div key={r.r} style={{
                                    padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
                                    borderBottom: i < board.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ width: 18, fontSize: r.medal ? 14 : 11, fontWeight: 900, color: C.dim, textAlign: 'center' }}>{r.medal || r.r}</span>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>
                                        {r.n.split(' ').map(w => w[0]).join('')}
                                    </div>
                                    <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#e5e7eb' }}>{r.n}</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: C.accent, minWidth: 52, textAlign: 'right' }}>{r.xp} XP</span>
                                    <span style={{ fontSize: 10, color: C.amber, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>🔥{r.s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════ */
function CTA() {
    const [ref, vis] = useReveal();
    return (
        <section ref={ref} style={{ padding: '72px 28px', borderTop: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(60,131,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, ...reveal(vis) }}>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                    Your first lesson is free.
                </h2>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px', lineHeight: 1.7 }}>
                    No credit card required. No account setup friction. Just pick a topic and start building.
                </p>
                <Link to="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '14px 32px', borderRadius: 10, background: C.accent,
                    color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 30px rgba(60,131,246,0.2)',
                }}>
                    Generate My First Lesson <ArrowRight size={16} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 16, fontSize: 11, color: C.dim }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={11} color={C.green} /> Free forever tier</span>
                    <span style={{ width: 1, height: 10, background: C.border }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={11} color={C.green} /> No credit card</span>
                    <span style={{ width: 1, height: 10, background: C.border }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={11} color={C.green} /> Instant access</span>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */
function Footer() {
    return (
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: '40px 28px 0' }}>
            <div className="hp-fgrid" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 0.8fr', gap: 32, paddingBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={12} color="#fff" /></div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'agile, sans-serif' }}>LevelUp<span style={{ color: C.accent }}>.dev</span></span>
                    </div>
                    <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.7, maxWidth: 240, margin: 0 }}>The execution-first learning platform for developers who build.</p>
                </div>
                {[
                    { t: 'Platform', ls: [['Home', '/'], ['Courses', '/courses'], ['Dashboard', '/dashboard']] },
                    { t: 'Company', ls: [['About', '/about'], ['Blogs', '/blogs'], ['Contact', '/contact']] },
                ].map(c => (
                    <div key={c.t}>
                        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.muted, textTransform: 'uppercase', margin: '0 0 12px' }}>{c.t}</p>
                        {c.ls.map(([l, h]) => (
                            <Link key={l} to={h} style={{ display: 'block', fontSize: 12, color: C.dim, textDecoration: 'none', padding: '3px 0', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
                                onMouseLeave={e => e.currentTarget.style.color = C.dim}>{l}</Link>
                        ))}
                    </div>
                ))}
                <div>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.muted, textTransform: 'uppercase', margin: '0 0 12px' }}>Social</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[Github, Twitter, Linkedin, MessageCircle].map((Ic, i) => (
                            <a key={i} href="#" style={{ width: 30, height: 30, borderRadius: 7, background: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, transition: 'all 0.15s', textDecoration: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = 'rgba(60,131,246,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = C.border; }}>
                                <Ic size={13} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#333', margin: 0 }}>© 2025 LevelUp.dev — Built for builders.</p>
            </div>
        </footer>
    );
}

/* ═══════════════════════════════════════════
   HOME
═══════════════════════════════════════════ */
export default function Home() {
    return (
        <div style={{ background: C.bg, color: C.text, fontFamily: 'outfit, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
            <style>{`
                @keyframes hpUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:none } }
                @keyframes hpTilt { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(0.3deg)} }
                .hp-tilt { animation: hpTilt 5s ease-in-out infinite; }
                .hp-btn-glow:hover { box-shadow:0 0 40px rgba(60,131,246,0.3) !important; }
                * { box-sizing: border-box; }

                @media(max-width:900px){
                    .hp-hero-row { flex-direction:column !important; gap:28px !important; }
                    .hp-hero-bento { min-width:0 !important; }
                    .hp-strip { flex-wrap:wrap !important; }
                    .hp-strip > div { flex:1 1 45% !important; }
                    .hp-prob-layout { flex-direction:column !important; gap:24px !important; }
                    .hp-bento { grid-template-columns:repeat(2,1fr) !important; }
                    .hp-gami-split { flex-direction:column !important; gap:24px !important; }
                    .hp-lb { width:100% !important; }
                    .hp-fgrid { grid-template-columns:1fr 1fr !important; }
                }
                @media(max-width:600px){
                    .hp-bento { grid-template-columns:1fr !important; }
                    .hp-fgrid { grid-template-columns:1fr !important; }
                    .hp-strip > div { flex:1 1 100% !important; }
                    .hp-dsk { display:none !important; }
                    .hp-mob { display:flex !important; }
                }
                @media(min-width:601px){
                    .hp-mob { display:none !important; }
                }
            `}</style>
            <Nav />
            <Hero />
            <Problem />
            <HowItWorks />
            <Features />
            <Gamification />
            <CTA />
            <Footer />
        </div>
    );
}