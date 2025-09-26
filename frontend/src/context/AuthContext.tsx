import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken } from "../lib/api";

type User = { userId: string; email: string; fullName?: string };
type AuthCtx = { user: User | null; refresh: () => Promise<void>; logout: () => void };
type Props = { children: ReactNode };

const Ctx = createContext<AuthCtx>({ user: null, refresh: async () => {}, logout: () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  async function refresh() {
    const token = getToken();
    if (!token) { setUser(null); return; }
    try { setUser(await api<User>("/api/v1/auth/me")); }
    catch { setUser(null); }
  }

  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  }

  useEffect(() => { void refresh(); }, []);

  return <Ctx.Provider value={{ user, refresh, logout }}>{children}</Ctx.Provider>;
}
