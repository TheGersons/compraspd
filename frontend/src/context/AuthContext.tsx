import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken } from "../lib/api";

type Me = { userId: string; email: string; };
type User = { userId: string; email: string; fullName: string; department: string; };
type AuthCtx = { user: User | null; refresh: () => Promise<void>; logout: () => void };


const Ctx = createContext<AuthCtx>({ user: null, refresh: async () => { }, logout: () => { } });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function refresh() {
    const token = getToken();
    if (!token) { setUser(null); return; }

    try {
      // 1) pide identidad mínima
      const me = await api<Me>("/api/v1/auth/me");
      // 2) pide perfil completo usando el id del paso 1
      const u = await api<User>(`/api/v1/users/${me.userId}`);

      // 3) normaliza a tu tipo User
      setUser({
        userId: u.userId,
        email: u.email,
        fullName: u.fullName,
        department: u.department,
      });
    } catch {
      setUser(null);
    }
  }
  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  }

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") void refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <Ctx.Provider value={{ user, refresh, logout }}>{children}</Ctx.Provider>;
}