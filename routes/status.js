const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple status endpoint for frontend health checking
router.get('/', async (req, res) => {
  try {
    const status = {
      serverStatus: 'ok',
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(status);
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ 
      serverStatus: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
