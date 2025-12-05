// mocks/mocks_proyectos.ts
import { Proyecto, DetalleProducto } from '../types/gerencia.types';

/**
 * ÁREA PROYECTOS - 6 proyectos
 * Total productos: 147
 */
export const PROYECTOS_PROYECTOS: Proyecto[] = [
  {
    id: 'proj-p01',
    nombre: 'Ampliación Planta Norte',
    estado: 'danger',
    criticidad: 9,
    responsable: 'María García',
    fechaInicio: '2024-09-01',
    fechaLimite: '2025-03-31',
    resumen: {
      totalProductos: 45,
      cotizados: 45,
      conDescuento: 32,
      comprados: 28,
      pagados: 24,
      primerSeguimiento: 20,
      enFOB: 16,
      conBL: 12,
      segundoSeguimiento: 8,
      enCIF: 4
    }
  },
  {
    id: 'proj-p02',
    nombre: 'Modernización Sistema SCADA',
    estado: 'warn',
    criticidad: 7,
    responsable: 'Carlos López',
    fechaInicio: '2024-08-15',
    fechaLimite: '2025-02-28',
    resumen: {
      totalProductos: 28,
      cotizados: 28,
      conDescuento: 19,
      comprados: 17,
      pagados: 15,
      primerSeguimiento: 13,
      enFOB: 11,
      conBL: 9,
      segundoSeguimiento: 7,
      enCIF: 5
    }
  },
  {
    id: 'proj-p03',
    nombre: 'Renovación Equipos Protección',
    estado: 'danger',
    criticidad: 10,
    responsable: 'Ana Martínez',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-01-15',
    resumen: {
      totalProductos: 32,
      cotizados: 30,
      conDescuento: 18,
      comprados: 15,
      pagados: 12,
      primerSeguimiento: 9,
      enFOB: 7,
      conBL: 5,
      segundoSeguimiento: 3,
      enCIF: 2
    }
  },
  {
    id: 'proj-p04',
    nombre: 'Proyecto Transmisión 230KV',
    estado: 'success',
    criticidad: 3,
    responsable: 'Juan Pérez',
    fechaInicio: '2024-07-01',
    fechaLimite: '2025-06-30',
    resumen: {
      totalProductos: 18,
      cotizados: 18,
      conDescuento: 14,
      comprados: 14,
      pagados: 13,
      primerSeguimiento: 12,
      enFOB: 11,
      conBL: 10,
      segundoSeguimiento: 9,
      enCIF: 8
    }
  },
  {
    id: 'proj-p05',
    nombre: 'Instalación Subestación',
    estado: 'warn',
    criticidad: 6,
    responsable: 'Laura Fernández',
    fechaInicio: '2024-09-15',
    fechaLimite: '2025-04-30',
    resumen: {
      totalProductos: 15,
      cotizados: 14,
      conDescuento: 10,
      comprados: 10,
      pagados: 9,
      primerSeguimiento: 8,
      enFOB: 7,
      conBL: 6,
      segundoSeguimiento: 5,
      enCIF: 3
    }
  },
  {
    id: 'proj-p06',
    nombre: 'Automatización Líneas',
    estado: 'success',
    criticidad: 2,
    responsable: 'Pedro Ramírez',
    fechaInicio: '2024-06-01',
    fechaLimite: '2025-08-31',
    resumen: {
      totalProductos: 9,
      cotizados: 7,
      conDescuento: 5,
      comprados: 5,
      pagados: 5,
      primerSeguimiento: 5,
      enFOB: 4,
      conBL: 3,
      segundoSeguimiento: 2,
      enCIF: 1
    }
  }
];

/**
 * ÁREA COMERCIAL - 4 proyectos
 * Total productos: 98
 */
