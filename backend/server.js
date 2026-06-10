const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/auth', authRoutes);
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
