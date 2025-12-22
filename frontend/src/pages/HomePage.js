// frontend/src/pages/HomePage.js
import React from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="app home-app">
      <header className="nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">K-learn Studio</span>
        </div>
       <div className="nav-right">
  <Link to="/auth" className="nav-link">
    Login
  </Link>
  <Link to="/signup" className="nav-link">
    Sign up
  </Link>
  <Link to="/register" className="primary-btn nav-primary">
    Become a tutor
  </Link>
</div>
      </header>

      <main className="home-hero">
        <div className="home-hero-text">
          <h1>Smart way to find tutors.</h1>
          <p>
            Discover trusted tutors for school, college, and competitive exams.
          </p>
          <div className="hero-actions">
  <Link to="/auth" className="primary-btn">
    I am a student (Login/Signup)
  </Link>
  <Link to="/register" className="secondary-btn">
    I am a tutor (Profile)
  </Link>
</div>
        </div>
        <div className="home-hero-card">
          <h2>Why K-learn Studio?</h2>
          <ul>
            <li>Verified tutor profiles.</li>
            <li>Filter by subject, level, and city.</li>
            <li>Chat and schedule sessions easily.</li>
          </ul>
        </div>
      </main>

      <section className="home-section">
        <h3>How it works</h3>
        <div className="home-steps">
          <div className="home-step">
            <h4>1. Sign up</h4>
            <p>Create a free account as student or tutor.</p>
          </div>
          <div className="home-step">
            <h4>2. Build profile</h4>
            <p>Add subjects, experience, and education.</p>
          </div>
          <div className="home-step">
            <h4>3. Connect</h4>
            <p>Students search, compare, and contact tutors.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
