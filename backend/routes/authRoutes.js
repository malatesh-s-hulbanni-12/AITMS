// AITMS/backend/routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { 
  registerCollege, 
  loginCollege, 
  getProfile,
  updateProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('collegeName')
    .notEmpty().withMessage('College name is required')
    .isLength({ min: 3 }).withMessage('College name must be at least 3 characters'),
  body('collegeEmail')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('state')
    .notEmpty().withMessage('State is required'),
  body('district')
    .notEmpty().withMessage('District is required'),
  body('address')
    .notEmpty().withMessage('Address is required')
];

const loginValidation = [
  body('collegeEmail')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, registerCollege);
router.post('/login', loginValidation, loginCollege);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;