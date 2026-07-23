import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth({ children }) {
  const { isLoading, user } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950">
        Memuat session...
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function RequireFreshPassword({ children }) {
  const { user } = useAuth();
  if (user?.is_first_login) return <Navigate to="/change-password" replace />;
  return children;
}
