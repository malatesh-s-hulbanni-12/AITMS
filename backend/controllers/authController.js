// AITMS/backend/controllers/authController.js
import College from '../models/College.js';
import LoginHistory from '../models/LoginHistory.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

// @desc    Register a new college
// @route   POST /api/auth/register
// @access  Public
export const registerCollege = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { collegeName, collegeEmail, password, state, district, address } = req.body;

    // Check if college already exists
    const existingCollege = await College.findOne({ collegeEmail });
    if (existingCollege) {
      return res.status(400).json({ 
        success: false, 
        message: 'College with this email already exists' 
      });
    }

    // Create new college
    const college = await College.create({
      collegeName,
      collegeEmail,
      password,
      state,
      district,
      address
    });

    // Generate token
    const token = generateToken(college._id);

    res.status(201).json({
      success: true,
      message: 'College registered successfully',
      data: {
        _id: college._id,
        collegeName: college.collegeName,
        collegeEmail: college.collegeEmail,
        state: college.state,
        district: college.district,
        address: college.address,
        role: college.role,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// @desc    Login college
// @route   POST /api/auth/login
// @access  Public
export const loginCollege = async (req, res) => {
  try {
    const { collegeEmail, password } = req.body;

    // Check if college exists
    const college = await College.findOne({ collegeEmail }).select('+password');
    
    if (!college) {
      // Log failed login attempt
      await LoginHistory.create({
        collegeId: null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failed'
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordMatch = await college.comparePassword(password);
    
    if (!isPasswordMatch) {
      // Log failed login attempt
      await LoginHistory.create({
        collegeId: college._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failed'
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    college.lastLogin = Date.now();
    await college.save({ validateBeforeSave: false });

    // Log successful login
    await LoginHistory.create({
      collegeId: college._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // Generate token
    const token = generateToken(college._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: college._id,
        collegeName: college.collegeName,
        collegeEmail: college.collegeEmail,
        state: college.state,
        district: college.district,
        role: college.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// @desc    Get current college profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const college = await College.findById(req.college._id);
    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update college profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { collegeName, state, district, address } = req.body;
    
    const college = await College.findById(req.college._id);
    
    if (college) {
      college.collegeName = collegeName || college.collegeName;
      college.state = state || college.state;
      college.district = district || college.district;
      college.address = address || college.address;
      
      const updatedCollege = await college.save();
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedCollege
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};