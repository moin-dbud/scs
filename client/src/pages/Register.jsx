import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── shared tokens (match Dashboard) ─── */
const C = {
    bg: '#000000',
    surface: '#171717',
    card: '#232323',
    border: 'rgba(255,255,255,0.12)',
    accent: '#3C83F6',
    text: '#ffffff',
    muted: '#a1a1aa',
};

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
            navigate('/courses');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            minHeight: '100vh', fontFamily: 'outfit, outfit Fallback, Arial, sans-serif',
            background: C.bg,
        }}>

            {/* ── LEFT: brand panel ── */}
            <div style={{
                background: `radial-gradient(ellipse at 35% 55%, rgba(60,131,246,0.18) 0%, rgba(124,58,237,0.10) 40%, ${C.bg} 75%)`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '60px 48px', position: 'relative',
            }}>
                <Link to="/" style={{ position: 'absolute', top: '28px', left: '32px', textDecoration: 'none' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: C.text }}>
                        LevelUp<span style={{ color: C.accent }}>.dev</span>
                    </span>
                </Link>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1, color: C.text, marginBottom: '16px' }}>
                        LevelUp<span style={{ color: C.accent }}>.dev</span>
                    </h1>
                    <p style={{ fontSize: '16px', color: C.muted, maxWidth: '280px', lineHeight: 1.7, margin: '0 auto' }}>
                        Start your skill-building journey and level up your career today.
                    </p>
                </div>

                <p style={{ position: 'absolute', bottom: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                    © 2026 LevelUp.dev. All Rights Reserved.
                </p>
            </div>

            {/* ── RIGHT: form ── */}
            <div style={{
                background: C.bg,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '60px 48px', overflowY: 'auto',
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: C.text, marginBottom: '6px' }}>
                        Create your account
                    </h2>
                    <p style={{ fontSize: '14px', color: C.muted, marginBottom: '28px' }}>
                        Fill in your details to get started for free.
                    </p>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)',
                            borderRadius: '10px', padding: '12px 16px',
                            color: '#f87171', fontSize: '13px', marginBottom: '18px',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                        {/* First / Last */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={lbl}>First Name</label>
                                <Inp icon={<User size={13} color="#555" />}>
                                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                                        required placeholder="John" style={inp}
                                        onFocus={e => e.target.style.borderColor = C.accent}
                                        onBlur={e => e.target.style.borderColor = C.border} />
                                </Inp>
                            </div>
                            <div>
                                <label style={lbl}>Last Name</label>
                                <Inp icon={<User size={13} color="#555" />}>
                                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                                        required placeholder="Doe" style={inp}
                                        onFocus={e => e.target.style.borderColor = C.accent}
                                        onBlur={e => e.target.style.borderColor = C.border} />
                                </Inp>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={lbl}>Email</label>
                            <Inp icon={<Mail size={13} color="#555" />}>
                                <input type="email" name="email" value={form.email} onChange={handleChange}
                                    required placeholder="you@example.com" style={inp}
                                    onFocus={e => e.target.style.borderColor = C.accent}
                                    onBlur={e => e.target.style.borderColor = C.border} />
                            </Inp>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={lbl}>Password</label>
                            <Inp icon={<Lock size={13} color="#555" />}>
                                <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                                    onChange={handleChange} required placeholder="Min 6 characters"
                                    style={{ ...inp, paddingRight: '44px' }}
                                    onFocus={e => e.target.style.borderColor = C.accent}
                                    onBlur={e => e.target.style.borderColor = C.border} />
                                <button type="button" onClick={() => setShowPw(p => !p)} style={eyeBtn}>
                                    {showPw ? <EyeOff size={14} color="#666" /> : <Eye size={14} color="#666" />}
                                </button>
                            </Inp>
                        </div>

                        {/* Confirm */}
                        <div>
                            <label style={lbl}>Confirm Password</label>
                            <Inp icon={<Lock size={13} color="#555" />}>
                                <input type={showPw ? 'text' : 'password'} name="confirm" value={form.confirm}
                                    onChange={handleChange} required placeholder="Repeat password" style={inp}
                                    onFocus={e => e.target.style.borderColor = C.accent}
                                    onBlur={e => e.target.style.borderColor = C.border} />
                            </Inp>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '13px', border: 'none', borderRadius: '10px',
                            background: loading ? '#232323' : C.accent,
                            color: C.text, fontSize: '15px', fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'background 0.2s', marginTop: '4px',
                        }}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        <span style={{ fontSize: '12px', color: '#444' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: C.muted, marginBottom: '20px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>

                    <p style={{ textAlign: 'center' }}>
                        <Link to="/" style={{ fontSize: '13px', color: '#555', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <ArrowLeft size={13} /> Back to home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── small helpers ── */
function Inp({ icon, children }) {
    return (
        <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>{icon}</span>
            {children}
        </div>
    );
}

const lbl = { display: 'block', fontSize: '12px', color: '#888', marginBottom: '7px', fontWeight: 500 };
const inp = {
    width: '100%', boxSizing: 'border-box',
    background: '#171717', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', padding: '11px 14px 11px 36px',
    fontSize: '13px', color: '#fff', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s',
};
const eyeBtn = {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
};
