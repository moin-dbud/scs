const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    /* ── Basic ── */
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    contact: { type: String, default: '' },
    dob: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, default: 'STUDENT' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    /* ── Professional ── */
    designation: { type: String, default: '' },
    company: { type: String, default: '' },
    experience: { type: String, default: '' },  // e.g. "2 years"
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: { type: String, default: '' },
    institution: { type: String, default: '' },
    graduationYear: { type: String, default: '' },

    /* ── Enrolled Courses ── */
    enrolledCourses: [{
        courseId: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String, default: '' },
        enrolledAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        linkedDiscord: { type: Boolean, default: false },
        completedLessons: { type: [String], default: [] },   // stores lesson ObjectId strings
    }],
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
