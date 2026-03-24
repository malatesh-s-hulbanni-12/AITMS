// AITMS/backend/controllers/facultyController.js
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import { validationResult } from 'express-validator';

// @desc    Add new faculty member
// @route   POST /api/faculty/add
// @access  Private (Admin only)
export const addFaculty = async (req, res) => {
  try {
    console.log('📝 Adding faculty for college:', req.college._id);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      name, email, phone, department, 
      designation, qualification, experience, address 
    } = req.body;

    // Check if faculty already exists with same email in THIS college
    const existingFaculty = await Faculty.findOne({ 
      email: email.toLowerCase(),
      collegeId: req.college._id 
    });

    if (existingFaculty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faculty with this email already exists in your college' 
      });
    }

    // Create new faculty with collegeId from authenticated user
    const faculty = await Faculty.create({
      name,
      email: email.toLowerCase(),
      phone,
      department,
      designation,
      qualification,
      experience,
      address,
      collegeId: req.college._id  // Important: Associate with logged-in college
    });

    console.log('✅ Faculty created with ID:', faculty._id, 'for college:', req.college._id);

    // Update department count
    await Department.findOneAndUpdate(
      { name: department, collegeId: req.college._id },
      { $inc: { totalFaculty: 1 } },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Faculty member added successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Add faculty error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding faculty',
      error: error.message 
    });
  }
};

// @desc    Get all faculty members for logged-in college
// @route   GET /api/faculty/all
// @access  Private
export const getAllFaculty = async (req, res) => {
  try {
    console.log('📥 Fetching faculty for college:', req.college._id);
    console.log('📄 College details:', {
      id: req.college._id,
      name: req.college.collegeName,
      email: req.college.collegeEmail
    });

    const { page = 1, limit = 10, department, search } = req.query;
    
    // IMPORTANT: Always filter by the logged-in college's ID
    // This ensures colleges only see their own faculty
    const query = { 
      collegeId: req.college._id,  // Use the authenticated college's ID
      isActive: true 
    };
    
    console.log('🔍 Base query (college-specific):', JSON.stringify(query, null, 2));
    
    // Add department filter if provided
    if (department && department !== 'all' && department !== 'undefined') {
      query.department = department;
      console.log('🏢 Added department filter:', department);
    }
    
    // Add search filter if provided
    if (search && search !== 'undefined' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 Added search filter:', search);
    }

    console.log('📦 Final query with college isolation:', JSON.stringify(query, null, 2));

    // Execute query with pagination
    const faculty = await Faculty.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Faculty.countDocuments(query);

    console.log('✅ Found faculty count for this college:', faculty.length);
    console.log('📊 Total in database for this college:', total);
    
    // Log first few faculty items for debugging
    if (faculty.length > 0) {
      console.log('📋 Sample faculty (first item):', {
        id: faculty[0]._id,
        name: faculty[0].name,
        collegeId: faculty[0].collegeId,
        department: faculty[0].department
      });
    } else {
      console.log('ℹ️ No faculty found for college:', req.college.collegeName);
    }

    res.json({
      success: true,
      data: faculty,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get faculty error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching faculty',
      error: error.message 
    });
  }
};

// @desc    Get single faculty member (ensure it belongs to the college)
// @route   GET /api/faculty/:id
// @access  Private
export const getFacultyById = async (req, res) => {
  try {
    console.log('🔍 Fetching faculty by ID:', req.params.id, 'for college:', req.college._id);

    const faculty = await Faculty.findOne({
      _id: req.params.id,
      collegeId: req.college._id  // Ensure faculty belongs to this college
    });

    if (!faculty) {
      console.log('❌ Faculty not found or does not belong to this college');
      return res.status(404).json({ 
        success: false, 
        message: 'Faculty member not found' 
      });
    }

    console.log('✅ Faculty found:', faculty.name);
    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Get faculty by id error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching faculty',
      error: error.message 
    });
  }
};

// @desc    Update faculty member (ensure it belongs to the college)
// @route   PUT /api/faculty/:id
// @access  Private
export const updateFaculty = async (req, res) => {
  try {
    console.log('✏️ Updating faculty:', req.params.id, 'for college:', req.college._id);

    const { name, phone, department, designation, qualification, experience, address } = req.body;

    // Find faculty ensuring it belongs to this college
    const faculty = await Faculty.findOne({
      _id: req.params.id,
      collegeId: req.college._id
    });

    if (!faculty) {
      console.log('❌ Faculty not found or does not belong to this college');
      return res.status(404).json({ 
        success: false, 
        message: 'Faculty member not found' 
      });
    }

    // Store old department for count update
    const oldDepartment = faculty.department;

    // Update fields
    faculty.name = name || faculty.name;
    faculty.phone = phone || faculty.phone;
    faculty.department = department || faculty.department;
    faculty.designation = designation || faculty.designation;
    faculty.qualification = qualification || faculty.qualification;
    faculty.experience = experience || faculty.experience;
    faculty.address = address || faculty.address;

    await faculty.save();
    console.log('✅ Faculty updated successfully');

    // Update department counts if department changed
    if (oldDepartment !== faculty.department) {
      await Department.findOneAndUpdate(
        { name: oldDepartment, collegeId: req.college._id },
        { $inc: { totalFaculty: -1 } }
      );
      await Department.findOneAndUpdate(
        { name: faculty.department, collegeId: req.college._id },
        { $inc: { totalFaculty: 1 } },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'Faculty member updated successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating faculty',
      error: error.message 
    });
  }
};

// @desc    Delete faculty member (ensure it belongs to the college)
// @route   DELETE /api/faculty/:id
// @access  Private
export const deleteFaculty = async (req, res) => {
  try {
    console.log('🗑️ Deleting faculty:', req.params.id, 'for college:', req.college._id);

    // Find faculty ensuring it belongs to this college
    const faculty = await Faculty.findOne({
      _id: req.params.id,
      collegeId: req.college._id
    });

    if (!faculty) {
      console.log('❌ Faculty not found or does not belong to this college');
      return res.status(404).json({ 
        success: false, 
        message: 'Faculty member not found' 
      });
    }

    // Soft delete - set isActive to false
    faculty.isActive = false;
    await faculty.save();
    console.log('✅ Faculty soft deleted successfully');

    // Update department count
    await Department.findOneAndUpdate(
      { name: faculty.department, collegeId: req.college._id },
      { $inc: { totalFaculty: -1 } }
    );

    res.json({
      success: true,
      message: 'Faculty member deleted successfully'
    });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting faculty',
      error: error.message 
    });
  }
};

// @desc    Get faculty statistics for logged-in college
// @route   GET /api/faculty/stats
// @access  Private
export const getFacultyStats = async (req, res) => {
  try {
    console.log('📊 Fetching faculty stats for college:', req.college._id);

    const totalFaculty = await Faculty.countDocuments({ 
      collegeId: req.college._id,  // Only count for this college
      isActive: true 
    });

    const departmentStats = await Faculty.aggregate([
      { 
        $match: { 
          collegeId: req.college._id,  // Only aggregate for this college
          isActive: true 
        } 
      },
      { $group: {
          _id: '$department',
          count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    const recentFaculty = await Faculty.find({ 
      collegeId: req.college._id,  // Only get recent for this college
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('✅ Stats for college:', {
      collegeId: req.college._id,
      total: totalFaculty,
      departments: departmentStats.length
    });

    res.json({
      success: true,
      data: {
        total: totalFaculty,
        departmentStats,
        recent: recentFaculty
      }
    });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching statistics',
      error: error.message 
    });
  }
};