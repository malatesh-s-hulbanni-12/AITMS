// AITMS/backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import clientRoutes from './routes/clientRoutes.js'; // Import client routes// AITMS/backend/server.js (Add this line with other imports)
import timetableRoutes from './routes/timetableRoutes.js';// AITMS/backend/server.js
// Add this line with other imports
import publicRoutes from './routes/publicRoutes.js';



dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://aitms-admin.onrender.com', 'https://aitms-client.onrender.com', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aitms')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ========== MOUNT ALL ROUTES ==========
app.use('/api/auth', authRoutes);           // Admin auth routes
app.use('/api/college', collegeRoutes);     // College management routes
app.use('/api/faculty', facultyRoutes);     // Faculty management routes
app.use('/api/client', clientRoutes);       // Client (student/teacher) routes// Add this line with other route mounts
app.use('/api/timetable', timetableRoutes);// Add this line with other route mounts
app.use('/api/public', publicRoutes);

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`----------------------------------------`);
  console.log(`🔵 Admin Routes:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - College: http://localhost:${PORT}/api/college`);
  console.log(`   - Faculty: http://localhost:${PORT}/api/faculty`);
  console.log(`----------------------------------------`);
  console.log(`🟢 Client Routes:`);
  console.log(`   - Colleges: http://localhost:${PORT}/api/client/colleges/all`);
  console.log(`   - Faculty by College: http://localhost:${PORT}/api/client/faculty/by-college/COLLEGE_ID`);
  console.log(`   - Teacher Login: http://localhost:${PORT}/api/client/teacher/login`);
  console.log(`   - Student Login: http://localhost:${PORT}/api/client/student/login`);
  console.log(`----------------------------------------\n`);
});
