require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB, createAdminUser, seedQuizQuestions } = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB and seed data
async function initializeApp() {
  try {
    await connectDB();
    await createAdminUser();
    await seedQuizQuestions();
    
    // Add this line to initialize settings
    await initializeSettings();
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
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(5000 , ()=>{
  console.log("server is on 5000 port")
})