// AITMS/client/src/pages/teacher/TeacherHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Calendar, Clock, 
  Bell, User, LogOut, Menu, X, ChevronRight,
  Home, FileText, Users, Settings, Moon, Sun,
  Award, TrendingUp, MessageSquare, Video,
  Download, Share2, Filter, Plus, Edit, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import AIChatButton from '../../components/AIChatButton'; // Import the AI Chat component

const TeacherHome = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('classes');

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    const college = localStorage.getItem('collegeInfo');
    const token = localStorage.getItem('clientToken');
    
    if (user) setUserInfo(JSON.parse(user));
    if (college) setCollegeInfo(JSON.parse(college));
    
    if (!token) {
      navigate('/teacher/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('collegeInfo');
    toast.success('👋 Logged out successfully!');
    navigate('/teacher/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Sample data
  const todayClasses = [
    { time: '09:00 - 10:00', subject: 'Data Structures', class: 'CS 3rd Sem', room: 'A-101', students: 65 },
    { time: '10:00 - 11:00', subject: 'Database Systems', class: 'CS 3rd Sem', room: 'A-102', students: 62 },
    { time: '11:00 - 12:00', subject: 'Operating Systems', class: 'CS 5th Sem', room: 'B-201', students: 58 },
  ];

  const coursesData = [
    { id: 1, name: 'Data Structures', code: 'CS301', semester: 3, students: 65, assignments: 4 },
    { id: 2, name: 'Database Systems', code: 'CS302', semester: 3, students: 62, assignments: 3 },
    { id: 3, name: 'Operating Systems', code: 'CS501', semester: 5, students: 58, assignments: 5 },
    { id: 4, name: 'Computer Networks', code: 'CS502', semester: 5, students: 54, assignments: 4 },
  ];

  const assignmentsData = [
    { id: 1, title: 'Binary Tree Implementation', course: 'Data Structures', dueDate: '2024-03-25', submissions: 45, total: 65 },
    { id: 2, title: 'SQL Queries Assignment', course: 'Database Systems', dueDate: '2024-03-26', submissions: 38, total: 62 },
    { id: 3, title: 'Process Scheduling Algorithms', course: 'Operating Systems', dueDate: '2024-03-27', submissions: 25, total: 58 },
  ];

  const attendanceData = [
    { date: '2024-03-18', subject: 'Data Structures', present: 58, total: 65, percentage: 89 },
    { date: '2024-03-18', subject: 'Database Systems', present: 55, total: 62, percentage: 88 },
    { date: '2024-03-17', subject: 'Operating Systems', present: 50, total: 58, percentage: 86 },
  ];

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
            <span className="font-bold text-gray-800 dark:text-white">Teacher Portal</span>
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
              <span className="font-bold text-gray-800 dark:text-white">Faculty</span>
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
            <p>📚 {userInfo?.department} • {userInfo?.designation}</p>
            <p>🏫 {collegeInfo?.name}</p>
            <p>📝 Employee ID: {userInfo?.id?.slice(-6)}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <SidebarItem icon={<Home className="w-5 h-5" />} text="Dashboard" active={activeTab === 'classes'} onClick={() => { setActiveTab('classes'); setSidebarOpen(false); }} />
          <SidebarItem icon={<BookOpen className="w-5 h-5" />} text="My Classes" active={activeTab === 'classes'} onClick={() => { setActiveTab('classes'); setSidebarOpen(false); }} />
          <SidebarItem icon={<FileText className="w-5 h-5" />} text="Assignments" active={activeTab === 'assignments'} onClick={() => { setActiveTab('assignments'); setSidebarOpen(false); }} />
          <SidebarItem icon={<Users className="w-5 h-5" />} text="Students" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setSidebarOpen(false); }} />
          <SidebarItem icon={<Calendar className="w-5 h-5" />} text="Attendance" active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }} />
          <SidebarItem icon={<Award className="w-5 h-5" />} text="Results" active={activeTab === 'results'} onClick={() => { setActiveTab('results'); setSidebarOpen(false); }} />
          <SidebarItem icon={<MessageSquare className="w-5 h-5" />} text="Messages" onClick={() => { setSidebarOpen(false); }} />
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
          <h1 className="text-2xl font-bold mb-2">Welcome back, Prof. {userInfo?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-orange-100">Here's your teaching overview for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <StatCard title="Today's Classes" value={todayClasses.length} icon={<Clock />} color="orange" />
          <StatCard title="Total Students" value="239" icon={<Users />} color="green" />
          <StatCard title="Courses" value={coursesData.length} icon={<BookOpen />} color="blue" />
          <StatCard title="Assignments" value="12" icon={<FileText />} color="purple" />
        </div>

        {/* Main Content Area */}
        <div className="px-6 pb-6">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Classes</h2>
              <button className="text-sm text-orange-600 flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Class
              </button>
            </div>
            
            <div className="space-y-3">
              {todayClasses.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-16 text-sm font-medium text-orange-600">{item.time.split(' - ')[0]}</div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium text-gray-800 dark:text-white">{item.subject}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.class} • Room {item.room} • {item.students} students</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-orange-500">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Tabs */}
          <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <TabButton active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} text="My Courses" />
            <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} text="Assignments" />
            <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} text="Students" />
            <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} text="Attendance" />
            <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} text="Results" />
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            {activeTab === 'classes' && <CoursesList data={coursesData} />}
            {activeTab === 'assignments' && <TeacherAssignments data={assignmentsData} />}
            {activeTab === 'students' && <StudentsList />}
            {activeTab === 'attendance' && <TeacherAttendance data={attendanceData} />}
            {activeTab === 'results' && <TeacherResults />}
          </div>
        </div>
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* AI Chat Button */}
      <AIChatButton 
        userInfo={userInfo}
        collegeInfo={collegeInfo}
        todayClasses={todayClasses}
        coursesData={coursesData}
        assignmentsData={assignmentsData}
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

