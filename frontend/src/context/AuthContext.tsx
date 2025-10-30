import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../pages/users/service/userApi";       // Ajusta a tu client real
import { getToken, removeToken, setToken } from "../lib/api";

type Role = { name: string };
type User = {
  id: string;
  fullName: string;
  email: string;
  role?: Role;
  departmentId?: string;
  isActive?: boolean;
};

type AuthCtx = {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      // Ajusta: endpoint que devuelve el perfil del usuario actual
      const me = await usersApi.me(); // <- implementa /api/v1/users/me en backend si aún no
      setUser(me);
    } catch {
      setUser(null);
      removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Restaurar sesión al montar
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (token: string) => {
    setToken(token);
    setIsLoading(true);
    await refresh();
  };

  const logout = () => {
    removeToken();
    setUser(null);
    
    navigate("/signin", { replace: true });
  };

  const value = useMemo(
    () => ({ user, isLoading, login, refresh, logout }),
    [user, isLoading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
