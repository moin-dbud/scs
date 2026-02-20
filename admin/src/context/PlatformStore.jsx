import React, {
    createContext, useContext, useState,
    useEffect, useCallback, useRef,
} from 'react';

const API = 'http://localhost:5000/api';

const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {

    /* ── Users (real backend) ── */
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');

    /* ── Stats (real backend) ── */
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    /* ── Courses (real backend) ── */
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    /* ── Announcements (local mock) ── */
    const [announcements, setAnnouncements] = useState([]);

    /* ── Settings (local state) ── */
    const [settings, setSettings] = useState({
        platformName: 'LevelUp.dev',
        maintenanceMode: false,
        registrationOpen: true,
    });

    /* ── Toast ── */
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const showToast = useCallback((msg, type = 'success') => {
        clearTimeout(toastTimer.current);
        setToast({ msg, type });
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    }, []);

    /* ════════════════════════════════
       Token helper
    ════════════════════════════════ */
    const getToken = () => sessionStorage.getItem('adminToken') || '';

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    });

    /* ════════════════════════════════
       FETCH — users
    ════════════════════════════════ */
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError('');
        try {
            const res = await fetch(`${API}/admin/users`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load users');
            setUsers(data.users);
        } catch (err) {
            setUsersError(err.message);
            showToast(err.message, 'error');
        } finally {
            setUsersLoading(false);
        }
    }, [showToast]);

    /* ════════════════════════════════
       FETCH — stats
    ════════════════════════════════ */
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setStats(data);
        } catch (err) {
            console.error('Stats fetch error:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    /* ════════════════════════════════
       FETCH — courses from backend
    ════════════════════════════════ */
    const fetchCourses = useCallback(async () => {
        setCoursesLoading(true);
        try {
            const res = await fetch(`${API}/admin/courses`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load courses');
            /* Normalise _id → id for component compatibility */
            setCourses(data.courses.map(c => ({ ...c, id: c._id })));
        } catch (err) {
            console.error('Courses fetch error:', err);
        } finally {
            setCoursesLoading(false);
        }
    }, []);

    /* ════════════════════════════════
       FETCH — announcements from backend
    ════════════════════════════════ */
    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/announcements`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setAnnouncements(data.announcements.map(a => ({ ...a, id: a._id })));
        } catch (err) {
            console.error('Announcements fetch error:', err);
        }
    }, []);

    /* ════════════════════════════════
       FETCH — settings from backend
    ════════════════════════════════ */
    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API}/admin/settings`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSettings({
                platformName: data.settings.platformName,
                maintenanceMode: data.settings.maintenanceMode,
                registrationOpen: data.settings.registrationOpen,
            });
        } catch (err) {
            console.error('Settings fetch error:', err);
        }
    }, []);

    /* Load everything on mount */
    useEffect(() => {
        fetchUsers();
        fetchStats();
        fetchCourses();
        fetchAnnouncements();
        fetchSettings();
    }, [fetchUsers, fetchStats, fetchCourses, fetchAnnouncements, fetchSettings]);

    /* ════════════════════════════════
       USER ACTIONS
    ════════════════════════════════ */
    const toggleUserStatus = useCallback(async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        /* Optimistic */
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        setStats(prev => prev ? {
            ...prev,
            activeUsers: newStatus === 'active' ? prev.activeUsers + 1 : prev.activeUsers - 1,
            inactiveUsers: newStatus === 'inactive' ? prev.inactiveUsers + 1 : prev.inactiveUsers - 1,
        } : prev);
        try {
            const res = await fetch(`${API}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Status update failed');
            showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        } catch (err) {
            /* Roll back */
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: currentStatus } : u));
            showToast(err.message, 'error');
        }
    }, [showToast]);

    const sendEmail = useCallback((user) => {
        const subject = encodeURIComponent('LevelUp.dev — Message from Admin');
        const body = encodeURIComponent(`Hi ${user.name},\n\n`);
        window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_blank');
        showToast(`Opening email to ${user.name}`);
    }, [showToast]);

    /* ════════════════════════════════
       COURSE ACTIONS — persist to backend
    ════════════════════════════════ */
    const createCourse = useCallback(async (courseData) => {
        try {
            const res = await fetch(`${API}/admin/courses`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(courseData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create course');
            const newCourse = { ...data.course, id: data.course._id };
            setCourses(prev => [newCourse, ...prev]);
            setStats(prev => prev ? { ...prev, totalCourses: (prev.totalCourses || 0) + 1 } : prev);
            showToast(`Course "${newCourse.title}" created`);
            return newCourse;
        } catch (err) {
            showToast(err.message, 'error');
        }
    }, [showToast]);

    const deleteCourse = useCallback(async (courseId) => {
        /* Optimistic */
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setStats(prev => prev ? { ...prev, totalCourses: Math.max(0, (prev.totalCourses || 0) - 1) } : prev);
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Delete failed');
            showToast('Course deleted', 'info');
        } catch (err) {
            showToast(err.message, 'error');
            fetchCourses(); /* Re-sync on failure */
        }
    }, [showToast, fetchCourses]);

    const toggleCourseStatus = useCallback(async (courseId, currentStatus) => {
        const newStatus = currentStatus === 'live' ? 'draft' : 'live';
        /* Optimistic */
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Status update failed');
            showToast(`Course ${newStatus === 'live' ? 'published' : 'unpublished'}`);
        } catch (err) {
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: currentStatus } : c));
            showToast(err.message, 'error');
        }
    }, [showToast]);


    /* ════════════════════════════════
       ANNOUNCEMENT ACTIONS — real backend
    ════════════════════════════════ */
    const addAnnouncement = useCallback(async (formData) => {
        try {
            const res = await fetch(`${API}/admin/announcements`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to publish');
            const ann = { ...data.announcement, id: data.announcement._id };
            setAnnouncements(prev => [ann, ...prev]);
            showToast(`Announcement "${ann.title}" published`);
            return ann;
        } catch (err) {
            showToast(err.message, 'error');
        }
    }, [showToast]);

    const editAnnouncement = useCallback(async (id, formData) => {
        try {
            const res = await fetch(`${API}/admin/announcements/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');
            const updated = { ...data.announcement, id: data.announcement._id };
            setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
            showToast('Announcement updated');
        } catch (err) {
            showToast(err.message, 'error');
        }
    }, [showToast]);

    const deleteAnnouncement = useCallback(async (id) => {
        /* Optimistic */
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        try {
            const res = await fetch(`${API}/admin/announcements/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Delete failed');
            showToast('Announcement deleted', 'info');
        } catch (err) {
            showToast(err.message, 'error');
            fetchAnnouncements(); /* Re-sync on failure */
        }
    }, [showToast, fetchAnnouncements]);


    /* ════════════════════════════════
       SETTINGS ACTIONS — real backend
    ════════════════════════════════ */
    const updateSettings = useCallback(async (patch) => {
        /* Optimistic local update */
        setSettings(prev => ({ ...prev, ...patch }));
        try {
            const res = await fetch(`${API}/admin/settings`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(patch),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save settings');
            /* Sync server response */
            setSettings({
                platformName: data.settings.platformName,
                maintenanceMode: data.settings.maintenanceMode,
                registrationOpen: data.settings.registrationOpen,
            });
            showToast('Settings saved');
        } catch (err) {
            showToast(err.message, 'error');
            fetchSettings(); /* Roll back to server state on failure */
        }
    }, [showToast, fetchSettings]);

    /* ════════════════════════════════
       DERIVED values
    ════════════════════════════════ */
    const totalEnrollments = users.reduce((s, u) => s + (u.enrolledCount || 0), 0);
    const activeCoursesCount = courses.filter(c => c.status === 'live').length;

    return (
        <PlatformContext.Provider value={{
            /* Users */
            users, usersLoading, usersError, fetchUsers,
            toggleUserStatus, sendEmail,

            /* Stats */
            stats, statsLoading, fetchStats,
            totalEnrollments, activeCoursesCount,

            /* Courses (now real backend) */
            courses, coursesLoading, fetchCourses,
            createCourse, deleteCourse, toggleCourseStatus,

            /* Announcements */
            announcements, addAnnouncement, editAnnouncement, deleteAnnouncement, fetchAnnouncements,

            /* Settings */
            settings, updateSettings,

            /* Toast */
            toast, showToast,
        }}>
            {children}
        </PlatformContext.Provider>
    );
}

export const usePlatform = () => useContext(PlatformContext);
