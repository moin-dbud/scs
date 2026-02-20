const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: { type: String, default: 'global', unique: true },
    maintenanceMode: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },
    platformName: { type: String, default: 'LevelUp.dev' },
    notifyNewUser: { type: Boolean, default: true },
    notifyEnrollment: { type: Boolean, default: true },
    notifyProject: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
