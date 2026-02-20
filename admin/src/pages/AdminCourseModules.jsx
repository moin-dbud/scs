import React, { useState, useEffect, useCallback } from 'react';
import {
    BookOpen, ChevronDown, ChevronRight, Plus, Trash2,
    Pencil, Check, X, FileText, HelpCircle, ClipboardList,
    Code2, Layers, GripVertical, Loader2, Save, Eye, EyeOff, ChevronUp,
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const getToken = () => sessionStorage.getItem('adminToken') || '';
const auth = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const C = {
    bg: '#000', surface: '#0d0d0d', card: '#111', raised: '#161616',
    border: 'rgba(255,255,255,0.08)', borderS: 'rgba(255,255,255,0.05)',
    accent: '#ef4444', accentDim: 'rgba(239,68,68,0.12)',
    blue: '#3b82f6', blueDim: 'rgba(59,130,246,0.12)',
    green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
    amber: '#f59e0b', amberDim: 'rgba(245,158,11,0.12)',
    purple: '#a855f7', purpleDim: 'rgba(168,85,247,0.12)',
    text: '#fff', muted: '#a1a1aa', dim: '#555',
};

const TYPES = [
    { value: 'article', label: 'Article', Icon: FileText, color: C.blue, dimBg: C.blueDim },
    { value: 'quiz', label: 'Quiz', Icon: HelpCircle, color: C.amber, dimBg: C.amberDim },
    { value: 'assignment', label: 'Assignment', Icon: ClipboardList, color: C.green, dimBg: C.greenDim },
    { value: 'coding', label: 'Coding', Icon: Code2, color: C.purple, dimBg: C.purpleDim },
];
const typeInfo = v => TYPES.find(t => t.value === v) || TYPES[0];

/* shared style helpers */
const inp = extra => ({
    background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '9px 12px', fontSize: '13px', color: C.text, fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
    ...extra,
});
const ta = extra => ({ ...inp(extra), resize: 'vertical', minHeight: '120px', lineHeight: 1.7 });
const btn = (bg, col = '#fff', extra = {}) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '8px', border: 'none',
    background: bg, color: col, fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s', ...extra,
});
const label = (text) => (
    <label style={{ fontSize: '11px', color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
        {text}
    </label>
);

/* ════════════════════════════════════
   Content editors per lesson type
════════════════════════════════════ */

/* ── Article editor ── */
function ArticleEditor({ value, onChange }) {
    const [preview, setPreview] = useState(false);
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                {label('Article Content (Markdown supported)')}
                <button onClick={() => setPreview(p => !p)} style={{ ...btn('transparent', C.muted), padding: '4px 10px', fontSize: '11px', border: `1px solid ${C.border}` }}>
                    {preview ? <EyeOff size={12} /> : <Eye size={12} />}
                    {preview ? 'Edit' : 'Preview'}
                </button>
            </div>
            {preview ? (
                <div style={{ background: '#0d0d0d', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px 20px', minHeight: '180px' }}>
                    <div style={{ fontSize: '14px', color: C.muted, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {value || <span style={{ color: C.dim, fontStyle: 'italic' }}>Nothing to preview.</span>}
                    </div>
                </div>
            ) : (
                <textarea value={value} onChange={e => onChange(e.target.value)}
                    placeholder="Write the full article here. Supports markdown-style formatting:&#10;&#10;# Heading&#10;## Subheading&#10;**Bold**, *italic*, `code`&#10;&#10;- Bullet point&#10;&#10;```js&#10;const example = 'code block';&#10;```"
                    style={ta({ minHeight: '280px' })}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = C.border} />
            )}
        </div>
    );
}

/* ── Quiz editor ── */
function QuizEditor({ questions = [], onChange }) {
    const addQ = () => onChange([...questions, { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]);
    const updateQ = (i, patch) => onChange(questions.map((q, idx) => idx === i ? { ...q, ...patch } : q));
    const removeQ = (i) => onChange(questions.filter((_, idx) => idx !== i));
    const updateOpt = (qi, oi, val) => {
        const opts = [...questions[qi].options];
        opts[oi] = val;
        updateQ(qi, { options: opts });
    };
    return (
        <div>
            {questions.map((q, qi) => (
                <div key={qi} style={{ background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: C.amber, background: C.amberDim, borderRadius: '6px', padding: '3px 8px', flexShrink: 0 }}>Q{qi + 1}</span>
                        <input value={q.question} onChange={e => updateQ(qi, { question: e.target.value })}
                            style={inp({ flex: 1 })} placeholder="Enter your question"
                            onFocus={e => e.target.style.borderColor = C.amber}
                            onBlur={e => e.target.style.borderColor = C.border} />
                        <button onClick={() => removeQ(qi)} style={{ ...btn('transparent', C.accent), padding: '7px 9px', flexShrink: 0 }}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        {q.options.map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                <input type="radio" name={`correct-${qi}`} checked={q.correct === oi}
                                    onChange={() => updateQ(qi, { correct: oi })}
                                    style={{ accentColor: C.green, flexShrink: 0, cursor: 'pointer' }} />
                                <input value={opt} onChange={e => updateOpt(qi, oi, e.target.value)}
                                    style={inp({ flex: 1 })} placeholder={`Option ${oi + 1}`}
                                    onFocus={e => e.target.style.borderColor = q.correct === oi ? C.green : C.amber}
                                    onBlur={e => e.target.style.borderColor = C.border} />
                            </div>
                        ))}
                    </div>
                    {label('Explanation (shown after answering)')}
                    <textarea value={q.explanation} onChange={e => updateQ(qi, { explanation: e.target.value })}
                        placeholder="Explain why the correct answer is right…"
                        style={ta({ minHeight: '60px' })}
                        onFocus={e => e.target.style.borderColor = C.amber}
                        onBlur={e => e.target.style.borderColor = C.border} />
                </div>
            ))}
            <button onClick={addQ} style={{ ...btn(C.amberDim, C.amber), border: `1px dashed rgba(245,158,11,0.35)`, width: '100%', justifyContent: 'center', padding: '10px' }}>
                <Plus size={13} /> Add Question
            </button>
        </div>
    );
}

/* ── Assignment editor ── */
function AssignmentEditor({ data = {}, onChange }) {
    const up = (k, v) => onChange({ ...data, [k]: v });
    const reqs = data.assignmentRequirements || [];
    const addReq = () => onChange({ ...data, assignmentRequirements: [...reqs, ''] });
    const updReq = (i, v) => onChange({ ...data, assignmentRequirements: reqs.map((r, idx) => idx === i ? v : r) });
    const delReq = (i) => onChange({ ...data, assignmentRequirements: reqs.filter((_, idx) => idx !== i) });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                {label('Assignment Brief')}
                <textarea value={data.assignmentBrief || ''} onChange={e => up('assignmentBrief', e.target.value)}
                    placeholder="Describe the assignment task in detail…"
                    style={ta({ minHeight: '160px' })}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.border} />
            </div>
            <div>
                {label('Requirements / Acceptance Criteria')}
                {reqs.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ marginTop: '10px', color: C.green, fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>{i + 1}.</span>
                        <input value={r} onChange={e => updReq(i, e.target.value)}
                            style={inp({ flex: 1 })} placeholder={`Requirement ${i + 1}`}
                            onFocus={e => e.target.style.borderColor = C.green}
                            onBlur={e => e.target.style.borderColor = C.border} />
                        <button onClick={() => delReq(i)} style={{ ...btn('transparent', C.accent), padding: '7px 9px' }}><Trash2 size={12} /></button>
                    </div>
                ))}
                <button onClick={addReq} style={{ ...btn(C.greenDim, C.green), border: `1px dashed rgba(34,197,94,0.35)`, width: '100%', justifyContent: 'center', padding: '9px' }}>
                    <Plus size={13} /> Add Requirement
                </button>
            </div>
            <div>
                {label('Deadline (days from enrollment)')}
                <input type="number" value={data.assignmentDeadlineDays ?? 7} onChange={e => up('assignmentDeadlineDays', Number(e.target.value))}
                    style={inp({ maxWidth: '120px' })} min={1}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.border} />
            </div>
        </div>
    );
}

