const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const CourseModule = require('../models/CourseModule');
const { sendMail } = require('../utils/email');
const { welcomeTemplate, enrollmentTemplate, submissionTemplate } = require('../utils/emailTemplates');

const router = express.Router();

/* ── JWT helpers ── */
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const authMiddleware = (req, res, next) => {
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

/* ═══════════════════════════════════════
   AUTH
═══════════════════════════════════════ */

/* POST /api/auth/register */
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });

        if (await User.findOne({ email }))
            return res.status(409).json({ message: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ firstName, lastName, email, password: hashed });
        const token = signToken(user._id);

        // Send Welcome Email
        sendMail(
            email,
            'Welcome to LevelUp.dev! 🚀',
            welcomeTemplate(firstName),
            'notifyNewUser'
        );

        res.status(201).json({ token, user: sanitize(user) });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Invalid email or password' });

        res.json({ token: signToken(user._id), user: sanitize(user) });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/auth/me */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* PUT /api/auth/profile/basic */
router.put('/profile/basic', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, contact, dob, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { firstName, lastName, contact, dob, bio },
            { new: true, runValidators: true }
        ).select('-password');
        res.json({ user });
    } catch (err) {
        console.error('Profile basic update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* PUT /api/auth/profile/professional */
router.put('/profile/professional', authMiddleware, async (req, res) => {
    try {
        const { designation, company, experience, linkedin, github, website,
            skills, education, institution, graduationYear } = req.body;

        // Parse skills if sent as comma-separated string
        const skillsArray = Array.isArray(skills)
            ? skills
            : (skills || '').split(',').map(s => s.trim()).filter(Boolean);

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                designation, company, experience, linkedin, github, website,
                skills: skillsArray, education, institution, graduationYear
            },
            { new: true, runValidators: true }
        ).select('-password');
        res.json({ user });
    } catch (err) {
        console.error('Profile professional update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ═══════════════════════════════════════
   ENROLLED COURSES
═══════════════════════════════════════ */

/* GET /api/auth/enrolled — list user's enrolled courses */
router.get('/enrolled', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('enrolledCourses');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ enrolledCourses: user.enrolledCourses });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/auth/enroll — enroll in a course */
router.post('/enroll', authMiddleware, async (req, res) => {
    try {
        const { courseId, title, image } = req.body;
        if (!courseId || !title) return res.status(400).json({ message: 'courseId and title are required' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent duplicate enrollment
        const alreadyEnrolled = user.enrolledCourses.some(c => c.courseId === courseId);
        if (alreadyEnrolled) return res.status(409).json({ message: 'Already enrolled in this course' });

        user.enrolledCourses.push({ courseId, title, image, enrolledAt: new Date(), progress: 0 });
        await user.save();

        // Send Enrollment Email
        sendMail(
            user.email,
            `Enrollment Confirmed: ${title} ✅`,
            enrollmentTemplate(title),
            'notifyEnrollment'
        );

        res.status(201).json({ enrolledCourses: user.enrolledCourses });
    } catch (err) {
        console.error('Enroll error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* GET /api/auth/lesson-progress/:courseId — get completed lesson IDs for user */
router.get('/lesson-progress/:courseId', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const user = await User.findById(req.userId).select('enrolledCourses');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const enroll = user.enrolledCourses.find(
            e => String(e.courseId) === String(courseId)
        );
        if (!enroll) return res.json({ completedLessons: [], progress: 0 });

        /* Gather every lesson _id that currently exists for this course */
        const modules = await CourseModule.find({ courseId }).select('lessons._id');
        const validIds = new Set(
            modules.flatMap(m => m.lessons.map(l => String(l._id)))
        );
        const totalLessons = validIds.size;

        /* Prune stale lesson IDs that no longer exist */
        const before = enroll.completedLessons.length;
        enroll.completedLessons = enroll.completedLessons.filter(id => validIds.has(String(id)));

        /* Recalculate progress */
        const newProgress = totalLessons > 0
            ? Math.round((enroll.completedLessons.length / totalLessons) * 100)
            : 0;

        /* If anything changed, persist the fix */
        if (enroll.completedLessons.length !== before || enroll.progress !== newProgress) {
            enroll.progress = newProgress;
            await user.save();
        }

        res.json({
            completedLessons: enroll.completedLessons,
            progress: enroll.progress,
        });
    } catch (err) {
        console.error('lesson-progress error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/auth/complete-lesson — mark a lesson done & recalculate progress */
router.post('/complete-lesson', authMiddleware, async (req, res) => {
    try {
        const { courseId, lessonId, totalLessons } = req.body;
        if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId required' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const enroll = user.enrolledCourses.find(
            e => String(e.courseId) === String(courseId)
        );
        if (!enroll) return res.status(404).json({ message: 'Not enrolled in this course' });

        /* idempotent — don't double-add */
        if (!enroll.completedLessons.includes(String(lessonId))) {
            enroll.completedLessons.push(String(lessonId));
        }

        /* recalculate progress % */
        const total = Number(totalLessons) || 1;
        enroll.progress = Math.round((enroll.completedLessons.length / total) * 100);

        await user.save();
        res.json({
            completedLessons: enroll.completedLessons,
            progress: enroll.progress,
        });
    } catch (err) {
        console.error('complete-lesson error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ═══════════════════════════════════════
   PROJECTS
═══════════════════════════════════════ */


/* GET /api/auth/projects  — list user's projects */
router.get('/projects', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ projects });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* POST /api/auth/projects  — submit new project */
router.post('/projects', authMiddleware, async (req, res) => {
    try {
        const { title, description, techStack, githubUrl, liveUrl } = req.body;
        if (!title) return res.status(400).json({ message: 'Project title is required' });

        const techArray = Array.isArray(techStack)
            ? techStack
            : (techStack || '').split(',').map(s => s.trim()).filter(Boolean);

        const project = await Project.create({
            userId: req.userId, title, description, techStack: techArray, githubUrl, liveUrl,
        });

        // Send Project Submission Email
        const user = await User.findById(req.userId);
        if (user) {
            sendMail(
                user.email,
                `Project Submitted: ${title} 📬`,
                submissionTemplate(title),
                'notifyProject'
            );
        }

        res.status(201).json({ project });
    } catch (err) {
        console.error('Project create error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* DELETE /api/auth/projects/:id */
router.delete('/projects/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        await project.deleteOne();
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ── helper ── */
function sanitize(user) {
    const { password, ...rest } = user.toObject ? user.toObject() : user;
    return rest;
}

module.exports = { router, authMiddleware };
