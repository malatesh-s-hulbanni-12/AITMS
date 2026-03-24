// AITMS/admin/src/components/Layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, User, 
  Users, CalendarClock, Settings, Bell,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        // On desktop, sidebar is closed by default, opens on hover
        setSidebarOpen(false);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Get college info from localStorage
    const storedCollege = localStorage.getItem('collegeInfo');
    if (storedCollege) {
      setCollegeInfo(JSON.parse(storedCollege));
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle hover effects
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(isHovered);
    }
  }, [isHovered, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('collegeInfo');
    toast.success('👋 Logged out successfully!');
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  // Function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle navigation and close sidebar on mobile
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
      setIsHovered(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-orange-500 to-orange-600 text-white z-30 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header */}
        <div className={`p-4 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-8 h-8" />
                <span className="font-bold text-lg">AITMS</span>
              </div>
              {isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className="p-1 hover:bg-orange-400 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            <CalendarClock className="w-8 h-8 mx-auto" />
          )}
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-8">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            text="Dashboard" 
            active={isActive('/admin/dashboard')}
            sidebarOpen={sidebarOpen}
            onClick={() => handleNavigation('/admin/dashboard')}
          />
          <SidebarItem 
            icon={<Users />} 
            text="Add Faculty" 
            active={isActive('/admin/add-faculty')}
            sidebarOpen={sidebarOpen}
            onClick={() => handleNavigation('/admin/add-faculty')}
          />
          <SidebarItem 
            icon={<User />} 
            text="Manage Faculty" 
            active={isActive('/admin/manage-faculty')}
            sidebarOpen={sidebarOpen}
            onClick={() => handleNavigation('/admin/manage-faculty')}
          />
          <SidebarItem 
            icon={<CalendarClock />} 
            text="Create Timetable" 
            active={isActive('/admin/create-timetable')}
            sidebarOpen={sidebarOpen}
            onClick={() => handleNavigation('/admin/create-timetable')}
          />
          <SidebarItem 
            icon={<Settings />} 
            text="Manage Timetable" 
            active={isActive('/admin/manage-timetable')}
            sidebarOpen={sidebarOpen}
            onClick={() => handleNavigation('/admin/manage-timetable')}
          />
        </nav>

        {/* Sidebar Footer - College Info */}
        <div className={`absolute bottom-4 w-full ${sidebarOpen ? 'px-4' : 'px-2'}`}>
          <div 
            className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} p-2 hover:bg-orange-400 rounded-lg cursor-pointer transition-colors`}
            onClick={() => handleNavigation('/admin/dashboard')}
          >
            {sidebarOpen ? (
              <>
                <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {collegeInfo?.collegeName || 'Admin'}
                  </p>
                  <p className="text-xs text-orange-100 truncate">
                    {collegeInfo?.collegeEmail || 'admin@college.edu'}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-700" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Mobile menu button and title */}
              <div className="flex items-center">
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                )}
                <h1 className={`${isMobile ? 'ml-2' : ''} text-xl font-semibold text-gray-800 hidden sm:block`}>
                  {title}
                </h1>
              </div>

              {/* Right side - College info and logout */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                </button>

                {/* College Info - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {collegeInfo?.collegeName || 'College Name'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {collegeInfo?.collegeEmail || 'email@college.edu'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {collegeInfo?.collegeName?.charAt(0) || 'C'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Title - Shown below navbar on mobile */}
            <div className="sm:hidden py-2 border-t border-gray-100">
              <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, text, active, sidebarOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-6 justify-center'} py-3 mb-1 transition-colors relative group
        ${active 
          ? 'bg-orange-400 text-white' 
          : 'text-orange-100 hover:bg-orange-400 hover:text-white'
        }`}
    >
      <span className={`${sidebarOpen ? 'mr-3' : ''}`}>{icon}</span>
      {sidebarOpen ? (
        <span className="text-sm font-medium">{text}</span>
      ) : (
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          {text}
        </span>
      )}
    </button>
  );
};

export default DashboardLayout;