export const PROYECTOS_COMERCIAL: Proyecto[] = [
  {
    id: 'proj-c01',
    nombre: 'Equipamiento Oficinas Centrales',
    estado: 'warn',
    criticidad: 5,
    responsable: 'Roberto Sánchez',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-02-28',
    resumen: {
      totalProductos: 38,
      cotizados: 38,
      conDescuento: 27,
      comprados: 22,
      pagados: 20,
      primerSeguimiento: 18,
      enFOB: 16,
      conBL: 14,
      segundoSeguimiento: 11,
      enCIF: 9
    }
  },
  {
    id: 'proj-c02',
    nombre: 'Mobiliario Nueva Sucursal',
    estado: 'success',
    criticidad: 3,
    responsable: 'Claudia Morales',
    fechaInicio: '2024-08-01',
    fechaLimite: '2025-05-31',
    resumen: {
      totalProductos: 25,
      cotizados: 25,
      conDescuento: 18,
      comprados: 15,
      pagados: 14,
      primerSeguimiento: 12,
      enFOB: 11,
      conBL: 9,
      segundoSeguimiento: 8,
      enCIF: 6
    }
  },
  {
    id: 'proj-c03',
    nombre: 'Renovación Flota Vehículos',
    estado: 'danger',
    criticidad: 8,
    responsable: 'Fernando Ortiz',
    fechaInicio: '2024-11-01',
    fechaLimite: '2025-01-31',
    resumen: {
      totalProductos: 22,
      cotizados: 20,
      conDescuento: 15,
      comprados: 11,
      pagados: 9,
      primerSeguimiento: 8,
      enFOB: 7,
      conBL: 6,
      segundoSeguimiento: 5,
      enCIF: 4
    }
  },
  {
    id: 'proj-c04',
    nombre: 'Sistemas Punto Venta',
    estado: 'success',
    criticidad: 4,
    responsable: 'Diana Castro',
    fechaInicio: '2024-07-15',
    fechaLimite: '2025-03-15',
    resumen: {
      totalProductos: 13,
      cotizados: 12,
      conDescuento: 7,
      comprados: 6,
      pagados: 6,
      primerSeguimiento: 5,
      enFOB: 4,
      conBL: 3,
      segundoSeguimiento: 3,
      enCIF: 2
    }
  }
];

/**
 * ÁREA TÉCNICA - 3 proyectos
 * Total productos: 76
 */
export const PROYECTOS_TECNICA: Proyecto[] = [
  {
    id: 'proj-t01',
    nombre: 'Laboratorio Calibración',
    estado: 'warn',
    criticidad: 6,
    responsable: 'Miguel Ángel Ruiz',
    fechaInicio: '2024-09-01',
    fechaLimite: '2025-03-31',
    resumen: {
      totalProductos: 34,
      cotizados: 33,
      conDescuento: 24,
      comprados: 22,
      pagados: 19,
      primerSeguimiento: 17,
      enFOB: 14,
      conBL: 12,
      segundoSeguimiento: 9,
      enCIF: 7
    }
  },
  {
    id: 'proj-t02',
    nombre: 'Instrumental Medición',
    estado: 'success',
    criticidad: 4,
    responsable: 'Patricia Núñez',
    fechaInicio: '2024-08-01',
    fechaLimite: '2025-04-30',
    resumen: {
      totalProductos: 27,
      cotizados: 26,
      conDescuento: 19,
      comprados: 17,
      pagados: 15,
      primerSeguimiento: 13,
      enFOB: 11,
      conBL: 9,
      segundoSeguimiento: 8,
      enCIF: 6
    }
  },
  {
    id: 'proj-t03',
    nombre: 'Herramientas Especializadas',
    estado: 'danger',
    criticidad: 7,
    responsable: 'Rodrigo Vargas',
    fechaInicio: '2024-10-15',
    fechaLimite: '2025-02-15',
    resumen: {
      totalProductos: 15,
      cotizados: 14,
      conDescuento: 9,
      comprados: 9,
      pagados: 8,
      primerSeguimiento: 7,
      enFOB: 6,
      conBL: 5,
      segundoSeguimiento: 4,
      enCIF: 3
    }
  }
];

/**
 * ÁREA OPERATIVA - 5 proyectos
 * Total productos: 112
 */
