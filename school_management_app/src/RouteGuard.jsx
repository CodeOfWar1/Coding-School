import { Navigate } from "react-router-dom";
import { useAuth } from "./state/AuthContext";

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function RouteGuard({ children, roles }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <Loader />;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <div className="p-6">Profile not found</div>;
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}