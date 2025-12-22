import React from "react";
import "./App.css";
import logo from "./assets/Logo.jpg";

function App() {
  return (
    <div className="app">
      <header className="nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">K-learn Studio</span>
        </div>
        <button className="nav-btn">Sign In</button>
      </header>

      <main className="hero">
        <div className="hero-text">
          <h1>Find the perfect tutor, fast.</h1>
          <p>
            K-learn Studio connects students with trusted tutors for school,
            college, and competitive exams in just a few clicks.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Become a Tutor</button>
          </div>
        </div>
        <div className="hero-card">
          <h2>Coming soon</h2>
          <p>We are building a smarter way to learn. Stay tuned for updates.</p>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
