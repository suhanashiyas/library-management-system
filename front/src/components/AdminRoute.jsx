import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Same as ProtectedRoute, but also requires the admin role.
// Use this to wrap pages that only admins should reach (e.g. user management).
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
