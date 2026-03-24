// AITMS/client/src/pages/TeacherLogin.jsx (Updated with correct API URLs)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, GraduationCap, Building2, Users, ChevronDown, Filter } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    collegeId: '',
    department: '',
    facultyId: '',
    email: ''
  });

  // Fetch all colleges from admin database
  useEffect(() => {
    const fetchColleges = async () => {
      setLoadingColleges(true);
      setError(null);
      
      try {
        const API_URL = 'http://localhost:5000/api/client/colleges/all';
        const response = await axios.get(API_URL);

        if (response.data.success) {
          setColleges(response.data.data || []);
          
          if (response.data.data?.length === 0) {
            setError('No colleges found. Please add colleges in admin panel.');
          }
        } else {
          setError('Failed to load colleges');
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
        
        if (error.code === 'ERR_NETWORK') {
          setError('Cannot connect to server. Is the backend running?');
        } else if (error.response) {
          setError(`Server error: ${error.response.status}`);
        } else {
          setError('Failed to load colleges');
        }
        
        toast.error('Failed to load colleges');
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  // Fetch faculty when college is selected
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!formData.collegeId) {
        setFaculty([]);
        setFilteredFaculty([]);
        setDepartments([]);
        return;
      }

      setLoadingFaculty(true);
      setError(null);

      try {
        const API_URL = `http://localhost:5000/api/client/faculty/by-college/${formData.collegeId}`;
        const response = await axios.get(API_URL);

        if (response.data.success) {
          const facultyList = response.data.data || [];
          setFaculty(facultyList);
          setFilteredFaculty(facultyList);
          
          // Extract unique departments
          const uniqueDepts = [...new Set(facultyList.map(f => f.department))];
          setDepartments(uniqueDepts);
          
          if (facultyList.length === 0) {
            toast.info('No faculty members found for this college');
          }
        } else {
          setError('Failed to load faculty');
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        setFaculty([]);
        setFilteredFaculty([]);
        setDepartments([]);
        toast.error('Failed to load faculty');
      } finally {
        setLoadingFaculty(false);
      }
    };

    fetchFaculty();
  }, [formData.collegeId]);

  // Filter faculty when department changes
  useEffect(() => {
    if (!formData.department || formData.department === 'all') {
      setFilteredFaculty(faculty);
    } else {
      const filtered = faculty.filter(f => f.department === formData.department);
      setFilteredFaculty(filtered);
    }
    
    // Reset faculty selection when filter changes
    setFormData(prev => ({
      ...prev,
      facultyId: ''
    }));
  }, [formData.department, faculty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset department and faculty when college changes
    if (name === 'collegeId') {
      setFormData(prev => ({
        ...prev,
        collegeId: value,
        department: '',
        facultyId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = 'http://localhost:5000/api/client/teacher/login';
      
      const response = await axios.post(API_URL, {
        collegeId: formData.collegeId,
        facultyId: formData.facultyId,
        email: formData.email
      });

      if (response.data.success) {
        toast.success('✅ Welcome back, Teacher!');
        
        localStorage.setItem('clientToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('collegeInfo', JSON.stringify(response.data.college));
        
        setTimeout(() => {
          navigate('/teacher/home');
        }, 2000);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || '❌ Login failed');
      } else if (error.request) {
        toast.error('Cannot connect to server');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 border border-orange-100">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-orange-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Teacher Login</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Login to access your teaching portal</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* College Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select College <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base appearance-none bg-white"
                  required
                  disabled={loadingColleges}
                >
                  <option value="">
                    {loadingColleges ? 'Loading colleges...' : '-- Select your college --'}
                  </option>
                  {colleges.length > 0 ? (
                    colleges.map(college => (
                      <option key={college._id} value={college._id}>
                        {college.collegeName} - {college.district}, {college.state}
                      </option>
                    ))
                  ) : (
                    !loadingColleges && <option disabled>No colleges available</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Department Filter - Only show when college selected */}
            {formData.collegeId && departments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Department
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base appearance-none bg-white"
                    disabled={loadingFaculty}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            )}

            {/* Faculty Selection */}
            {formData.collegeId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                  <select
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base appearance-none bg-white"
                    required
                    disabled={loadingFaculty || filteredFaculty.length === 0}
                  >
                    <option value="">
                      {loadingFaculty ? 'Loading faculty...' : '-- Select your name --'}
                    </option>
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map(f => (
                        <option key={f._id} value={f._id}>
                          {f.name} - {f.department} ({f.designation})
                        </option>
                      ))
                    ) : (
                      !loadingFaculty && <option disabled>No faculty available</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {filteredFaculty.length === 0 && !loadingFaculty && (
                  <p className="text-xs text-red-500 mt-1">
                    No faculty found for selected department. Please try another department.
                  </p>
                )}
              </div>
            )}

            {/* Email - For validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use your registered email address
              </p>
            </div>

            {/* Selected Info Display */}
            {formData.facultyId && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-600 font-medium">Selected Faculty:</p>
                <p className="text-sm text-gray-700">
                  {filteredFaculty.find(f => f._id === formData.facultyId)?.name}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !formData.collegeId || !formData.facultyId || !formData.email}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login as Teacher
                </span>
              )}
            </button>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm sm:text-base text-gray-600">
                Not a teacher?{' '}
                <Link to="/student/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Student Login
                </Link>
              </p>
            </div>
          </form>

          {/* Quick Tips */}
          <div className="mt-6 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-orange-600">Quick Tips:</span><br />
              1. Select your college<br />
              2. Filter by department (optional)<br />
              3. Select your name from the list<br />
              4. Enter your registered email
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherLogin;