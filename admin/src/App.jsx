import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { PlatformProvider } from './context/PlatformStore';
import AdminLayout from './components/AdminLayout';
import Toast from './components/Toast';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminSettings from './pages/AdminSettings';
import AdminCourseModules from './pages/AdminCourseModules';

/* ── Full-page loader while session resolves ── */
function Loader() {
  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', animation: 'spin 0.75s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>
      <p style={{ color: '#555', fontSize: '13px' }}>Verifying access…</p>
    </div>
  );
}

/* ── Route guard: only authenticated admins get through ── */
function PrivateAdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <Loader />;
  if (!admin) return <Navigate to="/login" replace />;
  return (
    <AdminLayout>
      {children}
      <Toast />
    </AdminLayout>
  );
}

/* ── Guest guard: already logged-in admins go to dashboard ── */
function GuestAdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <Loader />;
  if (admin) return <Navigate to="/" replace />;
  return children;
}

function AdminApp() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<GuestAdminRoute><AdminLogin /></GuestAdminRoute>} />

      {/* Protected admin routes */}
      <Route path="/" element={<PrivateAdminRoute><AdminDashboard /></PrivateAdminRoute>} />
      <Route path="/users" element={<PrivateAdminRoute><AdminUsers /></PrivateAdminRoute>} />
      <Route path="/courses" element={<PrivateAdminRoute><AdminCourses /></PrivateAdminRoute>} />
      <Route path="/enrollments" element={<PrivateAdminRoute><AdminEnrollments /></PrivateAdminRoute>} />
      <Route path="/announcements" element={<PrivateAdminRoute><AdminAnnouncements /></PrivateAdminRoute>} />
      <Route path="/course-modules" element={<PrivateAdminRoute><AdminCourseModules /></PrivateAdminRoute>} />
      <Route path="/settings" element={<PrivateAdminRoute><AdminSettings /></PrivateAdminRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <PlatformProvider>
        <AdminApp />
      </PlatformProvider>
    </AdminAuthProvider>
  );
}
