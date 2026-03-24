// AITMS/backend/routes/collegeRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import College from '../models/College.js';

const router = express.Router();

// Get all colleges (protected route)
router.get('/all', protect, async (req, res) => {
  try {
    const colleges = await College.find().select('-password');
    res.json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get college by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const college = await College.findById(req.params.id).select('-password');
    
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      });
    }
    
    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

export default router;