/* ── Coding editor ── */
function CodingEditor({ data = {}, onChange }) {
    const up = (k, v) => onChange({ ...data, [k]: v });
    const tcs = data.testCases || [];
    const addTc = () => onChange({ ...data, testCases: [...tcs, { input: '', expectedOutput: '' }] });
    const updTc = (i, k, v) => onChange({ ...data, testCases: tcs.map((t, idx) => idx === i ? { ...t, [k]: v } : t) });
    const delTc = (i) => onChange({ ...data, testCases: tcs.filter((_, idx) => idx !== i) });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                {label('Problem Statement')}
                <textarea value={data.problemStatement || ''} onChange={e => up('problemStatement', e.target.value)}
                    placeholder="Describe the coding problem clearly. Include input/output format, constraints…"
                    style={ta({ minHeight: '160px' })}
                    onFocus={e => e.target.style.borderColor = C.purple}
                    onBlur={e => e.target.style.borderColor = C.border} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                    {label('Language')}
                    <select value={data.language || 'javascript'} onChange={e => up('language', e.target.value)}
                        style={inp({ cursor: 'pointer' })}
                        onFocus={e => e.target.style.borderColor = C.purple}
                        onBlur={e => e.target.style.borderColor = C.border}>
                        {['javascript', 'python', 'java', 'cpp', 'typescript'].map(l => (
                            <option key={l} value={l} style={{ background: '#111' }}>{l}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                {label('Starter Code')}
                <textarea value={data.starterCode || ''} onChange={e => up('starterCode', e.target.value)}
                    placeholder={`function solution(input) {\n  // write your code here\n}`}
                    style={{ ...ta({ minHeight: '120px' }), fontFamily: 'monospace', fontSize: '13px' }}
                    onFocus={e => e.target.style.borderColor = C.purple}
                    onBlur={e => e.target.style.borderColor = C.border} />
            </div>
            <div>
                {label('Test Cases')}
                {tcs.map((tc, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <input value={tc.input} onChange={e => updTc(i, 'input', e.target.value)}
                            style={inp({})} placeholder="Input" />
                        <input value={tc.expectedOutput} onChange={e => updTc(i, 'expectedOutput', e.target.value)}
                            style={inp({})} placeholder="Expected Output" />
                        <button onClick={() => delTc(i)} style={{ ...btn('transparent', C.accent), padding: '7px 9px' }}><Trash2 size={12} /></button>
                    </div>
                ))}
                <button onClick={addTc} style={{ ...btn(C.purpleDim, C.purple), border: `1px dashed rgba(168,85,247,0.35)`, width: '100%', justifyContent: 'center', padding: '9px' }}>
                    <Plus size={13} /> Add Test Case
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════
   Lesson Content Panel (full editor)
════════════════════════════════════ */
function LessonContentPanel({ lesson, lessonIdx, moduleId, courseId, onSaveLesson }) {
    const [draft, setDraft] = useState(lesson);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const up = (k, v) => { setDraft(p => ({ ...p, [k]: v })); setDirty(true); };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}/modules/${moduleId}`, {
                method: 'PUT',
                headers: auth(),
                body: JSON.stringify({ title: undefined, order: undefined, updateLesson: { idx: lessonIdx, data: draft } }),
            });
            // We'll do an inline save via a special endpoint instead
            // For now: save the entire module with the updated lesson
            onSaveLesson(lessonIdx, draft);
            setDirty(false);
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const { color, Icon, label: typeLabel } = typeInfo(draft.type);

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginTop: '12px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: '99px', color, fontSize: '12px', fontWeight: 700 }}>
                    <Icon size={13} /> {typeLabel} Content
                </div>
                <span style={{ fontSize: '13px', color: C.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</span>
                <button onClick={save} disabled={saving || !dirty}
                    style={{ ...btn(dirty ? C.green : '#1a1a1a', dirty ? '#fff' : C.dim), border: `1px solid ${dirty ? 'transparent' : C.border}`, opacity: saving ? 0.6 : 1 }}>
                    {saving ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={13} />}
                    {saving ? 'Saving…' : dirty ? 'Save Content' : 'Saved'}
                </button>
            </div>

            {/* Content editor */}
            {draft.type === 'article' && (
                <ArticleEditor value={draft.content || ''} onChange={v => up('content', v)} />
            )}
            {draft.type === 'quiz' && (
                <QuizEditor questions={draft.questions || []} onChange={v => up('questions', v)} />
            )}
            {draft.type === 'assignment' && (
                <AssignmentEditor data={draft} onChange={v => setDraft(p => ({ ...p, ...v, type: p.type }))} />
            )}
            {draft.type === 'coding' && (
                <CodingEditor data={draft} onChange={v => setDraft(p => ({ ...p, ...v, type: p.type }))} />
            )}
        </div>
    );
}

/* ════════════════════════════════════
   Lesson Row (with content toggle)
════════════════════════════════════ */
function LessonRow({ lesson, idx, onUpdate, onDelete, onToggleContent, contentOpen, moduleId, courseId, onSaveLesson }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(lesson);
    const { Icon, color } = typeInfo(lesson.type);

    const commit = () => { onUpdate(idx, draft); setEditing(false); };
    const cancel = () => { setDraft(lesson); setEditing(false); };

    if (editing) return (
        <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px auto auto auto', gap: '8px', alignItems: 'center', padding: '10px 12px', background: '#1c1c1c', borderRadius: '8px' }}>
                <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                    style={inp({})} placeholder="Lesson title" autoFocus
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = C.border} />
                <input value={draft.duration} onChange={e => setDraft(p => ({ ...p, duration: e.target.value }))}
                    style={inp({})} placeholder="e.g. 15m" />
                <select value={draft.type} onChange={e => setDraft(p => ({ ...p, type: e.target.value }))}
                    style={inp({ padding: '9px 8px', cursor: 'pointer' })}>
                    {TYPES.map(t => <option key={t.value} value={t.value} style={{ background: '#111' }}>{t.label}</option>)}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.muted, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                    <input type="checkbox" checked={draft.free} onChange={e => setDraft(p => ({ ...p, free: e.target.checked }))} style={{ accentColor: C.green }} />
                    Free
                </label>
                <button onClick={commit} style={{ ...btn(C.green), padding: '8px 10px' }}><Check size={14} /></button>
                <button onClick={cancel} style={{ ...btn('#1a1a1a', C.muted), border: `1px solid ${C.border}`, padding: '8px 10px' }}><X size={14} /></button>
            </div>
        </div>
    );

    return (
        <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: C.raised, borderRadius: contentOpen ? '8px 8px 0 0' : '8px', border: `1px solid ${contentOpen ? color + '40' : C.borderS}`, transition: 'border-color 0.2s' }}>
                <GripVertical size={13} color={C.dim} style={{ flexShrink: 0 }} />
                <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} color={color} />
                </div>
                <span style={{ flex: 1, fontSize: '13px' }}>{lesson.title || <em style={{ color: C.dim }}>Untitled</em>}</span>
                {lesson.duration && <span style={{ fontSize: '11px', color: C.dim }}>{lesson.duration}</span>}
                {lesson.free && <span style={{ fontSize: '10px', fontWeight: 700, color: C.green, background: C.greenDim, padding: '2px 8px', borderRadius: '99px' }}>FREE</span>}
                <button onClick={() => onToggleContent(idx)} title="Edit content"
                    style={{ ...btn('transparent', contentOpen ? color : C.dim), padding: '5px 8px', fontSize: '11px' }}>
                    {contentOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    Content
                </button>
                <button onClick={() => setEditing(true)} style={{ ...btn('transparent', C.muted), padding: '6px 8px' }}><Pencil size={12} /></button>
                <button onClick={() => onDelete(idx)} style={{ ...btn('transparent', C.accent), padding: '6px 8px' }}><Trash2 size={12} /></button>
            </div>
            {contentOpen && (
                <LessonContentPanel lesson={lesson} lessonIdx={idx}
                    moduleId={moduleId} courseId={courseId} onSaveLesson={onSaveLesson} />
            )}
        </div>
    );
}

/* ════════════════════════════════════
   Module Card
════════════════════════════════════ */
function ModuleCard({ mod, courseId, onSaved, onDeleted }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(mod.title);
    const [lessons, setLessons] = useState(mod.lessons || []);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [openContent, setOpenContent] = useState({});

    const toggleContent = (i) => setOpenContent(p => ({ ...p, [i]: !p[i] }));

    const addLesson = () =>
        setLessons(p => [...p, { title: '', duration: '', type: 'article', free: false, content: '' }]);
    const updateLesson = (i, v) => setLessons(p => p.map((l, idx) => idx === i ? { ...l, ...v } : l));
    const deleteLesson = (i) => { setLessons(p => p.filter((_, idx) => idx !== i)); setOpenContent(p => { const n = { ...p }; delete n[i]; return n; }); };
    const saveLesson = (i, v) => setLessons(p => p.map((l, idx) => idx === i ? { ...l, ...v } : l));

    const save = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}/modules/${mod._id}`, {
                method: 'PUT', headers: auth(),
                body: JSON.stringify({ title: title.trim(), lessons, order: mod.order }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onSaved(data.module);
            setEditing(false);
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    /* Save content updates (called from LessonContentPanel) */
    const saveWithContent = async (idx, updatedLesson) => {
        const newLessons = lessons.map((l, i) => i === idx ? { ...l, ...updatedLesson } : l);
        setLessons(newLessons);
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}/modules/${mod._id}`, {
                method: 'PUT', headers: auth(),
                body: JSON.stringify({ title: mod.title, lessons: newLessons, order: mod.order }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onSaved(data.module);
        } catch (err) { alert('Failed to save: ' + err.message); }
    };

    const del = async () => {
        if (!window.confirm(`Delete module "${mod.title}"?`)) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}/modules/${mod._id}`, {
                method: 'DELETE', headers: auth(),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            onDeleted(mod._id);
        } catch (err) { alert(err.message); setDeleting(false); }
    };

    return (
        <div style={{ border: `1px solid ${open ? 'rgba(239,68,68,0.25)' : C.border}`, borderRadius: '12px', marginBottom: '10px', background: C.card, overflow: 'hidden', transition: 'border-color 0.2s' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => !editing && setOpen(p => !p)}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Layers size={13} color={C.accent} />
                </div>
                {editing ? (
                    <input value={title} onChange={e => setTitle(e.target.value)} onClick={e => e.stopPropagation()}
                        autoFocus style={{ ...inp({ flex: 1, padding: '7px 10px', fontSize: '14px', fontWeight: 700 }) }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e => e.target.style.borderColor = C.border} />
                ) : (
                    <span style={{ flex: 1, fontWeight: 700, fontSize: '14px' }}>{mod.title}</span>
                )}
                <span style={{ fontSize: '11px', color: C.dim, marginRight: '4px' }}>
                    {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                </span>
                {editing ? (
                    <>
                        <button onClick={e => { e.stopPropagation(); save(); }} disabled={saving}
                            style={{ ...btn(C.green), padding: '7px 12px' }}>
                            {saving ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Check size={13} />}
                            Save
                        </button>
                        <button onClick={e => { e.stopPropagation(); setEditing(false); setTitle(mod.title); setLessons(mod.lessons || []); }}
                            style={{ ...btn('#1a1a1a', C.muted), border: `1px solid ${C.border}`, padding: '7px 10px' }}>
                            <X size={13} />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={e => { e.stopPropagation(); setEditing(true); setOpen(true); }}
                            style={{ ...btn('transparent', C.muted), padding: '7px 9px' }}>
                            <Pencil size={13} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); del(); }} disabled={deleting}
                            style={{ ...btn('transparent', C.accent), padding: '7px 9px' }}>
                            {deleting ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Trash2 size={13} />}
                        </button>
                        {open ? <ChevronUp size={15} color={C.dim} /> : <ChevronDown size={15} color={C.dim} />}
                    </>
                )}
            </div>

            {/* Lesson body */}
            {(open || editing) && (
                <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.borderS}` }}>
                    <div style={{ paddingTop: '14px' }}>
                        {lessons.length === 0 && (
                            <p style={{ fontSize: '13px', color: C.dim, textAlign: 'center', padding: '20px 0' }}>
                                No lessons yet — add the first one below.
                            </p>
                        )}
                        {lessons.map((l, i) => (
                            <LessonRow key={i} lesson={l} idx={i}
                                onUpdate={updateLesson} onDelete={deleteLesson}
                                onToggleContent={toggleContent} contentOpen={!!openContent[i]}
                                moduleId={mod._id} courseId={courseId} onSaveLesson={saveWithContent} />
                        ))}
                        <button onClick={addLesson}
                            style={{ ...btn(C.blueDim, C.blue), border: `1px dashed rgba(59,130,246,0.35)`, width: '100%', justifyContent: 'center', padding: '9px', marginTop: '6px' }}>
                            <Plus size={13} /> Add Lesson
                        </button>
                        {(editing || lessons.some((_, i) => openContent[i])) && (
                            <button onClick={save} disabled={saving}
                                style={{ ...btn(C.accent), width: '100%', justifyContent: 'center', padding: '10px', marginTop: '8px' }}>
                                {saving ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={13} />}
                                Save Module
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════
   Main Page
════════════════════════════════════ */
export default function AdminCourseModules() {
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [selectedId, setSelectedId] = useState('');
    const [modules, setModules] = useState([]);
    const [modulesLoading, setModulesLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [addBusy, setAddBusy] = useState(false);

    useEffect(() => {
        fetch(`${API}/admin/courses`, { headers: auth() })
            .then(r => r.json()).then(d => setCourses(d.courses || []))
            .catch(console.error).finally(() => setCoursesLoading(false));
    }, []);

    const loadModules = useCallback(async (id) => {
        if (!id) { setModules([]); return; }
        setModulesLoading(true);
        try {
            const res = await fetch(`${API}/admin/courses/${id}/modules`, { headers: auth() });
            const data = await res.json();
            setModules(data.modules || []);
        } catch (err) { console.error(err); }
        finally { setModulesLoading(false); }
    }, []);

    useEffect(() => { loadModules(selectedId); }, [selectedId, loadModules]);

    const addModule = async () => {
        if (!newTitle.trim() || !selectedId) return;
        setAddBusy(true);
        try {
            const res = await fetch(`${API}/admin/courses/${selectedId}/modules`, {
                method: 'POST', headers: auth(),
                body: JSON.stringify({ title: newTitle.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setModules(p => [...p, data.module]);
            setNewTitle(''); setShowAdd(false);
        } catch (err) { alert(err.message); }
        finally { setAddBusy(false); }
    };

    const handleSaved = (updated) => setModules(p => p.map(m => m._id === updated._id ? updated : m));
    const handleDeleted = (id) => setModules(p => p.filter(m => m._id !== id));

    const selectedCourse = courses.find(c => c._id === selectedId);

    return (
        <div style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
                select option { background: #111; }
            `}</style>

            {/* Page header */}
            <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={18} color={C.accent} />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>Course Modules</h1>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: C.muted }}>
                    Select a course, then build its modules and lesson content (articles · quizzes · assignments · coding).
                </p>
            </div>

            {/* Course selector */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 22px', marginBottom: '24px', animation: 'fadeUp 0.4s ease 0.05s both' }}>
                <label style={{ fontSize: '12px', color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                    Select Course
                </label>
                {coursesLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '13px' }}>
                        <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Loading courses…
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                            style={{ ...inp({ padding: '11px 40px 11px 14px', fontSize: '14px', appearance: 'none', cursor: 'pointer' }) }}
                            onFocus={e => e.target.style.borderColor = C.accent}
                            onBlur={e => e.target.style.borderColor = C.border}>
                            <option value="">— Choose a course —</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}{c.status === 'draft' ? ' (draft)' : ''}</option>)}
                        </select>
                        <ChevronDown size={16} color={C.dim} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                )}
                {selectedCourse && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '14px', padding: '12px 14px', background: C.raised, borderRadius: '10px', border: `1px solid ${C.borderS}` }}>
                        {selectedCourse.image && <img src={selectedCourse.image} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 800, fontSize: '15px', margin: '0 0 3px' }}>{selectedCourse.title}</p>
                            <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>
                                {[selectedCourse.instructor, selectedCourse.category, selectedCourse.level].filter(Boolean).join(' · ')}&nbsp;·&nbsp;
                                <span style={{ color: C.accent }}>{modules.length} modules</span>
                            </p>
                        </div>
                        <div style={{ alignSelf: 'center' }}>
                            {TYPES.map(({ value, label: tl, Icon, color, dimBg }) => (
                                <span key={value} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color, background: dimBg, padding: '2px 8px', borderRadius: '99px', marginLeft: '4px' }}>
                                    <Icon size={10} /> {tl}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modules */}
            {selectedId && (
                <div style={{ animation: 'fadeUp 0.35s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                            Modules
                            {modules.length > 0 && <span style={{ fontSize: '12px', color: C.dim, fontWeight: 500, marginLeft: '8px' }}>{modules.length} total</span>}
                        </h2>
                        <button onClick={() => { setShowAdd(p => !p); setNewTitle(''); }}
                            style={{ ...btn(showAdd ? '#1a1a1a' : C.accentDim, showAdd ? C.muted : C.accent), border: `1px solid ${showAdd ? C.border : 'rgba(239,68,68,0.3)'}` }}>
                            {showAdd ? <X size={14} /> : <Plus size={14} />}
                            {showAdd ? 'Cancel' : 'Add Module'}
                        </button>
                    </div>

                    {showAdd && (
                        <div style={{ background: C.card, border: `1px solid rgba(239,68,68,0.25)`, borderRadius: '12px', padding: '16px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                placeholder="Module title, e.g. Introduction to HTML"
                                style={inp({ flex: 1 })} autoFocus
                                onFocus={e => e.target.style.borderColor = C.accent}
                                onBlur={e => e.target.style.borderColor = C.border}
                                onKeyDown={e => e.key === 'Enter' && addModule()} />
                            <button onClick={addModule} disabled={addBusy || !newTitle.trim()}
                                style={{ ...btn(C.accent), padding: '9px 18px', opacity: (!newTitle.trim() || addBusy) ? 0.5 : 1 }}>
                                {addBusy ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Check size={14} />}
                                Create
                            </button>
                        </div>
                    )}

                    {modulesLoading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: C.muted }}>
                            <Loader2 size={28} color={C.accent} style={{ animation: 'spin 0.7s linear infinite', display: 'block', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '13px' }}>Loading modules…</p>
                        </div>
                    ) : modules.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', background: C.card, borderRadius: '14px', border: `1px dashed ${C.border}` }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                <Layers size={24} color={C.accent} />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>No modules yet</p>
                            <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>Click <strong>Add Module</strong> to create the first one.</p>
                        </div>
                    ) : (
                        modules.map(mod => (
                            <ModuleCard key={mod._id} mod={mod} courseId={selectedId}
                                onSaved={handleSaved} onDeleted={handleDeleted} />
                        ))
                    )}
                </div>
            )}

            {!selectedId && !coursesLoading && (
                <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: C.accentDim, border: `1px solid rgba(239,68,68,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                        <BookOpen size={30} color={C.accent} />
                    </div>
                    <p style={{ fontWeight: 800, fontSize: '18px', margin: '0 0 8px' }}>No course selected</p>
                    <p style={{ fontSize: '14px', color: C.muted, margin: 0 }}>Choose a course from the dropdown above to manage its modules and lesson content.</p>
                </div>
            )}
        </div>
    );
}
