// frontend/src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("klearn_token");
    const storedUser = localStorage.getItem("klearn_user");
    if (!token || !storedUser) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("klearn_token");
    localStorage.removeItem("klearn_user");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="app dashboard-app">
      <header className="nav dashboard-nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">K-learn Studio</span>
        </div>
        <div className="nav-right">
          <span className="dashboard-user-name">{user.name}</span>
          <button className="nav-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <aside className="dashboard-sidebar">
          <h3>Profile</h3>
          <p>{user.role === "tutor" ? "Tutor account" : "Student account"}</p>
        </aside>

        <section className="dashboard-content">
          <ProfileSettings user={user} setUser={setUser} />
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio.
      </footer>
    </div>
  );
};

const ProfileSettings = ({ user, setUser }) => {
  const [name, setName] = useState(user.name || "");
  const [status, setStatus] = useState(null);

const handleSave = async (e) => {
  e.preventDefault();
  setStatus("saving");

  try {
    const token = localStorage.getItem("klearn_token");
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // ← ADD THIS
      },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");

    setUser(data.user);
    localStorage.setItem("klearn_user", JSON.stringify(data.user));
    setStatus("saved");
  } catch (err) {
    setStatus(err.message);
  }
};


  return (
    <div className="profile-settings">
      <h2>Profile settings</h2>
      <form className="profile-form" onSubmit={handleSave}>
        <label className="label">
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        {/* Later: image upload to change profile picture */}

        <button type="submit" className="primary-btn">
          Save changes
        </button>
      </form>
      {status === "saving" && <p>Saving…</p>}
      {status === "saved" && (
        <p style={{ color: "green" }}>Profile updated successfully.</p>
      )}
      {status && status !== "saving" && status !== "saved" && (
        <p style={{ color: "red" }}>{status}</p>
      )}
    </div>
  );
};

export default DashboardPage;
