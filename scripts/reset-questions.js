require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { Question } = require('../models');
const { seedQuizQuestions } = require('../database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehunt';

async function resetQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    console.log('Deleting all existing questions...');
    await Question.deleteMany({});
    console.log('All questions deleted');
    
    console.log('Re-seeding questions from database.js...');
    await seedQuizQuestions();
    
    console.log('Questions reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting questions:', error);
    process.exit(1);
  }
}

resetQuestions();
