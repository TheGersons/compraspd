// mocks/mocks_operativa.ts
import { Proyecto, DetalleProducto } from '../types/gerencia.types';

export const PROYECTOS_OPERATIVA: Proyecto[] = [
  {
    id: 'oper-001',
    nombre: 'Departamento de Logística',
    estado: 'success',
    criticidad: 4,
    responsable: 'Patricia Cruz',
    fechaInicio: '2024-09-01',
    fechaLimite: '2025-08-31',
    resumen: {
      totalProductos: 112,
      cotizados: 104,
      conDescuento: 45,
      comprados: 91,
      pagados: 83,
      primerSeguimiento: 74,
      enFOB: 64,
      conBL: 56,
      segundoSeguimiento: 51,
      enCIF: 46
    }
  },
  {
    id: 'oper-002',
    nombre: 'Departamento de Mantenimiento',
    estado: 'warn',
    criticidad: 6,
    responsable: 'Rodrigo Silva',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-09-30',
    resumen: {
      totalProductos: 89,
      cotizados: 78,
      conDescuento: 34,
      comprados: 65,
      pagados: 56,
      primerSeguimiento: 47,
      enFOB: 38,
      conBL: 31,
      segundoSeguimiento: 27,
      enCIF: 22
    }
  },
  {
    id: 'oper-003',
    nombre: 'Departamento de Producción',
    estado: 'danger',
    criticidad: 8,
    responsable: 'Sandra Campos',
    fechaInicio: '2024-08-15',
    fechaLimite: '2025-02-28',
    resumen: {
      totalProductos: 134,
      cotizados: 108,
      conDescuento: 51,
      comprados: 85,
      pagados: 67,
      primerSeguimiento: 52,
      enFOB: 39,
      conBL: 28,
      segundoSeguimiento: 21,
      enCIF: 15
    }
  },
  {
    id: 'oper-004',
    nombre: 'Departamento de Seguridad',
    estado: 'success',
    criticidad: 3,
    responsable: 'Tomás Reyes',
    fechaInicio: '2024-11-01',
    fechaLimite: '2025-10-31',
    resumen: {
      totalProductos: 71,
      cotizados: 68,
      conDescuento: 26,
      comprados: 64,
      pagados: 61,
      primerSeguimiento: 58,
      enFOB: 55,
      conBL: 52,
      segundoSeguimiento: 50,
      enCIF: 47
    }
  },
  {
    id: 'oper-005',
    nombre: 'Departamento de Limpieza',
    estado: 'warn',
    criticidad: 5,
    responsable: 'Verónica Ortiz',
    fechaInicio: '2024-09-15',
    fechaLimite: '2025-09-15',
    resumen: {
      totalProductos: 96,
      cotizados: 87,
      conDescuento: 38,
      comprados: 74,
      pagados: 66,
      primerSeguimiento: 58,
      enFOB: 49,
      conBL: 42,
      segundoSeguimiento: 37,
      enCIF: 32
    }
  },
  {
    id: 'oper-006',
    nombre: 'Departamento de Almacén',
    estado: 'success',
    criticidad: 2,
    responsable: 'Walter Suárez',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-06-30',
    resumen: {
      totalProductos: 78,
      cotizados: 75,
      conDescuento: 29,
      comprados: 71,
      pagados: 69,
      primerSeguimiento: 66,
      enFOB: 63,
      conBL: 60,
      segundoSeguimiento: 58,
      enCIF: 55
    }
  }
];

export const PROYECTOS_OPERATIVA_ORDENADOS = [...PROYECTOS_OPERATIVA].sort((a, b) => b.criticidad - a.criticidad);

export const DETALLE_PRODUCTOS_OPERATIVA: DetalleProducto[] = [
  {
    id: 'prod-oper-001',
    sku: 'LOG-MONT-001',
    descripcion: 'Montacargas eléctrico 2 ton',
    cantidad: 3,
    cotizacionId: 'cot-oper-001',
    cotizacionNombre: 'COT-OPER-2024-301',
    proveedor: 'Material Handling Equipment',
    responsable: 'Patricia Cruz',
    proceso: 'enCIF',
    estado: 'success',
    fechaSolicitud: '2024-09-10',
    fechaEstimada: '2024-11-25',
    precioUnitario: 28500.00,
    precioTotal: 85500.00,
    observaciones: 'Entrenamiento completado'
  },
  {
    id: 'prod-oper-002',
    sku: 'MAN-HERR-KIT',
    descripcion: 'Kit herramientas profesional 120 pzas',
    cantidad: 15,
    cotizacionId: 'cot-oper-001',
    cotizacionNombre: 'COT-OPER-2024-301',
    proveedor: 'Industrial Tools Supply',
    responsable: 'Patricia Cruz',
    proceso: 'pagados',
    estado: 'warn',
    fechaSolicitud: '2024-10-05',
    fechaEstimada: '2024-12-20',
    precioUnitario: 420.00,
    precioTotal: 6300.00
  },
  {
    id: 'prod-oper-003',
    sku: 'PROD-MAT-PRIM',
    descripcion: 'Materia prima Lote A-2024',
    cantidad: 5000,
    cotizacionId: 'cot-oper-002',
    cotizacionNombre: 'COT-OPER-2024-302',
    proveedor: 'Raw Materials Corp',
    responsable: 'Rodrigo Silva',
    proceso: 'primerSeguimiento',
    estado: 'danger',
    fechaSolicitud: '2024-08-20',
    fechaEstimada: '2024-11-15',
    diasRetraso: 18,
    precioUnitario: 2.50,
    precioTotal: 12500.00,
    observaciones: 'Retraso en puerto'
  },
  {
    id: 'prod-oper-004',
    sku: 'SEG-EPP-001',
    descripcion: 'Casco de seguridad blanco',
    cantidad: 100,
    cotizacionId: 'cot-oper-003',
    cotizacionNombre: 'COT-OPER-2024-303',
    proveedor: 'Safety Equipment Inc',
    responsable: 'Sandra Campos',
    proceso: 'comprados',
    estado: 'success',
    fechaSolicitud: '2024-11-01',
    fechaEstimada: '2024-12-15',
    precioUnitario: 35.00,
    precioTotal: 3500.00
  },
  {
    id: 'prod-oper-005',
    sku: 'LIMP-DESINF-001',
    descripcion: 'Desinfectante industrial 20L',
    cantidad: 50,
    cotizacionId: 'cot-oper-004',
    cotizacionNombre: 'COT-OPER-2024-304',
    proveedor: 'Cleaning Solutions',
    responsable: 'Tomás Reyes',
    proceso: 'cotizados',
    estado: 'warn',
    fechaSolicitud: '2024-11-20',
    fechaEstimada: '2025-01-15',
    precioUnitario: 45.00,
    precioTotal: 2250.00
  },
  {
    id: 'prod-oper-006',
    sku: 'ALM-EST-001',
    descripcion: 'Estantería metálica 3x2x0.5m',
    cantidad: 25,
    cotizacionId: 'cot-oper-005',
    cotizacionNombre: 'COT-OPER-2024-305',
    proveedor: 'Warehouse Systems',
    responsable: 'Verónica Ortiz',
    proceso: 'enBL',
    estado: 'success',
    fechaSolicitud: '2024-09-01',
    fechaEstimada: '2024-10-31',
    precioUnitario: 680.00,
    precioTotal: 17000.00,
    observaciones: 'En aduana'
  }
];