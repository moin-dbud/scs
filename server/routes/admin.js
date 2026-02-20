const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');
const Announcement = require('../models/Announcement');
const Setting = require('../models/Setting');
const CourseModule = require('../models/CourseModule');

const router = express.Router();

/* ════════════════════════════════════════
   ADMIN JWT middleware
════════════════════════════════════════ */
const adminMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/* ════════════════════════════════════════
   PUBLIC — GET /api/admin/courses/public
   No auth required — used by the client-side Courses page
════════════════════════════════════════ */
router.get('/courses/public', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'live' }).sort({ createdAt: -1 });
        res.json({ courses });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/admin/courses/public/:id — single course + modules + enrolled count */
router.get('/courses/public/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const modules = await CourseModule
            .find({ courseId: req.params.id })
            .sort({ order: 1, createdAt: 1 });

        const enrolledCount = await User.countDocuments({
            'enrolledCourses.courseId': req.params.id,
        });

        res.json({ course, modules, enrolledCount });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/admin/courses/public/:id/leaderboard — top students (no auth) */
router.get('/courses/public/:id/leaderboard', async (req, res) => {
    try {
        const courseId = req.params.id;
        const users = await User.find(
            { 'enrolledCourses.courseId': courseId },
            { firstName: 1, lastName: 1, 'enrolledCourses.$': 1 }
        ).limit(50);

        const board = users
            .map(u => {
                const enroll = u.enrolledCourses.find(e => String(e.courseId) === String(courseId));
                return {
                    _id: u._id,
                    name: `${u.firstName} ${u.lastName}`.trim(),
                    firstName: u.firstName,
                    lastName: u.lastName,
                    progress: enroll?.progress || 0,
                    completedLessons: enroll?.completedLessons?.length || 0,
                };
            })
            .sort((a, b) => b.progress - a.progress || b.completedLessons - a.completedLessons)
            .slice(0, 10);

        res.json({ leaderboard: board });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ════════════════════════════════════════
   USERS
════════════════════════════════════════ */

/* GET /api/admin/users */
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        const result = users.map(u => ({
            _id: u._id,
            name: `${u.firstName} ${u.lastName}`.trim(),
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role || 'STUDENT',
            status: u.status || 'active',
            enrolledCourses: u.enrolledCourses || [],
            enrolledCount: (u.enrolledCourses || []).length,
            createdAt: u.createdAt,
        }));
        res.json({ users: result });
    } catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* PATCH /api/admin/users/:id/status */
router.patch('/users/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/admin/stats */
router.get('/stats', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).select('status enrolledCourses createdAt firstName lastName email role');
        const totalUsers = users.length;
        const activeUsers = users.filter(u => (u.status || 'active') === 'active').length;
        const inactiveUsers = totalUsers - activeUsers;
        const totalEnrollments = users.reduce((s, u) => s + (u.enrolledCourses?.length || 0), 0);
        const totalCourses = await Course.countDocuments();
        const recentUsers = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            totalEnrollments,
            totalCourses,
            recentUsers: recentUsers.map(u => ({
                _id: u._id,
                name: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
                role: u.role || 'STUDENT',
                status: u.status || 'active',
                enrolledCount: (u.enrolledCourses || []).length,
                createdAt: u.createdAt,
            })),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ════════════════════════════════════════
   COURSES — admin CRUD
════════════════════════════════════════ */

/* GET /api/admin/courses */
router.get('/courses', adminMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ createdAt: -1 });
        res.json({ courses });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/admin/courses */
router.post('/courses', adminMiddleware, async (req, res) => {
    try {
        const {
            title, subtitle, instructor, category,
            duration, modules, price, originalPrice,
            image, tags, features, level, badge, badgeColor, status,
        } = req.body;

        if (!title?.trim())
            return res.status(400).json({ message: 'Course title is required' });

        const tagsArr = Array.isArray(tags) ? tags : (tags || '').split(',').map(s => s.trim()).filter(Boolean);
        const featuresArr = Array.isArray(features) ? features : (features || '').split(',').map(s => s.trim()).filter(Boolean);

        const course = await Course.create({
            title: title.trim(), subtitle, instructor, category,
            duration, modules: Number(modules) || 0, price, originalPrice,
            image, tags: tagsArr, features: featuresArr, level,
            badge, badgeColor, status: status || 'draft',
        });

        /* ── Auto-announcement for new course ── */
        try {
            const parts = [];
            if (category) parts.push(category);
            if (instructor) parts.push(`by ${instructor}`);
            if (price != null) parts.push(`₹${Number(price).toLocaleString('en-IN')}`);

            const announcementTitle = `🎓 New Course: ${course.title}`;
            const announcementDesc = parts.length
                ? parts.join(' · ')
                : (subtitle || 'A brand-new course has just been added to the platform!');

            await Announcement.create({
                title: announcementTitle,
                description: announcementDesc,
            });
        } catch (annErr) {
            // Non-fatal — log but don't fail the course creation
            console.warn('Auto-announcement failed:', annErr.message);
        }

        res.status(201).json({ course });
    } catch (err) {
        console.error('Create course error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* PUT /api/admin/courses/:id */
router.put('/courses/:id', adminMiddleware, async (req, res) => {
    try {
        const {
            title, subtitle, instructor, category,
            duration, modules, price, originalPrice,
            image, tags, features, level, badge, badgeColor, status,
        } = req.body;

        const tagsArr = Array.isArray(tags) ? tags : (tags || '').split(',').map(s => s.trim()).filter(Boolean);
        const featuresArr = Array.isArray(features) ? features : (features || '').split(',').map(s => s.trim()).filter(Boolean);

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { title, subtitle, instructor, category, duration, modules: Number(modules) || 0, price, originalPrice, image, tags: tagsArr, features: featuresArr, level, badge, badgeColor, status },
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ course });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* PATCH /api/admin/courses/:id/status */
router.patch('/courses/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ course });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* DELETE /api/admin/courses/:id */
router.delete('/courses/:id', adminMiddleware, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        /* Remove this course from all users' enrolledCourses */
        await User.updateMany(
            { 'enrolledCourses.courseId': req.params.id },
            { $pull: { enrolledCourses: { courseId: req.params.id } } }
        );

        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ════════════════════════════════════════
   COURSE MODULES
════════════════════════════════════════ */

/* GET /api/admin/courses/:id/modules  — list all modules for a course */
router.get('/courses/:id/modules', adminMiddleware, async (req, res) => {
    try {
        const modules = await CourseModule
            .find({ courseId: req.params.id })
            .sort({ order: 1, createdAt: 1 });
        res.json({ modules });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/admin/courses/:id/modules  — create a new module */
router.post('/courses/:id/modules', adminMiddleware, async (req, res) => {
    try {
        const { title, order, lessons } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: 'Module title is required' });

        const count = await CourseModule.countDocuments({ courseId: req.params.id });
        const module = await CourseModule.create({
            courseId: req.params.id,
            title: title.trim(),
            order: order ?? count,          // append by default
            lessons: lessons || [],
        });
        /* Sync the modules count on the Course doc */
        const total = count + 1;
        await Course.findByIdAndUpdate(req.params.id, { modules: total });
        res.status(201).json({ module });
    } catch (err) {
        console.error('Create module error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* PUT /api/admin/courses/:courseId/modules/:moduleId  — update module + lessons */
router.put('/courses/:courseId/modules/:moduleId', adminMiddleware, async (req, res) => {
    try {
        const { title, order, lessons } = req.body;
        const mod = await CourseModule.findOneAndUpdate(
            { _id: req.params.moduleId, courseId: req.params.courseId },
            { title: title?.trim(), order, lessons: lessons || [] },
            { new: true, runValidators: true }
        );
        if (!mod) return res.status(404).json({ message: 'Module not found' });
        res.json({ module: mod });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* DELETE /api/admin/courses/:courseId/modules/:moduleId */
router.delete('/courses/:courseId/modules/:moduleId', adminMiddleware, async (req, res) => {
    try {
        const mod = await CourseModule.findOneAndDelete({
            _id: req.params.moduleId, courseId: req.params.courseId,
        });
        if (!mod) return res.status(404).json({ message: 'Module not found' });
        /* Update module count on Course */
        const remaining = await CourseModule.countDocuments({ courseId: req.params.courseId });
        await Course.findByIdAndUpdate(req.params.courseId, { modules: remaining });
        res.json({ message: 'Module deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ════════════════════════════════════════
   ANNOUNCEMENTS
════════════════════════════════════════ */

/* GET /api/admin/announcements/public — no auth, fetched by user dashboards */
router.get('/announcements/public', async (req, res) => {
    try {
        const list = await Announcement.find({}).sort({ createdAt: -1 });
        res.json({ announcements: list });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/admin/announcements — admin list */
router.get('/announcements', adminMiddleware, async (req, res) => {
    try {
        const list = await Announcement.find({}).sort({ createdAt: -1 });
        res.json({ announcements: list });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/admin/announcements */
router.post('/announcements', adminMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
        const a = await Announcement.create({ title: title.trim(), description: (description || '').trim() });
        res.status(201).json({ announcement: a });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* PATCH /api/admin/announcements/:id */
router.patch('/announcements/:id', adminMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const a = await Announcement.findByIdAndUpdate(
            req.params.id,
            { title: title?.trim(), description: (description || '').trim() },
            { new: true, runValidators: true }
        );
        if (!a) return res.status(404).json({ message: 'Announcement not found' });
        res.json({ announcement: a });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* DELETE /api/admin/announcements/:id */
router.delete('/announcements/:id', adminMiddleware, async (req, res) => {
    try {
        const a = await Announcement.findByIdAndDelete(req.params.id);
        if (!a) return res.status(404).json({ message: 'Announcement not found' });
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


/* ════════════════════════════════════════
   SETTINGS (singleton doc - key = 'global')
════════════════════════════════════════ */

/* Helper: get-or-create singleton; seeds missing fields to their defaults */
const getSetting = async () => {
    const doc = await Setting.findOneAndUpdate(
        { key: 'global' },
        {
            $setOnInsert: { key: 'global' },
            /* Seed defaults for fields that may be missing on old docs */
            $set: {},
        },
        { upsert: true, new: true }
    );
    /* Back-fill any fields that are still undefined (old doc pre-dating the field) */
    const patch = {};
    if (doc.registrationOpen === undefined || doc.registrationOpen === null) patch.registrationOpen = true;
    if (doc.maintenanceMode === undefined || doc.maintenanceMode === null) patch.maintenanceMode = false;
    if (Object.keys(patch).length) {
        return Setting.findOneAndUpdate({ key: 'global' }, { $set: patch }, { new: true });
    }
    return doc;
};

/* GET /api/admin/settings/public — no auth, polled by client */
router.get('/settings/public', async (req, res) => {
    try {
        const s = await getSetting();
        res.json({ maintenanceMode: s.maintenanceMode, registrationOpen: s.registrationOpen });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/admin/settings — admin, full settings */
router.get('/settings', adminMiddleware, async (req, res) => {
    try {
        const s = await getSetting();
        res.json({ settings: s });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* PATCH /api/admin/settings — admin, partial update */
router.patch('/settings', adminMiddleware, async (req, res) => {
    try {
        const allowed = ['maintenanceMode', 'registrationOpen', 'platformName', 'notifyNewUser', 'notifyEnrollment', 'notifyProject'];
        const update = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
        const s = await Setting.findOneAndUpdate(
            { key: 'global' },
            { $set: update },
            { upsert: true, new: true }
        );
        res.json({ settings: s });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
