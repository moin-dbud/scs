const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
