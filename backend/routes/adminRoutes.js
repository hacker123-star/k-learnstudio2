// backend/routes/adminRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Tutor = require("../models/Tutor");

const router = express.Router();

// Middleware: verify admin token
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET /api/admin/tutors/pending  (list pending tutors)
router.get("/tutors/pending", verifyAdmin, async (req, res) => {
  try {
    const tutors = await Tutor.find({ verificationStatus: "pending" })
      .sort({ createdAt: -1 })
      .select("-defaultPassword"); // hide password
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/approve-tutor/:id
router.post("/approve-tutor/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findById(id);
    
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    
    if (tutor.verificationStatus === "approved") {
      return res.status(400).json({ message: "Tutor already approved" });
    }
    
    // Generate default password
    const defaultPassword = "temp123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    // Create User account for tutor
    const User = require("../models/User");
    const user = await User.create({
      name: tutor.name,
      email: tutor.email,
      passwordHash,
      role: "tutor"
    });
    
    // Approve tutor
    tutor.verificationStatus = "approved";
    tutor.isVerified = true;
    tutor.defaultPassword = defaultPassword;
    await tutor.save();
    
    res.json({
      message: "Tutor approved successfully",
      tutorId: tutor._id,
      userId: user._id,
      defaultPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/reject-tutor/:id
router.post("/reject-tutor/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findById(id);
    
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    
    tutor.verificationStatus = "rejected";
    await tutor.save();
    
    res.json({ message: "Tutor rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
