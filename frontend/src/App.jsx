// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import PrivateRoute from './components/PrivateRoute';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminDashboard from './pages/AdminDashboard';
// import FacultyDashboard from './pages/FacultyDashboard';
// import StudentDashboard from './pages/StudentDashboard';
// import NotFound from './pages/NotFound';

// const roleToPath = {
//   Admin: '/admin',
//   Faculty: '/faculty',
//   Student: '/student',
// };

// const RootRedirect = () => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="page-loading">Loading...</div>;
//   if (!user) return <Navigate to="/login" replace />;
//   return <Navigate to={roleToPath[user.role] || '/login'} replace />;
// };

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<RootRedirect />} />
//       <Route path="/login" element={<Login />} />
//new code for home page
import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/faculty"
        element={
          <PrivateRoute allowedRoles={["Faculty"]}>
            <FacultyDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/student"
        element={
          <PrivateRoute allowedRoles={["Student"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
