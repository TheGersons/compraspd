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
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No tienes permisos para acceder a esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
            >
              Volver atrás
            </button>
          </div>
        </div>
      );
    }
  }

  // 4. RENDERIZAR CONTENIDO
  return children ? <>{children}</> : <Outlet />;
}