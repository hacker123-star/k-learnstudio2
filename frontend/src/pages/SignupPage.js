import React, { useState } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    classCourse: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileImage: null
  });
  const [status, setStatus] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'confirmPassword') {
      setPasswordMatch(form.password === value);
    }
    
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setStatus("❌ Passwords do not match");
      return;
    }

    setStatus("loading");

    // ✅ 15 SECOND TIMEOUT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const formData = new FormData();
      formData.append("name", form.fullName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phone", form.phone);
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("classCourse", form.classCourse);
      formData.append("role", "student");

      if (form.profileImage) {
        formData.append("profileImage", form.profileImage);
      }

      console.log('Sending to:', `${API_BASE_URL}/api/auth/register`);

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', res.status);

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // ✅ SUCCESS - IMMEDIATE REDIRECT
      localStorage.setItem("klearn_token", data.token);
      localStorage.setItem("klearn_user", JSON.stringify(data.user));
      
      setStatus("success");
      
      // Redirect after success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        setStatus("⏱️ Server slow. Please try again.");
      } else {
        setStatus(err.message);
      }
    }
  };

  return (
    <div className="app auth-app">
      <header className="nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">K-learn Studio</span>
        </div>
      </header>

      <main className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">👨‍🎓 Student Signup</h2>
          <p className="auth-subtitle">
            Create account instantly and start browsing tutors
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* ✅ STANDARD AUTOCOMPLETE */}
            <input
              name="fullName"
              autoComplete="name"
              placeholder="Full Name *"
              value={form.fullName}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <input
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                placeholder="Date of Birth *"
                value={form.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <input
                name="classCourse"
                autoComplete="off"
                placeholder="Class/Course (Class 10, B.Tech CSE) *"
                value={form.classCourse}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email *"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone Number *"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Password (min 6 chars) *"
                value={form.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm Password *"
                className={!passwordMatch ? "input-error" : ""}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Profile Picture */}
            <div className="file-upload-student">
              <label className="file-label">
                📸 Profile Picture (Optional)
                <input
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
              {form.profileImage && (
                <div className="file-preview">
                  <p className="file-name">✅ {form.profileImage.name}</p>
                  <button 
                    type="button" 
                    className="delete-file-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setForm(prev => ({...prev, profileImage: null}));
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <p className="tutor-note">
              👨‍🏫 Want to teach? <a href="/register">Tutor Application</a>
            </p>

            <button 
              type="submit" 
              className="primary-btn"
              disabled={status === "loading" || !passwordMatch}
            >
              {status === "loading" ? "🔄 Creating Account..." : "Create Student Account"}
            </button>
          </form>

          {/* ✅ STATUS MESSAGES */}
          {status === "loading" && (
            <p className="loading-message">🔄 Creating your account...</p>
          )}
          {status === "success" && (
            <p className="success-message">✅ Account created! Redirecting to dashboard...</p>
          )}
          {status && status !== "loading" && status !== "success" && (
            <p className="error-message">{status}</p>
          )}
          {!passwordMatch && !status && (
            <p className="error-message">❌ Passwords do not match</p>
          )}
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio. All rights reserved.
      </footer>
    </div>
  );
};

export default SignupPage;
