// AITMS/backend/routes/clientRoutes.js (Complete updated file with student routes)
import express from 'express';
import College from '../models/College.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ========== COLLEGE ROUTES ==========

// Get all colleges for dropdown
router.get('/colleges/all', async (req, res) => {
  console.log('\n🔵 ===== GET /api/client/colleges/all =====');
  
  try {
    const colleges = await College.find()
      .select('_id collegeName district state')
      .sort({ collegeName: 1 });
    
    res.json({
      success: true,
      data: colleges
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== FACULTY ROUTES ==========

// Get faculty by college ID
router.get('/faculty/by-college/:collegeId', async (req, res) => {
  console.log('\n🟢 ===== GET /api/client/faculty/by-college/:collegeId =====');
  
  try {
    const faculty = await Faculty.find({ 
      collegeId: req.params.collegeId,
      isActive: true 
    })
    .select('_id name department designation email phone')
    .sort({ name: 1 });
    
    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== TEACHER ROUTES ==========

// Teacher login (without password)
router.post('/teacher/login', async (req, res) => {
  console.log('\n🟠 ===== POST /api/client/teacher/login =====');
  console.log('📋 Login attempt for email:', req.body.email);
  
  try {
    const { collegeId, facultyId, email } = req.body;
    
    if (!collegeId || !facultyId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const faculty = await Faculty.findOne({
      _id: facultyId,
      collegeId: collegeId,
      isActive: true
    }).populate('collegeId', 'collegeName');

    if (!faculty) {
      return res.status(401).json({ 
        success: false, 
        message: 'Faculty not found' 
      });
    }

    if (faculty.email !== email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email does not match our records' 
      });
    }

    const token = jwt.sign(
      { 
        id: faculty._id, 
        type: 'teacher', 
        collegeId: faculty.collegeId._id,
        email: faculty.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        designation: faculty.designation,
        phone: faculty.phone
      },
      college: {
        id: faculty.collegeId._id,
        name: faculty.collegeId.collegeName
      }
    });
  } catch (error) {
    console.error('❌ Teacher login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// ========== STUDENT ROUTES ==========

// Student Registration
router.post('/student/register', async (req, res) => {
  console.log('\n🔵 ===== POST /api/client/student/register =====');
  
  try {
    const {
      fullName,
      email,
      password,
      phone,
      department,
      enrollmentNo,
      semester,
      collegeId,
      admissionYear,
      dateOfBirth,
      address,
      city,
      state,
      pincode,
      parentName,
      parentPhone
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { enrollmentNo: enrollmentNo }
      ]
    });

    if (existingStudent) {
      if (existingStudent.email === email.toLowerCase()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
      if (existingStudent.enrollmentNo === enrollmentNo) {
        return res.status(400).json({ 
          success: false, 
          message: 'Enrollment number already exists' 
        });
      }
    }

    // Create new student
    const student = await Student.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      department,
      enrollmentNo,
      semester: parseInt(semester),
      collegeId,
      admissionYear: parseInt(admissionYear),
      dateOfBirth: new Date(dateOfBirth),
      address,
      city,
      state,
      pincode,
      parentName,
      parentPhone,
      isActive: true
    });

    console.log('✅ Student registered:', student.fullName);

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: studentResponse
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
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
});

// Student Login
router.post('/student/login', async (req, res) => {
  console.log('\n🔵 ===== POST /api/client/student/login =====');
  console.log('📋 Login attempt for email:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    console.log('1. Received login request for email:', email);
    
    if (!email || !password) {
      console.log('2. Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find student by email
    console.log('3. Searching for student in database...');
    const student = await Student.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('+password');

    console.log('4. Student found:', student ? 'Yes' : 'No');

    if (!student) {
      console.log('5. No student found with this email');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    console.log('6. Verifying password...');
    const isMatch = await student.comparePassword(password);
    console.log('7. Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    console.log('8. Generating JWT token...');
    const token = jwt.sign(
      { 
        id: student._id, 
        type: 'student',
        email: student.email,
        collegeId: student.collegeId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Get college info
    const college = await College.findById(student.collegeId).select('collegeName');

    console.log('9. Login successful for:', student.fullName);

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        department: student.department,
        enrollmentNo: student.enrollmentNo,
        semester: student.semester
      },
      college: {
        id: student.collegeId,
        name: college?.collegeName
      }
    });
  } catch (error) {
    console.error('❌ Student login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// ========== ADD THIS NEW ENDPOINT FOR STUDENT COUNT ==========
// Get student count by college ID
router.get('/students/count', async (req, res) => {
  console.log('\n🔵 ===== GET /api/client/students/count =====');
  console.log('📋 Fetching student count for college:', req.query.collegeId);
  
  try {
    const { collegeId } = req.query;
    
    if (!collegeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'College ID is required' 
      });
    }

    const count = await Student.countDocuments({ 
      collegeId: collegeId,
      isActive: true 
    });

    console.log(`✅ Found ${count} students for college ${collegeId}`);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('❌ Error fetching student count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

export default router;