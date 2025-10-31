import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

type Props = {
  children?: ReactNode;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Verificando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace/>;
  }

  if (roles && roles.length > 0) {
    const roleName = user.role?.name;
    const allowed = roleName && roles.includes(roleName);
    if (!allowed) return <Navigate to="/403" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
