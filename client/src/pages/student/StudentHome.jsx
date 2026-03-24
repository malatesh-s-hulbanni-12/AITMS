// AITMS/client/src/pages/student/StudentHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Calendar, Clock, 
  Bell, User, LogOut, Menu, X, ChevronRight,
  Home, FileText, Users, Settings, Moon, Sun,
  Award, TrendingUp, AlertCircle, CheckCircle,
  Download, Share2, Filter, Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import StudentAIChatButton from '../../components/StudentAIChatButton';

const StudentHome = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('timetable');

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    const college = localStorage.getItem('collegeInfo');
    const token = localStorage.getItem('clientToken');
    
    if (user) setUserInfo(JSON.parse(user));
    if (college) setCollegeInfo(JSON.parse(college));
    
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Sample data
  const timetableData = [
    { day: 'Monday', time: '09:00 - 10:00', subject: 'Data Structures', faculty: 'Dr. Rajesh Kumar', room: 'A-101' },
    { day: 'Monday', time: '10:00 - 11:00', subject: 'Database Systems', faculty: 'Prof. Sunita Sharma', room: 'A-102' },
    { day: 'Tuesday', time: '09:00 - 10:00', subject: 'Operating Systems', faculty: 'Dr. Amit Patel', room: 'B-201' },
    { day: 'Tuesday', time: '11:00 - 12:00', subject: 'Computer Networks', faculty: 'Prof. Priya Singh', room: 'B-202' },
  ];

  const assignmentsData = [
    { id: 1, subject: 'Data Structures', title: 'Binary Tree Implementation', dueDate: '2024-03-25', status: 'pending', marks: 20 },
    { id: 2, subject: 'Database Systems', title: 'SQL Queries', dueDate: '2024-03-26', status: 'submitted', marks: 15 },
    { id: 3, subject: 'Operating Systems', title: 'Process Scheduling', dueDate: '2024-03-27', status: 'pending', marks: 25 },
    { id: 4, subject: 'Computer Networks', title: 'Network Topologies', dueDate: '2024-03-28', status: 'late', marks: 10 },
  ];

  const examsData = [
    { subject: 'Data Structures', date: '2024-04-10', time: '10:00 AM', venue: 'Hall A', duration: '3 hours' },
    { subject: 'Database Systems', date: '2024-04-12', time: '10:00 AM', venue: 'Hall B', duration: '3 hours' },
    { subject: 'Operating Systems', date: '2024-04-15', time: '10:00 AM', venue: 'Hall A', duration: '3 hours' },
  ];

  const attendanceData = [
    { subject: 'Data Structures', total: 20, attended: 18, percentage: 90 },
    { subject: 'Database Systems', total: 20, attended: 17, percentage: 85 },
    { subject: 'Operating Systems', total: 18, attended: 15, percentage: 83 },
    { subject: 'Computer Networks', total: 18, attended: 14, percentage: 78 },
  ];

  const resultsData = [
    { subject: 'Data Structures', internal: 18, external: 65, total: 83 },
    { subject: 'Database Systems', internal: 17, external: 68, total: 85 },
    { subject: 'Operating Systems', internal: 16, external: 62, total: 78 },
    { subject: 'Computer Networks', internal: 15, external: 60, total: 75 },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = timetableData.filter(item => item.day === today);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-gray-800 dark:text-white">Student Portal</span>
          </div>
          <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white">Student</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-300 font-semibold text-lg">
                {userInfo?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{userInfo?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo?.email}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>📚 Semester {userInfo?.semester} • {userInfo?.department}</p>
            <p>🏫 {collegeInfo?.name}</p>
            <p>📝 Enrollment: {userInfo?.enrollmentNo}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <SidebarItem icon={<Home className="w-5 h-5" />} text="Dashboard" active={activeTab === 'timetable'} onClick={() => { setActiveTab('timetable'); setSidebarOpen(false); }} />
          <SidebarItem icon={<BookOpen className="w-5 h-5" />} text="Timetable" active={activeTab === 'timetable'} onClick={() => { setActiveTab('timetable'); setSidebarOpen(false); }} />
          <SidebarItem icon={<FileText className="w-5 h-5" />} text="Assignments" active={activeTab === 'assignments'} onClick={() => { setActiveTab('assignments'); setSidebarOpen(false); }} />
          <SidebarItem icon={<Calendar className="w-5 h-5" />} text="Exams" active={activeTab === 'exams'} onClick={() => { setActiveTab('exams'); setSidebarOpen(false); }} />
          <SidebarItem icon={<Award className="w-5 h-5" />} text="Results" active={activeTab === 'results'} onClick={() => { setActiveTab('results'); setSidebarOpen(false); }} />
          <SidebarItem icon={<TrendingUp className="w-5 h-5" />} text="Attendance" active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }} />
          <SidebarItem icon={<Users className="w-5 h-5" />} text="Faculty" onClick={() => { setSidebarOpen(false); }} />
          <SidebarItem icon={<Settings className="w-5 h-5" />} text="Settings" onClick={() => { setSidebarOpen(false); }} />
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {userInfo?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-orange-100">Here's your academic overview for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <StatCard title="Today's Classes" value={todayClasses.length} icon={<Clock />} color="orange" />
          <StatCard title="Assignments" value={assignmentsData.filter(a => a.status === 'pending').length} icon={<FileText />} color="green" />
          <StatCard title="Attendance" value="85%" icon={<Users />} color="blue" />
          <StatCard title="CGPA" value="8.5" icon={<Award />} color="purple" />
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-6">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
              <span className="text-sm text-orange-600">{today}</span>
            </div>
            
            {todayClasses.length > 0 ? (
              <div className="space-y-3">
                {todayClasses.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-16 text-sm font-medium text-orange-600">{item.time.split(' - ')[0]}</div>
                    <div className="flex-1 ml-4">
                      <p className="font-medium text-gray-800 dark:text-white">{item.subject}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.faculty} • Room {item.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No classes scheduled for today</p>
            )}
          </div>

          {/* Quick Access Tabs */}
          <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <TabButton active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} text="Full Timetable" />
            <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} text="Assignments" />
            <TabButton active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} text="Exams" />
            <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} text="Results" />
            <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} text="Attendance" />
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            {activeTab === 'timetable' && <FullTimetable data={timetableData} />}
            {activeTab === 'assignments' && <AssignmentsList data={assignmentsData} />}
            {activeTab === 'exams' && <ExamsList data={examsData} />}
            {activeTab === 'results' && <ResultsList data={resultsData} />}
            {activeTab === 'attendance' && <AttendanceList data={attendanceData} />}
          </div>
        </div>
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Student AI Chat Button */}
      <StudentAIChatButton 
        userInfo={userInfo}
        collegeInfo={collegeInfo}
      />
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, text, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
    ${active ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </button>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center`}>
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
      </div>
    </div>
  );
};

// Tab Button
const TabButton = ({ active, onClick, text }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg whitespace-nowrap mr-2 transition-colors
    ${active ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
    {text}
  </button>
);

// Full Timetable Component
const FullTimetable = ({ data }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="space-y-4">
      {days.map(day => {
        const dayClasses = data.filter(item => item.day === day);
        return (
          <div key={day} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{day}</h3>
            {dayClasses.length > 0 ? (
              <div className="space-y-2">
                {dayClasses.map((item, index) => (
                  <div key={index} className="flex text-sm">
                    <span className="w-24 text-gray-500 dark:text-gray-400">{item.time}</span>
                    <span className="flex-1 text-gray-800 dark:text-white">{item.subject}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.room}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-600">No classes</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Assignments List Component
const AssignmentsList = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.subject} • Due: {item.dueDate}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-xs px-2 py-1 rounded-full ${
            item.status === 'submitted' ? 'bg-green-100 text-green-600' :
            item.status === 'late' ? 'bg-red-100 text-red-600' :
            'bg-yellow-100 text-yellow-600'
          }`}>
            {item.status}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{item.marks} marks</span>
        </div>
      </div>
    ))}
  </div>
);

// Exams List Component
const ExamsList = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between mb-2">
          <p className="font-medium text-gray-800 dark:text-white">{item.subject}</p>
          <span className="text-sm text-orange-600">{item.duration}</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span>📅 {item.date}</span>
          <span>⏰ {item.time}</span>
          <span>📍 {item.venue}</span>
        </div>
      </div>
    ))}
  </div>
);

// Results List Component
const ResultsList = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="font-medium text-gray-800 dark:text-white">{item.subject}</p>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Int: {item.internal}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Ext: {item.external}</span>
          <span className="font-semibold text-green-600">{item.total}</span>
        </div>
      </div>
    ))}
  </div>
);

// Attendance List Component
const AttendanceList = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between mb-2">
          <p className="font-medium text-gray-800 dark:text-white">{item.subject}</p>
          <span className={`font-semibold ${item.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {item.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${item.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${item.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {item.attended} out of {item.total} classes attended
        </p>
      </div>
    ))}
  </div>
);

export default StudentHome;