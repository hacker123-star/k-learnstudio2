const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.random().toString(36).substr(2, 4) + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// STUDENT REGISTER - Global uniqueness check
router.post('/register', upload.single('profileImage'), async (req, res) => {
  console.log('🔥 STUDENT REGISTER HIT');
  console.log('Body:', req.body);
  console.log('File:', req.file ? req.file.filename : 'No file');

  try {
    const { name, email, password, phone, dateOfBirth, classCourse, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }

    // ✅ GLOBAL UNIQUENESS CHECK - USER + TUTOR COLLECTIONS
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone?.trim() }] 
    });
    const existingTutor = await Tutor.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone?.trim() }] 
    });

    if (existingUser || existingTutor) {
      return res.status(400).json({ 
        message: 'Email or phone already registered. One account per person.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create student
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || '',
      dateOfBirth: dateOfBirth || null,
      classCourse: classCourse?.trim() || '',
      role: 'student'
    };

    if (req.file) {
      userData.profileImage = req.file.path;
    }

    const user = new User(userData);
    await user.save();

    console.log('✅ STUDENT CREATED:', user.email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'student' },
      process.env.JWT_SECRET || 'supersecretfallbackkey'
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('❌ REGISTER ERROR:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email or phone already in use. One account per person.' 
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// LOGIN - Role-specific (searches both collections)
router.post('/login', async (req, res) => {
  console.log('🔥 LOGIN HIT:', req.body);

  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role required' });
    }

    // ✅ STRICT ROLE SEARCH - Student role → ONLY User collection
    if (role === 'student') {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      
      if (!user) {
        return res.status(401).json({ message: 'Student account not found. Try Tutor login.' });
      }
      
      if (user.role !== 'student') {
        return res.status(401).json({ message: 'This email is registered as Tutor. Select Tutor login.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: 'student' },
        process.env.JWT_SECRET || 'supersecretfallbackkey'
      );

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: 'student' }
      });

    } 
    // ✅ STRICT TUTOR SEARCH - Tutor role → ONLY Tutor collection (approved)
    else if (role === 'tutor') {
      const tutor = await Tutor.findOne({ 
        email: email.toLowerCase().trim(), 
        status: 'approved' 
      });
      
      if (!tutor) {
        return res.status(401).json({ message: 'Tutor account not found or pending approval. Try Student login.' });
      }

      // Tutors don't have password field - assume admin sets it
      // For now, use simple check or add password field to Tutor model
      const isMatch = password === 'temp123'; // TEMP - Admin sets real password
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid tutor password' });
      }

      const token = jwt.sign(
        { userId: tutor._id, email: tutor.email, role: 'tutor' },
        process.env.JWT_SECRET || 'supersecretfallbackkey'
      );

      res.json({
        token,
        user: { id: tutor._id, name: tutor.name, email: tutor.email, role: 'tutor' }
      });

    } else {
      return res.status(400).json({ message: 'Invalid role. Choose student or tutor.' });
    }

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
