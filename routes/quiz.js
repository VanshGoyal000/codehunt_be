const express = require('express');
const router = express.Router();
const { User, Question, Response, Timer, Setting } = require('../models');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Global timer variables
let globalTimer = {
  active: false,
  startTime: null,
  duration: 0,
  createdBy: null
};

// Implement caching middleware for quiz routes
const cache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function cacheMiddleware(req, res, next) {
  // Only cache GET requests
  if (req.method !== 'GET') return next();
  
  const key = `${req.originalUrl || req.url}`;
  const cachedResponse = cache[key];
  
  if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_DURATION)) {
    console.log(`Cache hit for ${key}`);
    return res.status(200).json(cachedResponse.data);
  }
  
  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function
  res.send = function(body) {
    // Only cache successful responses
    if (res.statusCode === 200 && body) {
      try {
        // Store in cache
        cache[key] = {
          data: JSON.parse(body),
          timestamp: Date.now()
        };
      } catch (err) {
        console.error('Error parsing response for cache:', err);
      }
    }
    
    // Call the original send function
    originalSend.call(this, body);
  };
  
  next();
}

// Check if quiz is enabled - middleware
const checkQuizEnabled = async (req, res, next) => {
  try {
    // Skip check for admin users
    if (req.user.username === 'admin') {
      return next();
    }
    
    const setting = await Setting.findOne({ key: 'quiz_enabled' });
    
    if (!setting || !setting.value) {
      return res.status(403).json({ 
        message: 'Quiz is not yet enabled by the administrator',
        status: 'disabled'
      });
    }
    
    next();
  } catch (error) {
    console.error('Check quiz status error:', error);
    res.status(500).json({ message: 'Error checking quiz status', error: error.message });
  }
};

// Get quiz status
router.get('/status', auth, async (req, res) => {
  try {
    // For admin, always return true
    if (req.user.username === 'admin') {
      return res.json({ enabled: true });
    }
    
    const setting = await Setting.findOne({ key: 'quiz_enabled' });
    
    res.json({ 
      enabled: setting ? setting.value : false,
      message: setting && setting.value ? 
        'Quiz is enabled. You can start now.' : 
        'Please wait for the administrator to enable the quiz.'
    });
  } catch (error) {
    console.error('Quiz status fetch error:', error);
    res.status(500).json({ message: 'Error fetching quiz status', error: error.message });
  }
});

// Get global timer status
router.get('/timer/global-status', auth, async (req, res) => {
  try {
    // First use the in-memory global timer
    if (globalTimer.active) {
      const currentTime = new Date();
      const startTime = new Date(globalTimer.startTime);
      const endTime = new Date(startTime.getTime() + (globalTimer.duration * 1000));
      
      // Check if timer has ended
      if (currentTime >= endTime) {
        globalTimer.active = false;
        
        return res.json({ 
          active: false,
          expired: true,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          currentTime: currentTime.toISOString(),
          message: 'Global timer has expired'
        });
      }
      
      // Calculate remaining time in seconds
      const remainingMilliseconds = endTime - currentTime;
      const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
      
      return res.json({
        active: true,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        currentTime: currentTime.toISOString(),
        remainingSeconds: remainingSeconds,
        message: 'Global timer is active',
        createdBy: globalTimer.createdBy
      });
    }
    
    // If no in-memory timer, check the database
    try {
      const dbGlobalTimer = await Timer.findOne({ global: true });
      
      if (dbGlobalTimer) {
        const currentTime = new Date();
        const startTime = new Date(dbGlobalTimer.start_time);
        const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 60 minutes
        
        // Check if timer has ended
        if (currentTime >= endTime) {
          return res.json({ 
            active: false,
            expired: true,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            currentTime: currentTime.toISOString(),
            message: 'Global timer has expired'
          });
        }
        
        // Calculate remaining time in seconds
        const remainingMilliseconds = endTime - currentTime;
        const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
        
        return res.json({
          active: true,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          currentTime: currentTime.toISOString(),
          remainingSeconds: remainingSeconds,
          message: 'Global timer is active'
        });
      }
    } catch (error) {
      console.error('DB Global timer check error:', error);
      // Continue even if there's a database error
    }
    
    return res.json({ 
      active: false,
      message: 'No global timer is currently active'
    });
  } catch (error) {
    console.error('Global timer status error:', error);
    res.status(500).json({ message: 'Error checking global timer status', error: error.message });
  }
});

