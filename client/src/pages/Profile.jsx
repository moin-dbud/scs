import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Briefcase, GraduationCap, FolderOpen,
    Pencil, LogOut, Mail, Phone, Calendar, FileText,
    ChevronDown, Globe, Github, Linkedin, BookOpen,
    Plus, Trash2, ExternalLink, Code, Clock, CheckCircle,
    XCircle, AlertCircle, Building, GraduationCap as GradCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Design tokens ── */
const C = {
    bg: '#000', nav: '#171717', surface: '#171717', card: '#232323',
    raised: '#2a2a2a', border: 'rgba(255,255,255,0.12)', borderS: 'rgba(255,255,255,0.06)',
    accent: '#3C83F6', grad: 'linear-gradient(135deg,#3b82f6,#7c3aed)',
    text: '#fff', muted: '#a1a1aa', dim: '#555',
};

/* ── Static enrolled courses (from Dashboard) ── */
const ENROLLED_COURSES = [
    {
        id: 'ai-cohort-2', title: '2.0 Job Ready AI Powered Cohort',
        enrolledDate: 'August 20, 2025', progress: 1.97,
        image: 'https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621',
    },
    {
        id: 'fullstack-dev', title: 'Full Stack Web Development',
        enrolledDate: 'September 1, 2025', progress: 25.5,
        image: 'https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621',
    },
];

const SECTIONS = [
    { id: 'basic', label: 'Basic Info', sub: 'Personal details', Icon: User },
    { id: 'professional', label: 'Professional', sub: 'Work & education', Icon: Briefcase },
    { id: 'batches', label: 'Your Batches', sub: 'Enrolled courses', Icon: GraduationCap },
    { id: 'projects', label: 'My Projects', sub: 'Submitted projects', Icon: FolderOpen },
];

const STATUS_CONFIG = {
    pending: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', Icon: AlertCircle },
    approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', Icon: CheckCircle },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', Icon: XCircle },
};

