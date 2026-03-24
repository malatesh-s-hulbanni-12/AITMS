// AITMS/admin/src/pages/admin/ManageTimetable.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { 
  Calendar, Download, Edit, X, Loader, RefreshCw,
  Filter, Trash2, Plus, BookOpen, Users, MapPin,
  LogOut, Clock, Save
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

// Edit Time Slots Modal Component
const EditTimeSlotsModal = ({ timeSlots, onSave, onClose }) => {
  const [editedSlots, setEditedSlots] = useState([...timeSlots]);
  const [loading, setLoading] = useState(false);

  const handleSlotChange = (index, value) => {
    const newSlots = [...editedSlots];
    newSlots[index] = value;
    setEditedSlots(newSlots);
  };

  const handleAddSlot = () => {
    setEditedSlots([...editedSlots, '9:00 - 10:00']);
  };

  const handleRemoveSlot = (index) => {
    if (editedSlots.length > 1) {
      const newSlots = editedSlots.filter((_, i) => i !== index);
      setEditedSlots(newSlots);
    }
  };

  const handleSave = () => {
    const validSlots = editedSlots.filter(slot => slot.trim() !== '');
    if (validSlots.length === 0) {
      toast.error('At least one time slot is required');
      return;
    }
    onSave(validSlots);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex justify-between items-center sticky top-0">
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Edit Time Slots
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-orange-400 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Customize your time slots. Add breaks, adjust timings based on your college schedule.
          </p>
          
          <div className="space-y-3">
            {editedSlots.map((slot, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => handleSlotChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 9:00 - 10:00"
                />
                <button
                  onClick={() => handleRemoveSlot(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  disabled={editedSlots.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddSlot}
            className="flex items-center space-x-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Time Slot</span>
          </button>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Time Slots</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Cell Modal Component
const EditCellModal = ({ entry, day, timeSlot, onClose, onSave, facultyList }) => {
  const [formData, setFormData] = useState({
    subject: '',
    facultyId: '',
    facultyName: '',
    room: '',
    duration: '1'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      console.log('📝 EditCellModal - Loading entry:', entry);
      setFormData({
        subject: entry.subject || '',
        facultyId: entry.facultyId || '',
        facultyName: entry.facultyName || '',
        room: entry.room || '',
        duration: entry.duration?.toString() || '1'
      });
    } else {
      setFormData({
        subject: '',
        facultyId: '',
        facultyName: '',
        room: '',
        duration: '1'
      });
    }
  }, [entry]);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.facultyId || !formData.room) {
      toast.error('Please fill all fields');
      return;
    }

    onSave({
      day,
      timeSlot,
      duration: parseInt(formData.duration),
      subject: formData.subject,
      facultyId: formData.facultyId,
      facultyName: formData.facultyName,
      room: formData.room
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            {entry ? 'Edit Class' : 'Add Class'} - {day} ({timeSlot})
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-orange-400 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter subject name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty <span className="text-red-500">*</span>
            </label>
            <select
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Faculty</option>
              {facultyList.map(faculty => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name} - {faculty.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., A-101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours) <span className="text-red-500">*</span>
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="3">3 Hours</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const ManageTimetable = () => {
  const navigate = useNavigate();
  const [combinedEntries, setCombinedEntries] = useState([]);
  const [allTimetables, setAllTimetables] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimeSlotsModal, setShowTimeSlotsModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState({ department: '', semester: '' });
  
  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    semester: ''
  });

  // College info
  const [collegeInfo, setCollegeInfo] = useState(null);

  // Custom time slots (stored in localStorage)
  const [customTimeSlots, setCustomTimeSlots] = useState(() => {
    const saved = localStorage.getItem('customTimeSlots');
    return saved ? JSON.parse(saved) : [
      '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
      '12:00 - 1:00', '1:00 - 2:00', '2:00 - 3:00', '3:00 - 4:00', '4:00 - 5:00'
    ];
  });

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Save custom time slots to localStorage
  useEffect(() => {
    localStorage.setItem('customTimeSlots', JSON.stringify(customTimeSlots));
  }, [customTimeSlots]);

  // Function to convert 24-hour format to 12-hour display format
  const convertTo12HourFormat = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minute}`;
  };

  // Function to convert database time slot to display format (12-hour)
  const convertToDisplayFormat = (dbTimeSlot) => {
    if (!dbTimeSlot) return '';
    
    const parts = dbTimeSlot.split(' - ');
    if (parts.length === 2) {
      const extractTime = (timeStr) => {
        const cleanTime = timeStr.replace(/\s*[AP]M\s*/g, '').trim();
        return convertTo12HourFormat(cleanTime);
      };
      
      const startTime = extractTime(parts[0]);
      const endTime = extractTime(parts[1]);
      
      return `${startTime} - ${endTime}`;
    }
    
    return dbTimeSlot;
  };

  // Function to get the start slot index for an entry
  const getEntryStartSlotIndex = (entry) => {
    if (!entry || !entry.displayTimeSlot) return -1;
    
    // Extract just the start time from the displayTimeSlot
    const startTimePart = entry.displayTimeSlot.split(' - ')[0];
    
    // Find which time slot starts with this time
    const index = customTimeSlots.findIndex(slot => {
      const slotStart = slot.split(' - ')[0];
      return slotStart === startTimePart;
    });
    
    console.log(`🔍 Finding start slot for ${entry.displayTimeSlot}:`, {
      startTimePart,
      foundIndex: index,
      matchingSlot: index !== -1 ? customTimeSlots[index] : 'not found'
    });
    
    return index;
  };

  // Function to validate and clean entry
  const validateEntry = (entry) => {
    if (!entry) return null;
    
    let duration = 1;
    const times = entry.timeSlot.split(' - ');
    if (times.length === 2) {
      const extractHour = (timeStr) => {
        const cleanTime = timeStr.replace(/\s*[AP]M\s*/g, '').trim();
        return parseInt(cleanTime.split(':')[0]);
      };
      
      const startHour = extractHour(times[0]);
      const endHour = extractHour(times[1]);
      duration = endHour - startHour;
      if (duration < 0) duration = 12 - startHour + endHour;
    }
    
    const validated = {
      day: entry.day || '',
      timeSlot: entry.timeSlot || '',
      displayTimeSlot: convertToDisplayFormat(entry.timeSlot),
      subject: entry.subject || '',
      facultyId: entry.facultyId || '',
      facultyName: entry.facultyName || '',
      room: entry.room || '',
      department: entry.department || '',
      semester: entry.semester || 0,
      startTime: entry.startTime || '',
      endTime: entry.endTime || '',
      duration: Math.abs(duration)
    };
    
    console.log('✅ Validated entry:', validated);
    return validated;
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedCollege = localStorage.getItem('collegeInfo');
    
    console.log('🔐 Auth Check - Token:', token ? 'Present' : 'Missing');
    console.log('🔐 Auth Check - College Info:', storedCollege ? 'Present' : 'Missing');
    
    if (!token || !storedCollege) {
      console.log('❌ No token or college info, redirecting to login...');
      toast.error('Please login to continue');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    if (storedCollege) {
      setCollegeInfo(JSON.parse(storedCollege));
    }
    
    setAuthChecked(true);
  }, [navigate]);

  // Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Get entry that starts at a specific day and time slot index
  const getEntryForTimeSlot = (day, timeSlotIndex) => {
    if (!combinedEntries) {
      console.log('⚠️ getEntryForTimeSlot - No combined entries');
      return null;
    }
    
    const timeSlot = customTimeSlots[timeSlotIndex];
    const timeSlotStart = timeSlot.split(' - ')[0];
    
    console.log(`🔍 Looking for entry starting at ${day} ${timeSlot} (start: ${timeSlotStart})`);
    
    // Find entry whose displayTimeSlot starts with this time
    const entry = combinedEntries.find(e => {
      if (e.day !== day) return false;
      const entryStart = e.displayTimeSlot.split(' - ')[0];
      const match = entryStart === timeSlotStart;
      if (match) {
        console.log(`✅ Found starting entry:`, e);
      }
      return match;
    });
    
    return entry;
  };

  // Get any entry that occupies a specific day and time slot index
  const getOccupyingEntry = (day, timeSlotIndex) => {
    if (!combinedEntries) {
      console.log('⚠️ getOccupyingEntry - No combined entries');
      return null;
    }
    
    const timeSlot = customTimeSlots[timeSlotIndex];
    console.log(`🔍 Looking for any entry occupying ${day} ${timeSlot} (index: ${timeSlotIndex})`);
    
    // Check all entries to see if they cover this time slot
    const occupying = combinedEntries.find(e => {
      if (e.day !== day) return false;
      
      const startSlotIndex = getEntryStartSlotIndex(e);
      if (startSlotIndex === -1) {
        console.log(`❌ Could not determine start slot for entry:`, e);
        return false;
      }
      
      const endSlotIndex = startSlotIndex + e.duration - 1;
      const occupies = timeSlotIndex >= startSlotIndex && timeSlotIndex <= endSlotIndex;
      
      if (occupies) {
        console.log(`✅ Entry occupies this slot:`, {
          entry: e.subject,
          startSlot: startSlotIndex,
          endSlot: endSlotIndex,
          currentSlot: timeSlotIndex,
          duration: e.duration
        });
      }
      
      return occupies;
    });
    
    return occupying;
  };

  // Log all entries and their slot positions
  const logEntriesWithSlots = () => {
    if (!combinedEntries.length) return;
    
    console.log('\n📋 ===== ENTRIES SLOT MAPPING =====');
    combinedEntries.forEach((e, idx) => {
      const startSlot = getEntryStartSlotIndex(e);
      console.log(`Entry ${idx + 1}: ${e.subject}`, {
        day: e.day,
        displayTimeSlot: e.displayTimeSlot,
        startSlot: startSlot,
        duration: e.duration,
        coversSlots: startSlot !== -1 ? 
          Array.from({ length: e.duration }, (_, i) => startSlot + i) : 'unknown'
      });
    });
  };

  // Fetch faculty list
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!authChecked) return;
      
      console.log('🚀 Fetching faculty list...');
      setLoadingFaculty(true);
      
      try {
        const response = await axios.get('http://localhost:5000/api/faculty/all', {
          headers: getAuthHeaders()
        });
        
        console.log('📥 Faculty response status:', response.status);
        
        if (response.data.success) {
          console.log(`✅ Loaded ${response.data.data.length} faculty members`);
          setFacultyList(response.data.data);
        }
      } catch (error) {
        console.error('❌ Error fetching faculty:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem('token');
          localStorage.removeItem('collegeInfo');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } finally {
        setLoadingFaculty(false);
      }
    };

    fetchFaculty();
  }, [authChecked, navigate]);

  // Fetch timetables when filters change
  useEffect(() => {
    const fetchTimetables = async () => {
      if (!authChecked) return;
      
      console.log('\n🔍 ===== FETCHING TIMETABLES =====');
      console.log('Filters:', filters);
      
      if (!filters.department || !filters.semester) {
        console.log('⏸️ Filters not complete, skipping fetch');
        setAllTimetables([]);
        setCombinedEntries([]);
        return;
      }

      try {
        setLoading(true);
        
        const params = new URLSearchParams({
          department: filters.department,
          semester: filters.semester
        });

        const url = `http://localhost:5000/api/timetable/all?${params}`;
        console.log('📡 Fetching from URL:', url);

        const response = await axios.get(url, {
          headers: getAuthHeaders()
        });

        console.log('📥 Timetable response status:', response.status);
        console.log('📥 Timetable response data:', response.data);

        if (response.data.success) {
          console.log(`✅ Found ${response.data.data.length} timetables`);
          
          if (response.data.data.length > 0) {
            const cleanedTimetables = response.data.data.map(tt => ({
              ...tt,
              entries: tt.entries ? tt.entries.map(validateEntry) : []
            }));
            
            setAllTimetables(cleanedTimetables);
            setDepartmentInfo({
              department: filters.department,
              semester: filters.semester
            });
            
            const allEntries = [];
            cleanedTimetables.forEach(tt => {
              if (tt.entries && tt.entries.length > 0) {
                allEntries.push(...tt.entries);
              }
            });
            
            console.log(`📋 Total combined entries: ${allEntries.length}`);
            setCombinedEntries(allEntries);
            
            // Log all entries after setting
            setTimeout(() => {
              logEntriesWithSlots();
            }, 100);
          } else {
            console.log('ℹ️ No timetables found');
            setAllTimetables([]);
            setCombinedEntries([]);
            toast.info('No timetable found for selected filters');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching timetables:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem('token');
          localStorage.removeItem('collegeInfo');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [filters.department, filters.semester, authChecked, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Filter changed: ${name} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCell = (day, timeSlotIndex) => {
    console.log(`✏️ Edit cell clicked: ${day} - ${customTimeSlots[timeSlotIndex]} (index: ${timeSlotIndex})`);
    
    if (!departmentInfo.department || !departmentInfo.semester) {
      toast.error('Please select department and semester first');
      return;
    }
    
    const entry = getEntryForTimeSlot(day, timeSlotIndex);
    
    console.log('Found entry:', entry || 'No entry found');
    
    setSelectedCell({ 
      day, 
      timeSlot: customTimeSlots[timeSlotIndex], 
      timeSlotIndex,
      entry 
    });
    setShowEditModal(true);
  };

  const handleSaveCell = async (updatedEntry) => {
    console.log('💾 Saving cell:', updatedEntry);
    
    if (!departmentInfo.department || !departmentInfo.semester) {
      toast.error('Department and semester not selected');
      return;
    }

    try {
      if (allTimetables.length === 0) {
        toast.error('No timetable found to update');
        return;
      }

      const targetTimetable = allTimetables[0];
      let updatedEntries = targetTimetable.entries ? [...targetTimetable.entries] : [];
      
      const slotIndex = customTimeSlots.findIndex(slot => slot === updatedEntry.timeSlot);
      if (slotIndex === -1) return;

      const endSlotIndex = Math.min(slotIndex + updatedEntry.duration - 1, customTimeSlots.length - 1);
      const endTimeSlot = customTimeSlots[endSlotIndex];
      const endTime = endTimeSlot.split(' - ')[1];

      const convertToDBFormat = (time12) => {
        const [hour, minute] = time12.split(':');
        let h = parseInt(hour);
        const isPM = (slotIndex >= 4);
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12) h = 0;
        const ampm = isPM ? 'PM' : 'AM';
        return `${h % 12 || 12}:${minute} ${ampm}`;
      };

      const startTime12 = updatedEntry.timeSlot.split(' - ')[0];
      const dbTimeSlot = `${convertToDBFormat(startTime12)} - ${convertToDBFormat(endTime)}`;

      const newEntry = {
        day: updatedEntry.day,
        timeSlot: dbTimeSlot,
        startTime: startTime12,
        endTime: endTime,
        subject: updatedEntry.subject,
        facultyId: updatedEntry.facultyId,
        facultyName: updatedEntry.facultyName,
        room: updatedEntry.room,
        department: departmentInfo.department,
        semester: parseInt(departmentInfo.semester),
        duration: updatedEntry.duration
      };

      updatedEntries = updatedEntries.filter(e => {
        const eDisplayFormat = convertToDisplayFormat(e.timeSlot);
        const eStartTime = eDisplayFormat.split(' - ')[0];
        const newStartTime = updatedEntry.timeSlot.split(' - ')[0];
        return !(e.day === updatedEntry.day && eStartTime === newStartTime);
      });

      updatedEntries.push(newEntry);

      const updateData = {
        entries: updatedEntries,
        department: departmentInfo.department,
        semester: parseInt(departmentInfo.semester)
      };

      const url = `http://localhost:5000/api/timetable/${targetTimetable._id}`;
      console.log('📡 Sending PUT request to:', url);
      
      const response = await axios.put(
        url,
        updateData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('✅ Class saved successfully');
        
        const params = new URLSearchParams({
          department: departmentInfo.department,
          semester: departmentInfo.semester
        });
        
        const refreshResponse = await axios.get(
          `http://localhost:5000/api/timetable/all?${params}`,
          { headers: getAuthHeaders() }
        );
        
        if (refreshResponse.data.success) {
          const cleanedTimetables = refreshResponse.data.data.map(tt => ({
            ...tt,
            entries: tt.entries ? tt.entries.map(validateEntry) : []
          }));
          
          setAllTimetables(cleanedTimetables);
          
          const allEntries = [];
          cleanedTimetables.forEach(tt => {
            if (tt.entries && tt.entries.length > 0) {
              allEntries.push(...tt.entries);
            }
          });
          setCombinedEntries(allEntries);
        }
        
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('❌ Error updating timetable:', error);
      toast.error('Failed to update timetable');
    }
  };

  const handleDeleteCell = async (day, timeSlotIndex) => {
    const timeSlot = customTimeSlots[timeSlotIndex];
    console.log(`🗑️ Deleting cell: ${day} - ${timeSlot}`);
    
    if (!departmentInfo.department || !departmentInfo.semester) return;
    if (allTimetables.length === 0) return;
    
    const entry = getEntryForTimeSlot(day, timeSlotIndex);
    if (!entry) return;
    
    if (!window.confirm('Remove this class from timetable?')) return;

    try {
      const targetTimetable = allTimetables[0];
      
      const entryStartTime = entry.displayTimeSlot.split(' - ')[0];
      
      const updatedEntries = targetTimetable.entries.filter(e => {
        const eDisplayFormat = convertToDisplayFormat(e.timeSlot);
        const eStartTime = eDisplayFormat.split(' - ')[0];
        return !(e.day === day && eStartTime === entryStartTime);
      });

      const updateData = {
        entries: updatedEntries,
        department: departmentInfo.department,
        semester: parseInt(departmentInfo.semester)
      };

      const response = await axios.put(
        `http://localhost:5000/api/timetable/${targetTimetable._id}`,
        updateData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('✅ Class removed successfully');
        
        const params = new URLSearchParams({
          department: departmentInfo.department,
          semester: departmentInfo.semester
        });
        
        const refreshResponse = await axios.get(
          `http://localhost:5000/api/timetable/all?${params}`,
          { headers: getAuthHeaders() }
        );
        
        if (refreshResponse.data.success) {
          const cleanedTimetables = refreshResponse.data.data.map(tt => ({
            ...tt,
            entries: tt.entries ? tt.entries.map(validateEntry) : []
          }));
          
          setAllTimetables(cleanedTimetables);
          
          const allEntries = [];
          cleanedTimetables.forEach(tt => {
            if (tt.entries && tt.entries.length > 0) {
              allEntries.push(...tt.entries);
            }
          });
          setCombinedEntries(allEntries);
        }
      }
    } catch (error) {
      console.error('❌ Error removing class:', error);
      toast.error('Failed to remove class');
    }
  };

  const handleSaveTimeSlots = (newSlots) => {
    setCustomTimeSlots(newSlots);
    setShowTimeSlotsModal(false);
    toast.success('✅ Time slots updated successfully');
  };

  const handleDownloadPDF = () => {
    if (combinedEntries.length === 0) return;

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFontSize(18);
      doc.setTextColor(249, 115, 22);
      doc.text(collegeInfo?.collegeName || 'GMIT', 148, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Department of ${departmentInfo.department} - Semester ${departmentInfo.semester}`, 148, 25, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Academic Year: 2024-25`, 148, 32, { align: 'center' });

      const tableData = days.map(day => {
        const row = [day];
        customTimeSlots.forEach((slot, index) => {
          const entry = getEntryForTimeSlot(day, index);
          const occupyingEntry = getOccupyingEntry(day, index);
          
          if (entry) {
            row.push(`${entry.subject}\n${entry.facultyName}\nRm:${entry.room}`);
          } else if (occupyingEntry) {
            row.push(`${occupyingEntry.subject}\n${occupyingEntry.facultyName}\nRm:${occupyingEntry.room}`);
          } else {
            row.push('—');
          }
        });
        return row;
      });

      autoTable(doc, {
        head: [['Day/Time', ...customTimeSlots]],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold', halign: 'left' }
        },
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [255, 247, 237]
        }
      });

      doc.save(`Timetable_${departmentInfo.department}_Sem${departmentInfo.semester}.pdf`);
      toast.success('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('collegeInfo');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getUniqueCount = (field) => {
    if (!combinedEntries) return 0;
    return new Set(combinedEntries.map(e => e[field])).size;
  };

  if (!authChecked) {
    return (
      <DashboardLayout title="Manage Timetable">
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Timetable">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Auth Status */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs flex justify-between items-center">
          <div>
            <p className="font-bold text-blue-700">Auth Status:</p>
            <p>Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
            <p>College: {collegeInfo?.collegeName || 'Not loaded'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
          >
            Logout
          </button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
          <p className="font-bold">Debug Info:</p>
          <p>Total Timetables Found: {allTimetables.length}</p>
          <p>Combined Entries: {combinedEntries.length}</p>
          <p>Department: {filters.department || 'Not selected'}</p>
          <p>Semester: {filters.semester || 'Not selected'}</p>
          <p>Faculty Loaded: {facultyList.length} members</p>
          <p>Time Slots: {customTimeSlots.length}</p>
          <div className="mt-2">
            <p className="font-semibold">Time Slots:</p>
            {customTimeSlots.map((slot, i) => (
              <p key={i} className="text-xs">Slot {i}: {slot}</p>
            ))}
          </div>
          <button 
            onClick={() => {
              console.log('All timetables:', allTimetables);
              console.log('Combined entries:', combinedEntries);
              console.log('Custom time slots:', customTimeSlots);
              logEntriesWithSlots();
            }}
            className="mt-2 px-2 py-1 bg-orange-500 text-white rounded"
          >
            Log State to Console
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manage Timetable</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTimeSlotsModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Edit Time Slots</span>
            </button>
            {combinedEntries.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-orange-500" />
            Filter Timetable
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
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
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Timetable Display */}
        {combinedEntries.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {/* College Header */}
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {collegeInfo?.collegeName || 'GMIT'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Department of {departmentInfo.department} - Semester {departmentInfo.semester}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Academic Year: 2024-25
              </p>
              <p className="text-xs text-orange-500 mt-2 font-semibold">
                Total Classes: {combinedEntries.length}
              </p>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-orange-500 text-white">
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold sticky left-0 bg-orange-500">
                      Day/Time
                    </th>
                    {customTimeSlots.map((slot, index) => (
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
                      {customTimeSlots.map((slot, index) => {
                        const entry = getEntryForTimeSlot(day, index);
                        const occupyingEntry = getOccupyingEntry(day, index);
                        
                        // Determine background color
                        let bgColor = '';
                        if (entry) {
                          bgColor = 'bg-orange-100'; // Start cell
                        } else if (occupyingEntry) {
                          bgColor = 'bg-orange-50'; // Continued cell
                        }
                        
                        return (
                          <td 
                            key={index} 
                            className={`border border-gray-300 p-2 text-center align-top min-h-[100px] relative group ${bgColor} cursor-pointer`}
                            onClick={() => handleEditCell(day, index)}
                          >
                            {entry ? (
                              <div className="bg-orange-100 p-2 rounded-lg border border-orange-300">
                                <p className="font-bold text-orange-800 text-xs sm:text-sm">{entry.subject}</p>
                                <p className="text-xs text-gray-700 mt-1">{entry.facultyName}</p>
                                <p className="text-xs text-orange-600 font-medium mt-1">Room: {entry.room}</p>
                                {entry.duration > 1 && (
                                  <p className="text-[10px] text-orange-500 mt-1">{entry.duration} hrs</p>
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCell(day, index);
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-red-50 hidden group-hover:block"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            ) : occupyingEntry ? (
                              <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                                <p className="font-bold text-orange-700 text-xs sm:text-sm">{occupyingEntry.subject}</p>
                                <p className="text-xs text-gray-600 mt-1">{occupyingEntry.facultyName}</p>
                                <p className="text-xs text-orange-500 font-medium mt-1">Room: {occupyingEntry.room}</p>
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="text-gray-300">—</span>
                                <Plus className="w-4 h-4 text-orange-400 absolute opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                <span>Class Start</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded mr-2"></div>
                <span>Class Continued</span>
              </div>
              <div className="flex items-center">
                <Plus className="w-4 h-4 text-orange-400 mr-2" />
                <span>Click to Add</span>
              </div>
              <div className="flex items-center">
                <Trash2 className="w-4 h-4 text-red-600 mr-2" />
                <span>Delete</span>
              </div>
            </div>

            {/* Quick Stats */}
            {combinedEntries.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total Classes</p>
                  <p className="text-lg font-bold text-orange-600">{combinedEntries.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Faculty</p>
                  <p className="text-lg font-bold text-green-600">{getUniqueCount('facultyId')}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Subjects</p>
                  <p className="text-lg font-bold text-blue-600">{getUniqueCount('subject')}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Rooms</p>
                  <p className="text-lg font-bold text-purple-600">{getUniqueCount('room')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Timetable Message */}
        {!loading && combinedEntries.length === 0 && filters.department && filters.semester && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No timetable entries found for selected filters</p>
            <p className="text-sm text-gray-400 mt-2">Try different department or semester</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCell && (
        <EditCellModal
          entry={selectedCell.entry}
          day={selectedCell.day}
          timeSlot={selectedCell.timeSlot}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCell}
          facultyList={facultyList}
        />
      )}

      {/* Edit Time Slots Modal */}
      {showTimeSlotsModal && (
        <EditTimeSlotsModal
          timeSlots={customTimeSlots}
          onSave={handleSaveTimeSlots}
          onClose={() => setShowTimeSlotsModal(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default ManageTimetable;