// AITMS/backend/controllers/timetableController.js
import Timetable from '../models/Timetable.js';
import Faculty from '../models/Faculty.js';
import College from '../models/College.js';

// @desc    Create new timetable
// @route   POST /api/timetable/create
// @access  Private (Admin only)
export const createTimetable = async (req, res) => {
  console.log('\n📅 ===== CREATE TIMETABLE =====');
  console.log('College ID:', req.college._id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      department,
      semester,
      entries,
      academicYear,
      validFrom,
      validTo,
      remarks
    } = req.body;

    // Validate required fields
    if (!department || !semester || !entries || !Array.isArray(entries)) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Department, semester, and entries are required'
      });
    }

    if (entries.length === 0) {
      console.log('❌ No entries provided');
      return res.status(400).json({
        success: false,
        message: 'At least one timetable entry is required'
      });
    }

    // Get college info
    const college = await College.findById(req.college._id);
    if (!college) {
      console.log('❌ College not found');
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }
    console.log('✅ College found:', college.collegeName);

    // Validate each entry has required fields
    console.log('🔍 Validating entries...');
    for (const entry of entries) {
      if (!entry.day || !entry.timeSlot || !entry.subject || 
          !entry.facultyId || !entry.room || !entry.startTime || !entry.endTime) {
        console.log('❌ Entry missing required fields:', entry);
        return res.status(400).json({
          success: false,
          message: 'Each entry must have day, timeSlot, subject, facultyId, room, startTime, endTime'
        });
      }

      // Verify faculty exists and belongs to this college
      const faculty = await Faculty.findOne({
        _id: entry.facultyId,
        collegeId: req.college._id,
        isActive: true
      });

      if (!faculty) {
        console.log(`❌ Faculty with ID ${entry.facultyId} not found`);
        return res.status(400).json({
          success: false,
          message: `Faculty with ID ${entry.facultyId} not found in your college`
        });
      }

      console.log(`✅ Faculty found: ${faculty.name}`);
      // Set faculty name from database
      entry.facultyName = faculty.name;
    }

    // Check for conflicts across all timetables
    console.log('🔍 Checking for conflicts...');
    const conflicts = await Timetable.checkConflicts(
      req.college._id,
      entries
    );

    if (conflicts.faculty.length > 0 || conflicts.room.length > 0) {
      console.log('❌ Conflicts detected:', conflicts);
      return res.status(409).json({
        success: false,
        message: 'Scheduling conflicts detected',
        conflicts
      });
    }

    // Create new timetable
    console.log('📝 Creating new timetable...');
    const timetable = await Timetable.create({
      collegeId: req.college._id,
      collegeName: college.collegeName,
      department,
      semester: parseInt(semester),
      academicYear: academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      entries,
      createdBy: req.college._id,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validTo: validTo ? new Date(validTo) : null,
      remarks
    });

    console.log('✅ Timetable created successfully. ID:', timetable._id);
    console.log('📊 Total entries:', timetable.entries.length);

    res.status(201).json({
      success: true,
      message: 'Timetable created successfully',
      data: timetable
    });
  } catch (error) {
    console.error('❌ Error creating timetable:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle conflict errors
    if (error.conflicts) {
      return res.status(409).json({
        success: false,
        message: error.message,
        conflicts: error.conflicts
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all timetables for a college
// @route   GET /api/timetable/all
// @access  Private
export const getAllTimetables = async (req, res) => {
  console.log('\n📋 ===== GET ALL TIMETABLES =====');
  console.log('College ID:', req.college._id);
  console.log('Query params:', req.query);
  
  try {
    const { department, semester, academicYear, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { 
      collegeId: req.college._id, 
      isActive: true 
    };

    if (department && department !== 'all' && department !== 'undefined') {
      query.department = department;
      console.log('Filtering by department:', department);
    }

    if (semester && semester !== 'all' && semester !== 'undefined') {
      query.semester = parseInt(semester);
      console.log('Filtering by semester:', semester);
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));

    // Execute query with pagination
    const timetables = await Timetable.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'collegeName');

    const total = await Timetable.countDocuments(query);

    console.log(`✅ Found ${timetables.length} timetables`);
    
    if (timetables.length > 0) {
      console.log('📋 First timetable:', {
        id: timetables[0]._id,
        department: timetables[0].department,
        semester: timetables[0].semester,
        entriesCount: timetables[0].entries?.length || 0
      });
      
      // Log first few entries if they exist
      if (timetables[0].entries && timetables[0].entries.length > 0) {
        console.log('📋 Sample entries (first 3):');
        timetables[0].entries.slice(0, 3).forEach((entry, idx) => {
          console.log(`  Entry ${idx + 1}:`, {
            day: entry.day,
            timeSlot: entry.timeSlot,
            subject: entry.subject,
            faculty: entry.facultyName,
            room: entry.room
          });
        });
      } else {
        console.log('⚠️ No entries in this timetable');
      }
    }

    res.json({
      success: true,
      data: timetables,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get single timetable by ID
// @route   GET /api/timetable/:id
// @access  Private
export const getTimetableById = async (req, res) => {
  console.log('\n🔍 ===== GET TIMETABLE BY ID =====');
  console.log('Timetable ID:', req.params.id);

  try {
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      collegeId: req.college._id,
      isActive: true
    }).populate('entries.facultyId', 'name email department designation');

    if (!timetable) {
      console.log('❌ Timetable not found');
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    console.log('✅ Timetable found:', timetable._id);
    console.log('📊 Entries count:', timetable.entries?.length || 0);

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('❌ Error fetching timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update timetable
// @route   PUT /api/timetable/:id
// @access  Private
// AITMS/backend/controllers/timetableController.js
// Update the updateTimetable function with better error handling

export const updateTimetable = async (req, res) => {
  console.log('\n✏️ ===== UPDATE TIMETABLE =====');
  console.log('Timetable ID:', req.params.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User college ID:', req.college?._id);

  try {
    const { entries, department, semester } = req.body;

    // Validate required fields
    if (!entries) {
      console.log('❌ No entries provided');
      return res.status(400).json({
        success: false,
        message: 'Entries are required'
      });
    }

    if (!Array.isArray(entries)) {
      console.log('❌ Entries is not an array');
      return res.status(400).json({
        success: false,
        message: 'Entries must be an array'
      });
    }

    console.log(`📋 Processing ${entries.length} entries`);

    // Find the timetable
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      collegeId: req.college._id,
      isActive: true
    });

    if (!timetable) {
      console.log('❌ Timetable not found');
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    console.log('✅ Found timetable:', {
      id: timetable._id,
      department: timetable.department,
      semester: timetable.semester,
      currentEntries: timetable.entries?.length || 0
    });

    // Validate each entry
    const validatedEntries = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Check required fields
      if (!entry.day || !entry.timeSlot || !entry.subject || 
          !entry.facultyId || !entry.room) {
        console.log(`❌ Entry ${i + 1} missing required fields:`, entry);
        return res.status(400).json({
          success: false,
          message: `Entry ${i + 1} missing required fields`
        });
      }

      // Verify faculty exists
      const faculty = await Faculty.findOne({
        _id: entry.facultyId,
        collegeId: req.college._id,
        isActive: true
      });

      if (!faculty) {
        console.log(`❌ Faculty ${entry.facultyId} not found`);
        return res.status(400).json({
          success: false,
          message: `Faculty with ID ${entry.facultyId} not found`
        });
      }

      validatedEntries.push({
        day: entry.day,
        timeSlot: entry.timeSlot,
        startTime: entry.startTime || entry.timeSlot.split(' - ')[0],
        endTime: entry.endTime || entry.timeSlot.split(' - ')[1],
        subject: entry.subject,
        facultyId: entry.facultyId,
        facultyName: faculty.name,
        room: entry.room,
        department: entry.department || timetable.department,
        semester: entry.semester || timetable.semester
      });
    }

    // Update timetable
    timetable.entries = validatedEntries;
    if (department) timetable.department = department;
    if (semester) timetable.semester = parseInt(semester);
    
    timetable.version += 1;
    timetable.updatedAt = new Date();

    await timetable.save();
    console.log('✅ Timetable updated successfully');

    // Return updated timetable
    const updatedTimetable = await Timetable.findById(timetable._id)
      .populate('entries.facultyId', 'name email department');

    res.json({
      success: true,
      message: 'Timetable updated successfully',
      data: updatedTimetable
    });

  } catch (error) {
    console.error('❌ Error in updateTimetable:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// AITMS/backend/controllers/timetableController.js

// Add this new function
// @desc    Get today's schedule
// @route   GET /api/timetable/today
// @access  Private
export const getTodaySchedule = async (req, res) => {
  console.log('\n📅 ===== GET TODAY\'S SCHEDULE =====');
  console.log('College ID:', req.college._id);
  
  try {
    const { day } = req.query;
    
    if (!day) {
      return res.status(400).json({
        success: false,
        message: 'Day parameter is required'
      });
    }

    console.log('Fetching schedule for day:', day);

    // Find all active timetables for this college
    const timetables = await Timetable.find({
      collegeId: req.college._id,
      isActive: true
    });

    let allEntries = [];
    timetables.forEach(timetable => {
      const dayEntries = timetable.entries.filter(entry => entry.day === day);
      allEntries = [...allEntries, ...dayEntries];
    });

    // Sort by time
    allEntries.sort((a, b) => {
      const timeA = a.timeSlot.split(' - ')[0];
      const timeB = b.timeSlot.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });

    console.log(`✅ Found ${allEntries.length} classes for ${day}`);

    res.json({
      success: true,
      data: {
        count: allEntries.length,
        entries: allEntries.slice(0, 10) // Limit to 10 for performance
      }
    });

  } catch (error) {
    console.error('❌ Error fetching today\'s schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Delete timetable (soft delete)
// @route   DELETE /api/timetable/:id
// @access  Private
export const deleteTimetable = async (req, res) => {
  console.log('\n🗑️ ===== DELETE TIMETABLE =====');
  console.log('Timetable ID:', req.params.id);

  try {
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      collegeId: req.college._id
    });

    if (!timetable) {
      console.log('❌ Timetable not found');
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Soft delete
    timetable.isActive = false;
    await timetable.save();

    console.log('✅ Timetable deleted successfully');

    res.json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get timetable statistics
// @route   GET /api/timetable/stats
// @access  Private
export const getTimetableStats = async (req, res) => {
  console.log('\n📊 ===== GET TIMETABLE STATS =====');

  try {
    const totalTimetables = await Timetable.countDocuments({
      collegeId: req.college._id,
      isActive: true
    });

    const departmentStats = await Timetable.aggregate([
      { $match: { collegeId: req.college._id, isActive: true } },
      { $group: {
          _id: '$department',
          count: { $sum: 1 },
          semesters: { $addToSet: '$semester' }
      }},
      { $sort: { count: -1 } }
    ]);

    const recentTimetables = await Timetable.find({
      collegeId: req.college._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('department semester academicYear createdAt');

    console.log('✅ Stats fetched successfully');
    console.log('📊 Total timetables:', totalTimetables);

    res.json({
      success: true,
      data: {
        total: totalTimetables,
        departmentStats,
        recent: recentTimetables
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Check for conflicts
// @route   POST /api/timetable/check-conflicts
// @access  Private
export const checkConflicts = async (req, res) => {
  console.log('\n⚠️ ===== CHECK CONFLICTS =====');
  console.log('Checking conflicts for entries:', req.body.entries?.length || 0);

  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      console.log('❌ Invalid entries format');
      return res.status(400).json({
        success: false,
        message: 'Entries array is required'
      });
    }

    const conflicts = await Timetable.checkConflicts(req.college._id, entries);

    console.log('✅ Conflict check complete');
    console.log('Faculty conflicts:', conflicts.faculty.length);
    console.log('Room conflicts:', conflicts.room.length);

    res.json({
      success: true,
      conflicts,
      hasConflicts: conflicts.faculty.length > 0 || conflicts.room.length > 0
    });
  } catch (error) {
    console.error('❌ Error checking conflicts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};