const express = require('express');
const multer = require('multer');
const path = require('path');
const Tutor = require('../models/Tutor');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).substr(2, 4) + '-' + file.originalname)
});
const upload = multer({ storage });

// Generate unique tutorId
const generateTutorId = (name) => {
  const namePart = name.trim().substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const numPart = Math.floor(100000 + Math.random() * 900000);
  const randomLetters = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TUTOR-${namePart}${numPart}${randomLetters}`;
};

router.post('/', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'educationPdf', maxCount: 1 }
]), async (req, res) => {
  console.log('🔥 TUTOR REGISTER HIT');
  console.log('Body:', req.body);
  console.log('Files:', req.files);

  try {
    const { name, email, phone, bio, city, experienceYears, highestEducation, subjects } = req.body;

    // Parse subjects
    let subjectsParsed = [];
    if (subjects) {
      subjectsParsed = Array.isArray(subjects) ? subjects.split(',') : [subjects];
    }

    // ✅ GLOBAL UNIQUENESS CHECK - USER + TUTOR
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }] 
    });
    const existingTutor = await Tutor.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }] 
    });

    if (existingUser || existingTutor) {
      return res.status(400).json({ 
        message: 'Email or phone already registered. One account per person.' 
      });
    }

    // ✅ VALIDATION
    if (!req.files?.['profileImage']?.[0] || !req.files?.['educationPdf']?.[0]) {
      return res.status(400).json({ message: 'Profile picture and education proof (PDF) required' });
    }
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !highestEducation?.trim() || subjectsParsed.length === 0) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Generate unique tutorId
    let tutorId = generateTutorId(name);
    let existingTutorId = await Tutor.findOne({ tutorId });
    let counter = 1;
    while (existingTutorId) {
      tutorId = generateTutorId(name) + counter;
      existingTutorId = await Tutor.findOne({ tutorId });
      counter++;
    }

    // Create tutor
    const tutor = new Tutor({
      tutorId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      bio: bio?.trim() || '',
      city: city?.trim() || '',
      experienceYears: parseFloat(experienceYears) || 0,
      highestEducation: highestEducation.trim(),
      subjects: subjectsParsed,
      profileImage: req.files['profileImage'][0].path,
      educationPdf: req.files['educationPdf'][0].path,
      status: 'pending'
    });

    await tutor.save();
    console.log('✅ TUTOR CREATED:', tutorId);

    res.status(201).json({ 
      message: 'success',
      tutorId
    });

  } catch (error) {
    console.error('❌ TUTOR ERROR:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email or phone already in use. One account per person.' 
      });
    }
    res.status(400).json({ message: 'Registration failed. Please try again.' });
  }
});

module.exports = router;
