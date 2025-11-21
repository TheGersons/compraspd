// services/kpiFetchers.ts
import { TableData, SummaryData } from '../types/kpi.types';

// ============================================================================
// COTIZACIONES
// ============================================================================

export async function fetchCotizacionesVencidas(): Promise<TableData> {
  // Mock data - único KPI con datos reales para prueba
  return {
    rows: [
      {
        area: 'Proyectos',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-001',
        asignado: 'Juan Pérez',
        proveedor: 'TechSupply Inc.',
        cantidadItems: 5,
        diasVencida: 8,
        prioridad: 'Alta',
        solicitoDescuento: 'SI',
        status: 'Pendiente'
      },
      {
        area: 'Proyectos',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-001',
        asignado: 'María García',
        proveedor: 'Global Parts Ltd.',
        cantidadItems: 5,
        diasVencida: 8,
        prioridad: 'Alta',
        solicitoDescuento: 'SI',
        status: 'Pendiente'
      },
      {
        area: 'Comercial',
        tipo: 'Internacional',
        ordenCotizacion: 'COT-2024-002',
        asignado: 'Carlos López',
        proveedor: 'Import Solutions',
        cantidadItems: 12,
        diasVencida: 5,
        prioridad: 'Media',
        solicitoDescuento: 'NO',
        status: 'En Revisión'
      },
      {
        area: 'Área Técnica',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-003',
        asignado: 'Ana Martínez',
        proveedor: 'Tech Distributors',
        cantidadItems: 3,
        diasVencida: 12,
        prioridad: 'Alta',
        solicitoDescuento: 'SI',
        status: 'Urgente'
      },
      {
        area: 'Operativa',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-004',
        asignado: 'Roberto Sánchez',
        proveedor: 'Local Supplies',
        cantidadItems: 8,
        diasVencida: 3,
        prioridad: 'Baja',
        solicitoDescuento: 'NO',
        status: 'Pendiente'
      },
      {
        area: 'Comercial',
        tipo: 'Internacional',
        ordenCotizacion: 'COT-2024-005',
        asignado: 'Laura Fernández',
        proveedor: 'Asia Trading Co.',
        cantidadItems: 15,
        diasVencida: 10,
        prioridad: 'Alta',
        solicitoDescuento: 'SI',
        status: 'En Revisión'
      },
      {
        area: 'Proyectos',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-006',
        asignado: 'Pedro Ramírez',
        proveedor: 'National Parts',
        cantidadItems: 6,
        diasVencida: 7,
        prioridad: 'Media',
        solicitoDescuento: 'NO',
        status: 'Pendiente'
      },
      {
        area: 'Área Técnica',
        tipo: 'Internacional',
        ordenCotizacion: 'COT-2024-007',
        asignado: 'Sofia Torres',
        proveedor: 'Euro Supplies',
        cantidadItems: 4,
        diasVencida: 15,
        prioridad: 'Alta',
        solicitoDescuento: 'SI',
        status: 'Urgente'
      },
      {
        area: 'Operativa',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-008',
        asignado: 'Miguel Ángel',
        proveedor: 'Quick Supply',
        cantidadItems: 10,
        diasVencida: 4,
        prioridad: 'Media',
        solicitoDescuento: 'NO',
        status: 'En Revisión'
      },
      {
        area: 'Comercial',
        tipo: 'Nacional',
        ordenCotizacion: 'COT-2024-009',
        asignado: 'Diana Morales',
        proveedor: 'Fast Trading',
        cantidadItems: 7,
        diasVencida: 6,
        prioridad: 'Media',
        solicitoDescuento: 'SI',
        status: 'Pendiente'
      },
      {
        area: 'Proyectos',
        tipo: 'Internacional',
        ordenCotizacion: 'COT-2024-010',
        asignado: 'Fernando Cruz',
        proveedor: 'Global Imports',
        cantidadItems: 20,
        diasVencida: 9,
        prioridad: 'Alta',
        solicitoDescuento: 'SI',
        status: 'Urgente'
      }
    ],
    total: 11
  };
}

export async function fetchCotizacionesPendientes(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCotizacion: 'COT-2024-011',
        area: 'Operativa',
        tipo: 'Nacional',
        solicitante: 'Roberto Medina',
        fechaSolicitud: '15/11/2024',
        diasPendiente: 5
      },
      {
        ordenCotizacion: 'COT-2024-012',
        area: 'Comercial',
        tipo: 'Internacional',
        solicitante: 'Ana Beltrán',
        fechaSolicitud: '17/11/2024',
        diasPendiente: 3
      },
      {
        ordenCotizacion: 'COT-2024-013',
        area: 'Área Técnica',
        tipo: 'Nacional',
        solicitante: 'Luis Castellanos',
        fechaSolicitud: '18/11/2024',
        diasPendiente: 2
      },
      {
        ordenCotizacion: 'COT-2024-014',
        area: 'Proyectos',
        tipo: 'Nacional',
        solicitante: 'Carmen Flores',
        fechaSolicitud: '19/11/2024',
        diasPendiente: 1
      }
    ],
    total: 4
  };
}

