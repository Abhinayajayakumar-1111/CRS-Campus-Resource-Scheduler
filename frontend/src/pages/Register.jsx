import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
//new code
import PasswordInput from "../components/PasswordInput";

const roleToPath = {
  Admin: "/admin",
  Faculty: "/faculty",
  Student: "/student",
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await register(
        form.name,
        form.email,
        form.password,
        form.role,
      );
      navigate(roleToPath[data.role] || "/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">CRS</h1>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label className="field-label">Full Name</label>
        <input
          className="field-input"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />

        <label className="field-label">Email</label>
        <input
          className="field-input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@campus.edu"
          required
        />
        {/* new code */}
        <label className="field-label">Password</label>
        <PasswordInput
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          minLength={6}
          required
        />

        <label className="field-label">Role</label>
        <select
          className="field-input"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Admin">Admin</option>
        </select>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
