const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/database');
const searchRoutes = require('./routes/search');
require('dotenv').config();

const studyMaterialRoutes = require('./routes/studyMaterial');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"]
  }
});


// Import models FIRST to ensure they're registered
// Connect to MongoDB
connectDB();

// Load models
require('./src/models/User');
require('./src/models/Community');
require('./src/models/CommunityPost');
require('./src/models/Achievement');
require('./src/models/StudyMaterial');
require('./src/models/Meetup');


// THEN import the achievement controller after models are loaded
const { initializeAchievements } = require('./src/controllers/achievementController');

// Connect to MongoDB and initialize achievements
connectDB().then(async () => {
  // MongoDB Connected
  // Initializing achievements
  await initializeAchievements();
}).catch(error => {
  console.error('❌ Database connection failed:', error);
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://campusconnect-an8j.onrender.com",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api', limiter);


// Enhanced logging middleware for debugging
app.use('/api', (req, res, next) => {
  // Log request method and URL
  if (req.body && Object.keys(req.body).length > 0) {
  // Log request body
  }
  next();
});

// Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/communities', require('./routes/communities'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/achievements', require('./routes/achievements'));
  // All routes loaded successfully
} catch (error) {
  console.error('Error loading routes:', error);
}


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/study-materials', studyMaterialRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/meetups', require('./routes/meetup'));




// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Test route

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// 404 handler (must be last route handler before error handler)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Backend Live' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, statusCode: 400 };
  }
  if (err.name === 'ValidationError') {
    error = { message: Object.values(err.errors).map(val => val.message).join(', '), statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  // Server running on port
  // Environment info
  // Frontend URL info
});