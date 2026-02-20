import React from 'react';
import { usePlatform } from '../context/PlatformStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const COLORS = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' };

export default function Toast() {
    const { toast } = usePlatform();
    if (!toast) return null;

    const Icon = ICONS[toast.type] || Info;
    const color = COLORS[toast.type] || '#3b82f6';

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#1a1a1a', border: `1px solid ${color}44`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '10px', padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.25s ease',
            maxWidth: '340px', fontSize: '13px', fontFamily: 'inherit',
        }}>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <Icon size={15} color={color} style={{ flexShrink: 0 }} />
            <span style={{ color: '#e4e4e7', flex: 1 }}>{toast.msg}</span>
        </div>
    );
}