// Start or get timer - Add checkQuizEnabled middleware
router.get('/timer/start', auth, checkQuizEnabled, async (req, res) => {
  try {
    // Check if global timer is active
    if (globalTimer.active) {
      return res.json({ 
        startTime: globalTimer.startTime,
        currentTime: new Date().toISOString(),
        isGlobal: true,
        duration: globalTimer.duration
      });
    }
    
    // If no global timer, use individual timer
    const timer = await Timer.findOne({ user_id: req.user._id });
    
    if (timer) {
      // Timer already exists, return it
      return res.json({ 
        startTime: timer.start_time.toISOString(),
        currentTime: new Date().toISOString(),
        isGlobal: false
      });
    }
    
    // Create new timer
    const startTime = new Date();
    const newTimer = new Timer({
      user_id: req.user._id,
      start_time: startTime
    });
    
    await newTimer.save();
    
    res.json({ 
      startTime: startTime.toISOString(),
      currentTime: new Date().toISOString(),
      isGlobal: false
    });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Error starting timer' });
  }
});

// Start global timer (admin only)
router.post('/timer/global-start', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.username !== 'admin') {
      return res.status(403).json({ message: 'Only admins can start global timers' });
    }
    
    const duration = req.body.duration || 60 * 60; // Default 60 minutes
    
    globalTimer = {
      active: true,
      startTime: new Date().toISOString(),
      duration: duration,
      createdBy: req.user.username
    };
    
    // Reset all individual timers
    await Timer.deleteMany({});
    
    res.json({
      message: 'Global timer started',
      active: true,
      startTime: globalTimer.startTime,
      duration: duration,
      currentTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Start global timer error:', error);
    res.status(500).json({ message: 'Error starting global timer' });
  }
});

// Stop global timer (admin only)
router.post('/timer/global-stop', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.username !== 'admin') {
      return res.status(403).json({ message: 'Only admins can stop global timers' });
    }
    
    globalTimer = {
      active: false,
      startTime: null,
      duration: 0,
      createdBy: null
    };
    
    res.json({
      message: 'Global timer stopped',
      active: false
    });
  } catch (error) {
    console.error('Stop global timer error:', error);
    res.status(500).json({ message: 'Error stopping global timer' });
  }
});

// Add endpoint to get quiz results
router.get('/results', auth, async (req, res) => {
  try {
    // Find all user's responses
    const responses = await Response.find({ user_id: req.user._id });
    
    // Find all questions
    const questions = await Question.find();
    
    // Calculate score for each year
    const results = {
      user: {
        username: req.user.username,
        warnings: req.user.warnings || 0,
        fullscreenViolations: req.user.fullscreenViolations || 0
      },
      scores: {}
    };
    
    // Process each response
    for (const response of responses) {
      if (!response.completed) continue;
      
      let score = 0;
      const answers = JSON.parse(response.answers);
      
      // Get questions for this year
      const yearQuestions = questions.filter(q => q.year_level === response.year_level);
      
      // Calculate score
      yearQuestions.forEach(question => {
        if (answers[question._id] === question.correct_answer) {
          score++;
        }
      });
      
      results.scores[response.year_level] = {
        score,
        totalQuestions: yearQuestions.length,
        submittedAt: response.submitted_at
      };
    }
    
    res.json(results);
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ message: 'Error fetching quiz results' });
  }
});

// Get saved answers for a specific year
router.get('/answers/:year', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    console.log(`Fetching saved answers for user ${req.user.username}, year ${year}`);
    
    const response = await Response.findOne({ 
      user_id: req.user._id, 
      year_level: year 
    });
    
    if (!response) {
      console.log(`No saved answers found for user ${req.user.username}`);
      return res.json({ answers: {} });
    }
    
    let parsedAnswers = {};
    
    try {
      parsedAnswers = JSON.parse(response.answers);
      console.log(`Retrieved saved answers for user ${req.user.username}`);
    } catch (err) {
      console.error(`Error parsing answers for user ${req.user.username}:`, err);
    }
    
    res.json({ 
      answers: parsedAnswers
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Error fetching answers', error: error.message });
  }
});

// Log tab switching warnings
router.post('/tab-warning', auth, async (req, res) => {
  try {
    const { warningCount } = req.body;
    
    req.user.warnings = warningCount;
    await req.user.save();
    
    res.json({ message: 'Warning logged successfully' });
  } catch (error) {
    console.error('Tab warning error:', error);
    res.status(500).json({ message: 'Error logging warning' });
  }
});

// Add endpoint to log fullscreen exit violation
router.post('/fullscreen-violation', auth, async (req, res) => {
  try {
    // Increment fullscreen violations counter for the user
    if (!req.user.fullscreenViolations) {
      req.user.fullscreenViolations = 0;
    }
    
    req.user.fullscreenViolations += 1;
    await req.user.save();
    
    res.json({ 
      message: 'Fullscreen violation logged', 
      violations: req.user.fullscreenViolations 
    });
  } catch (error) {
    console.error('Fullscreen violation error:', error);
    res.status(500).json({ message: 'Error logging fullscreen violation' });
  }
});

