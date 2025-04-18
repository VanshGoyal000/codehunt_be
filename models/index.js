const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  warnings: {
    type: Number,
    default: 0
  },
  fullscreenViolations: {
    type: Number,
    default: 0
  },
  token: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Question schema
const questionSchema = new mongoose.Schema({
  year_level: {   // Changed from quiz_round to year_level
    type: Number,
    required: true,
    enum: [1, 2, 3]  // 1st year, 2nd year, 3rd year
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: String, // JSON string of options array
    required: true
  },
  correct_answer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  question_type: {
    type: String,
    enum: ['mcq', 'numerical', 'string'],
    default: 'mcq'
  }
});

// Response schema
const responseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year_level: {   // Changed from quiz_round to year_level
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  answers: {
    type: String, // JSON string of answers
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  submitted_at: {
    type: Date,
    default: Date.now
  }
});

// Timer schema
const timerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.global; } // Only required if not global
  },
  global: {
    type: Boolean,
    default: false
  },
  start_time: {
    type: Date,
    required: true,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Setting schema for application configuration
const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create models only if not already defined
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Response = mongoose.models.Response || mongoose.model('Response', responseSchema);
const Timer = mongoose.models.Timer || mongoose.model('Timer', timerSchema);
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

module.exports = {
  User,
  Question,
  Response,
  Timer,
  Setting
};
