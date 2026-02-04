import { useQuery } from "@tanstack/react-query";
import { QuoteFilters } from "../../../components/quotes/filters";
import { getToken } from "../../../lib/api";

// ============================================================================
// TYPES
// ============================================================================

type QuotationFromAPI = {
  id: string;
  nombreCotizacion: string;
  estado: string;
  tipoCompra: string;
  lugarEntrega: string;
  fechaSolicitud: string;
  fechaLimite: string;
  fechaEstimada: string;
  comentarios?: string;
  solicitante: {
    id: string;
    nombre: string;
    email: string;
    departamento?: {
      nombre: string;
    };
  };
  tipo: {
    id: string;
    nombre: string;
    area: {
      nombreArea: string;
    };
  };
  proyecto?: {
    id: string;
    nombre: string;
  };
  detalles: Array<{
    id: string;
    cantidad: number;
    descripcionProducto: string;
    sku?: string;
    tipoUnidad: string;
  }>;
};

type DashboardResponse = {
  quotations: QuotationFromAPI[];
  total: number;
  page: number;
  pageSize: number;
};

type StatsResponse = {
  monthlyStats: Array<{
    month: string;
    count: number;
    totalAmount: number;
    estimatedRevenue: number;
  }>;
  summary: {
    total: number;
    open: number;
    approved: number;
    rejected: number;
  };
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Helper para hacer fetch con autenticación
 */
async function fetchWithAuth<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  // ✅ MANEJAR 401/403 AQUÍ
  if (response.status === 401 || response.status === 403) {
    const error = await response.json().catch(() => ({ message: response.statusText }));

    // Mostrar dialog sin lanzar error que React Query capture
    if (window.showAccessDenied) {
      window.showAccessDenied(error.message || 'No tienes permisos');
    }

    // Lanzar error silencioso (React Query lo captura pero no muestra nada)
    throw new Error('AUTH_ERROR');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Mapea estados del frontend al backend
 */
function mapEstadoFilter(estado?: string): string | undefined {
  if (!estado || estado === "todas") return undefined;

  const estadoMap: Record<string, string> = {
    abiertas: "ENVIADA",
    en_revision: "EN_REVISION",
    pendientes: "ENVIADA", // Alias
    cerradas: "APROBADA",
    vencidas: "ENVIADA", // Filtrar por fecha en frontend
  };

  return estadoMap[estado] || estado.toUpperCase();
}

/**
 * Mapea tipo de compra del frontend al backend
 */
function mapTipoCompraFilter(tipoCompra?: string): string | undefined {
  if (!tipoCompra || tipoCompra === "todas") return undefined;

  // Ya viene en formato correcto desde el filtro
  if (tipoCompra === "NATIONAL" || tipoCompra === "INTERNATIONAL") {
    return tipoCompra === "NATIONAL" ? "NACIONAL" : "INTERNACIONAL";
  }

  const tipoCompraMap: Record<string, string> = {
    nacional: "NACIONAL",
    internacional: "INTERNACIONAL",
  };

  return tipoCompraMap[tipoCompra] || tipoCompra.toUpperCase();
}

/**
 * Obtiene las cotizaciones con filtros aplicados
 */
async function fetchQuotations(
  filters: QuoteFilters,
  isAdmin: boolean = false
): Promise<DashboardResponse> {
  console.log('📊 [API] Fetching quotations with filters:', filters);

  // Construir query params
  const params = new URLSearchParams();

  // Estado
  const estado = mapEstadoFilter(filters.estado);
  if (estado) params.append("estado", estado);

  // Tipo de compra
  const tipoCompra = mapTipoCompraFilter(filters.tipoCompra);
  if (tipoCompra) params.append("tipoCompra", tipoCompra);

  // Proyecto
  if (filters.proyectoId && filters.proyectoId !== "todos") {
    params.append("proyectoId", filters.proyectoId);
  }

  // Tipo de solicitud (tipoId)
  if (filters.tipoSolicitud && filters.tipoSolicitud !== "todas") {
    // TODO: Mapear nombres de tipo a IDs cuando tengamos catálogo
    // Por ahora, asumimos que viene el ID
    params.append("tipoId", filters.tipoSolicitud);
  }

  // Paginación
  params.append("page", "1");
  params.append("pageSize", "100");

  // Endpoint según permisos
  const endpoint = isAdmin
    ? `${API_BASE_URL}/api/v1/quotations/all?${params.toString()}`
    : `${API_BASE_URL}/api/v1/quotations?${params.toString()}`;

  //payload, incluir jwt


  const data = await fetchWithAuth<{ items: QuotationFromAPI[]; total: number; page: number; pageSize: number }>(endpoint);

  console.log('✅ [API] Quotations received:', data);

  return {
    quotations: data.items || [],
    total: data.total || 0,
    page: data.page || 1,
    pageSize: data.pageSize || 20,
  };
}

/**
 * Obtiene estadísticas para los gráficos
 * TODO: Implementar endpoint de estadísticas en el backend
 */
async function fetchQuotationsStats(preset: string): Promise<StatsResponse> {
  console.log('📈 [API] Fetching stats for period:', preset);

  // TODO: Crear endpoint /api/v1/quotations/stats en el backend
  // Por ahora retornamos datos mock

  // Endpoint temporal - descomentar cuando exista
  // const data = await fetchWithAuth<StatsResponse>(
  //   `${API_BASE_URL}/api/v1/quotations/stats?period=${preset}`
  // );

  // Mock data mientras tanto
  const mockData: StatsResponse = {
    monthlyStats: [],
    summary: {
      total: 0,
      open: 0,
      approved: 0,
      rejected: 0,
    },
  };

  console.log('✅ [API] Stats received (mock):', mockData);
  return mockData;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook para obtener dashboard de cotizaciones
 */
export function useQuotesDashboard(filters: QuoteFilters) {
  // TODO: Obtener del contexto de autenticación
  // Por ahora asumimos admin para testing
  const isAdmin = true;

  return useQuery({
    queryKey: ["quotations", "dashboard", filters],
    queryFn: () => fetchQuotations(filters, isAdmin),
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener estadísticas de cotizaciones
 */
export function useQuotesStats(preset: string) {
  return useQuery({
    queryKey: ["quotations", "stats", preset],
    queryFn: () => fetchQuotationsStats(preset),
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
    // Por ahora deshabilitar hasta que exista el endpoint
    enabled: false,
  });
}

/**
 * Hook para obtener una cotización individual
 */
export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotations", id],
    queryFn: async () => {
      const data = await fetchWithAuth<QuotationFromAPI>(
        `${API_BASE_URL}/api/v1/quotations/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener mis cotizaciones (usuario actual)
 */
export function useMyQuotations(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["quotations", "mine", page, pageSize],
    queryFn: async () => {
      const data = await fetchWithAuth<{ items: QuotationFromAPI[]; total: number; page: number; pageSize: number }>(
        `${API_BASE_URL}/api/v1/quotations?page=${page}&pageSize=${pageSize}`
      );
      return {
        quotations: data.items || [],
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 20,
      } as DashboardResponse;
    },
  });
}