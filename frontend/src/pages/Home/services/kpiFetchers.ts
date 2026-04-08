// services/kpiFetchers.ts - CONECTADO AL API
import { TableData, SummaryData } from '../types/kpi.types';
import { getToken } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Cache para evitar múltiples llamadas al API
let kpiCache: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 segundos

async function fetchKpisFromApi(): Promise<any> {
  const now = Date.now();
  if (kpiCache && (now - cacheTimestamp) < CACHE_TTL) {
    return kpiCache;
  }

  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/kpis`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Error cargando KPIs');
  }

  kpiCache = await response.json();
  cacheTimestamp = now;
  return kpiCache;
}

function formatMonto(valor: number): string {
  if (valor >= 1000000) return `L ${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `L ${(valor / 1000).toFixed(0)}K`;
  return `L ${valor.toLocaleString('es-HN')}`;
}

// ============================================================================
// COTIZACIONES
// ============================================================================

export async function fetchCotizacionesVencidas(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  return {
    rows: data.cotizaciones?.vencidas || [],
    total: data.cotizaciones?.vencidas?.length || 0,
  };
}

export async function fetchCotizacionesPendientes(): Promise<TableData> {
  // Productos sin cotizar - no hay tabla detallada, solo el count
  const data = await fetchKpisFromApi();
  return {
    rows: [],
    total: data.cotizaciones?.sinCotizar || 0,
  };
}

export async function fetchCotizacionesEnRevision(): Promise<TableData> {
  // Items sin descuento
  const data = await fetchKpisFromApi();
  return {
    rows: [],
    total: data.cotizaciones?.sinDescuento || 0,
  };
}

export async function fetchCotizacionesAprobadas(): Promise<SummaryData> {
  const data = await fetchKpisFromApi();
  return {
    source: 'Cotizaciones sin responsable asignado',
    lastUpdate: 'Tiempo real',
    trend: '',
    apiValue: data.cotizaciones?.sinResponsable || 0,
  };
}

export async function fetchCotizacionesRechazadas(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  return {
    rows: data.cotizaciones?.rechazados || [],
    total: data.cotizaciones?.rechazados?.length || 0,
  };
}

export async function fetchCotizacionesMontoTotal(): Promise<SummaryData> {
  const data = await fetchKpisFromApi();
  return {
    source: 'Suma de cotizaciones activas',
    lastUpdate: 'Tiempo real',
    trend: '',
    apiValue: formatMonto(data.cotizaciones?.montoTotal || 0),
  };
}

export async function fetchCotizacionesPromedioDias(): Promise<SummaryData> {
  const data = await fetchKpisFromApi();
  return {
    source: 'Promedio desde solicitud hasta aprobación',
    lastUpdate: 'Tiempo real',
    trend: '',
    apiValue: data.cotizaciones?.promedioDias || 0,
  };
}

export async function fetchCotizacionesSinOfertas(): Promise<TableData> {
  // Total en curso
  const data = await fetchKpisFromApi();
  return {
    rows: [],
    total: data.cotizaciones?.totalEnCurso || 0,
  };
}

// ============================================================================
// COMPRAS
// ============================================================================

export async function fetchComprasOrdenesActivas(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  return {
    rows: [],
    total: data.compras?.totalProductos || 0,
  };
}

export async function fetchComprasPreCompra(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  const resumen = data.compras?.resumenEtapas || {};
  const sinCotizar = (data.compras?.totalProductos || 0) - (resumen.cotizado || 0);
  return {
    rows: [],
    total: sinCotizar > 0 ? sinCotizar : 0,
  };
}

export async function fetchComprasFabricacion(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  const resumen = data.compras?.resumenEtapas || {};
  // Productos comprados pero no en FOB aún
  const enFabricacion = (resumen.comprado || 0) - (resumen.enFOB || 0);
  return {
    rows: [],
    total: enFabricacion > 0 ? enFabricacion : 0,
  };
}

export async function fetchComprasFors(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  const resumen = data.compras?.resumenEtapas || {};
  return {
    rows: [],
    total: resumen.enFOB || 0,
  };
}

export async function fetchComprasCif(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  const resumen = data.compras?.resumenEtapas || {};
  return {
    rows: [],
    total: resumen.enCIF || 0,
  };
}

export async function fetchComprasCompletadas(): Promise<SummaryData> {
  const data = await fetchKpisFromApi();
  const resumen = data.compras?.resumenEtapas || {};
  return {
    source: 'Productos recibidos (completados)',
    lastUpdate: 'Tiempo real',
    trend: '',
    apiValue: resumen.recibido || 0,
  };
}

export async function fetchComprasRetrasadas(): Promise<TableData> {
  const data = await fetchKpisFromApi();
  return {
    rows: data.compras?.retrasados || [],
    total: data.compras?.productosConRetraso || 0,
  };
}

export async function fetchComprasMontoMes(): Promise<SummaryData> {
  // No tenemos monto de compras del mes en el API actual
  return {
    source: 'Monto de compras del mes',
    lastUpdate: 'Tiempo real',
    trend: '',
    apiValue: 0,
  };
}

// ============================================================================
// IMPORT/EXPORT - Se mantienen vacíos según requerimiento
// ============================================================================

export async function fetchImportacionesActivas(): Promise<TableData> {
  return { rows: [], total: 0 };
}

export async function fetchImportacionesEnAduana(): Promise<TableData> {
  return { rows: [], total: 0 };
}

export async function fetchExportaciones(): Promise<TableData> {
  return { rows: [], total: 0 };
}

export async function fetchDocumentosPendientes(): Promise<TableData> {
  return { rows: [], total: 0 };
}

export async function fetchImportExportValorTotal(): Promise<SummaryData> {
  return { source: 'Sin datos disponibles', lastUpdate: '-', trend: '' };
}

export async function fetchImportExportDiasPromedio(): Promise<SummaryData> {
  return { source: 'Sin datos disponibles', lastUpdate: '-', trend: '' };
}

export async function fetchIncidencias(): Promise<TableData> {
  return { rows: [], total: 0 };
}

export async function fetchImportacionesRetenidas(): Promise<TableData> {
  return { rows: [], total: 0 };
}
