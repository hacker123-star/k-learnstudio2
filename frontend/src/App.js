// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage"; // tutor profile form
import AuthPage from "./pages/AuthPage"; // login
import SignupPage from "./pages/SignupPage"; // signup
import DashboardPage from "./pages/DashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Tutor profile */}
        <Route path="/auth" element={<AuthPage />} /> {/* Login */}
        <Route path="/signup" element={<SignupPage />} /> {/* Signup */}
        <Route path="/dashboard" element={<DashboardPage />} />
         <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<AuthPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/admin-login" element={<AdminLoginPage />} />
  <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;

