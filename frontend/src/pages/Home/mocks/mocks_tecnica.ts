// mocks/mocks_tecnica.ts
import { Proyecto, DetalleProducto } from '../types/gerencia.types';

export const PROYECTOS_TECNICA: Proyecto[] = [
  {
    id: 'tec-001',
    nombre: 'Oferta Técnica - Certificación ISO',
    estado: 'success',
    criticidad: 3,
    responsable: 'Jorge Castillo',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-03-31',
    resumen: {
      totalProductos: 68,
      cotizados: 64,
      conDescuento: 24,
      comprados: 58,
      pagados: 53,
      primerSeguimiento: 47,
      enFOB: 41,
      conBL: 36,
      segundoSeguimiento: 33,
      enCIF: 29
    }
  },
  {
    id: 'tec-002',
    nombre: 'Cotización Interna - Laboratorio',
    estado: 'warn',
    criticidad: 7,
    responsable: 'Karla Jiménez',
    fechaInicio: '2024-09-15',
    fechaLimite: '2025-02-28',
    resumen: {
      totalProductos: 82,
      cotizados: 71,
      conDescuento: 31,
      comprados: 59,
      pagados: 49,
      primerSeguimiento: 41,
      enFOB: 33,
      conBL: 26,
      segundoSeguimiento: 22,
      enCIF: 18
    }
  },
  {
    id: 'tec-003',
    nombre: 'Oferta Técnica - Mantenimiento Anual',
    estado: 'success',
    criticidad: 2,
    responsable: 'Luis Paredes',
    fechaInicio: '2024-11-01',
    fechaLimite: '2025-10-31',
    resumen: {
      totalProductos: 45,
      cotizados: 44,
      conDescuento: 15,
      comprados: 42,
      pagados: 41,
      primerSeguimiento: 40,
      enFOB: 38,
      conBL: 37,
      segundoSeguimiento: 36,
      enCIF: 35
    }
  },
  {
    id: 'tec-004',
    nombre: 'Cotización Interna - I+D',
    estado: 'danger',
    criticidad: 9,
    responsable: 'Mónica Herrera',
    fechaInicio: '2024-08-15',
    fechaLimite: '2024-12-31',
    resumen: {
      totalProductos: 91,
      cotizados: 73,
      conDescuento: 35,
      comprados: 58,
      pagados: 44,
      primerSeguimiento: 33,
      enFOB: 24,
      conBL: 17,
      segundoSeguimiento: 12,
      enCIF: 8
    }
  },
  {
    id: 'tec-005',
    nombre: 'Oferta Técnica - Calibración',
    estado: 'warn',
    criticidad: 6,
    responsable: 'Nicolás Ramos',
    fechaInicio: '2024-10-15',
    fechaLimite: '2025-04-15',
    resumen: {
      totalProductos: 54,
      cotizados: 48,
      conDescuento: 18,
      comprados: 41,
      pagados: 35,
      primerSeguimiento: 29,
      enFOB: 24,
      conBL: 19,
      segundoSeguimiento: 16,
      enCIF: 13
    }
  },
  {
    id: 'tec-006',
    nombre: 'Cotización Interna - Control de Calidad',
    estado: 'success',
    criticidad: 4,
    responsable: 'Olga Navarro',
    fechaInicio: '2024-09-01',
    fechaLimite: '2025-05-31',
    resumen: {
      totalProductos: 76,
      cotizados: 71,
      conDescuento: 28,
      comprados: 65,
      pagados: 60,
      primerSeguimiento: 54,
      enFOB: 48,
      conBL: 43,
      segundoSeguimiento: 40,
      enCIF: 36
    }
  }
];

export const PROYECTOS_TECNICA_ORDENADOS = [...PROYECTOS_TECNICA].sort((a, b) => b.criticidad - a.criticidad);

export const DETALLE_PRODUCTOS_TECNICA: DetalleProducto[] = [
  {
    id: 'prod-tec-001',
    sku: 'LAB-MICRO-001',
    descripcion: 'Microscopio digital 2000x USB',
    cantidad: 6,
    cotizacionId: 'cot-tec-001',
    cotizacionNombre: 'COT-TEC-2024-201',
    proveedor: 'Scientific Instruments',
    responsable: 'Jorge Castillo',
    proceso: 'enCIF',
    estado: 'success',
    fechaSolicitud: '2024-09-20',
    fechaEstimada: '2024-11-20',
    precioUnitario: 1850.00,
    precioTotal: 11100.00,
    observaciones: 'Calibrado y operativo'
  },
  {
    id: 'prod-tec-002',
    sku: 'MED-ESPEC-HD',
    descripcion: 'Espectrofotómetro UV-VIS',
    cantidad: 3,
    cotizacionId: 'cot-tec-001',
    cotizacionNombre: 'COT-TEC-2024-201',
    proveedor: 'Lab Equipment Pro',
    responsable: 'Jorge Castillo',
    proceso: 'pagados',
    estado: 'warn',
    fechaSolicitud: '2024-10-01',
    fechaEstimada: '2024-12-15',
    precioUnitario: 4200.00,
    precioTotal: 12600.00
  },
  {
    id: 'prod-tec-003',
    sku: 'CAL-TERMO-001',
    descripcion: 'Termómetro calibrador patrón',
    cantidad: 4,
    cotizacionId: 'cot-tec-002',
    cotizacionNombre: 'COT-TEC-2024-202',
    proveedor: 'Calibration Services',
    responsable: 'Karla Jiménez',
    proceso: 'primerSeguimiento',
    estado: 'danger',
    fechaSolicitud: '2024-08-25',
    fechaEstimada: '2024-11-10',
    diasRetraso: 20,
    precioUnitario: 980.00,
    precioTotal: 3920.00,
    observaciones: 'Certificación internacional demorada'
  },
  {
    id: 'prod-tec-004',
    sku: 'SEN-PRESS-001',
    descripcion: 'Sensor de presión industrial 0-10bar',
    cantidad: 15,
    cotizacionId: 'cot-tec-003',
    cotizacionNombre: 'COT-TEC-2024-203',
    proveedor: 'Industrial Sensors',
    responsable: 'Luis Paredes',
    proceso: 'comprados',
    estado: 'success',
    fechaSolicitud: '2024-10-20',
    fechaEstimada: '2024-12-30',
    precioUnitario: 340.00,
    precioTotal: 5100.00
  },
  {
    id: 'prod-tec-005',
    sku: 'ANA-GAS-001',
    descripcion: 'Analizador de gases multiparamétrico',
    cantidad: 2,
    cotizacionId: 'cot-tec-004',
    cotizacionNombre: 'COT-TEC-2024-204',
    proveedor: 'Gas Analysis Systems',
    responsable: 'Mónica Herrera',
    proceso: 'cotizados',
    estado: 'warn',
    fechaSolicitud: '2024-11-18',
    fechaEstimada: '2025-02-15',
    precioUnitario: 8500.00,
    precioTotal: 17000.00
  },
  {
    id: 'prod-tec-006',
    sku: 'BAL-PREC-001',
    descripcion: 'Balanza analítica 0.0001g',
    cantidad: 8,
    cotizacionId: 'cot-tec-005',
    cotizacionNombre: 'COT-TEC-2024-205',
    proveedor: 'Precision Scales',
    responsable: 'Nicolás Ramos',
    proceso: 'enBL',
    estado: 'success',
    fechaSolicitud: '2024-08-01',
    fechaEstimada: '2024-10-15',
    precioUnitario: 1750.00,
    precioTotal: 14000.00,
    observaciones: 'En aduana'
  }
];