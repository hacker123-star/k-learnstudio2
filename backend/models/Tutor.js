const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  tutorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // ✅ NEW PASSWORD FIELD
  bio: String,
  city: String,
  experienceYears: { type: Number, default: 0 },
  highestEducation: { type: String, required: true },
  subjects: [{ type: String }],
  profileImage: { type: String, required: true },
  educationPdf: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });


module.exports = mongoose.model('Tutor', tutorSchema);
