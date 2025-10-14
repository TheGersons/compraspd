import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken } from "../lib/api";

// ----------------------------------------------------
// PASO 1: Tipos del Backend
// ----------------------------------------------------

// Lo que devuelve el token endpoint /api/v1/auth/me
type Me = { 
    sub: string; // ID del usuario
    email: string; 
    role: string; // Nombre del rol (ej: "SUPERVISOR") viene directo del token
}; 

// Lo que devuelve el endpoint de perfil /api/v1/users/:id
type UserProfileResponse = {
    id: string;
    email: string;
    fullName: string;
    // El departamento es un objeto anidado (o null)
    departmentId: string | null; 
    // El rol es un objeto anidado
    role: { id: string; name: string; description: string }; 
};

// ----------------------------------------------------
// PASO 2: Tipo del Contexto (Lo que usará tu UI)
// ----------------------------------------------------
type UserContext = { 
    id: string; 
    email: string; 
    fullName: string; 
    // Mantenemos solo el nombre del departamento
    departmentId: string | null; 
    role: string; // Mantenemos solo el nombre del rol
};
type AuthCtx = { 
    user: UserContext | null; 
    refresh: () => Promise<void>; 
    logout: () => void 
};
// ----------------------------------------------------

const Ctx = createContext<AuthCtx>({ user: null, refresh: async () => { }, logout: () => { } });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null);

  async function refresh() {
    const token = getToken();
    if (!token) { setUser(null); return; }

    try {
      // 1) Pide identidad mínima del token (sub, email, role)
      const me = await api<Me>("/api/v1/auth/me");
      
      // 2) Pide perfil completo usando el ID del token ('sub')
      const profile = await api<UserProfileResponse>(`/api/v1/users/${me.sub}`); 

      // 3) Normaliza a tu tipo UserContext, extrayendo el nombre del rol y departamento
      setUser({
        id: me.sub,         
        email: me.email,
        fullName: profile.fullName, 
        
        // El departamento es opcional y está anidado
        departmentId: profile.departmentId ?? null,
        
        // Aunque el rol viene en 'me', lo confirmamos y lo tomamos del token 
        // para máxima consistencia y evitar dependencia de profile.role.name
        role: me.role,       
      });
      
    } catch (e) {
        console.error("Error al cargar perfil:", e);
        logout(); 
    }
  }

  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  }
  
  // Implementación de useEffect y Provider (se mantiene igual)
  useEffect(() => {
    void refresh(); 
    
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") void refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <Ctx.Provider value={{ user, refresh, logout }}>{children}</Ctx.Provider>;
}