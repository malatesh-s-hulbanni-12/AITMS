// AITMS/backend/models/Timetable.js
import mongoose from 'mongoose';

const timetableEntrySchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  subjectCode: {
    type: String,
    trim: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty is required']
  },
  facultyName: {
    type: String,
    required: [true, 'Faculty name is required']
  },
  room: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  section: {
    type: String,
    default: 'A'
  },
  batch: {
    type: String
  },
  isLab: {
    type: Boolean,
    default: false
  }
}, {
  _id: false
});

const timetableSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: [true, 'College ID is required'],
    index: true
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    index: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    default: () => {
      const year = new Date().getFullYear();
      return `${year}-${year + 1}`;
    }
  },
  entries: [timetableEntrySchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: {
    type: Date
  },
  version: {
    type: Number,
    default: 1
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
timetableSchema.index({ collegeId: 1, department: 1, semester: 1, academicYear: 1 });
timetableSchema.index({ 'entries.facultyId': 1 });
timetableSchema.index({ 'entries.room': 1 });

// Ensure no conflicts for faculty (same time)
timetableSchema.pre('save', async function(next) {
  const timetable = this;
  
  // Check for faculty conflicts within this timetable
  const facultyConflicts = [];
  const roomConflicts = [];
  
  const timeSlotMap = new Map();
  
  for (const entry of timetable.entries) {
    const key = `${entry.day}-${entry.timeSlot}`;
    
    if (timeSlotMap.has(key)) {
      const existing = timeSlotMap.get(key);
      
      // Check faculty conflict
      if (existing.facultyId.toString() === entry.facultyId.toString()) {
        facultyConflicts.push({
          day: entry.day,
          timeSlot: entry.timeSlot,
          faculty: entry.facultyName
        });
      }
      
      // Check room conflict
      if (existing.room === entry.room) {
        roomConflicts.push({
          day: entry.day,
          timeSlot: entry.timeSlot,
          room: entry.room
        });
      }
    } else {
      timeSlotMap.set(key, entry);
    }
  }
  
  if (facultyConflicts.length > 0) {
    const error = new Error('Faculty conflicts detected');
    error.conflicts = { faculty: facultyConflicts, room: roomConflicts };
    return next(error);
  }
  
  if (roomConflicts.length > 0) {
    const error = new Error('Room conflicts detected');
    error.conflicts = { faculty: facultyConflicts, room: roomConflicts };
    return next(error);
  }
  
  next();
});

// Static method to check for conflicts across all timetables
timetableSchema.statics.checkConflicts = async function(collegeId, entries, excludeTimetableId = null) {
  const conflicts = {
    faculty: [],
    room: []
  };

  // Get all active timetables for this college
  const query = { collegeId, isActive: true };
  if (excludeTimetableId) {
    query._id = { $ne: excludeTimetableId };
  }

  const existingTimetables = await this.find(query);

  // Create a map of existing bookings
  const facultyBookings = new Map();
  const roomBookings = new Map();

  existingTimetables.forEach(timetable => {
    timetable.entries.forEach(entry => {
      const key = `${entry.day}-${entry.timeSlot}`;
      
      // Faculty booking
      const facultyKey = `${entry.facultyId}-${key}`;
      facultyBookings.set(facultyKey, {
        timetable: timetable._id,
        entry: entry
      });

      // Room booking
      const roomKey = `${entry.room}-${key}`;
      roomBookings.set(roomKey, {
        timetable: timetable._id,
        entry: entry
      });
    });
  });

  // Check new entries for conflicts
  entries.forEach(entry => {
    const key = `${entry.day}-${entry.timeSlot}`;
    
    // Check faculty conflict
    const facultyKey = `${entry.facultyId}-${key}`;
    if (facultyBookings.has(facultyKey)) {
      conflicts.faculty.push({
        day: entry.day,
        timeSlot: entry.timeSlot,
        faculty: entry.facultyName,
        existing: facultyBookings.get(facultyKey)
      });
    }

    // Check room conflict
    const roomKey = `${entry.room}-${key}`;
    if (roomBookings.has(roomKey)) {
      conflicts.room.push({
        day: entry.day,
        timeSlot: entry.timeSlot,
        room: entry.room,
        existing: roomBookings.get(roomKey)
      });
    }
  });

  return conflicts;
};

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;