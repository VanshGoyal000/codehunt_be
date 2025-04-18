const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const { adminAuth } = require('../middleware/auth');
const { User, Question, Response, Setting } = require('../models');

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../data/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Create a new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username,
      password: hashedPassword
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: 'User created successfully',
      userId: newUser._id
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Bulk create users
router.post('/users/bulk', adminAuth, async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ message: 'Users array is required' });
    }
    
    const results = [];
    let succeeded = 0;
    let failed = 0;
    
    for (const user of users) {
      try {
        // Check if username exists
        const existingUser = await User.findOne({ username: user.username });
        if (existingUser) {
          failed++;
          results.push({ 
            username: user.username, 
            success: false, 
            error: 'Username already exists' 
          });
          continue;
        }
        
        // Hash password and create user
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const newUser = new User({
          username: user.username,
          password: hashedPassword
        });
        
        await newUser.save();
        
        succeeded++;
        results.push({ 
          username: user.username, 
          success: true, 
          id: newUser._id 
        });
      } catch (err) {
        failed++;
        results.push({ 
          username: user.username, 
          success: false, 
          error: err.message 
        });
      }
    }
    
    res.json({
      message: `Created ${succeeded} users, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error("Error creating bulk users:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Import users from Excel file
router.post('/users/import', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel file is required' });
    }
    
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const results = [];
    let created = 0;
    let failed = 0;
    
    for (const row of data) {
      try {
        const username = row.username || row.Username;
        const password = row.password || row.Password;
        
        if (!username || !password) {
          failed++;
          results.push({ 
            username: username || 'Unknown', 
            success: false, 
            error: 'Invalid data: username or password missing' 
          });
          continue;
        }
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          failed++;
          results.push({ username, success: false, error: 'Username already exists' });
          continue;
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
          username,
          password: hashedPassword
        });
        
        await user.save();
        created++;
        results.push({ username, success: true, id: user._id });
      } catch (error) {
        failed++;
        results.push({ 
          username: row.username || 'Unknown', 
          success: false, 
          error: error.message 
        });
      }
    }
    
    // Delete the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      message: `Created ${created} users, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error('Import users error:', error);
    // Delete the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ username: { $ne: 'admin' } })
      .select('id username warnings created_at');
    
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Generate user template Excel
router.get('/users/template', adminAuth, (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');
    
    sheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Password', key: 'password', width: 20 }
    ];
    
    // Add a sample row
    sheet.addRow({ username: 'student1', password: 'pass123' });
    sheet.addRow({ username: 'student2', password: 'pass456' });
    
    // Add instructions
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.mergeCells('A1:B1');
    instructionsSheet.getCell('A1').value = 'User Import Template Instructions';
    instructionsSheet.getCell('A1').font = { size: 16, bold: true };
    
    instructionsSheet.mergeCells('A3:B7');
    instructionsSheet.getCell('A3').value = 
      '1. Fill in the Users sheet with student usernames and passwords\n' +
      '2. Each row represents one user account\n' +
      '3. Do not modify the header row\n' +
      '4. Save the file and import it using the "Import Users" function';
    
    // Set content type and disposition
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.xlsx');
    
    // Send the workbook
    workbook.xlsx.write(res)
      .then(() => {
        console.log('User template Excel sent');
      })
      .catch(error => {
        console.error('Error sending user template:', error);
        res.status(500).json({ message: 'Error generating template' });
      });
  } catch (error) {
    console.error('Generate template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export results to Excel
router.get('/export-results', adminAuth, async (req, res) => {
  try {
    // Get all users and their responses
    const users = await User.find({ username: { $ne: 'admin' } })
      .select('id username warnings fullscreenViolations')
      .lean();
    
    // Get all questions with correct answers
    const questions = await Question.find()
      .select('_id year_level question correct_answer')
      .lean();
    
    // Get all responses
    const responses = await Response.find()
      .lean();
    
    // Calculate scores for each user by year level
    const userResults = users.map(user => {
      // Initialize results for each year level
      const yearResults = {
        year1: { attempted: false, score: 0, total: 0 },
        year2: { attempted: false, score: 0, total: 0 },
        year3: { attempted: false, score: 0, total: 0 },
      };
      
      // Process each year level separately
      for (let year = 1; year <= 3; year++) {
        const userResponse = responses.find(
          r => r.user_id.toString() === user._id.toString() && r.year_level === year
        );
        
        if (!userResponse) continue;
        
        yearResults[`year${year}`].attempted = true;
        
        const yearQuestions = questions.filter(q => q.year_level === year);
        yearResults[`year${year}`].total = yearQuestions.length;
        
        try {
          const userAnswers = JSON.parse(userResponse.answers);
          
          yearQuestions.forEach(question => {
            if (userAnswers[question._id]?.toString() === question.correct_answer) {
              yearResults[`year${year}`].score++;
            }
          });
        } catch (err) {
          console.error(`Error parsing answers for user ${user.username}:`, err);
        }
      }
      
      return {
        username: user.username,
        year1Score: yearResults.year1.score,
        year1Total: yearResults.year1.total,
        year1Attempted: yearResults.year1.attempted,
        year2Score: yearResults.year2.score,
        year2Total: yearResults.year2.total,
        year2Attempted: yearResults.year2.attempted,
        year3Score: yearResults.year3.score,
        year3Total: yearResults.year3.total,
        year3Attempted: yearResults.year3.attempted,
        totalScore: yearResults.year1.score + yearResults.year2.score + yearResults.year3.score,
        warnings: user.warnings || 0,
        fullscreenViolations: user.fullscreenViolations || 0
      };
    });
    
    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet("All Results");
    const year1Sheet = workbook.addWorksheet("1st Year Results");
    const year2Sheet = workbook.addWorksheet("2nd Year Results");
    const year3Sheet = workbook.addWorksheet("3rd Year Results");
    
    // Add headers to main sheet
    mainSheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: '1st Year Score', key: 'year1Score', width: 15 },
      { header: '2nd Year Score', key: 'year2Score', width: 15 },
      { header: '3rd Year Score', key: 'year3Score', width: 15 },
      { header: 'Total Score', key: 'totalScore', width: 15 },
      { header: 'Warnings', key: 'warnings', width: 15 },
      { header: 'Fullscreen Violations', key: 'fullscreenViolations', width: 20 }
    ];
    
    // Add headers to year-specific sheets
    [year1Sheet, year2Sheet, year3Sheet].forEach((sheet, idx) => {
      const yearNum = idx + 1;
      sheet.columns = [
        { header: 'Username', key: 'username', width: 20 },
        { header: `Year ${yearNum} Score`, key: `year${yearNum}Score`, width: 15 },
        { header: 'Total Questions', key: `year${yearNum}Total`, width: 15 },
        { header: 'Percentage', key: 'percentage', width: 15 },
        { header: 'Warnings', key: 'warnings', width: 15 },
        { header: 'Fullscreen Violations', key: 'fullscreenViolations', width: 20 }
      ];
    });
    
    // Add title to each sheet
    [
      { sheet: mainSheet, title: 'CodeHunt - All Results' },
      { sheet: year1Sheet, title: 'CodeHunt - 1st Year Results' },
      { sheet: year2Sheet, title: 'CodeHunt - 2nd Year Results' },
      { sheet: year3Sheet, title: 'CodeHunt - 3rd Year Results' }
    ].forEach(({ sheet, title }) => {
      // Add title
      sheet.mergeCells('A1:G1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = title;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };
      
      // Add date
      sheet.mergeCells('A2:G2');
      const dateCell = sheet.getCell('A2');
      dateCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      dateCell.alignment = { horizontal: 'center' };
      
      // Add empty row
      sheet.addRow({});
    });
    
    // Add header styling to each sheet
    [mainSheet, year1Sheet, year2Sheet, year3Sheet].forEach(sheet => {
      const headerRow = sheet.getRow(4);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
      });
    });
    
    // Add data rows to main sheet
    userResults.forEach(result => {
      mainSheet.addRow(result);
    });
    
    // Add data to year-specific sheets with calculated percentage
    for (const result of userResults) {
      // Year 1 sheet
      if (result.year1Attempted) {
        const percentage = result.year1Total > 0 
          ? ((result.year1Score / result.year1Total) * 100).toFixed(2) + '%'
          : 'N/A';
        year1Sheet.addRow({
          ...result,
          percentage
        });
      }
      
      // Year 2 sheet
      if (result.year2Attempted) {
        const percentage = result.year2Total > 0 
          ? ((result.year2Score / result.year2Total) * 100).toFixed(2) + '%'
          : 'N/A';
        year2Sheet.addRow({
          ...result,
          percentage
        });
      }
      
      // Year 3 sheet
      if (result.year3Attempted) {
        const percentage = result.year3Total > 0 
          ? ((result.year3Score / result.year3Total) * 100).toFixed(2) + '%'
          : 'N/A';
        year3Sheet.addRow({
          ...result,
          percentage
        });
      }
    }
    
    // Sort each year sheet by score (highest first)
    [
      { sheet: year1Sheet, scoreKey: 'year1Score' },
      { sheet: year2Sheet, scoreKey: 'year2Score' },
      { sheet: year3Sheet, scoreKey: 'year3Score' }
    ].forEach(({ sheet, scoreKey }) => {
      // Skip header rows
      const dataRows = sheet.getRows(5, sheet.rowCount - 4);
      if (dataRows) {
        // Sort by score (descending)
        dataRows.sort((a, b) => {
          return b.getCell(scoreKey).value - a.getCell(scoreKey).value;
        });
      }
    });
    
    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set headers and send response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=codehunt_results.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting results', error: error.message });
  }
});

// Download quiz questions template
router.get('/questions/template', adminAuth, (req, res) => {
  try {
    const questionsPath = path.resolve(__dirname, '../data/quiz_questions.xlsx');
    
    // If the file doesn't exist, return error
    if (!fs.existsSync(questionsPath)) {
      return res.status(404).json({ message: 'Quiz questions template not found' });
    }
    
    // Send the file
    res.download(questionsPath, 'quiz_questions_template.xlsx', (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set quiz status (enabled/disabled)
router.post('/quiz-status', adminAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Quiz status must be a boolean' });
    }
    
    // Find and update the quiz status setting
    let setting = await Setting.findOne({ key: 'quiz_enabled' });
    
    if (setting) {
      setting.value = enabled;
      setting.updated_at = new Date();
      setting.updated_by = req.user._id;
      await setting.save();
    } else {
      // Create a new setting if it doesn't exist
      setting = new Setting({
        key: 'quiz_enabled',
        value: enabled,
        updated_by: req.user._id
      });
      await setting.save();
    }
    
    res.json({ 
      message: enabled ? 'Quiz is now enabled for all users' : 'Quiz is now disabled for all users',
      status: enabled
    });
  } catch (error) {
    console.error('Quiz status update error:', error);
    res.status(500).json({ message: 'Error updating quiz status', error: error.message });
  }
});

// Get quiz status
router.get('/quiz-status', adminAuth, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'quiz_enabled' });
    
    res.json({ 
      enabled: setting ? setting.value : true,
      updated_at: setting ? setting.updated_at : null
    });
  } catch (error) {
    console.error('Quiz status fetch error:', error);
    res.status(500).json({ message: 'Error fetching quiz status', error: error.message });
  }
});

module.exports = router;
