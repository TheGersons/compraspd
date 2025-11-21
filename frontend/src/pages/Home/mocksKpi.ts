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


// ============================================================================
// MOCK DATA - Con más variedad de tonos y elementos extendidos
// ============================================================================

export const MOCK_COTIZACIONES: KpiData[] = [
  // --- Elementos Originales ---
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
    tone: "success",
    hint: "Requieren atención",
    details: {
      source: "Estado: EN_REVISION",
      lastUpdate: "Hace 2 minutos",
      trend: "→ Sin cambios"
    }
  },
  {
    title: "Vencidas",
    value: 6,
    tone: "warn",
    hint: "Ultimos 30 días",
    details: {
      source: "Estado: APROBADA",
      lastUpdate: "Hace 1 minuto",
      trend: "↑ +8% vs mes anterior"
    }
  },
  {
    title: "Pendientes",
    value: 12,
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
    value: "L 2.5M",
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
    value: "4.2",
    tone: "warn",
    hint: "Tiempo respuesta",
    details: {
      source: "Fecha solicitud vs aprobación",
      lastUpdate: "Actualización diaria",
      trend: "↓ Mejoró 0.5 días"
    }
  },
  // --- 12 Elementos Adicionales ---
  {
    title: "Rechazadas",
    value: 32,
    tone: "success",
    hint: "Últimos 30 días",
    details: {
      source: "Estado: RECHAZADA",
      lastUpdate: "Hace 15 minutos",
      trend: "↑ +3% vs mes anterior"
    }
  },
  {
    title: "Monto Aprobado",
    value: "L 1.8M",
    tone: "warn",
    hint: "Acumulado mes",
    details: {
      source: "Suma de cotizaciones APROBADA",
      lastUpdate: "Hace 1 hora",
      trend: "↑ +20% vs meta"
    }
  },
];

export const MOCK_COMPRAS: KpiData[] = [
  // --- Elementos Originales ---
  {
    title: "Órdenes Activas",
    value: 45,
    tone: "success",
    hint: "En tránsito",
    details: {
      source: "Compras en estado PENDIENTE",
      lastUpdate: "Tiempo real",
      trend: "↑ +3 esta semana"
    }
  },
  {
    title: "Pre-Compra",
    value: 18,
    tone: "danger",
    hint: "Por confirmar",
    details: {
      source: "Items en PRE-COMPRA",
      lastUpdate: "Hace 5 minutos",
      trend: "→ Estable"
    }
  },
  {
    title: "Fabricación",
    value: 12,
    tone: "danger",
    hint: "En producción",
    details: {
      source: "Items en FABRICACION",
      lastUpdate: "Hace 8 minutos",
      trend: "↓ -2 completados hoy"
    }
  },
  {
    title: "En FORS",
    value: 8,
    tone: "success",
    hint: "Documentación",
    details: {
      source: "Items en FORS",
      lastUpdate: "Hace 15 minutos",
      trend: "→ En proceso"
    }
  },
  {
    title: "CIF",
    value: 5,
    tone: "success",
    hint: "Por recibir",
    details: {
      source: "Items en CIF",
      lastUpdate: "Hace 20 minutos",
      trend: "↑ +2 llegaron a aduana"
    }
  },
  {
    title: "Completadas",
    value: 234,
    tone: "success",
    hint: "Este año",
    details: {
      source: "Compras COMPLETADA",
      lastUpdate: "Actualización diaria",
      trend: "↑ +145% vs año anterior"
    }
  },
  // --- 12 Elementos Adicionales ---
  {
    title: "Facturas Pendientes",
    value: 25,
    tone: "danger",
    hint: "Por pagar o recibir",
    details: {
      source: "Cuentas por pagar",
      lastUpdate: "Hace 1 hora",
      trend: "↑ +5 vs ayer"
    }
  },
  {
    title: "Proveedores Activos",
    value: 85,
    tone: "success",
    hint: "Con transacciones recientes",
    details: {
      source: "Maestro de proveedores",
      lastUpdate: "Actualización semanal",
      trend: "→ Estable"
    }
  },
  {
    title: "Requisiciones Nuevas",
    value: 7,
    tone: "info",
    hint: "Ingresadas hoy",
    details: {
      source: "Módulo de Solicitudes",
      lastUpdate: "Tiempo real",
      trend: "↑ +2 vs promedio"
    }
  },
];

export const MOCK_IMPORT_EXPORT: KpiData[] = [
  // --- Elementos Originales ---
  {
    title: "Importaciones Activas",
    value: 15,
    tone: "warn",
    hint: "En proceso",
    details: {
      source: "Tipo: INTERNACIONAL",
      lastUpdate: "Hace 30 minutos",
      trend: "↑ +3 esta semana"
    }
  },
  {
    title: "En Aduana",
    value: 6,
    tone: "warn",
    hint: "Por liberar",
    details: {
      source: "Estado CIF + documentación",
      lastUpdate: "Hace 1 hora",
      trend: "→ En trámite"
    }
  },
  {
    title: "Exportaciones",
    value: 8,
    tone: "success",
    hint: "Este mes",
    details: {
      source: "Tipo: EXPORTACION",
      lastUpdate: "Actualización diaria",
      trend: "↑ +60% vs mes anterior"
    }
  },
  {
    title: "Documentos Pendientes",
    value: 4,
    tone: "danger",
    hint: "Requieren acción",
    details: {
      source: "Documentos sin completar",
      lastUpdate: "Hace 2 horas",
      trend: "↓ -1 vs ayer"
    }
  },
  {
    title: "Valor Total",
    value: "$850K",
    tone: "danger",
    hint: "En tránsito",
    details: {
      source: "Suma de import/export activos",
      lastUpdate: "Actualización diaria",
      trend: "↑ +20% vs mes anterior"
    }
  },
  {
    title: "Días Promedio",
    value: "12.5",
    tone: "warn",
    hint: "Tiempo despacho",
    details: {
      source: "Inicio a liberación",
      lastUpdate: "Cálculo semanal",
      trend: "↓ Mejoró 2 días"
    }
  },
  // --- 12 Elementos Adicionales ---
  {
    title: "Import. Liberadas Hoy",
    value: 2,
    tone: "success",
    hint: "Listas para bodega",
    details: {
      source: "Estado: LIBERADA",
      lastUpdate: "Hace 15 minutos",
      trend: "↑ +1 vs promedio"
    }
  },
  {
    title: "Costos Fijos ($)",
    value: "$15K",
    tone: "danger",
    hint: "Acumulado mes",
    details: {
      source: "Fletes y Aduanales",
      lastUpdate: "Actualización diaria",
      trend: "→ Estable"
    }
  },
];