export default function Profile() {
    const { user, loading, updateBasicProfile, updateProfessionalProfile, getProjects, submitProject, deleteProject, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('basic');

    /* ── Basic state ── */
    const [basicEdit, setBasicEdit] = useState(false);
    const [basicForm, setBasicForm] = useState({ firstName: '', lastName: '', email: '', contact: '', dob: '', bio: '' });
    const [basicSaving, setBasicSaving] = useState(false);

    /* ── Professional state ── */
    const [profEdit, setProfEdit] = useState(false);
    const [profForm, setProfForm] = useState({
        designation: '', company: '', linkedin: '', github: '',
        website: '', skills: '', education: '', institution: '', graduationYear: '',
    });
    const [resumeFile, setResumeFile] = useState(null);   // File object
    const [resumeName, setResumeName] = useState('');     // stored filename
    const [profSaving, setProfSaving] = useState(false);

    /* ── Projects state ── */
    const [projects, setProjects] = useState([]);
    const [projLoading, setProjLoading] = useState(false);
    const [showProjForm, setShowProjForm] = useState(false);
    const [projForm, setProjForm] = useState({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '' });
    const [projSubmitting, setProjSubmitting] = useState(false);
    const [projError, setProjError] = useState('');

    /* ── Feedback ── */
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    const flash = (msg, type = 'success') => { setFeedback({ msg, type }); setTimeout(() => setFeedback({ msg: '', type: '' }), 3500); };

    /* ── Redirect if not authed ── */
    useEffect(() => { if (!loading && !user) navigate('/login'); }, [user, loading, navigate]);

    /* ── Populate basic form ── */
    useEffect(() => {
        if (!user) return;
        setBasicForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', contact: user.contact || '', dob: user.dob || '', bio: user.bio || '' });
        setProfForm({
            designation: user.designation || '', company: user.company || '',
            linkedin: user.linkedin || '', github: user.github || '', website: user.website || '',
            skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
            education: user.education || '', institution: user.institution || '', graduationYear: user.graduationYear || '',
        });
        setResumeName(user.resumeName || '');
    }, [user]);

    /* ── Load projects when switching to that tab ── */
    useEffect(() => {
        if (activeSection !== 'projects') return;
        setProjLoading(true);
        getProjects().then(d => setProjects(d.projects || [])).catch(() => { }).finally(() => setProjLoading(false));
    }, [activeSection]);

    /* ── Handlers ── */
    const saveBasic = async () => {
        setBasicSaving(true);
        try { await updateBasicProfile(basicForm); setBasicEdit(false); flash('Basic info updated!'); }
        catch (e) { flash(e.message, 'error'); }
        finally { setBasicSaving(false); }
    };

    const saveProf = async () => {
        setProfSaving(true);
        try { await updateProfessionalProfile(profForm); setProfEdit(false); flash('Professional info updated!'); }
        catch (e) { flash(e.message, 'error'); }
        finally { setProfSaving(false); }
    };

    const handleSubmitProject = async (e) => {
        e.preventDefault(); setProjError(''); setProjSubmitting(true);
        try {
            const d = await submitProject(projForm);
            setProjects(p => [d.project, ...p]);
            setProjForm({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '' });
            setShowProjForm(false);
            flash('Project submitted!');
        } catch (e) { setProjError(e.message); }
        finally { setProjSubmitting(false); }
    };

    const handleDeleteProject = async (id) => {
        if (!confirm('Delete this project?')) return;
        try {
            await deleteProject(id);
            setProjects(p => p.filter(x => x._id !== id));
            flash('Project deleted.');
        } catch (e) { flash(e.message, 'error'); }
    };

    if (loading) return <Loader />;
    const initials = `${basicForm.firstName[0] || ''}${basicForm.lastName[0] || ''}`.toUpperCase() || 'U';

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'outfit, outfit Fallback, Arial, sans-serif', color: C.text }}>
            {/* Dark select option styling */}
            <style>{`
                select option { background: #1a1a1a; color: #fff; }
                select option:disabled { color: #555; }
                select option:checked, select option:hover { background: #3C83F6 !important; color: #fff; }
            `}</style>

            {/* ══ NAVBAR ══ */}
            <nav style={{ background: C.nav, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '65px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 900, color: C.text, margin: 0 }}>
                            LevelUp<span style={{ color: C.accent }}>.dev</span>
                        </h1>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>{basicForm.firstName} {basicForm.lastName}</span>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
                            {initials}
                        </div>
                        <ChevronDown size={16} color={C.muted} />
                    </div>
                </div>
            </nav>

            {/* ══ GLOBAL FEEDBACK ══ */}
            {feedback.msg && (
                <div style={{
                    position: 'fixed', top: '76px', right: '24px', zIndex: 100,
                    background: feedback.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(60,131,246,0.95)',
                    color: '#fff', padding: '12px 20px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}>
                    {feedback.msg}
                </div>
            )}

            {/* ══ BODY ══ */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>

                {/* ──────── SIDEBAR ──────── */}
                <aside style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.borderS}`, overflow: 'hidden' }}>
                    <div style={{ padding: '22px 20px 14px' }}>
                        <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>My Profile</p>
                        <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.5 }}>Manage your information and preferences</p>
                    </div>

                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 20px 20px' }}>
                        <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, marginBottom: '12px', boxShadow: '0 0 24px rgba(60,131,246,0.25)' }}>
                            {initials}
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{basicForm.firstName} {basicForm.lastName}</p>
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', background: 'rgba(60,131,246,0.15)', color: C.accent, border: `1px solid rgba(60,131,246,0.35)`, borderRadius: '20px', padding: '3px 12px' }}>
                            {profForm.designation || 'Select Profession'}
                        </span>
                        {profForm.company && (
                            <p style={{ alignItems: 'center', justifyContent: 'center',  fontSize: '12px', color: C.dim }}>{profForm.company}</p>
                        )}
                    </div>

                    {/* Nav */}
                    <div style={{ padding: '0 10px 12px' }}>
                        {SECTIONS.map(({ id, label, sub, Icon }) => {
                            const active = activeSection === id;
                            return (
                                <button key={id} onClick={() => setActiveSection(id)} style={{
                                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '11px',
                                    padding: '10px 13px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    background: active ? C.accent : 'transparent',
                                    color: active ? '#fff' : C.muted, marginBottom: '3px',
                                    transition: 'all 0.18s', fontFamily: 'inherit',
                                }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.card; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: active ? 'rgba(255,255,255,0.20)' : C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={14} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '1px' }}>{label}</p>
                                        <p style={{ fontSize: '11px', opacity: 0.7 }}>{sub}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick stats */}
                    <div style={{ margin: '0 10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.borderS}`, borderRadius: '10px', overflow: 'hidden' }}>
                        {[['Courses', ENROLLED_COURSES.length], ['Projects', projects.length]].map(([label, val], i) => (
                            <div key={label} style={{ padding: '14px 10px', textAlign: 'center', borderRight: i === 0 ? `1px solid ${C.borderS}` : 'none' }}>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: C.accent }}>{val}</p>
                                <p style={{ fontSize: '11px', color: C.dim }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Logout */}
                    <div style={{ padding: '0 10px 14px' }}>
                        <button onClick={() => { logout(); navigate('/login'); }} style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '10px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`,
                            background: 'transparent', color: '#f87171', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <LogOut size={14} /> Log Out
                        </button>
                    </div>
                </aside>

                {/* ──────── MAIN CONTENT ──────── */}
                <main style={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.borderS}`, overflow: 'hidden', minHeight: '500px' }}>

                    {/* ═══ BASIC INFO ═══ */}
                    {activeSection === 'basic' && (
                        <>
                            <SectionHeader
                                title="Basic Info" subtitle="Update your personal details"
                                icon={<User size={15} color="#fff" />} accent={C.accent}
                                editMode={basicEdit} saving={basicSaving}
                                onEdit={() => setBasicEdit(true)} onSave={saveBasic} onCancel={() => setBasicEdit(false)}
                            />
                            <div style={{ padding: '26px 30px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <Field label="First Name" icon={<User size={13} color={C.dim} />} name="firstName" value={basicForm.firstName} onChange={e => setBasicForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={!basicEdit} />
                                    <Field label="Last Name" icon={<User size={13} color={C.dim} />} name="lastName" value={basicForm.lastName} onChange={e => setBasicForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={!basicEdit} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <Field label="Email (read-only)" icon={<Mail size={13} color={C.dim} />} name="email" value={basicForm.email} onChange={() => { }} disabled={true} type="email" />
                                    <Field label="Contact" icon={<Phone size={13} color={C.dim} />} name="contact" value={basicForm.contact} onChange={e => setBasicForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={!basicEdit} />
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <Field label="Date of Birth" icon={<Calendar size={13} color={C.dim} />} name="dob" value={basicForm.dob} onChange={e => setBasicForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={!basicEdit} placeholder="dd-mm-yyyy" />
                                </div>
                                <div>
                                    <label style={lbl}><FileText size={13} color={C.dim} style={{ marginRight: '5px', verticalAlign: 'middle' }} />Bio</label>
                                    <textarea name="bio" value={basicForm.bio} onChange={e => setBasicForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={!basicEdit}
                                        placeholder="Write a short bio about yourself…" rows={4}
                                        style={{ width: '100%', boxSizing: 'border-box', background: C.card, border: `1px solid ${C.borderS}`, borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: basicEdit ? C.text : C.muted, fontFamily: 'inherit', resize: 'vertical', outline: 'none', transition: 'border-color 0.2s' }}
                                        onFocus={e => { if (basicEdit) e.target.style.borderColor = C.accent; }}
                                        onBlur={e => e.target.style.borderColor = C.borderS}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══ PROFESSIONAL ═══ */}
                    {activeSection === 'professional' && (
                        <>
                            {/* ── Top bar: large title + edit/logout buttons (matches image) ── */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 30px 20px', borderBottom: `1px solid ${C.borderS}` }}>
                                <div>
                                    <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '5px' }}>Professional Information</h2>
                                    <p style={{ fontSize: '13px', color: C.muted }}>Your Career and Educational Background</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                    {profEdit ? (
                                        <>
                                            <Btn onClick={() => setProfEdit(false)} variant="outline">Cancel</Btn>
                                            <Btn onClick={saveProf} disabled={profSaving} variant="primary">{profSaving ? 'Saving…' : 'Save Changes'}</Btn>
                                        </>
                                    ) : (
                                        <Btn onClick={() => setProfEdit(true)} variant="outline"><Pencil size={13} /> Edit Profile</Btn>
                                    )}
                                    <Btn onClick={() => { logout(); navigate('/login'); }} variant="danger"><LogOut size={13} /> Log Out</Btn>
                                </div>
                            </div>

                            <div style={{ padding: '24px 30px' }}>

                                {/* ── Section inner heading ── */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Briefcase size={16} color="#fff" />
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 700 }}>Professional Information</span>
                                </div>

                                {/* ── Row 1: Profession (dropdown) | Organization/College ── */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>

                                    {/* Profession dropdown */}
                                    <div>
                                        <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Briefcase size={13} color={C.dim} />
                                            Profession
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                name="designation"
                                                value={profForm.designation}
                                                onChange={e => setProfForm(p => ({ ...p, designation: e.target.value }))}
                                                disabled={!profEdit}
                                                style={{
                                                    width: '100%', boxSizing: 'border-box',
                                                    appearance: 'none', WebkitAppearance: 'none',
                                                    background: '#1a1a1a',
                                                    border: `1px solid ${profEdit ? 'rgba(60,131,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                                                    borderRadius: '8px', padding: '12px 36px 12px 14px',
                                                    fontSize: '14px', fontWeight: profForm.designation ? 600 : 400,
                                                    color: profForm.designation ? '#fff' : '#555',
                                                    fontFamily: 'inherit', outline: 'none',
                                                    cursor: profEdit ? 'pointer' : 'default',
                                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                                    boxShadow: profEdit ? '0 0 0 1px rgba(60,131,246,0.15)' : 'none',
                                                }}
                                                onFocus={e => { if (profEdit) e.target.style.borderColor = '#3C83F6'; }}
                                                onBlur={e => e.target.style.borderColor = profEdit ? 'rgba(60,131,246,0.5)' : 'rgba(255,255,255,0.07)'}
                                            >
                                                <option value="" disabled>Select profession</option>
                                                <option value="Student">Student</option>
                                                <option value="Passout">Passout</option>
                                                <option value="Employed">Employed</option>
                                                <option value="Self-employed">Self-employed</option>
                                                <option value="Freelancer">Freelancer</option>
                                            </select>
                                            {/* Custom chevron icon */}
                                            <ChevronDown
                                                size={15}
                                                color={profEdit ? '#3C83F6' : '#555'}
                                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <ProfField
                                        label="Organization / College"
                                        icon={<Building size={13} color={C.dim} />}
                                        name="company"
                                        value={profForm.company}
                                        onChange={e => setProfForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                        disabled={!profEdit}
                                        placeholder="Not Provided"
                                    />
                                </div>

                                {/* ── Row 2: Resume upload (full width) ── */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FileText size={13} color={C.dim} />
                                        Resume (PDF, Max 5MB)
                                    </label>
                                    <div
                                        onClick={() => profEdit && document.getElementById('resumeInput').click()}
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            background: C.card,
                                            border: `1.5px solid ${resumeFile || resumeName ? C.accent : 'rgba(60,131,246,0.5)'}`,
                                            borderRadius: '10px', padding: '14px 16px',
                                            fontSize: '14px',
                                            color: resumeFile ? C.text : resumeName ? C.muted : C.accent,
                                            cursor: profEdit ? 'pointer' : 'default',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxShadow: profEdit ? `0 0 0 1px rgba(60,131,246,0.2)` : 'none',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                        }}
                                    >
                                        <FileText size={15} color={C.accent} style={{ flexShrink: 0 }} />
                                        <span style={{ flex: 1 }}>
                                            {resumeFile
                                                ? resumeFile.name
                                                : resumeName || 'Not specified'}
                                        </span>
                                        {profEdit && (
                                            <span style={{ fontSize: '12px', color: C.accent, fontWeight: 600 }}>Browse</span>
                                        )}
                                    </div>
                                    <input
                                        id="resumeInput" type="file" accept=".pdf" style={{ display: 'none' }}
                                        onChange={e => {
                                            const f = e.target.files[0];
                                            if (f && f.size <= 5 * 1024 * 1024) setResumeFile(f);
                                            else if (f) alert('File must be under 5 MB');
                                        }}
                                    />
                                </div>

                                {/* ── Row 3: LinkedIn | GitHub ── */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                                    <ProfField
                                        label="LinkedIn Profile"
                                        icon={<Linkedin size={13} color={C.dim} />}
                                        name="linkedin"
                                        value={profForm.linkedin}
                                        onChange={e => setProfForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                        disabled={!profEdit}
                                        placeholder="Not provided"
                                    />
                                    <ProfField
                                        label="Github Profile"
                                        icon={<Github size={13} color={C.dim} />}
                                        name="github"
                                        value={profForm.github}
                                        onChange={e => setProfForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                        disabled={!profEdit}
                                        placeholder="Not provided"
                                    />
                                </div>

                                {/* ── Skills (tags preview) ── */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Code size={13} color={C.dim} />
                                        Skills (comma-separated)
                                    </label>
                                    <textarea
                                        name="skills" value={profForm.skills}
                                        onChange={e => setProfForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                        disabled={!profEdit}
                                        placeholder="React, Node.js, Python, MongoDB…" rows={2}
                                        style={{ width: '100%', boxSizing: 'border-box', background: C.card, border: `1px solid ${C.borderS}`, borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: profEdit ? C.text : C.muted, fontFamily: 'inherit', resize: 'none', outline: 'none', transition: 'border-color 0.2s' }}
                                        onFocus={e => { if (profEdit) e.target.style.borderColor = C.accent; }}
                                        onBlur={e => e.target.style.borderColor = C.borderS}
                                    />
                                    {profForm.skills && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                            {profForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                                <span key={s} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(60,131,246,0.15)', color: C.accent, border: `1px solid rgba(60,131,246,0.3)` }}>{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ── Website ── */}
                                <ProfField
                                    label="Personal Website"
                                    icon={<Globe size={13} color={C.dim} />}
                                    name="website"
                                    value={profForm.website}
                                    onChange={e => setProfForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                    disabled={!profEdit}
                                    placeholder="Not provided"
                                />
                            </div>
                        </>
                    )}

                    {/* ═══ YOUR BATCHES ═══ */}
                    {activeSection === 'batches' && (
                        <>
                            <div style={{ padding: '26px 30px 22px', borderBottom: `1px solid ${C.borderS}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <GraduationCap size={16} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '3px' }}>Your Batches</h2>
                                    <p style={{ fontSize: '13px', color: C.muted }}>Courses you're currently enrolled in</p>
                                </div>
                            </div>
                            <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {ENROLLED_COURSES.map(course => (
                                    <div key={course.id} style={{ background: C.card, borderRadius: '12px', border: `1px solid ${C.borderS}`, overflow: 'hidden', display: 'flex', gap: 0 }}>
                                        <img src={course.image} alt={course.title} style={{ width: '160px', height: '110px', objectFit: 'cover', flexShrink: 0 }} />
                                        <div style={{ padding: '16px 20px', flex: 1 }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{course.title}</h3>
                                            <p style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>Enrolled: {course.enrolledDate}</p>
                                            {/* Progress bar */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <span style={{ fontSize: '12px', color: C.muted }}>Progress</span>
                                                    <span style={{ fontSize: '12px', color: C.accent, fontWeight: 600 }}>{course.progress}%</span>
                                                </div>
                                                <div style={{ height: '5px', background: '#333', borderRadius: '99px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${course.progress}%`, height: '100%', background: C.accent, borderRadius: '99px', transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                            <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
                                                <button style={{ padding: '7px 18px', background: C.accent, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    Resume Learning →
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ═══ MY PROJECTS ═══ */}
                    {activeSection === 'projects' && (
                        <>
                            <div style={{ padding: '26px 30px 22px', borderBottom: `1px solid ${C.borderS}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FolderOpen size={16} color="#fff" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '3px' }}>My Projects</h2>
                                        <p style={{ fontSize: '13px', color: C.muted }}>Submit and showcase the projects you've built</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowProjForm(p => !p)} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                                    background: showProjForm ? C.raised : C.accent, border: 'none',
                                    borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                                }}>
                                    <Plus size={14} /> {showProjForm ? 'Cancel' : 'Add Project'}
                                </button>
                            </div>

                            {/* Submit Form */}
                            {showProjForm && (
                                <div style={{ margin: '20px 30px 0', background: C.card, borderRadius: '12px', border: `1px solid ${C.borderS}`, padding: '22px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px', color: C.accent }}>Submit a New Project</h3>
                                    {projError && <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '14px' }}>{projError}</div>}
                                    <form onSubmit={handleSubmitProject} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                                        <Field label="Project Title *" icon={<FolderOpen size={13} color={C.dim} />} name="title" value={projForm.title} onChange={e => setProjForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={false} placeholder="My Awesome Project" />
                                        <div>
                                            <label style={lbl}><FileText size={13} color={C.dim} style={{ marginRight: '5px', verticalAlign: 'middle' }} />Description</label>
                                            <textarea name="description" value={projForm.description} onChange={e => setProjForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                                placeholder="Describe what this project does…" rows={3}
                                                style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: `1px solid ${C.borderS}`, borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: C.text, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                                                onFocus={e => e.target.style.borderColor = C.accent}
                                                onBlur={e => e.target.style.borderColor = C.borderS}
                                            />
                                        </div>
                                        <Field label="Tech Stack (comma-separated)" icon={<Code size={13} color={C.dim} />} name="techStack" value={projForm.techStack} onChange={e => setProjForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={false} placeholder="React, Node.js, MongoDB" />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px' }}>
                                            <Field label="GitHub URL" icon={<Github size={13} color={C.dim} />} name="githubUrl" value={projForm.githubUrl} onChange={e => setProjForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={false} placeholder="https://github.com/..." />
                                            <Field label="Live URL" icon={<Globe size={13} color={C.dim} />} name="liveUrl" value={projForm.liveUrl} onChange={e => setProjForm(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={false} placeholder="https://myproject.vercel.app" />
                                        </div>
                                        <button type="submit" disabled={projSubmitting} style={{ padding: '11px', background: projSubmitting ? '#333' : C.accent, border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: projSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
                                            {projSubmitting ? 'Submitting…' : 'Submit Project'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Projects List */}
                            <div style={{ padding: '20px 30px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {projLoading ? (
                                    <p style={{ color: C.muted, fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Loading projects…</p>
                                ) : projects.length === 0 ? (
                                    <EmptyState icon={<FolderOpen size={40} color="#333" />} title="No projects yet" sub="Click 'Add Project' to submit your first project." />
                                ) : projects.map(proj => {
                                    const st = STATUS_CONFIG[proj.status] || STATUS_CONFIG.pending;
                                    return (
                                        <div key={proj._id} style={{ background: C.card, borderRadius: '12px', border: `1px solid ${C.borderS}`, padding: '18px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{proj.title}</h3>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px', background: st.bg, color: st.color, border: `1px solid ${st.color}40` }}>
                                                            <st.Icon size={11} /> {st.label}
                                                        </span>
                                                    </div>
                                                    {proj.description && <p style={{ fontSize: '13px', color: C.muted, marginBottom: '10px', lineHeight: 1.6 }}>{proj.description}</p>}
                                                    {proj.techStack?.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                                            {proj.techStack.map(t => (
                                                                <span key={t} style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '20px', background: 'rgba(60,131,246,0.12)', color: C.accent, border: `1px solid rgba(60,131,246,0.25)` }}>{t}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '14px' }}>
                                                        {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted, textDecoration: 'none' }}><Github size={13} /> GitHub</a>}
                                                        {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted, textDecoration: 'none' }}><ExternalLink size={13} /> Live Demo</a>}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteProject(proj._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '4px', flexShrink: 0 }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#555'}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '11px', color: C.dim }}>Submitted {new Date(proj.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

/* ══════════ Sub-components ══════════ */

function SectionHeader({ title, subtitle, icon, accent, editMode, saving, onEdit, onSave, onCancel }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '26px 30px 22px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <div>
                    <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '3px' }}>{title}</h2>
                    <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{subtitle}</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                {editMode ? (
                    <>
                        <Btn onClick={onCancel} variant="outline">Cancel</Btn>
                        <Btn onClick={onSave} disabled={saving} variant="primary">{saving ? 'Saving…' : 'Save Changes'}</Btn>
                    </>
                ) : (
                    <Btn onClick={onEdit} variant="outline"><Pencil size={13} /> Edit</Btn>
                )}
            </div>
        </div>
    );
}

function SubHeading({ label, Icon }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Icon size={14} color="#3C83F6" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#3C83F6', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>
        </div>
    );
}

function Field({ label, icon, name, value, onChange, disabled, type = 'text', placeholder }) {
    return (
        <div>
            <label style={lbl}><span style={{ marginRight: '5px', verticalAlign: 'middle' }}>{icon}</span>{label}</label>
            <input type={type} name={name} value={value} onChange={onChange} disabled={disabled}
                placeholder={placeholder || label}
                style={{ width: '100%', boxSizing: 'border-box', background: '#232323', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: disabled ? '#555' : '#fff', fontFamily: 'inherit', outline: 'none', cursor: disabled ? 'default' : 'text', transition: 'border-color 0.2s' }}
                onFocus={e => { if (!disabled) e.target.style.borderColor = '#3C83F6'; }}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
        </div>
    );
}

function Btn({ onClick, disabled, variant, children }) {
    const base = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.15s' };
    const v = {
        primary: { ...base, background: disabled ? '#232323' : '#3C83F6', color: '#fff' },
        outline: { ...base, background: 'transparent', color: '#ccc', border: '1px solid rgba(255,255,255,0.15)' },
        danger: { ...base, background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.35)' },
    };
    return <button onClick={onClick} disabled={disabled} style={v[variant] || v.outline}>{children}</button>;
}

/* ProfField — label with icon above, dark input, shows placeholder when disabled+empty */
function ProfField({ label, icon, name, value, onChange, disabled, placeholder }) {
    return (
        <div>
            <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '5px' }}>
                {icon}{label}
            </label>
            <input
                type="text" name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px', padding: '12px 14px',
                    fontSize: '14px',
                    color: value ? '#fff' : '#555',
                    fontFamily: 'inherit', outline: 'none',
                    cursor: disabled ? 'default' : 'text',
                    transition: 'border-color 0.2s',
                }}
                onFocus={e => { if (!disabled) e.target.style.borderColor = '#3C83F6'; }}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
        </div>
    );
}

function EmptyState({ icon, title, sub }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '54px 20px', textAlign: 'center' }}>
            {icon}
            <p style={{ fontSize: '16px', fontWeight: 700, marginTop: '14px', marginBottom: '6px' }}>{title}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>{sub}</p>
        </div>
    );
}

function Loader() {
    return <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'outfit, Arial, sans-serif' }}>Loading…</div>;
}

const lbl = { display: 'block', fontSize: '12px', color: '#888', marginBottom: '7px', fontWeight: 500 };