export async function fetchCotizacionesEnRevision(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCotizacion: 'COT-2024-015',
        revisor: 'María García',
        fechaIngreso: '12/11/2024',
        diasEnRevision: 8,
        cantidadOfertas: 3,
        prioridad: 'Media'
      },
      {
        ordenCotizacion: 'COT-2024-016',
        revisor: 'Carlos López',
        fechaIngreso: '10/11/2024',
        diasEnRevision: 10,
        cantidadOfertas: 5,
        prioridad: 'Alta'
      },
      {
        ordenCotizacion: 'COT-2024-017',
        revisor: 'Juan Pérez',
        fechaIngreso: '14/11/2024',
        diasEnRevision: 6,
        cantidadOfertas: 2,
        prioridad: 'Baja'
      },
      {
        ordenCotizacion: 'COT-2024-018',
        revisor: 'Laura Fernández',
        fechaIngreso: '13/11/2024',
        diasEnRevision: 7,
        cantidadOfertas: 4,
        prioridad: 'Media'
      },
      {
        ordenCotizacion: 'COT-2024-019',
        revisor: 'Pedro Ramírez',
        fechaIngreso: '11/11/2024',
        diasEnRevision: 9,
        cantidadOfertas: 3,
        prioridad: 'Alta'
      }
    ],
    total: 5
  };
}

export async function fetchCotizacionesAprobadas(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Sistema de cotizaciones - Estado: APROBADA',
    lastUpdate: 'Hace 3 minutos',
    trend: '↑ +18% vs mes anterior'
  };
}

export async function fetchCotizacionesRechazadas(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCotizacion: 'COT-2024-020',
        motivoRechazo: 'Precio fuera de presupuesto',
        fechaRechazo: '18/11/2024',
        rechazadoPor: 'Director Financiero'
      },
      {
        ordenCotizacion: 'COT-2024-021',
        motivoRechazo: 'Especificaciones no cumplen requisitos',
        fechaRechazo: '16/11/2024',
        rechazadoPor: 'Gerente Técnico'
      },
      {
        ordenCotizacion: 'COT-2024-022',
        motivoRechazo: 'Tiempos de entrega no aceptables',
        fechaRechazo: '15/11/2024',
        rechazadoPor: 'Gerente Operaciones'
      }
    ],
    total: 3
  };
}

export async function fetchCotizacionesMontoTotal(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Suma de cotizaciones activas (ENVIADA + EN_REVISION + APROBADA)',
    lastUpdate: 'Hace 8 minutos',
    trend: '↑ +22% vs mes anterior'
  };
}

export async function fetchCotizacionesPromedioDias(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Promedio desde fecha solicitud hasta aprobación/rechazo',
    lastUpdate: 'Actualización diaria - 06:00 AM',
    trend: '↓ Mejoró 1.2 días vs mes anterior'
  };
}

export async function fetchCotizacionesSinOfertas(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCotizacion: 'COT-2024-023',
        area: 'Comercial',
        fechaEnvio: '16/11/2024',
        diasSinOferta: 4,
        proveedoresContactados: 3
      },
      {
        ordenCotizacion: 'COT-2024-024',
        area: 'Proyectos',
        fechaEnvio: '15/11/2024',
        diasSinOferta: 5,
        proveedoresContactados: 4
      },
      {
        ordenCotizacion: 'COT-2024-025',
        area: 'Área Técnica',
        fechaEnvio: '17/11/2024',
        diasSinOferta: 3,
        proveedoresContactados: 2
      }
    ],
    total: 3
  };
}

// ============================================================================
// COMPRAS
// ============================================================================

