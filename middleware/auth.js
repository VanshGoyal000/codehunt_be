const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Get token from header and handle different formats
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract token (support both "Bearer token" and just "token" formats)
    const token = authHeader.startsWith('Bearer ') ? 
      authHeader.substring(7) : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    auth(req, res, async () => {
      if (req.user && req.user.username === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: 'Admin access required' });
      }
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error in admin authentication' });
  }
};

module.exports = { auth, adminAuth };
