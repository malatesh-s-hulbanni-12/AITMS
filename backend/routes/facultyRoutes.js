// AITMS/backend/routes/facultyRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  addFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyStats
} from '../controllers/facultyController.js';

const router = express.Router();

// Validation rules for adding faculty
const facultyValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).withMessage('Please enter a valid phone number'),
  body('department')
    .notEmpty().withMessage('Department is required')
    .isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'])
    .withMessage('Invalid department'),
  body('designation')
    .notEmpty().withMessage('Designation is required'),
  body('qualification')
    .notEmpty().withMessage('Qualification is required'),
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isNumeric().withMessage('Experience must be a number')
    .custom(value => value >= 0 && value <= 50).withMessage('Experience must be between 0 and 50 years'),
  body('address')
    .notEmpty().withMessage('Address is required')
];

// All routes are protected
router.use(protect);

// Faculty routes
router.post('/add', facultyValidation, addFaculty);
router.get('/all', getAllFaculty);
router.get('/stats', getFacultyStats);
router.get('/:id', getFacultyById);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);

// AITMS/backend/routes/facultyRoutes.js
// Add this endpoint

// @desc    Get faculty profile by email
// @route   GET /api/faculty/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  console.log('🔍 Fetching faculty profile for email:', req.query.email);
  
  try {
    const faculty = await Faculty.findOne({ 
      email: req.query.email,
      collegeId: req.college._id,
      isActive: true 
    });

    if (!faculty) {
      return res.status(404).json({ 
        success: false, 
        message: 'Faculty not found' 
      });
    }

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('❌ Error fetching faculty:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

export default router;