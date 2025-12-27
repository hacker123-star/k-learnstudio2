const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const userRoutes = require('./routes/userRoutes'); // Optional

const app = express();

// ✅ CORS - All origins for dev
app.use(cors({
  origin: ['http://localhost:3000', 'https://k-learnstudio2.netlify.app'],
  credentials: true
}));

// ✅ Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/users', userRoutes || ((req, res) => res.status(404).json({})));

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    routes: ['/api/auth/register', '/api/auth/login', '/api/tutors']
  });
});

// ✅ Test route
app.post('/test', (req, res) => {
  console.log('TEST HIT:', req.body);
  res.json({ message: 'Backend alive!', data: req.body });
});

// ✅ Create uploads folder if missing
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
  console.log('📁 Created uploads folder');
}

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

console.log('MONGO_URI exists:', !!MONGO_URI);
console.log('MONGO_URI preview:', MONGO_URI ? MONGO_URI.substring(0, 20) + '...' : 'MISSING');

if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing from .env file!');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Health: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
  });
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 K-Learn Studio API Running!',
    endpoints: ['/api/auth/register', '/api/auth/login', '/api/auth/tutor/register'],
    status: 'healthy'
  });
});
