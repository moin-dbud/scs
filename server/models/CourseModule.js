const mongoose = require('mongoose');

/* ── Quiz question sub-schema ── */
const quizQuestionSchema = new mongoose.Schema({
    question: { type: String, default: '' },
    options: { type: [String], default: ['', '', '', ''] },
    correct: { type: Number, default: 0 },   // index into options[]
    explanation: { type: String, default: '' },
}, { _id: true });

/* ── Lesson sub-schema ── */
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    duration: { type: String, default: '' },
    type: { type: String, enum: ['article', 'quiz', 'assignment', 'coding'], default: 'article' },
    free: { type: Boolean, default: false },

    /* ── Article content (markdown / rich text) ── */
    content: { type: String, default: '' },

    /* ── Quiz specific ── */
    questions: { type: [quizQuestionSchema], default: [] },

    /* ── Assignment specific ── */
    assignmentBrief: { type: String, default: '' },
    assignmentRequirements: { type: [String], default: [] },
    assignmentDeadlineDays: { type: Number, default: 7 },

    /* ── Coding problem ── */
    problemStatement: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    testCases: { type: [{ input: String, expectedOutput: String }], default: [] },
}, { _id: true });

/* ── Module schema ── */
const moduleSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    order: { type: Number, default: 0 },
    title: { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('CourseModule', moduleSchema);
