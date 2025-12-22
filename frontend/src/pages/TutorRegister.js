import React, { useState } from "react";
import { API_BASE_URL } from "../config"; // create this if not yet

const TutorRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subjects: "",
    bio: "",
    experienceYears: "",
    city: ""
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE_URL}/api/tutors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subjects: form.subjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experienceYears: Number(form.experienceYears) || 0
        })
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
        subjects: "",
        bio: "",
        experienceYears: "",
        city: ""
      });
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="tutor-register">
      <h2>Register as a Tutor</h2>
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
          name="subjects"
          placeholder="Subjects (comma separated, e.g. Math, Physics)"
          value={form.subjects}
          onChange={handleChange}
        />
        <input
          name="experienceYears"
          type="number"
          min="0"
          placeholder="Years of experience"
          value={form.experienceYears}
          onChange={handleChange}
        />
        <textarea
          name="bio"
          placeholder="Short bio / what you teach"
          rows="4"
          value={form.bio}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>

      {status === "loading" && <p>Submitting...</p>}
      {status === "success" && <p>Thank you! Your profile has been submitted.</p>}
      {status && status !== "loading" && status !== "success" && (
        <p style={{ color: "red" }}>{status}</p>
      )}
    </div>
  );
};

export default TutorRegister;
