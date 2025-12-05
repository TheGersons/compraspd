// mocks/mocksKpi.ts
type KpiData = {
  title: string;
  value: number | string;
  hint?: string;
  tone: "brand" | "success" | "warn" | "danger" | "info" | "purple" | "pink" | "orange" | "teal" | "indigo";
  details?: {
    source?: string;
    lastUpdate?: string;
    trend?: string;
  };
};

/**
 * KPIS CONSISTENTES CON MOCKS DE GERENCIA
 * 
 * Total productos en sistema: 433
 * - Área Proyectos: 147 productos
 * - Área Comercial: 98 productos
 * - Área Técnica: 76 productos
 * - Área Operativa: 112 productos
 * 
 * Total proyectos activos: 18
 * - Área Proyectos: 6 proyectos
 * - Área Comercial: 4 proyectos
 * - Área Técnica: 3 proyectos
 * - Área Operativa: 5 proyectos
 */

// ============================================================================
// COTIZACIONES
// ============================================================================
export const MOCK_COTIZACIONES: KpiData[] = [
  {
    title: "Cotizaciones Totales",
    value: 156,
    tone: "success",
    hint: "Últimos 30 días",
    details: {
      source: "Sistema de cotizaciones",
      lastUpdate: "Hace 5 minutos",
      trend: "↑ +12% vs mes anterior"
    }
  },
  {
    title: "En Revisión",
    value: 23,
    tone: "info",
    hint: "Requieren atención",
    details: {
      source: "Estado: EN_REVISION",
      lastUpdate: "Hace 2 minutos",
      trend: "→ Sin cambios"
    }
  },
  {
    title: "Aprobadas",
    value: 89,
    tone: "success",
    hint: "Este mes",
    details: {
      source: "Estado: APROBADA_COMPLETA/PARCIAL",
      lastUpdate: "Hace 1 minuto",
      trend: "↑ +8% vs mes anterior"
    }
  },
  {
    title: "Pendientes",
    value: 32,
    tone: "warn",
    hint: "Sin asignar",
    details: {
      source: "Estado: ENVIADA",
      lastUpdate: "Hace 3 minutos",
      trend: "↓ -5% vs mes anterior"
    }
  },
  {
    title: "Monto Total",
    value: "L 8.7M",
    tone: "success",
    hint: "En proceso",
    details: {
      source: "Suma de cotizaciones activas",
      lastUpdate: "Hace 10 minutos",
      trend: "↑ +15% vs mes anterior"
    }
  },
  {
    title: "Promedio Días",
    value: "3.8",
    tone: "success",
    hint: "Tiempo respuesta",
    details: {
      source: "Fecha solicitud vs aprobación",
      lastUpdate: "Actualización diaria",
      trend: "↓ Mejoró 0.4 días"
    }
  },
  {
    title: "Rechazadas",
    value: 12,
    tone: "warn",
    hint: "Últimos 30 días",
    details: {
      source: "Estado: RECHAZADA",
      lastUpdate: "Hace 15 minutos",
      trend: "↓ -3% vs mes anterior"
    }
  },
  {
    title: "Monto Aprobado",
    value: "L 6.2M",
    tone: "success",
    hint: "Acumulado mes",
    details: {
      source: "Suma de cotizaciones APROBADA",
      lastUpdate: "Hace 1 hora",
      trend: "↑ +20% vs meta"
    }
  },
];

// ============================================================================
// COMPRAS Y PRODUCTOS
// ============================================================================
export const MOCK_COMPRAS: KpiData[] = [
  {
    title: "Productos Activos",
    value: 433,
    tone: "info",
    hint: "En seguimiento",
    details: {
      source: "Vista gerencial - Total",
      lastUpdate: "Tiempo real",
      trend: "→ Constante"
    }
  },
  {
    title: "Proyectos Activos",
    value: 18,
    tone: "success",
    hint: "En ejecución",
    details: {
      source: "4 áreas operativas",
      lastUpdate: "Actualización diaria",
      trend: "→ Estable"
    }
  },
  {
    title: "Cotizados",
    value: 418,
    tone: "success",
    hint: "96.5% del total",
    details: {
      source: "Productos con cotización",
      lastUpdate: "Hace 5 minutos",
      trend: "↑ +15 esta semana"
    }
  },
  {
    title: "Con Descuento",
    value: 295,
    tone: "warn",
    hint: "68% del total",
    details: {
      source: "Solicitudes de descuento",
      lastUpdate: "Hace 8 minutos",
      trend: "↑ En negociación"
    }
  },
  {
    title: "Comprados",
    value: 266,
    tone: "success",
    hint: "61% del total",
    details: {
      source: "Órdenes de compra emitidas",
      lastUpdate: "Hace 15 minutos",
      trend: "↑ +12 hoy"
    }
  },
  {
    title: "Pagados",
    value: 232,
    tone: "success",
    hint: "54% del total",
    details: {
      source: "Pagos procesados",
      lastUpdate: "Hace 20 minutos",
      trend: "↑ +8 hoy"
    }
  },
  {
    title: "En FOB",
    value: 172,
    tone: "warn",
    hint: "40% del total",
    details: {
      source: "Productos embarcados",
      lastUpdate: "Hace 30 minutos",
      trend: "→ En tránsito"
    }
  },
  {
    title: "En CIF",
    value: 84,
    tone: "info",
    hint: "19% del total",
    details: {
      source: "Productos en aduana",
      lastUpdate: "Hace 45 minutos",
      trend: "↑ +5 liberados hoy"
    }
  },
  {
    title: "Productos Críticos",
    value: 47,
    tone: "danger",
    hint: "Con atrasos >5 días",
    details: {
      source: "Criticidad alta",
      lastUpdate: "Tiempo real",
      trend: "↑ Requieren atención"
    }
  },
];

