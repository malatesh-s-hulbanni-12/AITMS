// AITMS/admin/src/App.jsx (with Dashboard)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Register from './pages/Register';
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AddFaculty from './pages/admin/AddFaculty';
import ManageFaculty from './pages/admin/ManageFaculty';
import CreateTimetable from './pages/admin/CreateTimetable';
import ManageTimetable from './pages/admin/ManageTimetable';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const collegeInfo = localStorage.getItem('collegeInfo');
  
  if (!token || !collegeInfo) {
    localStorage.removeItem('token');
    localStorage.removeItem('collegeInfo');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const collegeInfo = localStorage.getItem('collegeInfo');
  
  if (token && collegeInfo) {
    return <Navigate to="/admin/dashboard" replace />;
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
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Navigate to="/register" replace />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/add-faculty" 
          element={
            <ProtectedRoute>
              <AddFaculty />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/manage-faculty" 
          element={
            <ProtectedRoute>
              <ManageFaculty />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/create-timetable" 
          element={
            <ProtectedRoute>
              <CreateTimetable />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/manage-timetable" 
          element={
            <ProtectedRoute>
              <ManageTimetable />
            </ProtectedRoute>
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;