// Save answers temporarily (auto-save)
router.post('/save', auth, async (req, res) => {
  try {
    const { year, answers } = req.body;
    
    if (!year || !answers) {
      return res.status(400).json({ message: 'Year and answers are required' });
    }
    
    console.log(`Saving answers for user ${req.user.username}, year ${year}`);
    console.log('Answers to save:', answers);
    
    // Check if response exists for this user and year
    let response = await Response.findOne({ 
      user_id: req.user._id, 
      year_level: year 
    });
    
    // Ensure answers are correctly stringified
    let answersToSave;
    if (typeof answers === 'string') {
      try {
        // Verify it's valid JSON by parsing and re-stringifying
        answersToSave = JSON.stringify(JSON.parse(answers));
      } catch (e) {
        console.error('Error parsing answers string:', e);
        // Just use the string as-is if it can't be parsed
        answersToSave = answers;
      }
    } else {
      // If it's an object, stringify it
      answersToSave = JSON.stringify(answers);
    }
    
    if (response) {
      // Update existing response
      response.answers = answersToSave;
      response.submitted_at = new Date();
      await response.save();
      console.log(`Updated existing answers for user ${req.user.username}`);
    } else {
      // Create new response
      response = new Response({
        user_id: req.user._id,
        year_level: year,
        answers: answersToSave,
        submitted_at: new Date()
      });
      await response.save();
      console.log(`Created new answers record for user ${req.user.username}`);
    }
    
    res.json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Save answers error:', error);
    res.status(500).json({ message: 'Error saving answers', error: error.message });
  }
});

// Submit answers for a year
router.post('/submit', auth, async (req, res) => {
  try {
    const { year, answers } = req.body;
    
    if (!year || !answers) {
      return res.status(400).json({ message: 'Year and answers are required' });
    }
    
    // Check if response exists for this user and year
    let response = await Response.findOne({ 
      user_id: req.user._id, 
      year_level: year 
    });
    
    if (response) {
      // Update existing response and mark as completed
      response.answers = JSON.stringify(answers);
      response.completed = true;
      response.submitted_at = new Date();
      await response.save();
    } else {
      // Create new completed response
      response = new Response({
        user_id: req.user._id,
        year_level: year,
        answers: JSON.stringify(answers),
        completed: true,
        submitted_at: new Date()
      });
      await response.save();
    }
    
    res.json({ message: 'Quiz submitted successfully' });
  } catch (error) {
    console.error('Submit answers error:', error);
    res.status(500).json({ message: 'Error submitting answers' });
  }
});

// This must be LAST because it has a path parameter that can match other routes
router.get('/:year', auth, checkQuizEnabled, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (isNaN(year) || year < 1 || year > 3) {
      return res.status(400).json({ message: 'Invalid year selection. Please select Year 1, 2, or 3' });
    }
    
    console.log(`Fetching questions for year level: ${year}`);
    
    // Make sure to use the correct field name that you defined in your schema
    const questions = await Question.find({ year_level: year })
      .select('_id year_level question options')
      .limit(10);  // Ensure only 10 questions are returned
    
    console.log(`Found ${questions.length} questions`);
    
    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Get quiz questions by year level - optimized with pagination
router.get('/:year', auth, cacheMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (isNaN(year) || year < 1 || year > 3) {
      return res.status(400).json({ message: 'Invalid year level' });
    }

    // Add pagination to reduce payload size
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 questions per page
    const skip = (page - 1) * limit;
    
    // Get count for pagination metadata
    const totalQuestions = await Question.countDocuments({ year_level: year });
    
    // Get paginated questions for this year level
    const questions = await Question.find({ year_level: year })
                                 .select('-correct_answer') // Don't send correct answers to client
                                 .skip(skip)
                                 .limit(limit)
                                 .lean();
    
    console.log(`Fetched ${questions.length} questions for year ${year} (page ${page}, limit ${limit})`);
    
    // Send pagination metadata with the questions
    return res.status(200).json({ 
      questions,
      pagination: {
        total: totalQuestions,
        page,
        limit,
        pages: Math.ceil(totalQuestions / limit)
      }
    });
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Clear cache when questions are updated
const clearQuestionCache = () => {
  Object.keys(cache).forEach(key => {
    if (key.includes('/quiz/')) {
      delete cache[key];
    }
  });
};

module.exports = router;
