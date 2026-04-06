import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * PublicRoute prevents authenticated users from accessing auth-related pages 
 * (Login, Register, ForgotPassword) by redirecting them to the dashboard.
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040406]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

export default PublicRoute;
