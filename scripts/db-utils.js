require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { User, Response, Timer } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehunt';

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

// Delete test users by pattern
async function deleteUsersByPattern(pattern = /^testuser\d+$/) {
  try {
    // Find users matching pattern
    const users = await User.find({ username: pattern });
    console.log(`Found ${users.length} users matching the pattern`);
    
    // Delete matching users
    const result = await User.deleteMany({ username: pattern });
    console.log(`Deleted ${result.deletedCount} users`);
    
    // Clean up related data
    console.log('Cleaning up related data...');
    
    // Delete responses from deleted users
    const validUserIds = (await User.find().select('_id')).map(u => u._id);
    const responsesDeleted = await Response.deleteMany({ 
      user_id: { $nin: validUserIds } 
    });
    console.log(`Deleted ${responsesDeleted.deletedCount} orphaned responses`);
    
    // Delete timers from deleted users
    const timersDeleted = await Timer.deleteMany({ 
      user_id: { $nin: validUserIds },
      global: { $ne: true }  // Don't delete global timers
    });
    console.log(`Deleted ${timersDeleted.deletedCount} orphaned timers`);
    
    return {
      usersDeleted: result.deletedCount,
      responsesDeleted: responsesDeleted.deletedCount,
      timersDeleted: timersDeleted.deletedCount
    };
  } catch (error) {
    console.error('Error deleting users:', error);
    throw error;
  }
}

// Database statistics
async function getDbStats() {
  try {
    const stats = {
      users: await User.countDocuments(),
      testUsers: await User.countDocuments({ username: /^testuser\d+$/ }),
      adminUsers: await User.countDocuments({ username: 'admin' }),
      responses: await Response.countDocuments(),
      timers: await Timer.countDocuments()
    };
    return stats;
  } catch (error) {
    console.error('Error getting database statistics:', error);
    throw error;
  }
}

// Main function to handle command line arguments
async function main() {
  await connectDB();
  
  const command = process.argv[2]?.toLowerCase();
  
  switch (command) {
    case 'stats':
      console.log('Database Statistics:');
      const stats = await getDbStats();
      console.table(stats);
      break;
      
    case 'delete-test-users':
      console.log('Deleting test users...');
      await deleteUsersByPattern(/^testuser\d+$/);
      break;
      
    case 'delete-all-users':
      console.log('WARNING: This will delete ALL users except admin');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Are you sure? This cannot be undone (yes/no): ', resolve);
      });
      
      if (answer.toLowerCase() === 'yes') {
        await deleteUsersByPattern({ username: { $ne: 'admin' } });
        console.log('All non-admin users deleted');
      } else {
        console.log('Operation cancelled');
      }
      readline.close();
      break;
      
    case 'help':
    default:
      console.log('\nCodeHunt Database Utilities');
      console.log('=========================');
      console.log('Available commands:');
      console.log('  stats               - Show database statistics');
      console.log('  delete-test-users   - Delete all users with "testuser" pattern');
      console.log('  delete-all-users    - Delete ALL users except admin (use with caution)');
      console.log('  help                - Show this help message');
      console.log('\nExample usage:');
      console.log('  node db-utils.js stats');
      console.log('  node db-utils.js delete-test-users');
  }
  
  await mongoose.connection.close();
}

// Execute main if run directly
if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  connectDB,
  deleteUsersByPattern,
  getDbStats
};
