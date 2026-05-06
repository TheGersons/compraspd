// src/hooks/useNavigateWithRole.ts

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

// Definir qué rutas requieren qué roles (array vacío = todos los autenticados)
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard
  '/dashboard': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/home': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],

  // Quotes
  '/quotes': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/quotes/new': [],
  '/quotes/my-quotes': [],
  '/quotes/history': [],
  '/reportes': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/reportes/productos': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/quotes/follow-ups': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/quotes/assignment': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/quotes/rejected': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],

  // Shopping
  '/shopping': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/shopping/follow-ups': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/shopping/history': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/shopping/documents': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/shopping/aprobacion': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/shopping/assignment': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],

  // Logística
  '/logistica': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/logistica/cotizaciones': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/logistica/historial': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/logistica/rechazadas': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/logistica/compras': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/logistica/documentos': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],

  // Licitaciones y Ofertas
  '/licitaciones': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/licitaciones/archivo': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/ofertas': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],
  '/ofertas/archivo': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'COMERCIAL'],

  // Projects
  '/projects': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/projects/new': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/projects/edit': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],

  // Users
  '/profiles': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/settings': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/roles': ['ADMIN'],
  '/profile': [],

  // Providers / Odoo
  '/providers': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/odoo': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],

  // Calendar y otros
  '/calendar': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/blank': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/form-elements': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/basic-tables': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/alerts': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/avatars': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/badge': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/buttons': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/images': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/videos': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/line-chart': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
  '/bar-chart': ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'],
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

    if (userRole === 'ADMIN' || userRole === 'SUPERVISOR' || userRole === 'JEFE_COMPRAS') {
      return '/dashboard';
    }

    if (userRole === 'COMERCIAL') {
      return '/shopping/follow-ups';
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