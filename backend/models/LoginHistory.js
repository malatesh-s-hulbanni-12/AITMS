// AITMS/backend/models/LoginHistory.js
import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  ipAddress: String,
  userAgent: String,
  loginTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;