// frontend/src/pages/AdminDashboardPage.js
import React, { useEffect, useState, useCallback } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending tutors (memoized)
  const fetchPendingTutors = useCallback(async () => {
    try {
      const token = localStorage.getItem("klearn_admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/tutors/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch tutors");
      const tutors = await res.json();
      setPendingTutors(tutors);
    } catch (err) {
      console.error(err);
      navigate("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Approve single tutor (memoized)
  const approveTutor = useCallback(async (tutorId) => {
    try {
      const token = localStorage.getItem("klearn_admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/approve-tutor/${tutorId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to approve");
      fetchPendingTutors(); // refresh list
      alert("✅ Tutor approved! Default password: temp123\nShare this with the tutor.");
    } catch (err) {
      alert("❌ Error approving tutor: " + err.message);
    }
  }, [fetchPendingTutors]);

  // Reject single tutor
  const rejectTutor = useCallback(async (tutorId) => {
    try {
      const token = localStorage.getItem("klearn_admin_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/reject-tutor/${tutorId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to reject");
      fetchPendingTutors(); // refresh list
      alert("❌ Tutor rejected");
    } catch (err) {
      alert("❌ Error rejecting tutor");
    }
  }, [fetchPendingTutors]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("klearn_admin_token");
    localStorage.removeItem("klearn_admin");
    navigate("/admin-login");
  };

  // Initial load + auth check
  useEffect(() => {
    const token = localStorage.getItem("klearn_admin_token");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchPendingTutors();
  }, [navigate, fetchPendingTutors]);

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="app dashboard-app">
      <header className="nav dashboard-nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">Admin Dashboard</span>
          <span className="badge">
            {pendingTutors.length} pending
          </span>
        </div>
        <button className="nav-btn secondary-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          <div className="admin-header">
            <h2>Pending Tutor Approvals</h2>
            <p className="admin-subtitle">
              Review and approve tutor applications below
            </p>
          </div>
          
          <div className="tutors-list">
            {pendingTutors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <h3>No pending tutors</h3>
                <p>All tutors are approved or no new applications yet.</p>
              </div>
            ) : (
              pendingTutors.map((tutor) => (
                <div key={tutor._id} className="tutor-card">
                  <div className="tutor-avatar-section">
                    {tutor.profileImageUrl ? (
                      <img 
                        src={tutor.profileImageUrl} 
                        alt={tutor.name}
                        className="tutor-avatar"
                      />
                    ) : (
                      <div className="tutor-avatar-placeholder">
                        {tutor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="tutor-info">
                    <h4>{tutor.name}</h4>
                    <p className="tutor-email">{tutor.email}</p>
                    <div className="tutor-badges">
                      {tutor.subjects?.map((subject, idx) => (
                        <span key={idx} className="subject-badge">
                          {subject}
                        </span>
                      ))}
                    </div>
                    <p className="tutor-details">
                      <strong>{tutor.highestEducation}</strong> • {tutor.city} •{" "}
                      {tutor.experienceYears} years exp
                    </p>
                  </div>
                  
                  <div className="tutor-actions">
                    <button 
                      className="primary-btn"
                      onClick={() => approveTutor(tutor._id)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => rejectTutor(tutor._id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio Admin
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
