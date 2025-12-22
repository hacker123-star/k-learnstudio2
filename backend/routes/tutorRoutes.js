// backend/routes/tutorRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const Tutor = require("../models/Tutor");

const router = express.Router();

// ensure temp uploads folder exists
const uploadDir = path.join(__dirname, "..", "temp_uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage (temporary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = base.replace(/\s+/g, "_");
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// helper: upload one file to Cloudinary then delete local temp file
const uploadToCloudinary = async (localPath, folder, resourceType = "auto") => {
  if (!localPath) return null;
  const result = await cloudinary.uploader.upload(localPath, {
    folder,
    resource_type: resourceType
  });
  fs.unlink(localPath, () => {}); // delete temp file
  return result.secure_url;
};

// POST /api/tutors
router.post(
  "/",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "educationPdf", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        city,
        bio,
        experienceYears,
        highestEducation
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }

      const existing = await Tutor.findOne({ email });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Tutor with this email already exists" });
      }

      // subjects[] from FormData
      let subjects = [];
      if (Array.isArray(req.body["subjects[]"])) {
        subjects = req.body["subjects[]"];
      } else if (req.body["subjects[]"]) {
        subjects = [req.body["subjects[]"]];
      }

      let profileImageUrl = "";
      let educationPdfUrl = "";

      const profileFile =
        req.files && req.files.profileImage && req.files.profileImage[0];
      const pdfFile =
        req.files && req.files.educationPdf && req.files.educationPdf[0];

      if (profileFile) {
        profileImageUrl = await uploadToCloudinary(
          profileFile.path,
          "klearnstudio_tutors/profileImages",
          "image"
        );
      }

      if (pdfFile) {
        educationPdfUrl = await uploadToCloudinary(
          pdfFile.path,
          "klearnstudio_tutors/educationPdfs",
          "raw"
        );
      }

     // In the Tutor.create() call, add:
const tutor = await Tutor.create({
  name,
  email,
  phone,
  city,
  bio,
  subjects,
  experienceYears: Number(experienceYears) || 0,
  highestEducation,
  profileImageUrl,
  educationPdfUrl,
  verificationStatus: "pending" // NEW: default pending
});


      res.status(201).json(tutor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

// GET /api/tutors
router.get("/", async (req, res) => {
  try {
    const tutors = await Tutor.find().sort({ createdAt: -1 });
    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
