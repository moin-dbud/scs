import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page Imports
import Home from '../pages/Home';
import About from '../pages/About';
import Blogs from '../pages/Blogs';
import Dashboard from '../pages/Dashboard';
import Course from '../pages/Course';
import Task from '../pages/Task';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Courses from '../pages/Courses';
import NotFound from '../pages/NotFound';

/**
 * AppRoutes Component
 * 
 * Centralized routing configuration for the entire application.
 * All route definitions are maintained here for easy management and scalability.
 * 
 * Route Structure:
 * - / - Home page
 * - /about - About page
 * - /blogs - Blogs listing
 * - /dashboard - User dashboard
 * - /course/:id - Individual course page (dynamic)
 * - /task/:id - Individual task page (dynamic)
 * - /profile - User profile
 * - /login - Login page
 * - /register - Registration page
 * - * - 404 Not Found (catch-all)
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blogs" element={<Blogs />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />

            {/* Dynamic Routes */}
            <Route path="/course/:id" element={<Course />} />
            <Route path="/task/:id" element={<Task />} />

            {/* 404 Fallback - Must be last */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
