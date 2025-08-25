const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth');
const filmRoutes = require('./routes/films');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;