export const PROYECTOS_OPERATIVA: Proyecto[] = [
  {
    id: 'proj-o01',
    nombre: 'Equipamiento Taller Principal',
    estado: 'success',
    criticidad: 3,
    responsable: 'Alberto Mendoza',
    fechaInicio: '2024-07-01',
    fechaLimite: '2025-07-31',
    resumen: {
      totalProductos: 35,
      cotizados: 35,
      conDescuento: 26,
      comprados: 24,
      pagados: 22,
      primerSeguimiento: 20,
      enFOB: 18,
      conBL: 15,
      segundoSeguimiento: 12,
      enCIF: 10
    }
  },
  {
    id: 'proj-o02',
    nombre: 'Maquinaria Pesada',
    estado: 'danger',
    criticidad: 8,
    responsable: 'Gabriela Torres',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-02-28',
    resumen: {
      totalProductos: 28,
      cotizados: 27,
      conDescuento: 19,
      comprados: 17,
      pagados: 14,
      primerSeguimiento: 12,
      enFOB: 10,
      conBL: 8,
      segundoSeguimiento: 6,
      enCIF: 4
    }
  },
  {
    id: 'proj-o03',
    nombre: 'Herramientas Manuales',
    estado: 'success',
    criticidad: 2,
    responsable: 'Héctor Jiménez',
    fechaInicio: '2024-06-15',
    fechaLimite: '2025-06-15',
    resumen: {
      totalProductos: 24,
      cotizados: 23,
      conDescuento: 17,
      comprados: 16,
      pagados: 15,
      primerSeguimiento: 13,
      enFOB: 11,
      conBL: 9,
      segundoSeguimiento: 8,
      enCIF: 6
    }
  },
  {
    id: 'proj-o04',
    nombre: 'Equipos Seguridad Industrial',
    estado: 'warn',
    criticidad: 5,
    responsable: 'Isabel Ramírez',
    fechaInicio: '2024-09-01',
    fechaLimite: '2025-03-31',
    resumen: {
      totalProductos: 16,
      cotizados: 15,
      conDescuento: 11,
      comprados: 9,
      pagados: 8,
      primerSeguimiento: 7,
      enFOB: 6,
      conBL: 5,
      segundoSeguimiento: 4,
      enCIF: 3
    }
  },
  {
    id: 'proj-o05',
    nombre: 'Vehículos Utilitarios',
    estado: 'warn',
    criticidad: 6,
    responsable: 'Jorge Medina',
    fechaInicio: '2024-10-15',
    fechaLimite: '2025-04-15',
    resumen: {
      totalProductos: 9,
      cotizados: 8,
      conDescuento: 5,
      comprados: 5,
      pagados: 4,
      primerSeguimiento: 3,
      enFOB: 2,
      conBL: 2,
      segundoSeguimiento: 1,
      enCIF: 1
    }
  }
];

// Ordenar por criticidad
export const PROYECTOS_ORDENADOS = [...PROYECTOS_PROYECTOS].sort((a, b) => b.criticidad - a.criticidad);
export const PROYECTOS_COMERCIAL_ORDENADOS = [...PROYECTOS_COMERCIAL].sort((a, b) => b.criticidad - a.criticidad);
export const PROYECTOS_TECNICA_ORDENADOS = [...PROYECTOS_TECNICA].sort((a, b) => b.criticidad - a.criticidad);
export const PROYECTOS_OPERATIVA_ORDENADOS = [...PROYECTOS_OPERATIVA].sort((a, b) => b.criticidad - a.criticidad);

/**
 * DETALLE DE PRODUCTOS - Para vista de nivel 3
 * Esta es una muestra de 8 productos para el área de proyectos
 */
