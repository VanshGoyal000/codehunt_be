require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { Question } = require('../models');

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

// First Year MCQ Questions
const firstYearMCQs = [
  {
    year_level: 1,
    question: "What will be the output of the following code?\n\nint arr[3] = {1, 2, 3};\nprintf(\"%d\", *(arr + 1));",
    options: JSON.stringify(["1", "2", "3", "Garbage value"]),
    correct_answer: "2",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "Which of the following is the correct way to declare a pointer to an array of 5 integers?",
    options: JSON.stringify(["int *ptr[5];", "int (*ptr)[5];", "int ptr[5];", "int ptr(*5);"]),
    correct_answer: "int (*ptr)[5];",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "What is the output of the following code?\n\nint x = 5;\nint *p = &x;\n*p = *p + 5;\nprintf(\"%d\", x);",
    options: JSON.stringify(["5", "10", "0", "Compilation error"]),
    correct_answer: "10",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "Consider the following code snippet:\n\nchar str[] = \"CProgramming\";\nprintf(\"%c\", *(str + 2));",
    options: JSON.stringify(["C", "P", "r", "o"]),
    correct_answer: "r",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "What will the following code print?\n\nint a = 5, b = 10;\nif (a = b)\n    printf(\"Equal\");\nelse\n    printf(\"Not Equal\");",
    options: JSON.stringify(["Equal", "Not Equal", "Compilation Error", "Runtime Error"]),
    correct_answer: "Equal",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "What is the size of the array int arr[2][3]; in bytes if sizeof(int) = 4?",
    options: JSON.stringify(["8", "10", "24", "6"]),
    correct_answer: "24",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "What is the output of this code?\n\nint a[2][2] = {{1, 2}, {3, 4}};\nprintf(\"%d\", *(*(a + 1) + 1));",
    options: JSON.stringify(["1", "2", "3", "4"]),
    correct_answer: "4",
    difficulty: "hard"
  },
  {
    year_level: 1,
    question: "What does this code print?\n\nint arr[] = {5, 10, 15};\nint *p = arr;\nprintf(\"%d\", *(p++));",
    options: JSON.stringify(["5", "10", "15", "Garbage value"]),
    correct_answer: "5",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "What will the following code output?\n\nint arr[3] = {1, 2, 3};\nint sum = 0;\nfor (int i = 0; i < 3; i++)\n    sum += arr[i];\nprintf(\"%d\", sum);",
    options: JSON.stringify(["3", "6", "9", "Compilation error"]),
    correct_answer: "6",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "What is the output of this code?\n\nint x = 3;\nint y = 4;\nprintf(\"%d\", x & y);",
    options: JSON.stringify(["0", "1", "2", "3"]),
    correct_answer: "2",
    difficulty: "medium"
  },
];

// First Year TITA Numerical Questions
const firstYearTITANumerical = [
  {
    year_level: 1,
    question: "How many keywords are there in ANSI C?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "32",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "How many types of tokens exist in C?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "6",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "How many storage classes are supported in C?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "4",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "How many basic data types are defined in ANSI C?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "4",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "What is the maximum length (in characters) of an identifier in ANSI C?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "31",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "How many bytes are used to store a float in a 32-bit C system?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "4",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "What is the ASCII value of the character 'A'?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "65",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "How many escape sequences are defined in standard C?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "15",
    difficulty: "medium"
  }
];

// First Year TITA String Questions
const firstYearTITAString = [
  {
    year_level: 1,
    question: "What is the keyword used in C to define a constant value that cannot be changed during execution?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "const",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "Which keyword is used to define a user-defined data type in C?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "typedef",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "Which header file is required to use standard input and output functions like printf and scanf?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "stdio.h",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "What is the keyword used to allocate memory dynamically in C?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "malloc",
    difficulty: "medium"
  },
  {
    year_level: 1,
    question: "Which keyword is used to exit a loop prematurely in C?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "break",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "What keyword is used to return control from a function to the calling function?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "return",
    difficulty: "easy"
  },
  {
    year_level: 1,
    question: "Which C library function is used to find the length of a string?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "strlen",
    difficulty: "easy"
  }
];

// Second Year MCQ Questions
const secondYearMCQs = [
  {
    year_level: 2,
    question: "What is the output of the following C++ code?\n\nint a = 10, b = 20;\ncout << a++ + ++b;",
    options: JSON.stringify(["30", "31", "32", "33"]),
    correct_answer: "32",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: JSON.stringify(["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"]),
    correct_answer: "Merge Sort",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "What does this Java code output?\n\nint x = 5;\nSystem.out.println(x >> 1);",
    options: JSON.stringify(["2", "2.5", "3", "1"]),
    correct_answer: "2",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "Which of these data structures is used in recursion?",
    options: JSON.stringify(["Queue", "Array", "Stack", "Linked List"]),
    correct_answer: "Stack",
    difficulty: "easy"
  },
  {
    year_level: 2,
    question: "What is the output of this C++ code?\n\nint x = 7;\nint y = x & 3;\ncout << y;",
    options: JSON.stringify(["1", "3", "2", "0"]),
    correct_answer: "3",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "Which of the following is *not* a property of dynamic programming?",
    options: JSON.stringify(["Optimal Substructure", "Memoization", "Greedy Choice", "Overlapping Subproblems"]),
    correct_answer: "Greedy Choice",
    difficulty: "hard"
  },
  {
    year_level: 2,
    question: "What will be the output of the following Java code?\n\nint arr[] = {1, 2, 3};\nSystem.out.println(arr[1]);",
    options: JSON.stringify(["1", "2", "3", "Compilation Error"]),
    correct_answer: "2",
    difficulty: "easy"
  },
  {
    year_level: 2,
    question: "Which of the following traversal methods is used in Depth First Search?",
    options: JSON.stringify(["Level Order", "Breadth First", "Preorder", "Inorder"]),
    correct_answer: "Preorder",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "What will be the output of the following code snippet?\n\nint a = 5;\ncout << (a == 5 ? \"Five\" : \"Not Five\");",
    options: JSON.stringify(["Five", "Not Five", "Error", "None"]),
    correct_answer: "Five",
    difficulty: "easy"
  },
  {
    year_level: 2,
    question: "Which data structure gives O(1) time complexity for insertion and deletion at both ends?",
    options: JSON.stringify(["Stack", "Queue", "Deque", "Array"]),
    correct_answer: "Deque",
    difficulty: "medium"
  },
];

