import { useEffect, useState } from "react";
import { getToken } from "../lib/api";
import type { Moneda } from "../utils/formatPrecio";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Cache simple en memoria — el catálogo cambia muy raramente
let cache: Moneda[] | null = null;
let inflight: Promise<Moneda[]> | null = null;

async function fetchMonedas(): Promise<Moneda[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/monedas?activo=true`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al cargar monedas");
  return res.json();
}

/**
 * Hook que carga el catálogo de monedas activas.
 * Cachea el resultado en memoria — solo hace fetch la primera vez.
 */
export function useMonedas() {
  const [monedas, setMonedas] = useState<Moneda[]>(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;

    if (!inflight) {
      inflight = fetchMonedas()
        .then((data) => {
          cache = data;
          return data;
        })
        .finally(() => {
          inflight = null;
        });
    }

    let active = true;
    inflight
      .then((data) => {
        if (active) {
          setMonedas(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const findByCodigo = (codigo: string) =>
    monedas.find((m) => m.codigo === codigo);

  const findById = (id?: string | null) =>
    id ? monedas.find((m) => m.id === id) : undefined;

  /** Default sugerido según tipoCompra (NACIONAL→HNL, INTERNACIONAL→USD). */
  const defaultPorTipoCompra = (
    tipoCompra: "NACIONAL" | "INTERNACIONAL" | string | null | undefined,
  ): Moneda | undefined => {
    if (tipoCompra === "INTERNACIONAL") return findByCodigo("USD");
    return findByCodigo("HNL");
  };

  return {
    monedas,
    loading,
    error,
    findByCodigo,
    findById,
    defaultPorTipoCompra,
  };
}

/** Invalida el cache, forzando recarga al próximo render. */
export function invalidateMonedasCache() {
  cache = null;
}
