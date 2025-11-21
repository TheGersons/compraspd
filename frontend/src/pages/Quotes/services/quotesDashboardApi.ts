// services/quotesDashboardApi.ts
import { QuoteFilters } from '../../../components/quotes/filters';
import { getToken } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Helper para hacer fetch con autenticación y manejo de errores
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

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: response.statusText 
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Mapea estados del filtro frontend al backend
 */
function mapEstadoToBackend(estado?: string): string | undefined {
  if (!estado || estado === "todas") return undefined;
  
  const estadoMap: Record<string, string> = {
    abiertas: "ENVIADA",
    en_revision: "EN_REVISION",
    pendientes: "ENVIADA",
    cerradas: "APROBADA",
    vencidas: "ENVIADA", // Filtrar por fecha después
  };
  
  return estadoMap[estado] || estado.toUpperCase();
}

/**
 * Mapea tipo de compra del filtro frontend al backend
 */
function mapTipoCompraToBackend(tipoCompra?: string): string | undefined {
  if (!tipoCompra || tipoCompra === "todas") return undefined;
  
  // Ya viene en formato NATIONAL/INTERNATIONAL desde el filtro
  if (tipoCompra === "NATIONAL") return "NACIONAL";
  if (tipoCompra === "INTERNATIONAL") return "INTERNACIONAL";
  
  // Alternativas
  if (tipoCompra === "nacional") return "NACIONAL";
  if (tipoCompra === "internacional") return "INTERNACIONAL";
  
  return tipoCompra.toUpperCase();
}

export const quotesDashboardApi = {
  /**
   * GET /api/v1/quotations/all (admin) o /api/v1/quotations (user)
   * Obtiene cotizaciones con filtros aplicados
   */
  async getDashboardData(filters: QuoteFilters) {
    console.log('📊 [API] Fetching dashboard data with filters:', filters);
    
    const params = new URLSearchParams();
    
    // Período (preset)
    if (filters.preset && filters.preset !== undefined) {
      params.append('period', filters.preset);
    }
    
    // Estado
    const estado = mapEstadoToBackend(filters.estado);
    if (estado) {
      params.append('estado', estado);
    }
    
    // Tipo de compra
    const tipoCompra = mapTipoCompraToBackend(filters.tipoCompra);
    if (tipoCompra) {
      params.append('tipoCompra', tipoCompra);
    }
    
    // Proyecto
    if (filters.proyectoId && filters.proyectoId !== 'todos') {
      params.append('proyectoId', filters.proyectoId);
    }
    
    // Tipo de solicitud
    if (filters.tipoSolicitud && filters.tipoSolicitud !== 'todas') {
      params.append('tipoId', filters.tipoSolicitud);
    }
    
    // Asignado a (cuando se implemente)
    if (filters.asignadoA && filters.asignadoA !== 'todos') {
      params.append('assignedTo', filters.asignadoA);
    }
    
    // Búsqueda
    if (filters.q) {
      params.append('search', filters.q);
    }
    
    // Paginación
    params.append('page', '1');
    params.append('pageSize', '100');

    // Determinar endpoint (TODO: obtener isAdmin del contexto)
    const isAdmin = true; // Temporal
    const endpoint = isAdmin
      ? `${API_BASE_URL}/api/v1/quotations/all?${params.toString()}`
      : `${API_BASE_URL}/api/v1/quotations?${params.toString()}`;

    const data = await fetchWithAuth<any>(endpoint);
    
    console.log('✅ [API] Dashboard data received:', data);
    
    // Transformar respuesta al formato esperado por el frontend
    return {
      quotations: data.items || [],
      requests: data.items || [], // Alias para compatibilidad temporal
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
    };
  },

  /**
   * GET /api/v1/quotations/stats?period={period}
   * Obtiene estadísticas para gráficos
   * TODO: Implementar endpoint en backend
   */
  async getStats(period: string) {
    console.log('📈 [API] Fetching stats for period:', period);
    
    // TODO: Descomentar cuando exista el endpoint
    // const data = await fetchWithAuth<any>(
    //   `${API_BASE_URL}/api/v1/quotations/stats?period=${period}`
    // );
    
    // Mock data mientras tanto
    const mockData = {
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
  },

  /**
   * GET /api/v1/quotations/:id
   * Obtiene una cotización específica
   */
  async getQuotation(id: string) {
    console.log('🔍 [API] Fetching quotation:', id);
    
    const data = await fetchWithAuth<any>(
      `${API_BASE_URL}/api/v1/quotations/${id}`
    );
    
    console.log('✅ [API] Quotation received:', data);
    return data;
  },

  /**
   * POST /api/v1/quotations
   * Crea una nueva cotización
   */
  async createQuotation(payload: any) {
    console.log('➕ [API] Creating quotation:', payload);
    
    const data = await fetchWithAuth<any>(
      `${API_BASE_URL}/api/v1/quotations`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    
    console.log('✅ [API] Quotation created:', data);
    return data;
  },

  /**
   * PATCH /api/v1/quotations/:id
   * Actualiza una cotización
   */
  async updateQuotation(id: string, payload: any) {
    console.log('✏️ [API] Updating quotation:', id, payload);
    
    const data = await fetchWithAuth<any>(
      `${API_BASE_URL}/api/v1/quotations/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    
    console.log('✅ [API] Quotation updated:', data);
    return data;
  },

  /**
   * PATCH /api/v1/quotations/:id/status
   * Cambia el estado de una cotización
   */
  async changeStatus(id: string, estado: string) {
    console.log('🔄 [API] Changing quotation status:', id, estado);
    
    const data = await fetchWithAuth<any>(
      `${API_BASE_URL}/api/v1/quotations/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      }
    );
    
    console.log('✅ [API] Status changed:', data);
    return data;
  },
};