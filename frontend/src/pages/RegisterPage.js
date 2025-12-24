import React, { useState } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { API_BASE_URL } from "../config";

const SUBJECT_SUGGESTIONS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi",
  "Computer Science", "History", "Geography", "Accountancy", "Economics",
  "Programming (C++)", "Programming (Python)", "Programming (Java)"
];

const RegisterPage = () => {
  return (
    <div className="app">
      <header className="nav">
        <div className="nav-left">
          <img src={logo} alt="K-learn Studio logo" className="logo" />
          <span className="brand">K-learn Studio</span>
        </div>
      </header>

      <main className="register-page">
        <div className="register-container">
          <section className="register-intro">
            <h1>👨‍🏫 Become a Tutor</h1>
            <p>Complete your profile. Admin will review (1-2 days)</p>
            <p className="student-note">
              👨‍🎓 Students: <a href="/signup">Student Signup</a>
            </p>
          </section>

          <TutorRegisterForm />
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio. All rights reserved.
      </footer>
    </div>
  );
};

const TutorRegisterForm = () => {
  // ✅ FIXED: All state INSIDE component
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    experienceYears: "0",
    experienceMonths: "0",
    isFresher: false,
    city: "",
    highestEducation: ""
  });

  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [profileImage, setProfileImage] = useState(null);
  const [educationPdf, setEducationPdf] = useState(null);
  const [status, setStatus] = useState(null);
  const [tutorId, setTutorId] = useState(""); // ✅ tutorId state FIXED

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  const handleEducationPdfChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setEducationPdf(file);
  };

  // SUBJECTS logic
  const filteredSuggestions = SUBJECT_SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(subjectInput.toLowerCase()) &&
      !subjects.includes(s)
  );

  const addSubject = (value) => {
    if (!value || subjects.includes(value)) return;
    setSubjects((prev) => [...prev, value]);
    setSubjectInput("");
    setHighlightedIndex(-1);
  };

  const removeSubject = (value) => {
    setSubjects((prev) => prev.filter((s) => s !== value));
  };

  const handleSubjectChange = (e) => {
    setSubjectInput(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleSubjectKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        addSubject(filteredSuggestions[highlightedIndex]);
      } else {
        addSubject(subjectInput.trim());
      }
    } else if (e.key === "Escape") {
      setHighlightedIndex(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION
    if (!profileImage) {
      setStatus('❌ Profile picture is required');
      return;
    }
    if (!educationPdf) {
      setStatus('❌ Education proof (PDF) is required');
      return;
    }
    if (subjects.length === 0) {
      setStatus('❌ At least one subject is required');
      return;
    }

    setStatus("loading");

    const totalYears = form.isFresher
      ? 0
      : Number(form.experienceYears) + Number(form.experienceMonths) / 12;

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("bio", form.bio);
      formData.append("city", form.city);
      formData.append("experienceYears", String(totalYears));
      formData.append("highestEducation", form.highestEducation);
      
      // ✅ FIXED: subjects as comma-separated string
      formData.append("subjects", subjects.join(', '));

      formData.append("profileImage", profileImage);
      formData.append("educationPdf", educationPdf);

      const res = await fetch(`${API_BASE_URL}/api/tutors`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to register tutor");
      }

      // ✅ SAVE TUTOR ID FROM BACKEND
      setTutorId(data.tutorId || 'TUTOR-ABC123XYZ');
      setStatus("success");

    } catch (err) {
      console.error(err);
      setStatus(err.message);
    }
  };

  // ✅ SUCCESS SCREEN - FORM HIDDEN
  if (status === "success") {
    return (
      <section className="tutor-register">
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Thank You!</h2>
            <p className="success-message">
              Your tutor application submitted successfully!
            </p>
            <p className="success-details">
              <strong>ID:</strong> {tutorId}<br/>
              <strong>⏱️ Review:</strong> 1-2 days<br/>
              <strong>📧 Next:</strong> Check email for login details
            </p>
            
            <div className="success-buttons">
              <a href="/auth" className="login-btn primary-btn">
                🔐 Login Here (after approval)
              </a>
              <a href="/" className="home-btn secondary-btn">
                ← Back to Home
              </a>
            </div>
            
            <p className="success-note">
              Questions? <a href="mailto:admin@klearnstudio.com">Email Admin</a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // FORM SCREEN
  return (
    <section className="tutor-register">
      <h2>Tutor Registration</h2>
      <p className="tutor-register-sub">
        Tell us about your experience and subjects so students can find you.
      </p>

      <form onSubmit={handleSubmit} className="tutor-form">
        <input name="name" placeholder="Full name*" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email*" value={form.email} onChange={handleChange} required />
        <input name="phone" placeholder="Phone*" value={form.phone} onChange={handleChange} required />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <input name="highestEducation" placeholder="Highest education*" value={form.highestEducation} onChange={handleChange} required />

        <div className="file-row">
          <div className="file-upload-tutor">
            <label className="file-label">
              📸 Profile Picture *
              <input type="file" accept="image/*" onChange={handleProfileImageChange} required />
            </label>
            {profileImage && (
              <div className="file-preview">
                <p className="file-name">✅ {profileImage.name}</p>
                <button type="button" className="delete-file-btn" onClick={() => setProfileImage(null)}>✕</button>
              </div>
            )}
          </div>

          <div className="file-upload-tutor">
            <label className="file-label">
              📄 Education Proof (PDF) *
              <input type="file" accept="application/pdf" onChange={handleEducationPdfChange} required />
            </label>
            {educationPdf && (
              <div className="file-preview">
                <p className="file-name">✅ {educationPdf.name}</p>
                <button type="button" className="delete-file-btn" onClick={() => setEducationPdf(null)}>✕</button>
              </div>
            )}
          </div>
        </div>

        <label className="label">
          Subjects you teach *
          <div className="subjects-input-wrapper">
            <input
              className="subjects-search-input"
              placeholder="Search subjects (↑↓, Enter)"
              value={subjectInput}
              onChange={handleSubjectChange}
              onKeyDown={handleSubjectKeyDown}
            />
            {filteredSuggestions.length > 0 && subjectInput && (
              <ul className="subjects-suggestions">
                {filteredSuggestions.map((s, index) => (
                  <li
                    key={s}
                    className={index === highlightedIndex ? "suggestion-item suggestion-item-active" : "suggestion-item"}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addSubject(s);
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="subjects-chips">
            {subjects.map((subj) => (
              <span key={subj} className="chip">
                {subj}
                <button type="button" className="chip-remove" onClick={() => removeSubject(subj)}>×</button>
              </span>
            ))}
            {subjects.length === 0 && <span className="chip-placeholder">No subjects added</span>}
          </div>
        </label>

        <div className="experience-row">
          <label className="label">
            Experience
            <div className="experience-selects">
              <select name="experienceYears" value={form.experienceYears} onChange={handleChange} disabled={form.isFresher}>
                <option value="0">0 years</option><option value="1">1 year</option><option value="2">2 years</option>
                <option value="3">3 years</option><option value="4">4 years</option><option value="5">5 years</option>
                <option value="6">6 years</option><option value="7">7 years</option><option value="8">8 years</option>
                <option value="9">9 years</option><option value="10">10+ years</option>
              </select>
              <select name="experienceMonths" value={form.experienceMonths} onChange={handleChange} disabled={form.isFresher}>
                <option value="0">0 months</option><option value="3">3 months</option><option value="6">6 months</option>
                <option value="9">9 months</option>
              </select>
            </div>
          </label>
          <label className="fresher-check">
            <input type="checkbox" name="isFresher" checked={form.isFresher} onChange={handleChange} />
            Fresher
          </label>
        </div>

        <textarea name="bio" placeholder="About your teaching..." rows="4" value={form.bio} onChange={handleChange} />
        
        <button type="submit" className="primary-btn" disabled={status === "loading"}>
          {status === "loading" ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {status && status !== "loading" && status !== "success" && (
        <p className="error-message">{status}</p>
      )}
    </section>
  );
};

export default RegisterPage;
