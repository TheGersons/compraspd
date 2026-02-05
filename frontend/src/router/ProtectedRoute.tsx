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

  // 1. MOSTRAR LOADING MIENTRAS CARGA
  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." fullScreen />;
  }

  // 2. REDIRIGIR A LOGIN SI NO HAY USUARIO
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // 3. VERIFICAR ROLES SI SE ESPECIFICARON
if (roles && roles.length > 0) {
  const userRole = user.rol?.nombre;
  
  if (!userRole || !roles.includes(userRole)) {
    // Si es USUARIO, redirigir a /quotes/new
    if (userRole === "USUARIO") {
      return <Navigate to="/quotes/new" replace />;
    }
    // Otros casos, redirigir al dashboard
    return <Navigate to="/quotes" replace />;
  }
}

  // 4. RENDERIZAR CONTENIDO
  return children ? <>{children}</> : <Outlet />;
}