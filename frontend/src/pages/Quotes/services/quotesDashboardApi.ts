// services/quotesDashboardApi.ts
import { QuoteFilters } from '../../../components/quotes/filters';
import { api } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const quotesDashboardApi = {
  // GET /api/v1/quotes/dashboard
  async getDashboardData(filters: QuoteFilters) {
    console.log('📊 [API] Fetching dashboard data with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters.preset) params.append('period', filters.preset === undefined ? "" : filters.preset);
    if (filters.estado !== 'todas') params.append('status', filters.estado === undefined ? "" : filters.estado);
    if (filters.tipoSolicitud !== 'todas') params.append('category', filters.tipoSolicitud === undefined ? "" : filters.tipoSolicitud);
    if (filters.tipoCompra !== 'todas') params.append('procurement', filters.tipoCompra === undefined ? "" : filters.tipoCompra);
    if (filters.proyectoId !== 'todos') params.append('projectId', filters.proyectoId === undefined ? "" : filters.proyectoId);
    if (filters.asignadoA !== 'todos') params.append('assignedTo', filters.asignadoA === undefined ? "" : filters.asignadoA);
    if (filters.q) params.append('search', filters.q);

    const data = await api<any>(
      `${API_BASE_URL}/api/v1/quotes/dashboard?${params.toString()}`
    );
    console.log('✅ [API] Dashboard data received:', data);
    return data;
  },

  // GET /api/v1/quotes/stats
  async getStats(period: string) {
    console.log('📈 [API] Fetching stats for period:', period);
    const data = await api<any>(
      `${API_BASE_URL}/api/v1/quotes/stats?period=${period}`
    );
    console.log('✅ [API] Stats received:', data);
    return data;
  },
};