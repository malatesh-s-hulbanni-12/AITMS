// AITMS/backend/routes/timetableRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import Timetable from '../models/Timetable.js'; // Add this import
import {
  createTimetable,
  getAllTimetables,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
  getTimetableStats,
  checkConflicts
} from '../controllers/timetableController.js';

const router = express.Router();

// Validation for timetable entry
const entryValidation = [
  body('day')
    .notEmpty().withMessage('Day is required')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    .withMessage('Invalid day'),
  body('timeSlot')
    .notEmpty().withMessage('Time slot is required'),
  body('startTime')
    .notEmpty().withMessage('Start time is required'),
  body('endTime')
    .notEmpty().withMessage('End time is required'),
  body('subject')
    .notEmpty().withMessage('Subject is required'),
  body('facultyId')
    .notEmpty().withMessage('Faculty ID is required')
    .isMongoId().withMessage('Invalid faculty ID'),
  body('room')
    .notEmpty().withMessage('Room number is required'),
  body('department')
    .notEmpty().withMessage('Department is required'),
  body('semester')
    .notEmpty().withMessage('Semester is required')
    .isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
];

// All routes are protected
router.use(protect);

// ========== SPECIFIC ROUTES (must come before dynamic routes) ==========

// Get today's schedule
router.get('/today', async (req, res) => {
  console.log('📅 Fetching today\'s schedule for day:', req.query.day);
  
  try {
    const { day } = req.query;
    
    const timetables = await Timetable.find({
      collegeId: req.college._id,
      isActive: true
    });

    let allEntries = [];
    timetables.forEach(timetable => {
      const dayEntries = timetable.entries.filter(entry => entry.day === day);
      allEntries = [...allEntries, ...dayEntries];
    });

    res.json({
      success: true,
      data: {
        count: allEntries.length,
        entries: allEntries.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get timetable for a specific teacher
router.get('/teacher/:facultyId', async (req, res) => {
  console.log('📅 Fetching timetable for faculty:', req.params.facultyId);
  
  try {
    // Find timetable entries where this faculty is assigned
    const timetables = await Timetable.find({
      collegeId: req.college._id,
      isActive: true,
      'entries.facultyId': req.params.facultyId
    }).sort({ createdAt: -1 });

    if (!timetables || timetables.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No timetable found for this teacher' 
      });
    }

    // Get the most recent timetable
    const latestTimetable = timetables[0];
    
    // Filter entries for this specific teacher
    const teacherEntries = latestTimetable.entries.filter(
      entry => entry.facultyId.toString() === req.params.facultyId
    );

    const response = {
      ...latestTimetable.toObject(),
      entries: teacherEntries
    };

    console.log(`✅ Found ${teacherEntries.length} classes for teacher`);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('❌ Error fetching teacher timetable:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Get statistics
router.get('/stats', getTimetableStats);

// Get all timetables
router.get('/all', getAllTimetables);

// Check for conflicts
router.post('/check-conflicts', checkConflicts);

// ========== DYNAMIC ROUTES (with :id parameter) ==========

// Get timetable by ID
router.get('/:id', getTimetableById);

// Create new timetable
router.post(
  '/create',
  [
    body('department').notEmpty().withMessage('Department is required'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('entries').isArray({ min: 1 }).withMessage('At least one entry is required')
  ],
  createTimetable
);

// Update timetable
router.put('/:id', updateTimetable);

// Delete timetable
router.delete('/:id', deleteTimetable);

export default router;