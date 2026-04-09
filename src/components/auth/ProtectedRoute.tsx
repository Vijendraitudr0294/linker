import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { isAdminUser } from "@/lib/authRoles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] p-4">
        <div className="rounded-2xl border-4 border-black bg-white px-8 py-7 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-black border-t-[#34D399]" />
          <p className="text-xs font-black uppercase tracking-[0.16em] text-black/70">Loading</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdminUser(user)) {
    console.warn("Unauthorized access attempt to admin route by:", user?.email);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
