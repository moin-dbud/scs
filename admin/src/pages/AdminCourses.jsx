import React, { useState, useRef } from 'react';
import { BookOpen, Users, Clock, Star, Eye, ToggleLeft, ToggleRight, Trash2, X, Save, Upload, ImageIcon } from 'lucide-react';
import { usePlatform } from '../context/PlatformStore';

const API = 'http://localhost:5000/api';

const C = {
    accent: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#f59e0b', purple: '#a855f7',
    muted: '#a1a1aa', dim: '#555', card: '#111', raised: '#181818',
    border: 'rgba(255,255,255,0.08)', borderS: 'rgba(255,255,255,0.05)',
};
const CAT_COLORS = { AI: C.purple, 'Web Dev': C.blue, DSA: C.yellow, DevOps: C.green };
const CATEGORIES = ['AI', 'Web Dev', 'DSA', 'DevOps', 'Other'];

const inp = {
    width: '100%', boxSizing: 'border-box', background: '#0d0d0d',
    border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px',
    padding: '10px 13px', fontSize: '13px', color: '#fff',
    fontFamily: 'inherit', outline: 'none',
};
const focusAccent = e => e.target.style.borderColor = C.accent;
const blurReset = e => e.target.style.borderColor = 'rgba(255,255,255,0.08)';