export async function fetchComprasOrdenesActivas(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCompra: 'OC-2024-101',
        proveedor: 'TechSupply Inc.',
        estado: 'FABRICACION',
        cantidadItems: 8,
        montoTotal: 'L 125,000',
        fechaOrden: '10/11/2024'
      },
      {
        ordenCompra: 'OC-2024-102',
        proveedor: 'Global Parts Ltd.',
        estado: 'FORS',
        cantidadItems: 5,
        montoTotal: 'L 85,500',
        fechaOrden: '12/11/2024'
      },
      {
        ordenCompra: 'OC-2024-103',
        proveedor: 'Import Solutions',
        estado: 'CIF',
        cantidadItems: 12,
        montoTotal: 'L 245,000',
        fechaOrden: '08/11/2024'
      },
      {
        ordenCompra: 'OC-2024-104',
        proveedor: 'Asia Trading Co.',
        estado: 'PRE-COMPRA',
        cantidadItems: 6,
        montoTotal: 'L 95,000',
        fechaOrden: '15/11/2024'
      },
      {
        ordenCompra: 'OC-2024-105',
        proveedor: 'Local Supplies',
        estado: 'FABRICACION',
        cantidadItems: 10,
        montoTotal: 'L 156,800',
        fechaOrden: '11/11/2024'
      }
    ],
    total: 5
  };
}

export async function fetchComprasPreCompra(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCompra: 'OC-2024-106',
        item: 'Cables de red Cat6',
        proveedor: 'Network Supply',
        diasEnEstado: 3,
        responsable: 'María García'
      },
      {
        ordenCompra: 'OC-2024-107',
        item: 'Switches 24 puertos',
        proveedor: 'Tech Distributors',
        diasEnEstado: 5,
        responsable: 'Carlos López'
      },
      {
        ordenCompra: 'OC-2024-108',
        item: 'Patch panels',
        proveedor: 'Data Center Solutions',
        diasEnEstado: 2,
        responsable: 'Juan Pérez'
      },
      {
        ordenCompra: 'OC-2024-109',
        item: 'Routers empresariales',
        proveedor: 'Enterprise Networks',
        diasEnEstado: 4,
        responsable: 'Laura Fernández'
      }
    ],
    total: 4
  };
}

export async function fetchComprasFabricacion(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCompra: 'OC-2024-110',
        item: 'Equipos industriales',
        proveedor: 'Manufacturing Corp',
        fechaInicio: '05/11/2024',
        diasFabricacion: 15,
        fechaEstimadaTermino: '25/11/2024'
      },
      {
        ordenCompra: 'OC-2024-111',
        item: 'Componentes electrónicos',
        proveedor: 'Electronics Ltd.',
        fechaInicio: '08/11/2024',
        diasFabricacion: 12,
        fechaEstimadaTermino: '23/11/2024'
      },
      {
        ordenCompra: 'OC-2024-112',
        item: 'Maquinaria especializada',
        proveedor: 'Heavy Equipment Co.',
        fechaInicio: '01/11/2024',
        diasFabricacion: 19,
        fechaEstimadaTermino: '28/11/2024'
      },
      {
        ordenCompra: 'OC-2024-113',
        item: 'Sensores IoT',
        proveedor: 'Smart Devices Inc.',
        fechaInicio: '10/11/2024',
        diasFabricacion: 10,
        fechaEstimadaTermino: '22/11/2024'
      },
      {
        ordenCompra: 'OC-2024-114',
        item: 'Paneles solares',
        proveedor: 'Green Energy Systems',
        fechaInicio: '07/11/2024',
        diasFabricacion: 13,
        fechaEstimadaTermino: '24/11/2024'
      }
    ],
    total: 5
  };
}

export async function fetchComprasFors(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCompra: 'OC-2024-115',
        item: 'Repuestos industriales',
        proveedor: 'Industrial Parts',
        fechaFors: '16/11/2024',
        documentosPendientes: 'Certificado de origen',
        responsable: 'Ana Martínez'
      },
      {
        ordenCompra: 'OC-2024-116',
        item: 'Herramientas especializadas',
        proveedor: 'Tools & Equipment',
        fechaFors: '17/11/2024',
        documentosPendientes: 'Bill of lading',
        responsable: 'Roberto Sánchez'
      },
      {
        ordenCompra: 'OC-2024-117',
        item: 'Material eléctrico',
        proveedor: 'Electrical Supplies',
        fechaFors: '15/11/2024',
        documentosPendientes: 'Packing list',
        responsable: 'Sofia Torres'
      },
      {
        ordenCompra: 'OC-2024-118',
        item: 'Equipos de medición',
        proveedor: 'Precision Instruments',
        fechaFors: '18/11/2024',
        documentosPendientes: 'Factura comercial',
        responsable: 'Miguel Ángel'
      }
    ],
    total: 4
  };
}

