// AITMS/client/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Calendar, Clock, 
  Bell, User, LogOut, Menu, X, ChevronRight,
  Home as HomeIcon, Users, FileText, Settings,
  Moon, Sun, Download, Share2, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('timetable'); // 'timetable', 'assignments', 'exams'

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('userInfo');
    const college = localStorage.getItem('collegeInfo');
    
    if (user) {
      setUserInfo(JSON.parse(user));
    }
    if (college) {
      setCollegeInfo(JSON.parse(college));
    }

    // Check if user is logged in
    const token = localStorage.getItem('clientToken');
    if (!token) {
      navigate('/student/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('collegeInfo');
    toast.success('👋 Logged out successfully!');
    navigate('/student/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Sample timetable data
  const timetableData = [
    { day: 'Monday', time: '09:00 - 10:00', subject: 'Data Structures', faculty: 'Dr. Rajesh Kumar', room: 'A-101' },
    { day: 'Monday', time: '10:00 - 11:00', subject: 'Database Systems', faculty: 'Prof. Sunita Sharma', room: 'A-102' },
    { day: 'Tuesday', time: '09:00 - 10:00', subject: 'Operating Systems', faculty: 'Dr. Amit Patel', room: 'B-201' },
    { day: 'Tuesday', time: '11:00 - 12:00', subject: 'Computer Networks', faculty: 'Prof. Priya Singh', room: 'B-202' },
    { day: 'Wednesday', time: '09:00 - 10:00', subject: 'Software Engineering', faculty: 'Dr. Rajesh Kumar', room: 'A-101' },
    { day: 'Wednesday', time: '10:00 - 11:00', subject: 'Web Development', faculty: 'Prof. Sunita Sharma', room: 'A-102' },
  ];

  // Sample assignments data
  const assignmentsData = [
    { subject: 'Data Structures', title: 'Binary Trees Implementation', dueDate: '2024-03-25', status: 'pending' },
    { subject: 'Database Systems', title: 'SQL Queries Assignment', dueDate: '2024-03-26', status: 'submitted' },
    { subject: 'Operating Systems', title: 'Process Scheduling Algorithms', dueDate: '2024-03-27', status: 'pending' },
    { subject: 'Computer Networks', title: 'Network Topologies', dueDate: '2024-03-28', status: 'late' },
  ];

  // Sample exams data
  const examsData = [
    { subject: 'Data Structures', date: '2024-04-10', time: '10:00 AM - 01:00 PM', venue: 'Hall A' },
    { subject: 'Database Systems', date: '2024-04-12', time: '10:00 AM - 01:00 PM', venue: 'Hall B' },
    { subject: 'Operating Systems', date: '2024-04-15', time: '10:00 AM - 01:00 PM', venue: 'Hall A' },
    { subject: 'Computer Networks', date: '2024-04-18', time: '10:00 AM - 01:00 PM', venue: 'Hall C' },
  ];

  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = timetableData.filter(item => item.day === today);

  // Get upcoming assignments
  const today_date = new Date().toISOString().split('T')[0];
  const upcomingAssignments = assignmentsData.filter(item => item.dueDate >= today_date).slice(0, 3);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userType = userInfo?.designation ? 'teacher' : 'student';
  const greeting = userType === 'teacher' ? 'Welcome, Professor' : 'Welcome, Student';
  const userName = userInfo?.name || userInfo?.fullName || 'User';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-gray-800 dark:text-white">AITMS</span>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white">AITMS</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-300 font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userInfo?.email}
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <p>{collegeInfo?.name || 'College Name'}</p>
            <p className="mt-1">
              {userType === 'teacher' ? userInfo?.department : `Semester ${userInfo?.semester} • ${userInfo?.department}`}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          <SidebarItem icon={<HomeIcon className="w-5 h-5" />} text="Dashboard" active={view === 'timetable'} onClick={() => setView('timetable')} />
          <SidebarItem icon={<BookOpen className="w-5 h-5" />} text="Timetable" active={view === 'timetable'} onClick={() => setView('timetable')} />
          <SidebarItem icon={<FileText className="w-5 h-5" />} text="Assignments" active={view === 'assignments'} onClick={() => setView('assignments')} />
          <SidebarItem icon={<Calendar className="w-5 h-5" />} text="Exams" active={view === 'exams'} onClick={() => setView('exams')} />
          <SidebarItem icon={<Users className="w-5 h-5" />} text="Faculty" />
          <SidebarItem icon={<Settings className="w-5 h-5" />} text="Settings" />
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Top Bar - Desktop */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {greeting}, {userName.split(' ')[0]}!
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 lg:p-8">
          <div className="max-w-4xl">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {greeting}, {userName}!
            </h1>
            <p className="text-orange-100 text-sm lg:text-base">
              {userType === 'teacher' 
                ? 'Manage your classes, assignments, and track student progress.'
                : 'Check your schedule, assignments, and exam timetable.'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{todaySchedule.length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">4</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming Exams</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{examsData.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">85%</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-6">
          {/* View Tabs - Mobile Responsive */}
          <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <div className="flex space-x-2">
              <TabButton 
                active={view === 'timetable'} 
                onClick={() => setView('timetable')}
                icon={<Clock className="w-4 h-4" />}
                text="Timetable"
              />
              <TabButton 
                active={view === 'assignments'} 
                onClick={() => setView('assignments')}
                icon={<FileText className="w-4 h-4" />}
                text="Assignments"
              />
              <TabButton 
                active={view === 'exams'} 
                onClick={() => setView('exams')}
                icon={<Calendar className="w-4 h-4" />}
                text="Exams"
              />
            </div>
          </div>

          {/* Timetable View */}
          {view === 'timetable' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Today's Schedule
                </h2>
                <button className="text-sm text-orange-600 hover:text-orange-700 flex items-center">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Mobile Timetable Cards */}
              <div className="space-y-3">
                {todaySchedule.length > 0 ? (
                  todaySchedule.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{item.subject}</h3>
                        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-1 rounded-full">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.faculty}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Room: {item.room}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No classes scheduled for today</p>
                  </div>
                )}
              </div>

              {/* Weekly Schedule Preview */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  This Week
                </h2>
                <div className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const dayClasses = timetableData.filter(item => item.day === day);
                    return (
                      <div key={day} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{day}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {dayClasses.length} classes
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Assignments View */}
          {view === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Pending Assignments
                </h2>
                <button className="text-sm text-orange-600 hover:text-orange-700">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {assignmentsData.map((assignment, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.subject}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        assignment.status === 'submitted' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                          : assignment.status === 'late'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exams View */}
          {view === 'exams' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Upcoming Examinations
              </h2>

              <div className="space-y-3">
                {examsData.map((exam, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{exam.subject}</h3>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                        {exam.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {new Date(exam.date).toLocaleDateString()}</span>
                      <span>📍 {exam.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
      ${active 
        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
  >
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </button>
);

// Tab Button Component
const TabButton = ({ active, onClick, icon, text }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
      ${active
        ? 'bg-orange-500 text-white'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
  >
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </button>
);

export default Home;