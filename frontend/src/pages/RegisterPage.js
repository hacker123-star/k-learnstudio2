// frontend/src/pages/RegisterPage.js
import React, { useState } from "react";
import "../App.css";
import logo from "../assets/Logo.jpg";
import { API_BASE_URL } from "../config";

const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Computer Science",
  "History",
  "Geography",
  "Accountancy",
  "Economics",
  "Programming (C++)",
  "Programming (Python)",
  "Programming (Java)"
];

const RegisterPage = () => {
  const [activeRole, setActiveRole] = useState("tutor"); // "tutor" | "student"

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
            <h1>Join K-learn Studio</h1>
            <p>
              Create your account as a tutor or a student and start your
              learning journey.
            </p>
          </section>

          <div className="role-tabs">
            <button
              className={
                activeRole === "tutor"
                  ? "role-tab role-tab-active"
                  : "role-tab"
              }
              onClick={() => setActiveRole("tutor")}
            >
              Tutor
            </button>
            <button
              className={
                activeRole === "student"
                  ? "role-tab role-tab-active"
                  : "role-tab"
              }
              onClick={() => setActiveRole("student")}
            >
              Student
            </button>
          </div>

          {activeRole === "tutor" ? <TutorRegisterForm /> : <StudentComingSoon />}
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} K-learn Studio. All rights reserved.
      </footer>
    </div>
  );
};

const TutorRegisterForm = () => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // file handlers
  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  const handleEducationPdfChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setEducationPdf(file);
  };

  // SUBJECTS logic (search bar + suggestions + chips)
  const filteredSuggestions = SUBJECT_SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(subjectInput.toLowerCase()) &&
      !subjects.includes(s)
  );

  const addSubject = (value) => {
    if (!value) return;
    if (!subjects.includes(value)) {
      setSubjects((prev) => [...prev, value]);
    }
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
      if (filteredSuggestions.length === 0) return;
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredSuggestions.length === 0) return;
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredSuggestions.length
      ) {
        addSubject(filteredSuggestions[highlightedIndex]);
      } else {
        const value = subjectInput.trim();
        addSubject(value);
      }
    } else if (e.key === "Escape") {
      setHighlightedIndex(-1);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
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

    subjects.forEach((subj) => formData.append("subjects[]", subj));

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }
    if (educationPdf) {
      formData.append("educationPdf", educationPdf);
    }

    const res = await fetch(`${API_BASE_URL}/api/tutors`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to register tutor");
    }

    setStatus("success");
    setForm({
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
    setSubjects([]);
    setSubjectInput("");
    setHighlightedIndex(-1);
    setProfileImage(null);
    setEducationPdf(null);
  } catch (err) {
    console.error(err);
    setStatus(err.message);
  }
};

  return (
    <section className="tutor-register">
      <h2>Tutor registration</h2>
      <p className="tutor-register-sub">
        Tell us about your experience and subjects so students can find you.
      </p>

      <form onSubmit={handleSubmit} className="tutor-form">
        <input
          name="name"
          placeholder="Full name*"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email*"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />

        <input
          name="highestEducation"
          placeholder="Highest education (e.g. B.Sc Physics, M.A English)"
          value={form.highestEducation}
          onChange={handleChange}
        />

        <div className="file-row">
          <div className="file-field">
            <label className="label">
              Profile picture
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </label>
            {profileImage && (
              <p className="file-name">Selected: {profileImage.name}</p>
            )}
          </div>

          <div className="file-field">
            <label className="label">
              Highest education proof (PDF)
              <input
                type="file"
                accept="application/pdf"
                onChange={handleEducationPdfChange}
              />
            </label>
            {educationPdf && (
              <p className="file-name">Selected: {educationPdf.name}</p>
            )}
          </div>
        </div>

        {/* Subjects: search bar + suggestions + chips */}
        <label className="label">
          Subjects you teach
          <div className="subjects-input-wrapper">
            <input
              className="subjects-search-input"
              placeholder="Search and press Enter (use ↑ ↓ to navigate)"
              value={subjectInput}
              onChange={handleSubjectChange}
              onKeyDown={handleSubjectKeyDown}
            />

            {filteredSuggestions.length > 0 && subjectInput && (
              <ul className="subjects-suggestions">
                {filteredSuggestions.map((s, index) => (
                  <li
                    key={s}
                    className={
                      index === highlightedIndex
                        ? "suggestion-item suggestion-item-active"
                        : "suggestion-item"
                    }
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
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => removeSubject(subj)}
                >
                  ×
                </button>
              </span>
            ))}
            {subjects.length === 0 && (
              <span className="chip-placeholder">
                No subjects added yet. Use the search above.
              </span>
            )}
          </div>
        </label>

        {/* Experience row */}
        <div className="experience-row">
          <label className="label">
            Experience
            <div className="experience-selects">
              <select
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                disabled={form.isFresher}
              >
                <option value="0">0 years</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
                <option value="6">6 years</option>
                <option value="7">7 years</option>
                <option value="8">8 years</option>
                <option value="9">9 years</option>
                <option value="10">10+ years</option>
              </select>

              <select
                name="experienceMonths"
                value={form.experienceMonths}
                onChange={handleChange}
                disabled={form.isFresher}
              >
                <option value="0">0 months</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="9">9 months</option>
              </select>
            </div>
          </label>

          <label className="fresher-check">
            <input
              type="checkbox"
              name="isFresher"
              checked={form.isFresher}
              onChange={handleChange}
            />
            Fresher (no experience yet)
          </label>
        </div>

        <textarea
          name="bio"
          placeholder="Short bio / what you teach"
          rows="4"
          value={form.bio}
          onChange={handleChange}
        />
        <button type="submit" className="primary-btn">
          Submit
        </button>
      </form>

      {status === "loading" && <p>Submitting...</p>}
      {status === "success" && (
        <p style={{ color: "green" }}>
          Thank you! Your tutor profile has been submitted.
        </p>
      )}
      {status && status !== "loading" && status !== "success" && (
        <p style={{ color: "red" }}>{status}</p>
      )}
    </section>
  );
};

const StudentComingSoon = () => (
  <section className="tutor-register">
    <h2>Student registration</h2>
    <p className="tutor-register-sub">
      Student signup is coming soon. For now, we are onboarding tutors to build
      a great network for you.
    </p>
  </section>
);

export default RegisterPage;
