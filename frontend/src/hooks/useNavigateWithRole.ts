// src/hooks/useNavigateWithRole.ts

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

// Definir qué rutas requieren qué roles (array vacío = todos los autenticados)
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard
  '/dashboard': ['ADMIN', 'SUPERVISOR'],
  '/home': ['ADMIN', 'SUPERVISOR'],
  
  // Quotes
  '/quotes': ['ADMIN', 'SUPERVISOR'],
  '/quotes/new': [],
  '/quotes/my-quotes': [],
  '/quotes/history': [],
  '/quotes/follow-ups': ['ADMIN', 'SUPERVISOR'],
  '/quotes/assignment': ['ADMIN', 'SUPERVISOR'],
  
  // Shopping
  '/shopping': ['ADMIN', 'SUPERVISOR'],
  '/shopping/follow-ups': ['ADMIN', 'SUPERVISOR'],
  '/shopping/history': ['ADMIN', 'SUPERVISOR'],
  '/shopping/assignment': ['ADMIN', 'SUPERVISOR'],
  
  // Projects
  '/projects': ['ADMIN', 'SUPERVISOR'],
  '/projects/new': ['ADMIN', 'SUPERVISOR'],
  '/projects/edit': ['ADMIN', 'SUPERVISOR'],
  
  // Users
  '/profiles': ['ADMIN'],
  '/settings': ['ADMIN', 'SUPERVISOR'],
  '/roles': ['ADMIN'],
  
  // Calendar y otros
  '/calendar': ['ADMIN', 'SUPERVISOR'],
  '/blank': ['ADMIN', 'SUPERVISOR'],
  '/form-elements': ['ADMIN', 'SUPERVISOR'],
  '/basic-tables': ['ADMIN', 'SUPERVISOR'],
  '/alerts': ['ADMIN', 'SUPERVISOR'],
  '/avatars': ['ADMIN', 'SUPERVISOR'],
  '/badge': ['ADMIN', 'SUPERVISOR'],
  '/buttons': ['ADMIN', 'SUPERVISOR'],
  '/images': ['ADMIN', 'SUPERVISOR'],
  '/videos': ['ADMIN', 'SUPERVISOR'],
  '/line-chart': ['ADMIN', 'SUPERVISOR'],
  '/bar-chart': ['ADMIN', 'SUPERVISOR'],
};

// Ruta de fallback segura para cualquier usuario autenticado
const FALLBACK_ROUTE = '/quotes/new';

// Obtener permisos para una ruta (soporta rutas dinámicas como /projects/edit/123)
const getPermissions = (path: string): string[] | null => {
  // 1. Coincidencia exacta
  if (ROUTE_PERMISSIONS[path] !== undefined) {
    return ROUTE_PERMISSIONS[path];
  }
  
  // 2. Coincidencia parcial (ordenar por longitud descendente para match más específico)
  const sortedRoutes = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  
  for (const route of sortedRoutes) {
    if (path.startsWith(route + '/') || path === route) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  
  // 3. Ruta no definida
  return null;
};

// Verificar si un rol tiene acceso a una ruta
const hasAccess = (path: string, userRole: string | undefined): boolean => {
  const allowedRoles = getPermissions(path);
  
  // Ruta no definida en permisos = denegar por seguridad
  if (allowedRoles === null) {
    return false;
  }
  
  // Array vacío = todos los autenticados pueden acceder
  if (allowedRoles.length === 0) {
    return true;
  }
  
  // Verificar si el rol está en la lista
  return userRole ? allowedRoles.includes(userRole) : false;
};

export function useNavigateWithRole() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateSafe = useCallback((
    path: string, 
    options?: { replace?: boolean; state?: unknown }
  ): boolean => {
    const userRole = user?.rol?.nombre;

    // Usuario no autenticado - ir a login
    if (!user) {
      navigate('/signin', { replace: true });
      return false;
    }

    // Verificar permiso
    if (hasAccess(path, userRole)) {
      navigate(path, options);
      return true;
    }

    // Sin permiso - ir a fallback
    console.warn(`[NavigateWithRole] Acceso denegado a "${path}" para rol "${userRole}". Redirigiendo a ${FALLBACK_ROUTE}`);
    navigate(FALLBACK_ROUTE, { replace: true });
    return false;
  }, [navigate, user]);

  // Función auxiliar para verificar sin navegar
  const canAccess = useCallback((path: string): boolean => {
    return hasAccess(path, user?.rol?.nombre);
  }, [user]);

  // Obtener la ruta de inicio según el rol
  const getHomeRoute = useCallback((): string => {
    const userRole = user?.rol?.nombre;
    
    if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
      return '/dashboard';
    }
    
    return FALLBACK_ROUTE;
  }, [user]);

  return { 
    navigateSafe, 
    canAccess, 
    getHomeRoute,
    FALLBACK_ROUTE 
  };
}