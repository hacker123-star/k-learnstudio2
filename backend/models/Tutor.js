const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: false },
  password: { type: String, required: false }, // ✅ Admin assigns later
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  subjects: [{ type: String }],
  experience: { type: Number, default: 0 },
  qualifications: { type: String, default: '' }, // ✅ highestEducation
  bio: { type: String, default: '' },
  city: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileImageId: { type: String, default: '' },
  documents: [{
    url: { type: String },
    public_id: { type: String },
    originalname: { type: String }
  }],
  tutorId: { type: String, default: '' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Tutor', tutorSchema);
