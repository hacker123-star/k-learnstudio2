const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    subjects: [{ type: String }],
    bio: { type: String },
    experienceYears: { type: Number, default: 0 },
    city: { type: String },
    highestEducation: { type: String },
    profileImageUrl: { type: String },
    educationPdfUrl: { type: String },
    
    // Verification workflow
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    defaultPassword: { type: String }, // set by admin after approval
    
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tutor", tutorSchema);
