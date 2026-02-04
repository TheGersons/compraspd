// src/context/AuthContext.tsx - VERSIÓN MEJORADA

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usersApi } from "../pages/users/service/userApi";
import {
  getToken,
  getRefreshToken,
  removeTokens,
  setTokens,
  setUser as saveUser,
  getUser as getSavedUser
} from "../lib/api";

type User = {
  id: string;
  nombre: string;
  email: string;
  rol: { id: string; nombre: string };
  departmentId?: string;
  isActive?: boolean;
};

type AuthCtx = {
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, userData?: any) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Refresca la información del usuario desde el backend
   * MEJORADO: No bloquea si falla
   */
  const refresh = async () => {
    const accessToken = getToken();
    const refreshToken = getRefreshToken();

    // Si no hay tokens, no hay sesión
    if (!accessToken && !refreshToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Si ya está refrescando, no hacer nada
    if (isRefreshing) {
      console.log("Ya hay un refresh en progreso");
      return;
    }

    setIsRefreshing(true);

    try {
      // Intentar obtener información del usuario
      const me = await usersApi.me();
      setUser(me);
      saveUser(me);
    } catch (error: any) {
      console.error("Error al obtener usuario:", error);

      // Si el error es de autenticación, limpiar sesión
      if (error?.message?.includes("401") || error?.message?.includes("Sesión")) {
        console.log("Sesión inválida, limpiando tokens...");
        setUser(null);
        removeTokens();

        // Solo redirigir si NO estamos ya en la página de login
        if (location.pathname !== "/signin") {
          navigate("/signin", { replace: true });
        }
      } else {
        // Si es otro error, mantener el usuario cacheado si existe
        const savedUser = getSavedUser();
        if (savedUser) {
          setUser(savedUser);
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Restaura sesión al montar el componente
   * MEJORADO: Carga rápida desde cache
   */
  useEffect(() => {
    // Cargar usuario desde localStorage primero (carga rápida)
    const savedUser = getSavedUser();
    if (savedUser) {
      setUser(savedUser);
      setIsLoading(false); // Mostrar UI inmediatamente
    }

    // Validar con el backend en segundo plano
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Login: guarda tokens y obtiene información del usuario
   */
  const login = async (
    accessToken: string,
    refreshToken: string,
    userData?: any
  ) => {
    console.log("Guardando tokens de nueva sesión...");

    setTokens(accessToken, refreshToken);

    if (userData) {
      setUser(userData);
      saveUser(userData);
      setIsLoading(false);

      // ✅ AGREGAR ESTO:
      const rolNombre = userData.rol.nombre.toUpperCase();
      if (rolNombre === 'USUARIO') {
        navigate('/quotes/my-quotes');
      } else {
        navigate('/quotes');
      }

      setTimeout(() => void refresh(), 100);
    } else {
      setIsLoading(true);
      await refresh();

      // ✅ AGREGAR ESTO TAMBIÉN:
      const me = await usersApi.me();
      const rolNombre = me.rol.nombre.toUpperCase();
      if (rolNombre === 'USUARIO') {
        navigate('/quotes/my-quotes');
      } else {
        navigate('/quotes');
      }
    }
  };

  /**
   * Logout: cierra sesión en backend y limpia tokens
   * MEJORADO: Siempre limpia local aunque falle el backend
   */
  const logout = async () => {
    console.log("Cerrando sesión...");

    const token = getToken();

    // Intentar cerrar sesión en backend
    if (token) {
      try {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        console.log("Sesión cerrada en backend");
      } catch (error) {
        console.warn("Error al cerrar sesión en backend (ignorado):", error);
        // Ignorar errores del backend
      }
    }

    // SIEMPRE limpiar tokens locales
    removeTokens();
    setUser(null);

    console.log("Tokens locales limpiados");

    // Redirigir a login
    navigate("/signin", { replace: true });
  };

  const value = useMemo(
    () => ({ user, isLoading, login, refresh, logout }),
    [user, isLoading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);