// Courses List Component
const CoursesList = ({ data }) => (
  <div className="space-y-3">
    {data.map((course) => (
      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-gray-800 dark:text-white">{course.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{course.code} • Semester {course.semester}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">{course.students} students</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{course.assignments} assignments</span>
          <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

// Teacher Assignments Component
const TeacherAssignments = ({ data }) => (
  <div className="space-y-3">
    {data.map((item) => (
      <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between mb-2">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.course}</p>
          </div>
          <span className="text-sm text-orange-600">Due: {item.dueDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">📊 {item.submissions}/{item.total} submitted</span>
            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${(item.submissions / item.total) * 100}%` }}
              />
            </div>
          </div>
          <button className="text-sm text-orange-600 hover:text-orange-700">Grade</button>
        </div>
      </div>
    ))}
  </div>
);

// Students List Component
const StudentsList = () => {
  const students = [
    { id: 1, name: 'John Doe', enrollment: 'EN2024001', attendance: 85, marks: 78 },
    { id: 2, name: 'Jane Smith', enrollment: 'EN2024002', attendance: 92, marks: 85 },
    { id: 3, name: 'Mike Johnson', enrollment: 'EN2024003', attendance: 78, marks: 72 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Enrollment</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Attendance</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Marks</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-4 py-2 text-sm text-gray-800 dark:text-white">{student.name}</td>
              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{student.enrollment}</td>
              <td className="px-4 py-2">
                <span className={`text-sm ${student.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                  {student.attendance}%
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{student.marks}</td>
              <td className="px-4 py-2">
                <button className="text-orange-600 hover:text-orange-700 text-sm">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Teacher Attendance Component
const TeacherAttendance = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between mb-2">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{item.subject}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
          </div>
          <span className={`font-semibold ${item.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {item.percentage}%
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {item.present} out of {item.total} students present
        </p>
      </div>
    ))}
  </div>
);

// Teacher Results Component
const TeacherResults = () => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
    <p>Results management coming soon...</p>
  </div>
);

export default TeacherHome;