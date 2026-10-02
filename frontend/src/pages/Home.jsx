// import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleToPath = {
  Admin: "/admin",
  Faculty: "/faculty",
  Student: "/student",
};

const FEATURES = [
  {
    title: "Never Get Double-Booked",
    description: "Slots lock instantly while pending review.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    title: "Always Stay Informed",
    description: "Get actionable feedback whenever a request is declined.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: "Built for Your Role",
    description:
      "See only what you need, from quick bookings to master controls.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      </svg>
    ),
  },
  {
    title: "Organized Campus Timelines",
    description: "Plan ahead easily with standard 3-day notice windows.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        <path d="M8.5 13.5h2M13.5 13.5h2M8.5 16.5h2" />
      </svg>
    ),
  },
  {
    title: "True Real-Time Visibility",
    description: "Check live room slots and equipment stock without guessing.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.8" />
      </svg>
    ),
  },
];

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="home-page">
      <header className="home-navbar">
        <div className="navbar-brand">
          <span className="brand-mark">CRS</span>
          <span className="brand-sub">Campus Resource Scheduler</span>
        </div>

        {user ? (
          <div className="navbar-user">
            <span className="user-name">{user.name}</span>
            <Link
              className="btn btn-primary"
              to={roleToPath[user.role] || "/login"}
            >
              Go to Dashboard
            </Link>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link className="btn btn-primary" to="/login">
            Sign In
          </Link>
        )}
      </header>

      <section className="home-hero">
        <h1>Book Rooms &amp; Equipment. Without the Chaos.</h1>
        <p>
          CRS: Campus Resource Scheduler is a single, conflict-free portal for
          reserving classrooms, seminar halls, and shared equipment across
          campus — with live availability, automatic slot conflict detection,
          and a clear approval workflow for every request.
        </p>
        {!user && (
          <div className="home-hero-actions">
            <Link className="btn btn-primary" to="/login">
              Sign In
            </Link>
            <Link className="btn btn-hero-secondary" to="/register">
              Get Started
            </Link>
          </div>
        )}
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <h3>For Students</h3>
          <p>
            Browse rooms by date, see exactly which time slots are open, and
            submit a room booking request in a few clicks.
          </p>
        </div>
        <div className="home-feature-card">
          <h3>For Faculty</h3>
          <p>
            Reserve a room and request the specific equipment quantities you
            need — projectors, microphones, chairs and more — with live
            inventory counts.
          </p>
        </div>
        <div className="home-feature-card">
          <h3>For Admins</h3>
          <p>
            Manage rooms and equipment inventory, review a master schedule of
            every booking, approve or reject requests with a reason, and release
            rooms and resources once an event wraps up.
          </p>
        </div>
      </section>

      <section className="home-highlights">
        <h2>Features</h2>
        <div className="highlight-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="highlight-card">
              <div className="highlight-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-how">
        <h2>How It Works</h2>
        <ol className="home-steps">
          <li>
            <strong>Check availability.</strong> Rooms show live status per time
            slot — 8:00 AM–12:00 PM, 1:00 PM–5:00 PM, or Full Day — so you only
            ever see valid options.
          </li>
          <li>
            <strong>Submit a request.</strong> Bookings must be made at least 3
            days in advance, keeping schedules predictable for everyone.
          </li>
          <li>
            <strong>Get approved.</strong> Admins review and approve or reject
            each request, with a mandatory reason for any rejection.
          </li>
          <li>
            <strong>Resources auto-update.</strong> Approved and even pending
            requests instantly reduce available inventory for the rest of that
            day — no double-booking, ever.
          </li>
        </ol>
      </section>

      <footer className="home-footer">
        <span>CRS — Campus Resource Scheduler</span>
      </footer>
    </div>
  );
};

export default Home;
