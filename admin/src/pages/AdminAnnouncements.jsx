import React, { useState } from 'react';
import { Megaphone, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { usePlatform } from '../context/PlatformStore';

const C = {
    accent: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#f59e0b',
    muted: '#a1a1aa', dim: '#555', card: '#111', raised: '#181818',
    border: 'rgba(255,255,255,0.08)', borderS: 'rgba(255,255,255,0.05)',
};
const inp = { width: '100%', boxSizing: 'border-box', background: '#0d0d0d', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#fff', fontFamily: 'inherit', outline: 'none' };

function AnnouncementForm({ initial, onSave, onCancel, label }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [desc, setDesc] = useState(initial?.description || '');
    const submit = e => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({ title: title.trim(), description: desc.trim() });
        setTitle(''); setDesc('');
    };
    return (
        <form onSubmit={submit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>{label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Title *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title…" style={inp}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Description</label>
                    <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Announcement details…"
                        style={{ ...inp, resize: 'vertical' }}
                        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {onCancel && (
                        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', background: C.raised, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: C.accent, border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Save size={13} /> {label}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function AdminAnnouncements() {
    const { announcements, addAnnouncement, editAnnouncement, deleteAnnouncement } = usePlatform();
    const [editId, setEditId] = useState(null);

    return (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Announcements</h1>
                <p style={{ fontSize: '14px', color: C.muted }}>Publish updates to all users — reflected instantly on their dashboards</p>
            </div>

            {/* Create form */}
            <AnnouncementForm
                label="+ Publish Announcement"
                onSave={data => addAnnouncement(data)}
            />

            {/* List */}
            {announcements.length === 0 ? (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                    <Megaphone size={28} color={C.dim} style={{ marginBottom: '10px' }} />
                    <p style={{ fontSize: '14px', color: C.dim }}>No announcements yet. Create one above.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {announcements.map(a => (
                        <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                            {editId === a.id ? (
                                <div style={{ padding: '20px 24px' }}>
                                    <AnnouncementForm
                                        label="Save Changes"
                                        initial={a}
                                        onSave={data => { editAnnouncement(a.id, data); setEditId(null); }}
                                        onCancel={() => setEditId(null)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <Megaphone size={14} color={C.accent} />
                                                <p style={{ fontWeight: 700, fontSize: '14px' }}>{a.title}</p>
                                            </div>
                                            {a.description && (
                                                <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.55 }}>{a.description}</p>
                                            )}
                                            <p style={{ fontSize: '11px', color: C.dim, marginTop: '8px' }}>
                                                {new Date(a.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                {a.updatedAt && ' (edited)'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                            <button onClick={() => setEditId(a.id)} style={{ padding: '7px', background: 'transparent', border: `1px solid ${C.borderS}`, borderRadius: '7px', color: C.blue, cursor: 'pointer', display: 'flex' }}>
                                                <Edit2 size={13} />
                                            </button>
                                            <button onClick={() => deleteAnnouncement(a.id)} style={{ padding: '7px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '7px', color: C.accent, cursor: 'pointer', display: 'flex' }}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #ef4444, transparent)' }} />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
