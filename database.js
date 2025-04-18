const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Question } = require('./models');

// MongoDB connection with optimizations for free tier
async function connectDB() {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/codehunt';
    
    // Optimize MongoDB connection for high concurrency on free tier
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // Increase timeout for slower free tier
      socketTimeoutMS: 45000,  // Prevent idle timeouts
      maxPoolSize: 20,         // Limit pool size for free tier
      minPoolSize: 5,          // Maintain minimum connections
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout
    };
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionString, options);
    
    // Add connection monitoring for production
    if (process.env.NODE_ENV === 'production') {
      mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
        // Attempt to reconnect
        setTimeout(connectDB, 5000);
      });
    }
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit in production - retry instead
    if (process.env.NODE_ENV === 'production') {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
}

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user if doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Seed quiz questions
async function seedQuizQuestions() {
  try {
    // Check if questions already exist
    // const questionCount = await Question.countDocuments();
    // if (questionCount > 0) {
    //   console.log('Questions already exist, skipping seed');
    //   return;
    // }

    console.log('Seeding quiz questions...');
    
    // FIRST YEAR QUESTIONS
    const firstYearQuestions = [
      {
        question: "What does HTML stand for?",
        options: JSON.stringify(["Hypertext Markup Language", "Hypertext Markdown Language", "Hyper Transfer Markup Language", "High-level Text Management Language"]),
        correct_answer: "Hypertext Markup Language",
        difficulty: "easy"
      },
      {
        question: "Which of the following is a valid way to declare a variable in JavaScript?",
        options: JSON.stringify(["var x = 5;", "variable x = 5;", "v x = 5;", "int x = 5;"]),
        correct_answer: "var x = 5;",
        difficulty: "easy"
      },
      {
        question: "Which CSS property is used to change the text color of an element?",
        options: JSON.stringify(["color", "text-color", "font-color", "foreground-color"]),
        correct_answer: "color",
        difficulty: "easy"
      },
      {
        question: "What is the correct way to write a comment in JavaScript?",
        options: JSON.stringify(["<!-- This is a comment -->", "// This is a comment", "/* This is a comment */", "Both // and /* */"]),
        correct_answer: "Both // and /* */",
        difficulty: "easy"
      },
      {
        question: "Which of the following is NOT a JavaScript data type?",
        options: JSON.stringify(["String", "Boolean", "Object", "Character"]),
        correct_answer: "Character",
        difficulty: "medium"
      },
      {
        question: "How do you create a function in JavaScript?",
        options: JSON.stringify(["function myFunction()", "function:myFunction()", "function = myFunction()", "create myFunction()"]),
        correct_answer: "function myFunction()",
        difficulty: "medium"
      },
      {
        question: "What is the correct HTML element for inserting a line break?",
        options: JSON.stringify(["<lb>", "<break>", "<br>", "<newline>"]),
        correct_answer: "<br>",
        difficulty: "easy"
      },
      {
        question: "What is the correct way to link an external JavaScript file?",
        options: JSON.stringify(["<script href='script.js'>", "<script src='script.js'>", "<script name='script.js'>", "<script link='script.js'>"]),
        correct_answer: "<script src='script.js'>",
        difficulty: "medium"
      },
      {
        question: "Which operator is used to assign a value to a variable in JavaScript?",
        options: JSON.stringify(["=", "==", "===", "*"]),
        correct_answer: "=",
        difficulty: "easy"
      },
      {
        question: "How do you declare a constant variable in JavaScript?",
        options: JSON.stringify(["var", "let", "const", "constant"]),
        correct_answer: "const",
        difficulty: "medium"
      }
    ];
    
    // SECOND YEAR QUESTIONS
    const secondYearQuestions = [
      {
        question: "What is a closure in JavaScript?",
        options: JSON.stringify(["A function that can access variables from its outer scope", "A block of code that never executes", "A CSS property", "A method to close browser windows"]),
        correct_answer: "A function that can access variables from its outer scope",
        difficulty: "medium"
      },
      {
        question: "What is the time complexity of binary search?",
        options: JSON.stringify(["O(1)", "O(n)", "O(log n)", "O(n²)"]),
        correct_answer: "O(log n)",
        difficulty: "medium"
      },
      {
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: JSON.stringify(["The current function", "The parent object", "The object the method belongs to", "The global window object"]),
        correct_answer: "The object the method belongs to",
        difficulty: "medium"
      },
      {
        question: "Which data structure follows the FIFO principle?",
        options: JSON.stringify(["Stack", "Queue", "Heap", "Tree"]),
        correct_answer: "Queue",
        difficulty: "medium"
      },
      {
        question: "What is the purpose of the 'async' and 'await' keywords in JavaScript?",
        options: JSON.stringify(["Handling DOM events", "Simplifying asynchronous operations", "Creating classes", "Managing database connections"]),
        correct_answer: "Simplifying asynchronous operations",
        difficulty: "hard"
      },
      {
        question: "What is the correct way to handle errors in an async function?",
        options: JSON.stringify(["try/catch block", "if/else statement", "switch statement", "error event listener"]),
        correct_answer: "try/catch block",
        difficulty: "hard"
      },
      {
        question: "What is a React hook?",
        options: JSON.stringify(["A function to access React features", "A CSS framework", "A JavaScript library", "A database connection"]),
        correct_answer: "A function to access React features",
        difficulty: "medium"
      },
      {
        question: "Which of the following is NOT a valid HTTP method?",
        options: JSON.stringify(["GET", "POST", "DELETE", "FETCH"]),
        correct_answer: "FETCH",
        difficulty: "medium"
      },
      {
        question: "What is the purpose of Redux in React applications?",
        options: JSON.stringify(["DOM manipulation", "State management", "API calls", "Component styling"]),
        correct_answer: "State management",
        difficulty: "medium"
      },
      {
        question: "What is the difference between 'let' and 'var' in JavaScript?",
        options: JSON.stringify(["'let' has block scope, 'var' has function scope", "'var' has block scope, 'let' has function scope", "They are identical", "'let' is for strings, 'var' is for numbers"]),
        correct_answer: "'let' has block scope, 'var' has function scope",
        difficulty: "medium"
      }
    ];
    
    // THIRD YEAR QUESTIONS
    const thirdYearQuestions = [
      {
        question: "What is a pure function in functional programming?",
        options: JSON.stringify(["A function with no side effects", "A function that logs to console", "A function that modifies DOM", "A function that changes global state"]),
        correct_answer: "A function with no side effects",
        difficulty: "hard"
      },
      {
        question: "What design pattern is React's architecture based on?",
        options: JSON.stringify(["MVC", "MVVM", "Flux", "Observer"]),
        correct_answer: "Flux",
        difficulty: "hard"
      },
      {
        question: "What is server-side rendering in React?",
        options: JSON.stringify(["Rendering components on the server before sending HTML to client", "Using a dedicated server for React apps", "Running React on a Node.js server", "Hosting React apps on a cloud server"]),
        correct_answer: "Rendering components on the server before sending HTML to client",
        difficulty: "hard"
      },
      {
        question: "What tool would you use to analyze a React app's bundle size?",
        options: JSON.stringify(["Webpack Bundle Analyzer", "React DevTools", "Chrome DevTools", "Node Inspector"]),
        correct_answer: "Webpack Bundle Analyzer",
        difficulty: "hard"
      },
      {
        question: "What is the purpose of Docker in modern web development?",
        options: JSON.stringify(["Containerization for consistent development and deployment", "API management", "Front-end framework", "Database optimization"]),
        correct_answer: "Containerization for consistent development and deployment",
        difficulty: "hard"
      },
      {
        question: "Which of these is a microservices architecture advantage?",
        options: JSON.stringify(["Easier debugging", "Independent scaling of services", "Simpler deployment", "Lower latency"]),
        correct_answer: "Independent scaling of services",
        difficulty: "hard"
      },
      {
        question: "What is GraphQL?",
        options: JSON.stringify(["A query language for APIs", "A graph database", "A charting library", "A JavaScript framework"]),
        correct_answer: "A query language for APIs",
        difficulty: "hard"
      },
      {
        question: "What is the purpose of JWT in authentication?",
        options: JSON.stringify(["Secure data transmission", "User interface components", "Server-side rendering", "Database encryption"]),
        correct_answer: "Secure data transmission",
        difficulty: "medium"
      },
      {
        question: "What is the advantage of using TypeScript over JavaScript?",
        options: JSON.stringify(["Static type checking", "Faster execution", "Smaller bundle size", "Direct browser support"]),
        correct_answer: "Static type checking",
        difficulty: "medium"
      },
      {
        question: "What is CORS in web development?",
        options: JSON.stringify(["A security feature restricting resource requests", "A CSS framework", "A JavaScript library", "A browser developer tool"]),
        correct_answer: "A security feature restricting resource requests",
        difficulty: "medium"
      }
    ];

    // Insert questions for each year
    for (const q of firstYearQuestions) {
      await Question.create({
        year_level: 1,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty
      });
    }

    for (const q of secondYearQuestions) {
      await Question.create({
        year_level: 2,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty
      });
    }

    for (const q of thirdYearQuestions) {
      await Question.create({
        year_level: 3,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty
      });
    }

    console.log('Quiz questions seeded successfully');
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
}

// Initialize default settings
async function initializeSettings() {
  try {
    // Check if Setting model is available
    const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({
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
    }));
    
    // Check if settings already exist
    const settingCount = await Setting.countDocuments();
    if (settingCount > 0) {
      console.log('Settings already exist, skipping initialization');
      return;
    }

    console.log('Initializing default settings...');
    
    // Default: Quiz is enabled
    await Setting.create({
      key: 'quiz_enabled',
      value: true,
      updated_at: new Date()
    });
    
    console.log('Default settings initialized successfully');
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

module.exports = {
  connectDB,
  createAdminUser,
  seedQuizQuestions,
  initializeSettings
};
