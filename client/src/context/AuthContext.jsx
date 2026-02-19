import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const API = 'http://localhost:5000/api/auth';

/* ── tiny fetch helper ── */
const apiFetch = async (path, method = 'GET', body = null) => {
    const token = localStorage.getItem('token');
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    };
    const res = await fetch(`${API}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* Restore session */
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        apiFetch('/me')
            .then(d => { if (d?.user) setUser(d.user); })
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
    }, []);

    /* ── Register ── */
    const register = async (fields) => {
        const data = await apiFetch('/register', 'POST', fields);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    /* ── Login ── */
    const login = async (fields) => {
        const data = await apiFetch('/login', 'POST', fields);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    /* ── Update Basic Profile ── */
    const updateBasicProfile = async (fields) => {
        const data = await apiFetch('/profile/basic', 'PUT', fields);
        setUser(data.user);
        return data.user;
    };

    /* ── Update Professional Profile ── */
    const updateProfessionalProfile = async (fields) => {
        const data = await apiFetch('/profile/professional', 'PUT', fields);
        setUser(data.user);
        return data.user;
    };

    /* ── Projects ── */
    const getProjects = () => apiFetch('/projects');
    const submitProject = (fields) => apiFetch('/projects', 'POST', fields);
    const deleteProject = (id) => apiFetch(`/projects/${id}`, 'DELETE');

    /* ── Enrolled Courses ── */
    const getEnrolledCourses = () => apiFetch('/enrolled');
    const enrollCourse = (courseId, title, image) =>
        apiFetch('/enroll', 'POST', { courseId, title, image });

    /* ── Logout ── */
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user, loading,
            register, login, logout,
            updateBasicProfile, updateProfessionalProfile,
            getProjects, submitProject, deleteProject,
            getEnrolledCourses, enrollCourse,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
