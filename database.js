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
    // Clear existing questions for clean reload
    await Question.deleteMany({});
    console.log('Existing questions cleared, seeding new questions...');
    
    // FIRST YEAR QUESTIONS - 25 MCQs
    const firstYearQuestions = [
      // Original 10 MCQs
      {
        year_level: 1,
        question: "What will be the output of the following code?\n\nint arr[3] = {1, 2, 3};\nprintf(\"%d\", *(arr + 1));",
        options: JSON.stringify(["1", "2", "3", "Garbage value"]),
        correct_answer: "2",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which of the following is the correct way to declare a pointer to an array of 5 integers?",
        options: JSON.stringify(["int *ptr[5];", "int (*ptr)[5];", "int ptr[5];", "int ptr(*5);"]),
        correct_answer: "int (*ptr)[5];",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What is the output of the following code?\n\nint x = 5;\nint *p = &x;\n*p = *p + 5;\nprintf(\"%d\", x);",
        options: JSON.stringify(["5", "10", "0", "Compilation error"]),
        correct_answer: "10",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Consider the following code snippet:\n\nchar str[] = \"CProgramming\";\nprintf(\"%c\", *(str + 2));",
        options: JSON.stringify(["C", "P", "r", "o"]),
        correct_answer: "r",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What will the following code print?\n\nint a = 5, b = 10;\nif (a = b)\n    printf(\"Equal\");\nelse\n    printf(\"Not Equal\");",
        options: JSON.stringify(["Equal", "Not Equal", "Compilation Error", "Runtime Error"]),
        correct_answer: "Equal",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What is the size of the array int arr[2][3]; in bytes if sizeof(int) = 4?",
        options: JSON.stringify(["8", "10", "24", "6"]),
        correct_answer: "24",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What is the output of this code?\n\nint a[2][2] = {{1, 2}, {3, 4}};\nprintf(\"%d\", *(*(a + 1) + 1));",
        options: JSON.stringify(["1", "2", "3", "4"]),
        correct_answer: "4",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What does this code print?\n\nint arr[] = {5, 10, 15};\nint *p = arr;\nprintf(\"%d\", *(p++));",
        options: JSON.stringify(["5", "10", "15", "Garbage value"]),
        correct_answer: "5",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What will the following code output?\n\nint arr[3] = {1, 2, 3};\nint sum = 0;\nfor (int i = 0; i < 3; i++)\n    sum += arr[i];\nprintf(\"%d\", sum);",
        options: JSON.stringify(["3", "6", "9", "Compilation error"]),
        correct_answer: "6",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "What is the output of this code?\n\nint x = 3;\nint y = 4;\nprintf(\"%d\", x & y);",
        options: JSON.stringify(["0", "1", "2", "3"]),
        correct_answer: "2",
        difficulty: "medium",
        question_type: "mcq"
      },
      // New additional 15 MCQs
      {
        year_level: 1,
        question: "Which keyword in C is used to declare a variable that is defined in another file or scope?",
        options: JSON.stringify(["global", "extern", "static", "export"]),
        correct_answer: "extern",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which C keyword is used to group different types of variables under a single name for structured data representation?",
        options: JSON.stringify(["typedef", "struct", "union", "enum"]),
        correct_answer: "struct",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which C keyword is used to skip the current iteration of a loop and jump to the next one?",
        options: JSON.stringify(["skip", "pass", "continue", "next"]),
        correct_answer: "continue",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which keyword in C++ allows a function or operator to be defined with the same name but behave differently based on input types or parameters?",
        options: JSON.stringify(["override", "overload", "polymorph", "virtual"]),
        correct_answer: "overload",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which C++ keyword is utilized to define a block of code that executes automatically when an object goes out of scope, often used for cleanup tasks?",
        options: JSON.stringify(["constructor", "finalizer", "destructor", "cleaner"]),
        correct_answer: "destructor",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which C keyword enforces immutability on a variable at compile time, preventing any reassignment during program execution?",
        options: JSON.stringify(["final", "static", "const", "define"]),
        correct_answer: "const",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which keyword in C allows the creation of an alias for existing data types, thereby enabling the definition of user-defined data abstractions?",
        options: JSON.stringify(["alias", "define", "typedef", "struct"]),
        correct_answer: "typedef",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which standard C header file must be included to access formatted input and output functions such as printf and scanf?",
        options: JSON.stringify(["conio.h", "stdlib.h", "stdio.h", "string.h"]),
        correct_answer: "stdio.h",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which C standard library function keyword facilitates dynamic memory allocation at runtime by returning a pointer to a specified block of memory?",
        options: JSON.stringify(["calloc", "malloc", "realloc", "alloc"]),
        correct_answer: "malloc",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which control flow keyword in C is used to force an immediate termination of the innermost enclosing loop or switch construct?",
        options: JSON.stringify(["break", "continue", "exit", "return"]),
        correct_answer: "break",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which Python keyword is used to initiate an exception handling construct that allows graceful management of runtime errors?",
        options: JSON.stringify(["handle", "throw", "error", "try"]),
        correct_answer: "try",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which keyword in Python denotes an immutable sequence type commonly used for storing heterogeneous elements?",
        options: JSON.stringify(["list", "tuple", "set", "array"]),
        correct_answer: "tuple",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which Java keyword is utilized to create an instance of a class dynamically during runtime?",
        options: JSON.stringify(["class", "object", "new", "make"]),
        correct_answer: "new",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which keyword in Java is used to prevent a method or variable from being overridden or modified in derived classes?",
        options: JSON.stringify(["final", "static", "const", "sealed"]),
        correct_answer: "final",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 1,
        question: "Which Java keyword is used to create a block of code that runs automatically when an object is instantiated?",
        options: JSON.stringify(["init", "constructor", "method", "class"]),
        correct_answer: "constructor",
        difficulty: "medium",
        question_type: "mcq"
      }
    ];

    // SECOND YEAR QUESTIONS - 25 MCQs
    const secondYearQuestions = [
      // Original 10 MCQs
      {
        year_level: 2,
        question: "What is the output of the following C++ code?\n\nint a = 10, b = 20;\ncout << a++ + ++b;",
        options: JSON.stringify(["30", "31", "32", "33"]),
        correct_answer: "32",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: JSON.stringify(["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"]),
        correct_answer: "Merge Sort",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "What does this Java code output?\n\nint x = 5;\nSystem.out.println(x >> 1);",
        options: JSON.stringify(["2", "2.5", "3", "1"]),
        correct_answer: "2",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which of these data structures is used in recursion?",
        options: JSON.stringify(["Queue", "Array", "Stack", "Linked List"]),
        correct_answer: "Stack",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "What is the output of this C++ code?\n\nint x = 7;\nint y = x & 3;\ncout << y;",
        options: JSON.stringify(["1", "3", "2", "0"]),
        correct_answer: "3",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which of the following is *not* a property of dynamic programming?",
        options: JSON.stringify(["Optimal Substructure", "Memoization", "Greedy Choice", "Overlapping Subproblems"]),
        correct_answer: "Greedy Choice",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "What will be the output of the following Java code?\n\nint arr[] = {1, 2, 3};\nSystem.out.println(arr[1]);",
        options: JSON.stringify(["1", "2", "3", "Compilation Error"]),
        correct_answer: "2",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which of the following traversal methods is used in Depth First Search?",
        options: JSON.stringify(["Level Order", "Breadth First", "Preorder", "Inorder"]),
        correct_answer: "Preorder",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "What will be the output of the following code snippet?\n\nint a = 5;\ncout << (a == 5 ? \"Five\" : \"Not Five\");",
        options: JSON.stringify(["Five", "Not Five", "Error", "None"]),
        correct_answer: "Five",
        difficulty: "easy",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which data structure gives O(1) time complexity for insertion and deletion at both ends?",
        options: JSON.stringify(["Stack", "Queue", "Deque", "Array"]),
        correct_answer: "Deque",
        difficulty: "medium",
        question_type: "mcq"
      },
      // New additional 15 MCQs
      {
        year_level: 2,
        question: "Consider an algorithm with the recurrence relation: T(n)=2T(n/2)+n. What is the tight asymptotic bound for its time complexity?",
        options: JSON.stringify(["O(nlogn)", "O(n)", "O(logn)", "O(n^2)"]),
        correct_answer: "O(nlogn)",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which of the following complexities represents the best-case time for searching an element in a balanced binary search tree (BST)?",
        options: JSON.stringify(["O(1)", "O(logn)", "O(n)", "O(nlogn)"]),
        correct_answer: "O(logn)",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "If an algorithm requires storing all pairs of elements from an input array of size n, what is the asymptotic space complexity?",
        options: JSON.stringify(["O(n)", "O(nlogn)", "O(n^2)", "O(2^n)"]),
        correct_answer: "O(n^2)",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "For an algorithm that recursively splits the input into three equal parts and performs constant-time work at each level, which recurrence expresses the time complexity?",
        options: JSON.stringify(["T(n)=2T(n/2)+n", "T(n)=3T(n/3)+O(1)", "T(n)=T(n−1)+O(1)", "T(n)=T(n−1)+n"]),
        correct_answer: "T(n)=3T(n/3)+O(1)",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which of the following statements best describes the difference between space complexity and auxiliary space?",
        options: JSON.stringify(["They are always the same", "Space complexity only measures stack usage", "Auxiliary space excludes input storage space", "Auxiliary space includes input and output space"]),
        correct_answer: "Auxiliary space excludes input storage space",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "In the context of Java's late binding paradigm, which syntactic construct facilitates dynamic method resolution based on the actual object's class at runtime, rather than the reference type?",
        options: JSON.stringify(["overload", "virtual", "override", "dynamic"]),
        correct_answer: "override",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which C++ mechanism permits syntactic duplication of function identifiers, differentiated solely by variances in their formal parameter lists, resolved during the compilation phase?",
        options: JSON.stringify(["Virtualization", "Function Overriding", "Function Overloading", "Method Binding"]),
        correct_answer: "Function Overloading",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "What abstract data type, operating on a strict first-in-first-out scheduling discipline, underlies the node exploration logic in breadth-prioritized graph traversals?",
        options: JSON.stringify(["Stack", "Queue", "Linked List", "Priority Queue"]),
        correct_answer: "Queue",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "In Java's method declaration syntax, which keyword ensures the immutability of method behavior by disabling the possibility of subclass-level redefinition?",
        options: JSON.stringify(["const", "static", "final", "private"]),
        correct_answer: "final",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Which foundational principle of C++ object-oriented semantics permits a superclass pointer to reference subclass instances while invoking the subclass-specific method definitions at runtime?",
        options: JSON.stringify(["Templates", "Abstraction", "Polymorphism", "Encapsulation"]),
        correct_answer: "Polymorphism",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "A function is defined as T(n)=2⋅T(n−1) with base case T(1)=1. What is the closed-form expression of T(n) and its time complexity?",
        options: JSON.stringify(["T(n)=n, Time Complexity: Θ(n)", "T(n)=2^n, Time Complexity: Θ(2^n)", "T(n)=2^n−1, Time Complexity: Θ(2^n)", "T(n)=n^2, Time Complexity: O(n^2)"]),
        correct_answer: "T(n)=2^n−1, Time Complexity: Θ(2^n)",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Given a min-heap [2, 5, 7, 10, 15, 20, 25], after inserting the element 1, what will be the new root and the number of swaps during percolation?",
        options: JSON.stringify(["Root = 1, Swaps = 3", "Root = 2, Swaps = 0", "Root = 1, Swaps = 1", "Root = 5, Swaps = 2"]),
        correct_answer: "Root = 1, Swaps = 3",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "In a complete undirected graph with n vertices, how many edges exist, and what is the space complexity of its adjacency matrix representation?",
        options: JSON.stringify(["n(n−1)/2, O(n^2)", "n(n−1), O(n)", "n^2, O(n)", "log n, O(n logn)"]),
        correct_answer: "n(n−1)/2, O(n^2)",
        difficulty: "medium",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "Given the recurrence T(n)=3T(n/2)+O(n), determine the tight asymptotic bound using Master's Theorem.",
        options: JSON.stringify(["O(nlogn)", "O(n1.5)", "O(n^log2^3)", "O(n^2)"]),
        correct_answer: "O(n^log2^3)",
        difficulty: "hard",
        question_type: "mcq"
      },
      {
        year_level: 2,
        question: "For a sorted array of 1025 elements, what is the maximum number of comparisons performed in binary search (worst case)?",
        options: JSON.stringify(["10", "9", "11", "8"]),
        correct_answer: "11",
        difficulty: "medium",
        question_type: "mcq"
      }
    ];
    
    // Insert questions for each year
    for (const q of firstYearQuestions) {
      await Question.create({
        year_level: q.year_level,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        question_type: q.question_type || "mcq"
      });
    }

    for (const q of secondYearQuestions) {
      await Question.create({
        year_level: q.year_level,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        question_type: q.question_type || "mcq"
      });
    }

    // Log results
    console.log('Quiz questions seeded successfully');
    console.log(`Year 1: ${firstYearQuestions.length} questions`);
    console.log(`Year 2: ${secondYearQuestions.length} questions`);
    console.log(`Total: ${firstYearQuestions.length + secondYearQuestions.length} questions`);
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
