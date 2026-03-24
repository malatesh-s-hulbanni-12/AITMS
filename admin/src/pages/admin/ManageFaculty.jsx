// AITMS/admin/src/pages/admin/ManageFaculty.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { 
  Search, Edit, Trash2, Eye, X, 
  ChevronLeft, ChevronRight, Loader, RefreshCw,
  User, Mail, Phone, BookOpen, MapPin, GraduationCap, Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// View Faculty Modal Component
const ViewFacultyModal = ({ faculty, onClose }) => {
  if (!faculty) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center">
            <User className="w-5 h-5 mr-2" />
            Faculty Details
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-orange-400 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 border-b border-gray-200 pb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-3xl sm:text-4xl font-bold">
                {faculty.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-800">{faculty.name}</h4>
              <p className="text-orange-600 font-medium">{faculty.designation}</p>
              <p className="text-sm text-gray-500 mt-1">{faculty.department}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem 
              icon={<Mail className="w-4 h-4 text-orange-500" />}
              label="Email" 
              value={faculty.email} 
            />
            <DetailItem 
              icon={<Phone className="w-4 h-4 text-orange-500" />}
              label="Phone" 
              value={faculty.phone} 
            />
            <DetailItem 
              icon={<BookOpen className="w-4 h-4 text-orange-500" />}
              label="Department" 
              value={faculty.department} 
            />
            <DetailItem 
              icon={<GraduationCap className="w-4 h-4 text-orange-500" />}
              label="Qualification" 
              value={faculty.qualification} 
            />
            <DetailItem 
              icon={<Briefcase className="w-4 h-4 text-orange-500" />}
              label="Experience" 
              value={`${faculty.experience} years`} 
            />
            <DetailItem 
              icon={<User className="w-4 h-4 text-orange-500" />}
              label="Designation" 
              value={faculty.designation} 
            />
          </div>

          {/* Address */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
              <MapPin className="w-4 h-4 mr-1 text-orange-500" />
              Address
            </label>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-sm sm:text-base">
              {faculty.address}
            </p>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              faculty.isActive 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {faculty.isActive ? '● Active' : '○ Inactive'}
            </span>
            <span className="text-xs text-gray-500">
              Joined: {new Date(faculty.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Faculty Modal Component
const EditFacultyModal = ({ faculty, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: faculty?.name || '',
    phone: faculty?.phone || '',
    department: faculty?.department || '',
    designation: faculty?.designation || '',
    qualification: faculty?.qualification || '',
    experience: faculty?.experience || '',
    address: faculty?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name || '',
        phone: faculty.phone || '',
        department: faculty.department || '',
        designation: faculty.designation || '',
        qualification: faculty.qualification || '',
        experience: faculty.experience || '',
        address: faculty.address || ''
      });
    }
  }, [faculty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    } else if (formData.experience < 0 || formData.experience > 50) {
      newErrors.experience = 'Experience must be between 0 and 50 years';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://aitms-slnp.onrender.com/api/faculty/${faculty._id}`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('✅ Faculty updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || '❌ Failed to update faculty', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil'
  ];

  if (!faculty) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit Faculty
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-orange-400 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Dr. John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="+91 98765 43210"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.designation ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Professor"
              />
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.qualification ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Ph.D., M.Tech"
              />
              {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                max="50"
                step="0.5"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.experience ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="5"
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>

            {/* Address - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter complete address"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <div className="flex items-center text-sm text-gray-500 mb-1">
      {icon}
      <span className="ml-1">{label}</span>
    </div>
    <p className="text-gray-800 font-medium break-words">{value || 'N/A'}</p>
  </div>
);

// Main Component
const ManageFaculty = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, departmentStats: [] });

  // Get college info from localStorage
  const getCollegeInfo = () => {
    try {
      const collegeInfo = localStorage.getItem('collegeInfo');
      if (collegeInfo) {
        return JSON.parse(collegeInfo);
      }
      return null;
    } catch (error) {
      console.error('Error parsing collegeInfo:', error);
      return null;
    }
  };

  // Fetch faculty data
  const fetchFaculty = async (page = 1) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login again');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (selectedDepartment !== 'all') {
        params.append('department', selectedDepartment);
      }

      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }

      const response = await axios.get(
        `https://aitms-slnp.onrender.com/api/faculty/all?${params}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setFacultyData(response.data.data || []);
        setFilteredFaculty(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error('Failed to fetch faculty data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'https://aitms-slnp.onrender.com/api/faculty/stats',
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem('token');
    const collegeInfo = localStorage.getItem('collegeInfo');
    
    if (!token || !collegeInfo) {
      toast.error('Please login to continue');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    fetchFaculty(currentPage);
    fetchStats();
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchFaculty(currentPage);
  }, [currentPage, selectedDepartment, searchTerm]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `https://aitms-slnp.onrender.com/api/faculty/${id}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('✅ Faculty member deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        fetchFaculty(currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || '❌ Failed to delete faculty', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  // Handle view
  const handleView = (faculty) => {
    setSelectedFaculty(faculty);
    setViewModal(true);
  };

  // Handle edit
  const handleEdit = (faculty) => {
    setSelectedFaculty(faculty);
    setEditModal(true);
  };

  // Handle update after edit
  const handleUpdate = () => {
    fetchFaculty(currentPage);
    fetchStats();
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchFaculty(currentPage);
    fetchStats();
    toast.info('Data refreshed!');
  };

  // Department options
  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil'
  ];

  return (
    <DashboardLayout title="Manage Faculty">
      <div className="space-y-4 sm:space-y-6">
        {/* Statistics Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">Total Faculty</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total || 0}</p>
          </div>
          {stats.departmentStats?.slice(0, 3).map((dept, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500 truncate">{dept._id}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{dept.count}</p>
            </div>
          ))}
        </div>

        {/* Header with Search and Filter - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Faculty Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {/* Faculty Grid - Mobile View (Cards) */}
            <div className="grid grid-cols-1 md:hidden gap-3 sm:gap-4">
              {filteredFaculty.length > 0 ? (
                filteredFaculty.map((faculty) => (
                  <div key={faculty._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{faculty.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{faculty.designation}</p>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                        {faculty.department}
                      </span>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <p className="flex items-center">
                        <span className="mr-2">📧</span> 
                        <span className="truncate">{faculty.email}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📞</span> {faculty.phone}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">🎓</span> {faculty.qualification}
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                      <button 
                        onClick={() => handleView(faculty)} 
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(faculty)} 
                        className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(faculty._id)} 
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No faculty members found</p>
                </div>
              )}
            </div>

            {/* Faculty Table - Desktop View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map((faculty) => (
                        <tr key={faculty._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {faculty.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{faculty.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                              {faculty.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{faculty.designation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{faculty.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{faculty.qualification}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button 
                              onClick={() => handleView(faculty)} 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg mx-1"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(faculty)} 
                              className="p-1 text-green-600 hover:bg-green-50 rounded-lg mx-1"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(faculty._id)} 
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg mx-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-500">
                          No faculty members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination - Mobile Responsive */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {viewModal && (
        <ViewFacultyModal 
          faculty={selectedFaculty} 
          onClose={() => {
            setViewModal(false);
            setSelectedFaculty(null);
          }} 
        />
      )}

      {editModal && (
        <EditFacultyModal 
          faculty={selectedFaculty} 
          onClose={() => {
            setEditModal(false);
            setSelectedFaculty(null);
          }}
          onUpdate={handleUpdate}
        />
      )}
    </DashboardLayout>
  );
};

export default ManageFaculty;
