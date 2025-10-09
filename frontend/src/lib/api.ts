// src/lib/api.ts
export function getToken(): string | null {
  // Intenta recuperar el token desde localStorage o, en su defecto, de sessionStorage
  return localStorage.getItem("token") ?? sessionStorage.getItem("token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Lanza un error con el cuerpo textual si el código HTTP no es 2xx
  if (!res.ok) throw new Error(await res.text());

  // Devuelve el cuerpo parseado como JSON y tipado genéricamente
  return res.json() as Promise<T>;
}
