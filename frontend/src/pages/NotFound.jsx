import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="auth-page">
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <h1 className="auth-title">404</h1>
      <p className="auth-subtitle">Page not found</p>
      <Link className="btn btn-primary" to="/login">
        Back to Login
      </Link>
    </div>
  </div>
);

export default NotFound;
