const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const fs = require('fs');

const router = express.Router();

// ✅ CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ MEMORY STORAGE
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ✅ UPLOAD FUNCTION
const uploadToCloudinary = (buffer, folder, isPdf = false) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: isPdf ? 'raw' : 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// ✅ STUDENT REGISTER
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, classCourse } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }

    // Check existing
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone?.trim() }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Upload image
    let profileImage = '', profileImageId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'klearnstudio/students');
      profileImage = result.secure_url;
      profileImageId = result.public_id;
    }

    // Save user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      dateOfBirth,
      classCourse,
      profileImage,
      profileImageId
    });

    await user.save();
    const token = jwt.sign({ id: user._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Student registered successfully ✅',
      token,
      user: { id: user._id, name: user.name, email: user.email, profileImage }
    });

  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ TUTOR REGISTER
router.post('/tutor/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), async (req, res) => {
  try {
    const { name, email, password, phone, subjects, experience, qualifications } = req.body;
    
    if (!name || !email || !password || !subjects) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existingTutor = await Tutor.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone?.trim() }] 
    });
    if (existingTutor) {
      return res.status(400).json({ message: 'Tutor already exists' });
    }

    // Upload profile image
    let profileImage = '', profileImageId = '';
    if (req.files['profileImage']?.[0]) {
      const result = await uploadToCloudinary(req.files['profileImage'][0].buffer, 'klearnstudio/tutors');
      profileImage = result.secure_url;
      profileImageId = result.public_id;
    }

    // Upload documents (PDFs)
    const documents = [];
    if (req.files['documents']) {
      for (let file of req.files['documents']) {
        const result = await uploadToCloudinary(file.buffer, 'klearnstudio/tutors/docs', true);
        documents.push({
          url: result.secure_url,
          public_id: result.public_id,
          originalname: file.originalname
        });
      }
    }

    // Save tutor
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tutor = new Tutor({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      subjects: subjects.split(',').map(s => s.trim()),
      experience: parseInt(experience) || 0,
      qualifications,
      profileImage,
      profileImageId,
      documents
    });

    await tutor.save();
    const token = jwt.sign({ id: tutor._id, role: 'tutor' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Tutor registered successfully ✅',
      token,
      tutor: { id: tutor._id, name: tutor.name, email: tutor.email, profileImage }
    });

  } catch (error) {
    console.error('❌ Tutor register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ STUDENT LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful ✅',
      token,
      user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ TUTOR LOGIN
router.post('/tutor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const tutor = await Tutor.findOne({ email: email.toLowerCase().trim() });
    
    if (!tutor || !await bcrypt.compare(password, tutor.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: tutor._id, role: 'tutor' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Tutor login successful ✅',
      token,
      tutor: { id: tutor._id, name: tutor.name, email: tutor.email, profileImage: tutor.profileImage }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
