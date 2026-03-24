// AITMS/backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import College from '../models/College.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get college from token
      req.college = await College.findById(decoded.id).select('-password');
      
      if (!req.college) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};