// ============================================================================
// IMPORT/EXPORT Y LOGÍSTICA
// ============================================================================
export const MOCK_IMPORT_EXPORT: KpiData[] = [
  {
    title: "Importaciones Activas",
    value: 172,
    tone: "info",
    hint: "FOB + BL + Seguimientos",
    details: {
      source: "Productos en tránsito",
      lastUpdate: "Hace 30 minutos",
      trend: "↑ +8 esta semana"
    }
  },
  {
    title: "En Aduana",
    value: 84,
    tone: "warn",
    hint: "Por liberar",
    details: {
      source: "Estado CIF",
      lastUpdate: "Hace 1 hora",
      trend: "→ En trámite"
    }
  },
  {
    title: "Primer Seguimiento",
    value: 202,
    tone: "success",
    hint: "47% del total",
    details: {
      source: "Tracking inicial",
      lastUpdate: "Actualización diaria",
      trend: "↑ +10 actualizados"
    }
  },
  {
    title: "Segundo Seguimiento",
    value: 160,
    tone: "success",
    hint: "37% del total",
    details: {
      source: "Tracking avanzado",
      lastUpdate: "Actualización diaria",
      trend: "↑ +7 actualizados"
    }
  },
  {
    title: "Con BL",
    value: 144,
    tone: "success",
    hint: "Bill of Lading emitido",
    details: {
      source: "Documentación completa",
      lastUpdate: "Hace 2 horas",
      trend: "↑ +4 hoy"
    }
  },
  {
    title: "Días Promedio",
    value: "42",
    tone: "warn",
    hint: "Compra a recepción",
    details: {
      source: "Tiempo total de importación",
      lastUpdate: "Cálculo semanal",
      trend: "→ Dentro de rango"
    }
  },
  {
    title: "Valor en Tránsito",
    value: "$3.2M",
    tone: "info",
    hint: "FOB + CIF activos",
    details: {
      source: "Suma productos embarcados",
      lastUpdate: "Actualización diaria",
      trend: "↑ +$450K esta semana"
    }
  },
  {
    title: "Liberados Esta Semana",
    value: 18,
    tone: "success",
    hint: "Listos para bodega",
    details: {
      source: "CIF completados",
      lastUpdate: "Hace 3 horas",
      trend: "↑ +4 vs semana anterior"
    }
  },
];

// ============================================================================
// RESUMEN POR ÁREA
// ============================================================================
export const MOCK_AREAS: KpiData[] = [
  {
    title: "Área Proyectos",
    value: "147 prod",
    tone: "purple",
    hint: "6 proyectos activos",
    details: {
      source: "Infraestructura y energía",
      lastUpdate: "Tiempo real",
      trend: "→ 3 críticos, 2 normales, 1 adelantado"
    }
  },
  {
    title: "Área Comercial",
    value: "98 prod",
    tone: "indigo",
    hint: "4 proyectos activos",
    details: {
      source: "Equipamiento y vehículos",
      lastUpdate: "Tiempo real",
      trend: "→ 1 crítico, 1 normal, 2 adelantados"
    }
  },
  {
    title: "Área Técnica",
    value: "76 prod",
    tone: "teal",
    hint: "3 proyectos activos",
    details: {
      source: "Instrumental y laboratorio",
      lastUpdate: "Tiempo real",
      trend: "→ 1 crítico, 1 normal, 1 adelantado"
    }
  },
  {
    title: "Área Operativa",
    value: "112 prod",
    tone: "orange",
    hint: "5 proyectos activos",
    details: {
      source: "Maquinaria y herramientas",
      lastUpdate: "Tiempo real",
      trend: "→ 1 crítico, 2 normales, 2 adelantados"
    }
  },
];