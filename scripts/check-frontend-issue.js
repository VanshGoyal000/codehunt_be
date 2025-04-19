require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { Question } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehunt';

async function checkQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Check count of questions by year level
    const year1Count = await Question.countDocuments({ year_level: 1 });
    const year2Count = await Question.countDocuments({ year_level: 2 });
    const year3Count = await Question.countDocuments({ year_level: 3 });
    
    console.log('\nQuestion counts in database:');
    console.log(`Year 1: ${year1Count} questions`);
    console.log(`Year 2: ${year2Count} questions`);
    console.log(`Year 3: ${year3Count} questions`);
    console.log(`Total: ${year1Count + year2Count + year3Count} questions\n`);
    
    // Check if there's any code limiting questions
    console.log('Checking for any code in routes that might limit questions...');
    const routes = require('fs').readFileSync('../routes/quiz.js', 'utf8');
    if (routes.includes('limit(10)') || routes.includes('limit(')) {
      console.log('ISSUE FOUND: Quiz route is limiting the number of questions returned.');
      console.log('Fix: Remove any .limit() calls in the routes/quiz.js file.');
    } else {
      console.log('No explicit limits found in quiz routes.');
    }
    
    console.log('\nDiagnostic complete. If you see "Total: 50 questions" but frontend only shows 10,');
    console.log('check your Quiz component to ensure it\'s not filtering or limiting questions.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking questions:', error);
    process.exit(1);
  }
}

checkQuestions();
