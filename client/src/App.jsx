// AITMS/client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import TeacherLogin from './pages/TeacherLogin';

// Student Pages
import StudentHome from './pages/student/StudentHome';

// Teacher Pages
import TeacherHome from './pages/teacher/TeacherHome';

// Protected Route Component
const ProtectedRoute = ({ children, userType }) => {
  const token = localStorage.getItem('clientToken');
  const userInfo = localStorage.getItem('userInfo');
  
  if (!token || !userInfo) {
    // Clear invalid data
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('collegeInfo');
    
    // Redirect to appropriate login
    if (userType === 'teacher') {
      return <Navigate to="/teacher/login" replace />;
    }
    return <Navigate to="/student/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      
      <Routes>
        {/* Redirect root to student login */}
        <Route path="/" element={<Navigate to="/student/login" replace />} />
        
        {/* ========== AUTH ROUTES ========== */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        
        {/* ========== STUDENT ROUTES ========== */}
        <Route 
          path="/student/home" 
          element={
            <ProtectedRoute userType="student">
              <StudentHome />
            </ProtectedRoute>
          } 
        />
        
        {/* ========== TEACHER ROUTES ========== */}
        <Route 
          path="/teacher/home" 
          element={
            <ProtectedRoute userType="teacher">
              <TeacherHome />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy redirects - keep for backward compatibility */}
        <Route path="/home" element={<Navigate to="/student/home" replace />} />
        <Route path="/student/dashboard" element={<Navigate to="/student/home" replace />} />
        <Route path="/teacher/dashboard" element={<Navigate to="/teacher/home" replace />} />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/student/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;