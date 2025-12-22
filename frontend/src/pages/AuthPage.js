// frontend/src/pages/AuthPage.js
import React, { useState } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [role, setRole] = useState("student"); // student | tutor

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
          <h2 className="auth-title">Login to K-learn Studio</h2>

          <div className="role-toggle">
            <button
              className={
                role === "student" ? "role-chip role-chip-active" : "role-chip"
              }
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              className={
                role === "tutor" ? "role-chip role-chip-active" : "role-chip"
              }
              onClick={() => setRole("tutor")}
            >
              Tutor
            </button>
          </div>

          <LoginForm role={role} />
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio.
      </footer>
    </div>
  );
};

const LoginForm = ({ role }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // store token & user and go to dashboard
      localStorage.setItem("klearn_token", data.token);
      localStorage.setItem("klearn_user", JSON.stringify(data.user));
      setStatus(null);
      navigate("/dashboard");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-subtitle">Logging in as {role}</p>

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button type="submit" className="primary-btn">
        Login
      </button>

      {status === "loading" && <p>Checking credentials…</p>}
      {status && status !== "loading" && (
        <p style={{ color: "red" }}>{status}</p>
      )}
    </form>
  );
};

export default AuthPage;
