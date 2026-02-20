const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    instructor: { type: String, default: '' },
    category: { type: String, default: 'Other' },
    duration: { type: String, default: '' },
    modules: { type: Number, default: 0 },
    price: { type: String, default: '' },
    originalPrice: { type: String, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },
    level: { type: String, default: '' },
    badge: { type: String, default: '' },
    badgeColor: { type: String, default: '#3b82f6' },
    status: { type: String, enum: ['live', 'draft'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
