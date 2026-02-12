// src/router/ProtectedRoute.tsx - VERSIÓN MEJORADA

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/common/LoadingScreen";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  roles?: string[];
}


export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.requierecambiopassword && window.location.pathname !== '/change-password-required') {
    return <Navigate to="/change-password-required" replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = user.rol?.nombre;
    if (!userRole || !roles.includes(userRole)) {

      if (userRole === "USUARIO") {
        return <Navigate to="/quotes/new" replace />;
      }
      return <Navigate to="/quotes" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}