/* ─── Image Upload Field ─── */
function ImageUploadField({ imageUrl, onUploaded }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const upload = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`${API}/admin/upload`, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onUploaded(data.url);
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const onFileChange = e => upload(e.target.files[0]);
    const onDrop = e => {
        e.preventDefault(); setDragOver(false);
        upload(e.dataTransfer.files[0]);
    };

    return (
        <div>
            <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Course Thumbnail
            </label>
            {/* Preview */}
            {imageUrl && (
                <div style={{ position: 'relative', marginBottom: '8px', borderRadius: '10px', overflow: 'hidden', height: '140px' }}>
                    <img src={imageUrl} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)', display: 'flex', alignItems: 'flex-end', padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>✓ Image uploaded</span>
                    </div>
                </div>
            )}

            {/* Drop zone */}
            <div
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{
                    border: `2px dashed ${dragOver ? C.accent : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '10px', padding: '18px', textAlign: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    background: dragOver ? 'rgba(239,68,68,0.05)' : '#0d0d0d',
                    transition: 'all 0.2s',
                }}
            >
                {uploading ? (
                    <p style={{ fontSize: '13px', color: C.muted }}>Uploading…</p>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <Upload size={22} color={C.dim} />
                        </div>
                        <p style={{ fontSize: '13px', color: C.muted, marginBottom: '2px' }}>
                            {imageUrl ? 'Replace image' : 'Click or drag & drop to upload'}
                        </p>
                        <p style={{ fontSize: '11px', color: C.dim }}>PNG, JPG, WEBP — max 5 MB</p>
                    </>
                )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        </div>
    );
}

/* ─── Create Course Modal ─── */
function CourseModal({ onClose, onCreate }) {
    const [form, setForm] = useState({
        title: '', subtitle: '', instructor: '', category: 'AI',
        duration: '', modules: '', price: '', originalPrice: '',
        image: '', tags: '', features: '', level: '', badge: '',
        badgeColor: '#f59e0b', status: 'draft',
    });
    const [saving, setSaving] = useState(false);
    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);
        await onCreate({
            ...form,
            modules: Number(form.modules) || 0,
            tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
            features: form.features.split(',').map(s => s.trim()).filter(Boolean),
        });
        setSaving(false);
        onClose();
    };

    const field = (key, label, type = 'text', placeholder = '') => (
        <div key={key}>
            <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>{label}</label>
            <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                style={inp} onFocus={focusAccent} onBlur={blurReset} />
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
            <div style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '580px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800 }}>New Course</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: '4px', display: 'flex' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Image Upload */}
                    <ImageUploadField
                        imageUrl={form.image}
                        onUploaded={url => setForm(p => ({ ...p, image: url }))}
                    />

                    {field('title', 'Course Title *')}
                    {field('subtitle', 'Subtitle / Tagline')}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {field('instructor', 'Instructor')}
                        {field('duration', 'Duration (e.g. 3 months)')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {field('price', 'Price (e.g. ₹9,999)')}
                        {field('originalPrice', 'Original Price (e.g. ₹19,999)')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {field('modules', 'No. of Modules', 'number')}
                        {field('level', 'Level (e.g. Beginner)')}
                    </div>

                    {field('tags', 'Tags (comma-separated)', 'text', 'React, Node.js, Python')}
                    {field('features', 'Features (comma-separated)', 'text', 'Live sessions, Certificate')}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Category</label>
                            <select value={form.category} onChange={set('category')} style={inp}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Status</label>
                            <select value={form.status} onChange={set('status')} style={inp}>
                                <option value="draft">Draft (hidden from students)</option>
                                <option value="live">Live (visible to students)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                        {field('badge', 'Badge label (e.g. Bestseller)')}
                        <div>
                            <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Colour</label>
                            <input type="color" value={form.badgeColor} onChange={set('badgeColor')}
                                style={{ width: '44px', height: '38px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', padding: '2px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', background: C.raised, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', background: saving ? '#555' : C.accent, border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            <Save size={13} /> {saving ? 'Saving…' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── View Modal ─── */
function ViewModal({ course, users, onClose }) {
    const enrolled = users.filter(u =>
        (u.enrolledCourses || []).some(e => e.courseId === course.id || e.courseId === course._id)
    );
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
                {course.image && (
                    <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                        <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }} />
                        <div style={{ position: 'absolute', bottom: '14px', left: '18px' }}>
                            <p style={{ fontWeight: 800, fontSize: '16px' }}>{course.title}</p>
                            <p style={{ fontSize: '12px', color: C.muted }}>{course.subtitle}</p>
                        </div>
                    </div>
                )}
                <div style={{ padding: '20px 24px' }}>
                    {!course.image && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>{course.title}</h2>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        {[['Category', course.category], ['Status', course.status], ['Duration', course.duration || '—'], ['Price', course.price || '—'], ['Instructor', course.instructor || '—'], ['Enrollments', enrolled.length]].map(([k, v]) => (
                            <div key={k} style={{ background: C.raised, borderRadius: '8px', padding: '10px 12px' }}>
                                <p style={{ fontSize: '10px', color: C.dim, marginBottom: '3px', textTransform: 'uppercase', fontWeight: 600 }}>{k}</p>
                                <p style={{ fontSize: '13px', fontWeight: 600, textTransform: k === 'Status' ? 'capitalize' : 'none' }}>{v}</p>
                            </div>
                        ))}
                    </div>

                    <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: C.muted }}>Enrolled Users ({enrolled.length})</p>
                    {enrolled.length === 0 ? (
                        <p style={{ fontSize: '13px', color: C.dim }}>No users enrolled yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                            {enrolled.map(u => (
                                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: C.raised, borderRadius: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '10px', flexShrink: 0 }}>
                                        {(u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>{u.name}</p>
                                        <p style={{ fontSize: '11px', color: C.dim }}>{u.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={onClose} style={{ marginTop: '18px', width: '100%', padding: '11px', background: C.raised, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Courses Page ─── */
export default function AdminCourses() {
    const { courses, coursesLoading, users, createCourse, deleteCourse, toggleCourseStatus } = usePlatform();
    const [showCreate, setShowCreate] = useState(false);
    const [viewCourse, setViewCourse] = useState(null);

    return (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {showCreate && <CourseModal onClose={() => setShowCreate(false)} onCreate={createCourse} />}
            {viewCourse && <ViewModal course={viewCourse} users={users} onClose={() => setViewCourse(null)} />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Courses</h1>
                    <p style={{ fontSize: '14px', color: C.muted }}>
                        {coursesLoading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} · ${courses.filter(c => c.status === 'live').length} live`}
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: C.accent, border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    + New Course
                </button>
            </div>

            {coursesLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ background: C.card, borderRadius: '14px', height: '200px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px' }}>
                    <ImageIcon size={40} color={C.dim} style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>No courses yet</p>
                    <p style={{ fontSize: '13px', color: C.dim }}>Click "+ New Course" to create your first course.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {courses.map(c => {
                        const catColor = CAT_COLORS[c.category] || C.blue;
                        const enrolledCount = users.filter(u =>
                            (u.enrolledCourses || []).some(e => e.courseId === c.id || e.courseId === c._id)
                        ).length;
                        return (
                            <div key={c.id}
                                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                            >
                                {/* Thumbnail */}
                                {c.image ? (
                                    <div style={{ height: '130px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />
                                        <span style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fff', background: catColor, padding: '2px 8px', borderRadius: '20px' }}>{c.category}</span>
                                        <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: c.status === 'live' ? 'rgba(34,197,94,0.9)' : 'rgba(0,0,0,0.6)', color: '#fff' }}>
                                            {c.status === 'live' ? '● LIVE' : '◌ DRAFT'}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ height: '4px', background: catColor }} />
                                )}

                                <div style={{ padding: '16px 18px' }}>
                                    {!c.image && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: catColor }}>{c.category}</span>
                                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: c.status === 'live' ? 'rgba(34,197,94,0.12)' : 'rgba(85,85,85,0.2)', color: c.status === 'live' ? C.green : C.dim }}>
                                                {c.status === 'live' ? '● LIVE' : '◌ DRAFT'}
                                            </span>
                                        </div>
                                    )}

                                    <h3 style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.35, marginBottom: '10px' }}>{c.title}</h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
                                        {[
                                            { Icon: Users, val: `${enrolledCount} students`, color: C.blue },
                                            { Icon: Star, val: `${c.rating || 0} rating`, color: C.yellow },
                                            { Icon: Clock, val: c.duration || '—', color: C.muted },
                                            { Icon: BookOpen, val: c.price || '—', color: C.green },
                                        ].map(({ Icon, val, color }, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Icon size={11} color={color} />
                                                <span style={{ fontSize: '11px', color: C.muted }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '7px', borderTop: `1px solid ${C.borderS}`, paddingTop: '12px' }}>
                                        <button onClick={() => setViewCourse(c)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '7px', background: C.raised, border: `1px solid ${C.borderS}`, borderRadius: '7px', color: C.muted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            <Eye size={11} /> View
                                        </button>
                                        <button onClick={() => toggleCourseStatus(c.id, c.status)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '7px', background: c.status === 'live' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${c.status === 'live' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, borderRadius: '7px', color: c.status === 'live' ? C.accent : C.green, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            {c.status === 'live' ? <><ToggleRight size={11} /> Unpublish</> : <><ToggleLeft size={11} /> Publish</>}
                                        </button>
                                        <button onClick={() => deleteCourse(c.id)} style={{ padding: '7px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: C.accent, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
        </div>
    );
}
