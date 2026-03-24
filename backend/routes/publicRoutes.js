// AITMS/backend/routes/publicRoutes.js
import express from 'express';
import Faculty from '../models/Faculty.js';
import Timetable from '../models/Timetable.js';

const router = express.Router();

// Public endpoint to get faculty by email
router.get('/faculty/by-email/:email', async (req, res) => {
  console.log('📡 Public API - Fetching faculty by email:', req.params.email);
  
  try {
    const faculty = await Faculty.findOne({ 
      email: req.params.email,
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
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get timetable for a specific department and semester (FOR STUDENTS)
// This is the missing endpoint that your student chat is trying to access
router.get('/timetable/department/:department/semester/:semester', async (req, res) => {
  console.log('\n📡 ===== PUBLIC API - FETCHING TIMETABLE FOR STUDENTS =====');
  console.log('Department:', req.params.department);
  console.log('Semester:', req.params.semester);
  
  try {
    const semesterNum = parseInt(req.params.semester);
    
    // Find the most recent timetable for this department and semester
    const timetables = await Timetable.find({
      department: req.params.department,
      semester: semesterNum,
      isActive: true
    }).sort({ createdAt: -1 }); // Most recent first

    console.log(`✅ Found ${timetables.length} timetables`);

    if (!timetables || timetables.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No timetable found for this department and semester' 
      });
    }

    // Get the latest timetable
    const latestTimetable = timetables[0];
    
    console.log(`📋 Latest timetable has ${latestTimetable.entries?.length || 0} entries`);

    res.json({
      success: true,
      data: {
        _id: latestTimetable._id,
        department: latestTimetable.department,
        semester: latestTimetable.semester,
        academicYear: latestTimetable.academicYear,
        entries: latestTimetable.entries || [],
        createdAt: latestTimetable.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Get ALL timetables for a teacher (all versions)
router.get('/timetable/teacher/:facultyId', async (req, res) => {
  console.log('\n📡 ===== PUBLIC API - FETCHING ALL TEACHER TIMETABLES =====');
  console.log('Faculty ID:', req.params.facultyId);
  
  try {
    // Find ALL timetables that have entries for this faculty
    const timetables = await Timetable.find({
      'entries.facultyId': req.params.facultyId,
      isActive: true
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${timetables.length} timetables containing this faculty`);

    if (!timetables || timetables.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No timetables found for this teacher' 
      });
    }

    // Process each timetable to extract ONLY this teacher's entries
    const processedTimetables = timetables.map(timetable => {
      const teacherEntries = timetable.entries.filter(
        entry => entry.facultyId.toString() === req.params.facultyId
      );

      return {
        _id: timetable._id,
        department: timetable.department,
        semester: timetable.semester,
        academicYear: timetable.academicYear,
        createdAt: timetable.createdAt,
        version: timetable.version,
        entries: teacherEntries
      };
    });

    const allEntries = [];
    timetables.forEach(timetable => {
      const teacherEntries = timetable.entries.filter(
        entry => entry.facultyId.toString() === req.params.facultyId
      );
      allEntries.push(...teacherEntries);
    });

    console.log(`📋 Total entries across all timetables: ${allEntries.length}`);

    res.json({
      success: true,
      data: {
        timetables: processedTimetables,
        allEntries: allEntries,
        totalEntries: allEntries.length,
        facultyId: req.params.facultyId,
        facultyName: allEntries[0]?.facultyName || 'Unknown'
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

export default router;