export async function fetchComprasCif(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCompra: 'OC-2024-119',
        item: 'Maquinaria CNC',
        proveedor: 'Machinery International',
        fechaLlegadaAduana: '17/11/2024',
        diasEnAduana: 3,
        estatusLiberacion: 'En proceso'
      },
      {
        ordenCompra: 'OC-2024-120',
        item: 'Computadoras industriales',
        proveedor: 'Industrial Computing',
        fechaLlegadaAduana: '18/11/2024',
        diasEnAduana: 2,
        estatusLiberacion: 'Documentación completa'
      },
      {
        ordenCompra: 'OC-2024-121',
        item: 'Sistemas de climatización',
        proveedor: 'HVAC Systems',
        fechaLlegadaAduana: '16/11/2024',
        diasEnAduana: 4,
        estatusLiberacion: 'Pendiente inspección'
      }
    ],
    total: 3
  };
}

export async function fetchComprasCompletadas(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Compras con estado COMPLETADA desde 01/01/2024',
    lastUpdate: 'Actualización diaria - 06:00 AM',
    trend: '↑ +165% vs año anterior 2023'
  };
}

export async function fetchComprasRetrasadas(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        ordenCompra: 'OC-2024-122',
        item: 'Transformadores',
        estadoActual: 'FABRICACION',
        fechaEstimada: '15/11/2024',
        diasRetraso: 5,
        motivoRetraso: 'Retraso en materia prima'
      },
      {
        ordenCompra: 'OC-2024-123',
        item: 'Válvulas industriales',
        estadoActual: 'FORS',
        fechaEstimada: '12/11/2024',
        diasRetraso: 8,
        motivoRetraso: 'Problemas de transporte'
      },
      {
        ordenCompra: 'OC-2024-124',
        item: 'Bombas hidráulicas',
        estadoActual: 'CIF',
        fechaEstimada: '10/11/2024',
        diasRetraso: 10,
        motivoRetraso: 'Documentación aduanal incompleta'
      }
    ],
    total: 3
  };
}

export async function fetchComprasMontoMes(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Suma de compras completadas en Noviembre 2024',
    lastUpdate: 'Actualización diaria - 06:00 AM',
    trend: '↑ +28% vs Octubre 2024'
  };
}

// ============================================================================
// IMPORT/EXPORT
// ============================================================================

export async function fetchImportacionesActivas(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        numeroImportacion: 'IMP-2024-501',
        proveedor: 'China Manufacturing Ltd.',
        paisOrigen: 'China',
        estadoActual: 'En tránsito',
        valorCIF: '$125,000',
        fechaEstimadaLlegada: '25/11/2024'
      },
      {
        numeroImportacion: 'IMP-2024-502',
        proveedor: 'Euro Industrial GmbH',
        paisOrigen: 'Alemania',
        estadoActual: 'En aduana',
        valorCIF: '$85,400',
        fechaEstimadaLlegada: '22/11/2024'
      },
      {
        numeroImportacion: 'IMP-2024-503',
        proveedor: 'USA Tech Corp',
        paisOrigen: 'Estados Unidos',
        estadoActual: 'Preparando embarque',
        valorCIF: '$156,800',
        fechaEstimadaLlegada: '28/11/2024'
      },
      {
        numeroImportacion: 'IMP-2024-504',
        proveedor: 'Japan Electronics',
        paisOrigen: 'Japón',
        estadoActual: 'En tránsito',
        valorCIF: '$92,300',
        fechaEstimadaLlegada: '26/11/2024'
      }
    ],
    total: 4
  };
}

export async function fetchImportacionesEnAduana(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        numeroImportacion: 'IMP-2024-505',
        fechaLlegada: '16/11/2024',
        diasEnAduana: 4,
        documentosFaltantes: 'Certificado sanitario',
        agenciaAduanal: 'Aduanas Express S.A.',
        estatusLiberacion: 'En revisión'
      },
      {
        numeroImportacion: 'IMP-2024-506',
        fechaLlegada: '17/11/2024',
        diasEnAduana: 3,
        documentosFaltantes: 'Ninguno',
        agenciaAduanal: 'Global Customs',
        estatusLiberacion: 'Pendiente pago impuestos'
      },
      {
        numeroImportacion: 'IMP-2024-507',
        fechaLlegada: '15/11/2024',
        diasEnAduana: 5,
        documentosFaltantes: 'Permiso de importación',
        agenciaAduanal: 'Fast Customs Services',
        estatusLiberacion: 'Documentos en proceso'
      }
    ],
    total: 3
  };
}

