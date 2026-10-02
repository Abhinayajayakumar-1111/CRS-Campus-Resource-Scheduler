import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
//new code for password toggle
import PasswordInput from "../components/PasswordInput";

const roleToPath = {
  Admin: "/admin",
  Faculty: "/faculty",
  Student: "/student",
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await login(form.email, form.password);
      navigate(roleToPath[data.role] || "/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">CRS</h1>
        <p className="auth-subtitle">Campus Resource Scheduler</p>

        {error && <div className="alert alert-error">{error}</div>}

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
          placeholder="••••••••"
          required
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
