// AITMS/admin/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Users, CalendarClock, BookOpen, TrendingUp, Award, Clock, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    totalCourses: 0,
    todayClasses: 0,
    recentFaculty: [],
    todaySchedule: []
  });
  const [loading, setLoading] = useState(true);
  const [collegeInfo, setCollegeInfo] = useState(null);

  // Fetch college info from localStorage
  useEffect(() => {
    const storedCollege = localStorage.getItem('collegeInfo');
    if (storedCollege) {
      setCollegeInfo(JSON.parse(storedCollege));
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!collegeInfo?._id) return;
      
      setLoading(true);
      console.log('📊 Fetching dashboard data for college:', collegeInfo._id);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Please login again');
          return;
        }

        // Fetch faculty stats
        console.log('📡 Fetching faculty stats...');
        const facultyResponse = await axios.get(
          `https://aitms-slnp.onrender.com/api/faculty/stats`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // Fetch students count
        console.log('📡 Fetching students count...');
        const studentsResponse = await axios.get(
          `https://aitms-slnp.onrender.com/api/client/students/count?collegeId=${collegeInfo._id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // Fetch courses/timetables
        console.log('📡 Fetching timetables...');
        const timetablesResponse = await axios.get(
          `https://aitms-slnp.onrender.com/api/timetable/all?limit=100`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // Fetch today's schedule
        console.log('📡 Fetching today\'s schedule...');
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayScheduleResponse = await axios.get(
          `https://aitms-slnp.onrender.com/api/timetable/today?day=${today}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // Process faculty stats
        let totalFaculty = 0;
        let recentFaculty = [];
        if (facultyResponse.data.success) {
          totalFaculty = facultyResponse.data.data.total || 0;
          recentFaculty = facultyResponse.data.data.recent || [];
          console.log('✅ Faculty stats:', { totalFaculty, recentFacultyCount: recentFaculty.length });
        }

        // Process students count
        let totalStudents = 0;
        if (studentsResponse.data.success) {
          totalStudents = studentsResponse.data.data.count || 0;
          console.log('✅ Students count:', totalStudents);
        }

        // Process timetables to get unique courses
        let totalCourses = 0;
        let uniqueSubjects = new Set();
        if (timetablesResponse.data.success) {
          timetablesResponse.data.data.forEach(timetable => {
            timetable.entries?.forEach(entry => {
              uniqueSubjects.add(entry.subject);
            });
          });
          totalCourses = uniqueSubjects.size;
          console.log('✅ Total courses:', totalCourses);
        }

        // Process today's schedule
        let todayClasses = 0;
        let todaySchedule = [];
        if (todayScheduleResponse.data.success) {
          todayClasses = todayScheduleResponse.data.data.count || 0;
          todaySchedule = todayScheduleResponse.data.data.entries || [];
          console.log('✅ Today\'s classes:', todayClasses);
        }

        setStats({
          totalFaculty,
          totalStudents,
          totalCourses,
          todayClasses,
          recentFaculty: recentFaculty.slice(0, 5), // Get only 5 most recent
          todaySchedule: todaySchedule.slice(0, 5) // Get only 5 for display
        });

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [collegeInfo]);

  // Format date for display
  const formatTime = (timeSlot) => {
    return timeSlot.split(' - ')[0];
  };

  // Get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate change percentages
  const statsWithChanges = [
    { 
      title: 'Total Faculty', 
      value: stats.totalFaculty.toString(), 
      icon: <Users />, 
      color: 'bg-blue-500', 
      change: `+${Math.floor(stats.totalFaculty * 0.1) || 1}` 
    },
    { 
      title: 'Total Students', 
      value: stats.totalStudents.toLocaleString(), 
      icon: <BookOpen />, 
      color: 'bg-green-500', 
      change: `+${Math.floor(stats.totalStudents * 0.05) || 5}` 
    },
    { 
      title: 'Active Courses', 
      value: stats.totalCourses.toString(), 
      icon: <Award />, 
      color: 'bg-purple-500', 
      change: `+${Math.floor(stats.totalCourses * 0.1) || 2}` 
    },
    { 
      title: 'Today\'s Classes', 
      value: stats.todayClasses.toString(), 
      icon: <Clock />, 
      color: 'bg-orange-500', 
      change: stats.todayClasses > 0 ? 'ongoing' : 'none' 
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* College Info Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-2">{collegeInfo?.collegeName || 'College Dashboard'}</h2>
          <p className="text-orange-100">Welcome back! Here's your college overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsWithChanges.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                {stat.change !== 'none' && (
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.change === 'ongoing' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CalendarClock className="w-5 h-5 mr-2 text-orange-500" />
              Today's Schedule
            </h3>
            {stats.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {stats.todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-16 text-sm font-medium text-orange-600">
                      {formatTime(item.timeSlot)}
                    </div>
                    <div className="flex-1 ml-2">
                      <p className="font-medium text-gray-800">{item.subject}</p>
                      <p className="text-sm text-gray-500">
                        {item.facultyName} • Room {item.room}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{item.department}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No classes scheduled for today</p>
              </div>
            )}
            {stats.todayClasses > 5 && (
              <button className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium">
                View all {stats.todayClasses} classes →
              </button>
            )}
          </div>

          {/* Recent Faculty */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-500" />
              Recently Added Faculty
            </h3>
            {stats.recentFaculty.length > 0 ? (
              <div className="space-y-3">
                {stats.recentFaculty.map((faculty, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-semibold">
                        {getInitials(faculty.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{faculty.name}</p>
                      <p className="text-sm text-gray-500">
                        {faculty.department} • {faculty.designation}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(faculty.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No faculty added yet</p>
              </div>
            )}
            {stats.totalFaculty > 5 && (
              <button className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium">
                View all {stats.totalFaculty} faculty →
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Department Count</p>
            <p className="text-xl font-bold text-orange-600">8</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Total Timetables</p>
            <p className="text-xl font-bold text-green-600">{stats.totalCourses > 0 ? 'Active' : '0'}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Academic Year</p>
            <p className="text-xl font-bold text-blue-600">2024-25</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">System Status</p>
            <p className="text-xl font-bold text-purple-600">Active</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
