// AITMS/admin/src/pages/admin/CreateTimetable.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { 
  Calendar, Clock, BookOpen, Users, Save, 
  Eye, X, Printer, Download, Plus, Trash2,
  Loader, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Preview Modal Component - UPDATED with proper time format matching
const PreviewTimetableModal = ({ 
  timetable, 
  onClose, 
  collegeInfo, 
  department, 
  semester,
  onSave 
}) => {
  const [saving, setSaving] = useState(false);
  
  if (!timetable || timetable.length === 0) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Time slots in display format (what users see in the table header)
  const timeSlots = [
    '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 1:00', '1:00 - 2:00', '2:00 - 3:00', '3:00 - 4:00', '4:00 - 5:00'
  ];

  // Function to normalize time for comparison (remove spaces, AM/PM)
  const normalizeTimeForComparison = (timeStr) => {
    // Remove all spaces and AM/PM markers for comparison
    return timeStr.replace(/\s+/g, '').replace(/AM|PM/gi, '').toLowerCase();
  };

  // Function to extract hour from time string
  const extractHour = (timeStr) => {
    // Handle formats like "9:00AM" or "9:00"
    const match = timeStr.match(/(\d{1,2}):\d{2}/);
    return match ? parseInt(match[1]) : 0;
  };

  // Function to check if an entry matches a time slot
  const entryMatchesTimeSlot = (entry, timeSlot) => {
    if (!entry || !entry.timeSlot) return false;
    
    // Split entry time slot into start and end
    const entryParts = entry.timeSlot.split(' - ');
    if (entryParts.length !== 2) return false;
    
    // Extract hour from entry start time (e.g., "9:00AM" -> 9)
    const entryStartHour = extractHour(entryParts[0]);
    
    // Extract hour from table time slot (e.g., "9:00 - 10:00" -> 9)
    const slotParts = timeSlot.split(' - ');
    const slotStartHour = extractHour(slotParts[0]);
    
    // Compare hours
    return entryStartHour === slotStartHour;
  };

  // Function to get entry for a specific day and time slot
  const getEntryForTimeSlot = (day, timeSlot) => {
    return timetable.find(e => {
      if (e.day !== day) return false;
      return entryMatchesTimeSlot(e, timeSlot);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg sm:text-xl font-semibold">Timetable Preview</h3>
              <span className="text-xs sm:text-sm bg-orange-400 px-2 sm:px-3 py-1 rounded-full">
                {collegeInfo?.collegeName || 'College Name'}
              </span>
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button className="p-1.5 sm:p-2 hover:bg-orange-400 rounded-lg">
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-orange-400 rounded-lg">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-orange-400 rounded-lg">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Content */}
        <div className="p-4 sm:p-6">
          {/* College Header */}
          <div className="text-center mb-6 sm:mb-8 border-b pb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {collegeInfo?.collegeName || 'GM INSTITUTE OF TECHNOLOGY'}
            </h1>
            <h2 className="text-lg sm:text-xl text-gray-600 mt-1">
              DEPARTMENT OF {department?.toUpperCase() || 'COMPUTER SCIENCE AND ENGINEERING'}
            </h2>
            <h3 className="text-base sm:text-lg text-orange-600 font-semibold mt-2">CLASS TIME TABLE</h3>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-4 text-xs sm:text-sm text-gray-600">
              <p><span className="font-medium">Academic Year:</span> 2024-25</p>
              <p><span className="font-medium">Semester:</span> {semester || 'I'}</p>
              <p><span className="font-medium">Department:</span> {department || 'CSE'}</p>
              <p><span className="font-medium">Total Classes:</span> {timetable.length}</p>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="border border-gray-300 px-3 py-3 text-left font-semibold sticky left-0 bg-orange-500">
                    Day/Time
                  </th>
                  {timeSlots.map((slot, index) => (
                    <th key={index} className="border border-gray-300 px-3 py-3 text-center font-semibold min-w-[100px]">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="hover:bg-orange-50">
                    <td className="border border-gray-300 px-3 py-3 font-medium text-gray-700 bg-orange-50 sticky left-0 bg-white">
                      {day}
                    </td>
                    {timeSlots.map((slot, index) => {
                      const entry = getEntryForTimeSlot(day, slot);
                      return (
                        <td 
                          key={index} 
                          className="border border-gray-300 p-2 text-center align-top min-h-[100px]"
                        >
                          {entry ? (
                            <div className="bg-orange-100 p-2 rounded-lg border border-orange-300">
                              <p className="font-bold text-orange-800 text-xs sm:text-sm">{entry.subject}</p>
                              <p className="text-xs text-gray-700 mt-1">{entry.facultyName}</p>
                              <p className="text-xs text-orange-600 font-medium mt-1">Room: {entry.room}</p>
                              <p className="text-[10px] text-gray-500 mt-1">{entry.timeSlot}</p>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Save Button */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div>
                <p className="font-medium text-gray-600">Class Coordinator:</p>
                <p className="text-gray-800">Dr. Rajesh Kumar</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">HOD:</p>
                <p className="text-gray-800">Dr. Sunita Sharma</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Generated On:</p>
                <p className="text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Valid From:</p>
                <p className="text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Save Timetable to Database</span>
                </>
              )}
            </button>
          </div>

          {/* Notes */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Note:</span> Preview shows entries based on start time matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CreateTimetable = () => {
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  
  const [formData, setFormData] = useState({
    department: '',
    semester: '',
    subject: '',
    facultyId: '',
    facultyName: '',
    day: '',
    startTime: '',
    endTime: '',
    room: '',
    timeSlot: ''
  });

  // All departments list
  const allDepartments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology'
  ];

  // Fetch college info
  useEffect(() => {
    const storedCollege = localStorage.getItem('collegeInfo');
    if (storedCollege) {
      setCollegeInfo(JSON.parse(storedCollege));
    }
  }, []);

  // Fetch faculty list
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/faculty/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setFacultyList(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        toast.error('Failed to load faculty list');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'facultyId') {
      const selectedFaculty = facultyList.find(f => f._id === value);
      setFormData({
        ...formData,
        facultyId: value,
        facultyName: selectedFaculty ? selectedFaculty.name : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Auto-calculate time slot
    if (name === 'startTime' || name === 'endTime') {
      const start = name === 'startTime' ? value : formData.startTime;
      const end = name === 'endTime' ? value : formData.endTime;
      
      if (start && end) {
        // Convert 24h format to 12h format for display
        const formatTime = (time) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes}${ampm}`;
        };

        const timeSlot = `${formatTime(start)} - ${formatTime(end)}`;
        setFormData(prev => ({ ...prev, timeSlot }));
      }
    }
  };

  const checkForConflicts = async (newEntry) => {
    try {
      setCheckingConflicts(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/timetable/check-conflicts',
        { entries: [newEntry] },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        return response.data.conflicts;
      }
      return { faculty: [], room: [] };
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return { faculty: [], room: [] };
    } finally {
      setCheckingConflicts(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    
    if (!formData.department || !formData.semester || !formData.subject || 
        !formData.facultyId || !formData.day || !formData.startTime || 
        !formData.endTime || !formData.room) {
      toast.error('Please fill all fields');
      return;
    }

    const semesterNum = parseInt(formData.semester);
    if (semesterNum < 1 || semesterNum > 8) {
      toast.error('Semester must be between 1 and 8');
      return;
    }

    // Calculate duration
    const startHour = parseInt(formData.startTime.split(':')[0]);
    const endHour = parseInt(formData.endTime.split(':')[0]);
    let duration = endHour - startHour;
    if (duration < 0) duration = 12 - startHour + endHour;

    const newEntry = {
      day: formData.day,
      timeSlot: formData.timeSlot,
      startTime: formData.startTime,
      endTime: formData.endTime,
      subject: formData.subject,
      facultyId: formData.facultyId,
      facultyName: formData.facultyName,
      room: formData.room,
      department: formData.department,
      semester: semesterNum,
      duration: Math.abs(duration)
    };

    // Check local conflicts
    const localConflict = timetableEntries.find(entry => 
      entry.day === formData.day && 
      entry.timeSlot === formData.timeSlot
    );

    if (localConflict) {
      toast.error(`❌ This time slot is already booked!`);
      return;
    }

    // Check backend conflicts
    const conflicts = await checkForConflicts(newEntry);
    
    if (conflicts.faculty?.length > 0 || conflicts.room?.length > 0) {
      toast.error(`❌ Conflict detected!`);
      return;
    }

    setTimetableEntries([...timetableEntries, { ...newEntry, id: Date.now() }]);
    
    setFormData({
      ...formData,
      subject: '',
      facultyId: '',
      facultyName: '',
      day: '',
      startTime: '',
      endTime: '',
      room: '',
      timeSlot: ''
    });

    toast.success('✅ Entry added to timetable');
  };

  const handleRemoveEntry = (id) => {
    setTimetableEntries(timetableEntries.filter(entry => entry.id !== id));
    toast.info('Entry removed');
  };

  const handleClearAll = () => {
    if (timetableEntries.length > 0) {
      if (window.confirm('Clear all entries?')) {
        setTimetableEntries([]);
        toast.info('All entries cleared');
      }
    }
  };

  const handleSaveTimetable = async () => {
    if (timetableEntries.length === 0) {
      toast.error('No entries to save');
      return;
    }

    if (!formData.department || !formData.semester) {
      toast.error('Please select department and semester first');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const timetableData = {
        collegeId: collegeInfo?._id,
        department: formData.department,
        semester: parseInt(formData.semester),
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        entries: timetableEntries.map(entry => ({
          day: entry.day,
          timeSlot: entry.timeSlot,
          startTime: entry.startTime,
          endTime: entry.endTime,
          subject: entry.subject,
          facultyId: entry.facultyId,
          facultyName: entry.facultyName,
          room: entry.room,
          department: entry.department,
          semester: entry.semester
        }))
      };

      const response = await axios.post(
        'http://localhost:5000/api/timetable/create',
        timetableData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('✅ Timetable saved successfully!');
        setTimetableEntries([]);
        setShowPreview(false);
        setFormData({
          ...formData,
          subject: '',
          facultyId: '',
          facultyName: '',
          day: '',
          startTime: '',
          endTime: '',
          room: '',
          timeSlot: ''
        });
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast.error(error.response?.data?.message || '❌ Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Timetable">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create Timetable</h2>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {timetableEntries.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setShowPreview(true)}
              disabled={timetableEntries.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 text-sm sm:text-base"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Entry Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Add New Entry</h3>
          
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Department</option>
                  {allDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <select
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Faculty</option>
                    {facultyList.map(faculty => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} - {faculty.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Day <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Room <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., A-101"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkingConflicts}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {checkingConflicts ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Entry</span>
                </>
              )}
            </button>
          </form>

          {/* Entries List */}
          {timetableEntries.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Added Entries ({timetableEntries.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {timetableEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs sm:text-sm">
                      <span className="font-bold text-orange-700">{entry.day}</span>
                      <span className="text-gray-700">{entry.timeSlot}</span>
                      <span className="text-gray-800 font-bold">{entry.subject}</span>
                      <span className="text-gray-600 truncate">{entry.facultyName}</span>
                      <span className="text-gray-600">Room {entry.room}</span>
                      <span className="text-xs text-orange-600 font-semibold">Sem {entry.semester}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewTimetableModal
          timetable={timetableEntries}
          onClose={() => setShowPreview(false)}
          collegeInfo={collegeInfo}
          department={formData.department}
          semester={formData.semester}
          onSave={handleSaveTimetable}
        />
      )}
    </DashboardLayout>
  );
};

export default CreateTimetable;