export const DETALLE_PRODUCTOS_PROYECTOS: DetalleProducto[] = [
  {
    id: 'prod-p001',
    sku: 'TRF-500KVA',
    descripcion: 'Transformador trifásico 500 KVA 13.8/0.48 KV',
    cantidad: 3,
    cotizacionId: 'cot-p-001',
    cotizacionNombre: 'COT-PROY-001',
    proveedor: 'ABB Transformers',
    responsable: 'María García',
    proceso: 'primerSeguimiento',
    estado: 'warn',
    fechaSolicitud: '2024-09-15',
    fechaEstimada: '2024-12-20',
    diasRetraso: 3,
    precioUnitario: 18500.00,
    precioTotal: 55500.00
  },
  {
    id: 'prod-p002',
    sku: 'CBL-4/0-AWG',
    descripcion: 'Cable conductor aluminio 4/0 AWG 600V',
    cantidad: 2500,
    cotizacionId: 'cot-p-002',
    cotizacionNombre: 'COT-PROY-002',
    proveedor: 'Conductores del Norte',
    responsable: 'María García',
    proceso: 'enFOB',
    estado: 'danger',
    fechaSolicitud: '2024-09-20',
    fechaEstimada: '2024-11-30',
    diasRetraso: 12,
    precioUnitario: 8.50,
    precioTotal: 21250.00,
    observaciones: 'Retraso en embarque'
  },
  {
    id: 'prod-p003',
    sku: 'PLC-S7-1500',
    descripcion: 'PLC Siemens S7-1500 CPU 1515-2 PN',
    cantidad: 4,
    cotizacionId: 'cot-p-008',
    cotizacionNombre: 'COT-SCADA-001',
    proveedor: 'Siemens AG',
    responsable: 'Carlos López',
    proceso: 'enCIF',
    estado: 'success',
    fechaSolicitud: '2024-08-20',
    fechaEstimada: '2024-11-15',
    precioUnitario: 4200.00,
    precioTotal: 16800.00
  },
  {
    id: 'prod-p004',
    sku: 'HMI-TP1500',
    descripcion: 'Panel HMI táctil 15" Comfort Panel',
    cantidad: 6,
    cotizacionId: 'cot-p-008',
    cotizacionNombre: 'COT-SCADA-001',
    proveedor: 'Siemens AG',
    responsable: 'Carlos López',
    proceso: 'segundoSeguimiento',
    estado: 'success',
    fechaSolicitud: '2024-08-20',
    fechaEstimada: '2024-11-15',
    precioUnitario: 2800.00,
    precioTotal: 16800.00
  },
  {
    id: 'prod-p005',
    sku: 'RLE-SEL-751A',
    descripcion: 'Relé protección diferencial SEL-751A',
    cantidad: 5,
    cotizacionId: 'cot-p-015',
    cotizacionNombre: 'COT-PROT-001',
    proveedor: 'Schweitzer Engineering',
    responsable: 'Ana Martínez',
    proceso: 'conDescuento',
    estado: 'danger',
    fechaSolicitud: '2024-10-05',
    fechaEstimada: '2024-12-15',
    diasRetraso: 8,
    precioUnitario: 3200.00,
    precioTotal: 16000.00,
    observaciones: 'Negociando descuento por volumen'
  },
  {
    id: 'prod-p006',
    sku: 'PNL-MCC-800A',
    descripcion: 'Panel MCC 800A 480V con 12 arrancadores',
    cantidad: 2,
    cotizacionId: 'cot-p-001',
    cotizacionNombre: 'COT-PROY-001',
    proveedor: 'Schneider Electric',
    responsable: 'María García',
    proceso: 'comprados',
    estado: 'warn',
    fechaSolicitud: '2024-09-10',
    fechaEstimada: '2024-12-30',
    diasRetraso: 2,
    precioUnitario: 15600.00,
    precioTotal: 31200.00
  },
  {
    id: 'prod-p007',
    sku: 'UPS-APC-10K',
    descripcion: 'UPS APC Smart-UPS 10KVA Online',
    cantidad: 3,
    cotizacionId: 'cot-p-004',
    cotizacionNombre: 'COT-TRANS-001',
    proveedor: 'APC by Schneider',
    responsable: 'Juan Pérez',
    proceso: 'enCIF',
    estado: 'success',
    fechaSolicitud: '2024-07-15',
    fechaEstimada: '2024-10-30',
    precioUnitario: 5400.00,
    precioTotal: 16200.00
  },
  {
    id: 'prod-p008',
    sku: 'SW-IND-24P',
    descripcion: 'Switch industrial managed 24 puertos gigabit',
    cantidad: 8,
    cotizacionId: 'cot-p-008',
    cotizacionNombre: 'COT-SCADA-001',
    proveedor: 'Cisco Systems',
    responsable: 'Carlos López',
    proceso: 'pagados',
    estado: 'success',
    fechaSolicitud: '2024-08-25',
    fechaEstimada: '2024-11-20',
    precioUnitario: 1850.00,
    precioTotal: 14800.00
  }
];

// Similar para otras áreas (comercial, técnica, operativa)
export const DETALLE_PRODUCTOS_COMERCIAL: DetalleProducto[] = [];
export const DETALLE_PRODUCTOS_TECNICA: DetalleProducto[] = [];
export const DETALLE_PRODUCTOS_OPERATIVA: DetalleProducto[] = [];