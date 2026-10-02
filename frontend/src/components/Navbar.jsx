import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">CRS</span>
        <span className="brand-sub">Campus Resource Scheduler</span>
      </div>
      {user && (
        <div className="navbar-user">
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className={`role-pill role-${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
