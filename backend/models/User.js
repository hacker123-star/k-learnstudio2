const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
   phone: { 
    type: String, 
    unique: true,  // ✅ GLOBAL PHONE UNIQUE
    sparse: true,  // Allow null phones
    index: true
  },
  dateOfBirth: Date,
  classCourse: String,
  profileImage: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
