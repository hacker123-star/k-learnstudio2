const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const tutorRoutes = require("./routes/tutorRoutes");

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

// Add these lines:
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tutors", tutorRoutes);

app.get("/", (req, res) => {
  res.json({ message: "K-learn Studio API is running" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


  // Add CORS for frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Health check endpoint
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
