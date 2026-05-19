import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./state/AuthContext";

import LoginPage from "./views/LoginPage";
import ViviLandingPage from "./views/ViviLandingPage";
import StudentDashboard from "./views/StudentDashboard";
import ParentDashboard from "./views/ParentDashboard";
import AdminDashboard from "./views/AdminDashboard";
import Gallery from "./views/Gallery";
import AboutPage from "./views/AboutPage";
import PartnersPage from "./views/PartnersPage";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  const isLoggedIn = !!user;
  const role = user?.profile?.role; // 👈 IMPORTANT CHANGE

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<ViviLandingPage />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* PROTECTED: STUDENT */}
      <Route
        path="/dashboard/student"
        element={
          isLoggedIn && role === "student" ? (
            <StudentDashboard />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />

      {/* PROTECTED: PARENT */}
      <Route
        path="/dashboard/parent"
        element={
          isLoggedIn && role === "parent" ? (
            <ParentDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* PROTECTED: ADMIN */}
      <Route
        path="/dashboard/admin"
        element={
          isLoggedIn && role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}