export async function fetchExportaciones(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        numeroExportacion: 'EXP-2024-301',
        cliente: 'Central American Distributors',
        paisDestino: 'Guatemala',
        fechaEmbarque: '12/11/2024',
        valorFOB: '$45,600',
        estado: 'En tránsito'
      },
      {
        numeroExportacion: 'EXP-2024-302',
        cliente: 'Caribbean Trading Co.',
        paisDestino: 'República Dominicana',
        fechaEmbarque: '15/11/2024',
        valorFOB: '$32,800',
        estado: 'Entregado'
      },
      {
        numeroExportacion: 'EXP-2024-303',
        cliente: 'South America Imports',
        paisDestino: 'Colombia',
        fechaEmbarque: '10/11/2024',
        valorFOB: '$58,900',
        estado: 'En tránsito'
      },
      {
        numeroExportacion: 'EXP-2024-304',
        cliente: 'Mexico Trade Partners',
        paisDestino: 'México',
        fechaEmbarque: '14/11/2024',
        valorFOB: '$41,200',
        estado: 'Documentación completa'
      },
      {
        numeroExportacion: 'EXP-2024-305',
        cliente: 'USA Import Solutions',
        paisDestino: 'Estados Unidos',
        fechaEmbarque: '16/11/2024',
        valorFOB: '$67,500',
        estado: 'En preparación'
      }
    ],
    total: 5
  };
}

export async function fetchDocumentosPendientes(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        numeroOperacion: 'IMP-2024-508',
        tipoOperacion: 'Importación',
        documentoPendiente: 'Certificado de origen',
        responsable: 'María García',
        diasPendiente: 3,
        prioridad: 'Alta'
      },
      {
        numeroOperacion: 'EXP-2024-306',
        tipoOperacion: 'Exportación',
        documentoPendiente: 'Factura comercial',
        responsable: 'Carlos López',
        diasPendiente: 2,
        prioridad: 'Media'
      },
      {
        numeroOperacion: 'IMP-2024-509',
        tipoOperacion: 'Importación',
        documentoPendiente: 'Bill of lading',
        responsable: 'Ana Martínez',
        diasPendiente: 5,
        prioridad: 'Alta'
      },
      {
        numeroOperacion: 'EXP-2024-307',
        tipoOperacion: 'Exportación',
        documentoPendiente: 'Permiso de exportación',
        responsable: 'Juan Pérez',
        diasPendiente: 1,
        prioridad: 'Baja'
      }
    ],
    total: 4
  };
}

export async function fetchImportExportValorTotal(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Suma de importaciones y exportaciones activas',
    lastUpdate: 'Actualización diaria - 06:00 AM',
    trend: '↑ +32% vs mes anterior'
  };
}

export async function fetchImportExportDiasPromedio(): Promise<SummaryData> {
  // Mock data
  return {
    source: 'Promedio desde inicio hasta liberación/entrega completa',
    lastUpdate: 'Cálculo semanal - Lunes 06:00 AM',
    trend: '↓ Mejoró 3.5 días vs mes anterior'
  };
}

export async function fetchIncidencias(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        numeroOperacion: 'IMP-2024-510',
        tipoIncidencia: 'Documentación incompleta',
        fechaIncidencia: '17/11/2024',
        descripcion: 'Falta certificado fitosanitario',
        responsable: 'Laura Fernández',
        estado: 'En resolución'
      },
      {
        numeroOperacion: 'EXP-2024-308',
        tipoIncidencia: 'Retraso en transporte',
        fechaIncidencia: '15/11/2024',
        descripcion: 'Contenedor demorado en puerto',
        responsable: 'Pedro Ramírez',
        estado: 'Resuelto'
      },
      {
        numeroOperacion: 'IMP-2024-511',
        tipoIncidencia: 'Daño en mercancía',
        fechaIncidencia: '16/11/2024',
        descripcion: 'Embalaje deteriorado en tránsito',
        responsable: 'Sofia Torres',
        estado: 'En reclamo'
      },
      {
        numeroOperacion: 'IMP-2024-512',
        tipoIncidencia: 'Retención aduanal',
        fechaIncidencia: '14/11/2024',
        descripcion: 'Inspección adicional requerida',
        responsable: 'Roberto Sánchez',
        estado: 'En resolución'
      }
    ],
    total: 4
  };
}

export async function fetchImportacionesRetenidas(): Promise<TableData> {
  // Mock data
  return {
    rows: [
      {
        numeroImportacion: 'IMP-2024-513',
        motivoRetencion: 'Inspección física detallada',
        fechaRetencion: '16/11/2024',
        diasRetenida: 4,
        accionRequerida: 'Presentar documentación técnica adicional',
        responsable: 'Miguel Ángel'
      },
      {
        numeroImportacion: 'IMP-2024-514',
        motivoRetencion: 'Valoración aduanera en revisión',
        fechaRetencion: '18/11/2024',
        diasRetenida: 2,
        accionRequerida: 'Justificar valor declarado',
        responsable: 'Diana Morales'
      }
    ],
    total: 2
  };
}