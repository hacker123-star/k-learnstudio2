// frontend/src/pages/AdminLoginPage.js
import React, { useState } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

const AdminLoginPage = () => {
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
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("klearn_admin_token", data.token);
      localStorage.setItem("klearn_admin", JSON.stringify(data.admin));
      setStatus(null);
      navigate("/admin");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="app auth-app">
      <header className="nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">K-learn Studio - Admin</span>
        </div>
      </header>

      <main className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">Admin Login</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Admin email"
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
            {status === "loading" && <p>Logging in…</p>}
            {status && status !== "loading" && (
              <p style={{ color: "red" }}>{status}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;
