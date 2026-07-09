const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { protect } = require('./middleware/authMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ── Security Headers ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''].filter(Boolean),
    },
  },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));

// ── CORS — restrict to frontend origin ──────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsing with size limit ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Global rate limiter ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ── Stricter auth rate limiter (applied to auth routes below) ───────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// ── Protected static files — receipts require authentication ────────
const path = require('path');
app.use('/uploads', protect, express.static(path.join(__dirname, 'uploads'), { index: false }));

// Basic health route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Routes will be added here
const authRoutes = require('./routes/authRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const videoRoutes = require('./routes/videoRoutes');
const userRoutes = require('./routes/userRoutes');
const aiSourceRoutes = require('./routes/aiSourceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const blogRoutes = require('./routes/blogRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const aiTutorRoutes = require('./routes/aiTutorRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const liveRoutes = require('./routes/liveRoutes');

// Mount routers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-sources', aiSourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiTutorRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/live', liveRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