// Second Year TITA Numerical Questions
const secondYearTITANumerical = [
  {
    year_level: 2,
    question: "What is the total number of steps required to find an element using Binary Search in a sorted array of 8 elements in the worst case?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "3",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "How many types of inheritance are supported in C++?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "5",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "What is the total number of recursive calls made in Merge Sort for an array of 8 elements?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "7",
    difficulty: "hard"
  },
  {
    year_level: 2,
    question: "What is the default size (in bytes) of an int in Java?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "4",
    difficulty: "easy"
  },
  {
    year_level: 2,
    question: "What is the maximum number of child nodes a binary tree node can have?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "2",
    difficulty: "easy"
  },
  {
    year_level: 2,
    question: "What is the number of comparisons in the worst-case scenario for Linear Search in an array of 10 elements?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "10",
    difficulty: "easy"
  },
  {
    year_level: 2,
    question: "What is the maximum number of elements in a heap with height 3 (binary heap)?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "15",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "How many bits are there in a Java char data type?",
    options: JSON.stringify(["Enter a numerical value"]),
    correct_answer: "16",
    difficulty: "medium"
  }
];

// Second Year TITA String Questions
const secondYearTITAString = [
  {
    year_level: 2,
    question: "In Java, which keyword is used to achieve runtime polymorphism?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "override",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "In C++, which concept allows multiple functions to have the same name with different parameters?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "function overloading",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "What is the data structure used in BFS traversal?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "queue",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "In Java, which keyword is used to prevent a method from being overridden?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "final",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "Which algorithmic paradigm is used in Merge Sort?",
    options: JSON.stringify(["Enter a single word or phrase"]),
    correct_answer: "divide and conquer",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "Which C++ concept allows a base class pointer to refer to a derived class object?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "polymorphism",
    difficulty: "medium"
  },
  {
    year_level: 2,
    question: "Which Java feature allows one class to inherit from another?",
    options: JSON.stringify(["Enter a single word"]),
    correct_answer: "inheritance",
    difficulty: "easy"
  }
];

// Third Year placeholder questions (you'll need to add real ones)
const thirdYearQuestions = [
  {
    year_level: 3,
    question: "What design pattern is used to decouple an abstraction from its implementation?",
    options: JSON.stringify(["Adapter", "Bridge", "Composite", "Decorator"]),
    correct_answer: "Bridge",
    difficulty: "hard"
  },
  {
    year_level: 3,
    question: "Which of the following is NOT a microservice architecture pattern?",
    options: JSON.stringify(["API Gateway", "Circuit Breaker", "Monolithic Design", "Service Discovery"]),
    correct_answer: "Monolithic Design",
    difficulty: "medium"
  },
  {
    year_level: 3,
    question: "In cloud computing, what does IaaS stand for?",
    options: JSON.stringify(["Internet as a Service", "Infrastructure as a Service", "Integration as a Service", "Identity as a Service"]),
    correct_answer: "Infrastructure as a Service",
    difficulty: "medium"
  },
  {
    year_level: 3,
    question: "Which of these is a DevOps practice?",
    options: JSON.stringify(["Waterfall development", "Continuous Integration", "Big Design Up Front", "Manual deployments"]),
    correct_answer: "Continuous Integration",
    difficulty: "medium"
  },
  {
    year_level: 3,
    question: "What is the time complexity of the Dijkstra's algorithm using a priority queue?",
    options: JSON.stringify(["O(V)", "O(V + E)", "O(V log V)", "O(V^2)"]),
    correct_answer: "O(V log V)",
    difficulty: "hard"
  },
];

// Combine all questions
const allQuestions = [
  ...firstYearMCQs, 
  ...firstYearTITANumerical, 
  ...firstYearTITAString,
  ...secondYearMCQs, 
  ...secondYearTITANumerical, 
  ...secondYearTITAString,
  ...thirdYearQuestions
];

// Function to update questions in the database
async function updateQuestions() {
  try {
    console.log('Updating questions in the database...');

    // First, remove existing questions for better control
    await Question.deleteMany({});
    console.log('Existing questions removed');

    // Insert all new questions
    await Question.insertMany(allQuestions);
    
    console.log(`Total ${allQuestions.length} questions added to the database`);
    console.log(`Year 1: ${firstYearMCQs.length + firstYearTITANumerical.length + firstYearTITAString.length} questions`);
    console.log(`Year 2: ${secondYearMCQs.length + secondYearTITANumerical.length + secondYearTITAString.length} questions`);
    console.log(`Year 3: ${thirdYearQuestions.length} questions`);

  } catch (error) {
    console.error('Error updating questions:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
connectDB().then(() => {
  updateQuestions();
});
