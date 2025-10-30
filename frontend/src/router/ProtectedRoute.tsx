import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children?: ReactNode;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Verificando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const roleName = user.role?.name;
    const allowed = roleName && roles.includes(roleName);
    if (!allowed) return <Navigate to="/403" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
