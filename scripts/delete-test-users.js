require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { User } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Delete test users
async function deleteTestUsers() {
  try {
    console.log('Finding test users...');
    
    // Find all test users (those created for load testing)
    const testUsers = await User.find({ username: /^testuser\d+$/ });
    
    console.log(`Found ${testUsers.length} test users`);
    
    if (testUsers.length === 0) {
      console.log('No test users found. Nothing to delete.');
      return;
    }
    
    // Confirm deletion
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('The following test users will be deleted:');
    testUsers.slice(0, 10).forEach(user => {
      console.log(`- ${user.username}`);
    });
    
    if (testUsers.length > 10) {
      console.log(`...and ${testUsers.length - 10} more`);
    }
    
    // Get user confirmation
    const answer = await new Promise(resolve => {
      readline.question('Are you sure you want to delete these users? (y/n): ', resolve);
    });
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Deletion cancelled.');
      readline.close();
      return;
    }
    
    readline.close();
    
    // Delete test users
    console.log('Deleting test users...');
    const result = await User.deleteMany({ username: /^testuser\d+$/ });
    
    console.log(`Deleted ${result.deletedCount} test users.`);
    
    // Delete any responses from test users
    console.log('Cleaning up related user data...');
    const { Response } = require('../models');
    
    // Remove responses by test users (they're already gone but their IDs might still be in responses)
    const deletedResponses = await Response.deleteMany({ user_id: { $nin: await User.find().select('_id') } });
    console.log(`Cleaned up ${deletedResponses.deletedCount} responses.`);
    
    console.log('Database cleanup complete!');
  } catch (error) {
    console.error('Error deleting test users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
async function run() {
  await connectDB();
  await deleteTestUsers();
  console.log('Script execution completed.');
  process.exit(0);
}

run();
