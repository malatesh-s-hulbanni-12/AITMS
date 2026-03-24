// AITMS/backend/models/Department.js
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  totalFaculty: {
    type: Number,
    default: 0
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;