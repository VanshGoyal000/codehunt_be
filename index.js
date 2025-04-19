require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB, createAdminUser, seedQuizQuestions } = require('./database');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware optimizations for high concurrency
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Reduce payload limit to prevent abuse
app.use(morgan('dev', {
  skip: (req, res) => process.env.NODE_ENV === 'production' // Skip logging in production
}));
app.use(compression());

// Implement rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  message: 'Too many requests, please try again later'
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Connect to MongoDB and seed data
async function initializeApp() {
  try {
    await connectDB();
    await createAdminUser();
    await seedQuizQuestions();
    
    // Import the missing function
    const { initializeSettings } = require('./database');
    await initializeSettings();
    console.log('App initialization complete!');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

initializeApp();

// Home route with login information
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the CodeHunt Quiz App</h1>
    <p>This is the API server for the CodeHunt quiz application.</p>
    <h2>Default Login Credentials:</h2>
    <p><strong>Admin Username:</strong> admin</p>
    <p><strong>Admin Password:</strong> admin123</p>
    <p>Visit the React frontend to access the full application.</p>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// Static folder for data files
app.use('/data', express.static(path.join(__dirname, 'data')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from frontend build directory
  app.use(express.static(path.join(__dirname, '../fe/dist')));
  
  // Handle SPA routing - for all other routes, serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../fe/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server with optimized settings
const server = app.listen(PORT, '0.0.0.0', () => {
  // Set server timeouts to handle many concurrent connections
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
  
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  const interfaces = require('os').networkInterfaces();
  for (let dev in interfaces) {
    interfaces[dev].forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        console.log(`LAN: http://${details.address}:${PORT}`);
      }
    });
  }
});
