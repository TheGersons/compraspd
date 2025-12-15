// src/lib/api.ts

// ============================================================================
// MANEJO DE TOKENS
// ============================================================================

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function removeTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function setUser(user: any): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): any | null {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

// ============================================================================
// BACKWARDS COMPATIBILITY (mantener compatibilidad con código antiguo)
// ============================================================================

export function setToken(token: string, persist = true): void {
  console.warn("setToken() is deprecated, use setTokens() instead");
  localStorage.setItem("access_token", token);
}

export function removeToken(): void {
  console.warn("removeToken() is deprecated, use removeTokens() instead");
  removeTokens();
}

// ============================================================================
// REFRESH TOKEN MEJORADO
// ============================================================================

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresca el access token usando el refresh token
 * MEJORADO: Usa una única promesa compartida para evitar múltiples requests
 */
async function refreshAccessToken(): Promise<string | null> {
  // Si ya está refrescando, retornar la promesa existente
  if (isRefreshing && refreshPromise) {
    console.log("Ya hay un refresh en progreso, esperando...");
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.error("No hay refresh token disponible");
    return null;
  }

  isRefreshing = true;

  // Crear nueva promesa de refresh
  refreshPromise = (async () => {
    try {
      console.log("Refrescando access token...");
      
      const response = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Error al refrescar token");
      }

      const data = await response.json();
      
      // Guardar nuevo access token
      localStorage.setItem("access_token", data.access_token);
      
      console.log("Access token refrescado exitosamente");
      
      return data.access_token;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      // Si falla el refresh, limpiar todo
      removeTokens();
      
      // NO redirigir automáticamente aquí
      // Dejar que el componente de rutas protegidas lo maneje
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================================
// FUNCIÓN API MEJORADA (NO BLOQUEA)
// ============================================================================

/**
 * Función fetch mejorada con:
 * - Autenticación automática
 * - Retry con refresh token si el access token expiró
 * - NO bloquea navegación mientras refresca
 */
export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const makeRequest = async (accessToken: string | null) => {
    return fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  };

  // Primera petición
  let response = await makeRequest(token);

  // Si es 401 (no autorizado) Y tenemos refresh token, intentar refrescar
  if (response.status === 401) {
    const hasRefreshToken = !!getRefreshToken();
    
    if (hasRefreshToken && token) {
      console.log("Token expirado, intentando refrescar...");

      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Reintentar la petición original con el nuevo token
          response = await makeRequest(newToken);
        } else {
          // Si no se pudo refrescar, lanzar error
          throw new Error("No se pudo refrescar el token");
        }
      } catch (error) {
        console.error("Error en refresh:", error);
        // Lanzar error para que el código que llamó maneje la redirección
        throw new Error("Sesión expirada");
      }
    }
  }

  // Lanzar error si no es exitoso
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}`);
  }

  // Devolver el JSON
  return response.json() as Promise<T>;
}

// ============================================================================
// FUNCIÓN API SIN AUTO-REFRESH (para casos específicos)
// ============================================================================

/**
 * Función fetch que NO intenta refrescar el token automáticamente
 * Útil para requests que no deben bloquear la navegación
 */
export async function apiNoRefresh<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}