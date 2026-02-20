require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { router: authRouter } = require('./routes/auth');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ── */
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5200'],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

/* ── Uploads folder ── */
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
app.use('/uploads', express.static(UPLOADS_DIR));

/* ── Multer config ── */
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, UPLOADS_DIR),
    filename: (_, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `course-${Date.now()}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_, file, cb) => {
        if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only images are allowed'));
    },
});

/* ── Image upload endpoint (admin only — no strict JWT here for simplicity) ── */
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ url });
});

/* ── Routes ── */
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/', (_, res) => res.json({ status: 'LevelUp.dev API running ✅' }));

/* ── MongoDB connect & start ── */
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected');

        /* Seed global settings defaults (runs safely every boot) */
        const Setting = require('./models/Setting');
        await Setting.findOneAndUpdate(
            { key: 'global', registrationOpen: { $exists: false } },
            { $set: { registrationOpen: true, maintenanceMode: false } },
            { upsert: false }
        );
        /* If the doc was created with registrationOpen=false incorrectly, fix it */
        await Setting.updateOne(
            {
                key: 'global', registrationOpen: false, maintenanceMode: false,
                updatedAt: { $lt: new Date(Date.now() - 60_000) }
            },   // only if not recently changed
            { $set: { registrationOpen: true } }
        );

        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
