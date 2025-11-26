// mocks/mocks_comercial.ts
import { Proyecto, DetalleProducto } from '../types/gerencia.types';

export const PROYECTOS_COMERCIAL: Proyecto[] = [
  {
    id: 'com-001',
    nombre: 'Licitación Pública LP-2024-089',
    estado: 'success',
    criticidad: 4,
    responsable: 'Roberto Sánchez',
    fechaInicio: '2024-09-01',
    fechaLimite: '2025-02-28',
    resumen: {
      totalProductos: 95,
      cotizados: 89,
      conDescuento: 38,
      comprados: 76,
      pagados: 68,
      primerSeguimiento: 59,
      enFOB: 48,
      conBL: 41,
      segundoSeguimiento: 37,
      enCIF: 32
    }
  },
  {
    id: 'com-002',
    nombre: 'Oferta Comercial - Cliente Corporativo A',
    estado: 'warn',
    criticidad: 6,
    responsable: 'Diana Torres',
    fechaInicio: '2024-10-15',
    fechaLimite: '2025-01-31',
    resumen: {
      totalProductos: 72,
      cotizados: 63,
      conDescuento: 28,
      comprados: 51,
      pagados: 43,
      primerSeguimiento: 35,
      enFOB: 27,
      conBL: 21,
      segundoSeguimiento: 18,
      enCIF: 14
    }
  },
  {
    id: 'com-003',
    nombre: 'Licitación Internacional LI-2024-023',
    estado: 'danger',
    criticidad: 8,
    responsable: 'Fernando Ruiz',
    fechaInicio: '2024-08-01',
    fechaLimite: '2024-12-31',
    resumen: {
      totalProductos: 108,
      cotizados: 87,
      conDescuento: 42,
      comprados: 67,
      pagados: 51,
      primerSeguimiento: 38,
      enFOB: 26,
      conBL: 18,
      segundoSeguimiento: 13,
      enCIF: 9
    }
  },
  {
    id: 'com-004',
    nombre: 'Oferta Comercial - Gobierno Regional',
    estado: 'success',
    criticidad: 3,
    responsable: 'Gabriela Mendoza',
    fechaInicio: '2024-11-01',
    fechaLimite: '2025-04-30',
    resumen: {
      totalProductos: 64,
      cotizados: 61,
      conDescuento: 22,
      comprados: 57,
      pagados: 54,
      primerSeguimiento: 51,
      enFOB: 48,
      conBL: 45,
      segundoSeguimiento: 43,
      enCIF: 40
    }
  },
  {
    id: 'com-005',
    nombre: 'Licitación Privada LP-2024-134',
    estado: 'warn',
    criticidad: 5,
    responsable: 'Héctor Vargas',
    fechaInicio: '2024-10-01',
    fechaLimite: '2025-03-31',
    resumen: {
      totalProductos: 58,
      cotizados: 52,
      conDescuento: 19,
      comprados: 44,
      pagados: 38,
      primerSeguimiento: 31,
      enFOB: 25,
      conBL: 20,
      segundoSeguimiento: 17,
      enCIF: 14
    }
  },
  {
    id: 'com-006',
    nombre: 'Oferta Marco Anual 2025',
    estado: 'success',
    criticidad: 2,
    responsable: 'Isabel Morales',
    fechaInicio: '2024-09-15',
    fechaLimite: '2025-09-15',
    resumen: {
      totalProductos: 83,
      cotizados: 80,
      conDescuento: 31,
      comprados: 74,
      pagados: 71,
      primerSeguimiento: 68,
      enFOB: 64,
      conBL: 60,
      segundoSeguimiento: 58,
      enCIF: 55
    }
  }
];

export const PROYECTOS_COMERCIAL_ORDENADOS = [...PROYECTOS_COMERCIAL].sort((a, b) => b.criticidad - a.criticidad);

export const DETALLE_PRODUCTOS_COMERCIAL: DetalleProducto[] = [
  {
    id: 'prod-com-001',
    sku: 'MOB-ESC-001',
    descripcion: 'Escritorio ejecutivo 1.60m caoba',
    cantidad: 45,
    cotizacionId: 'cot-com-001',
    cotizacionNombre: 'COT-COM-2024-101',
    proveedor: 'Muebles Corporativos SA',
    responsable: 'Roberto Sánchez',
    proceso: 'enCIF',
    estado: 'success',
    fechaSolicitud: '2024-09-05',
    fechaEstimada: '2024-11-15',
    precioUnitario: 450.00,
    precioTotal: 20250.00,
    observaciones: 'Entrega exitosa'
  },
  {
    id: 'prod-com-002',
    sku: 'MOB-SIL-002',
    descripcion: 'Silla ergonómica ejecutiva negra',
    cantidad: 50,
    cotizacionId: 'cot-com-001',
    cotizacionNombre: 'COT-COM-2024-101',
    proveedor: 'Ergonomix Pro',
    responsable: 'Roberto Sánchez',
    proceso: 'pagados',
    estado: 'warn',
    fechaSolicitud: '2024-09-05',
    fechaEstimada: '2024-12-10',
    precioUnitario: 280.00,
    precioTotal: 14000.00
  },
  {
    id: 'prod-com-003',
    sku: 'EQP-PROY-HD',
    descripcion: 'Proyector Full HD 4000 lúmenes',
    cantidad: 12,
    cotizacionId: 'cot-com-002',
    cotizacionNombre: 'COT-COM-2024-102',
    proveedor: 'AV Solutions',
    responsable: 'Diana Torres',
    proceso: 'primerSeguimiento',
    estado: 'danger',
    fechaSolicitud: '2024-08-20',
    fechaEstimada: '2024-11-30',
    diasRetraso: 15,
    precioUnitario: 650.00,
    precioTotal: 7800.00,
    observaciones: 'Problemas de importación'
  },
  {
    id: 'prod-com-004',
    sku: 'TEL-VID-CONF',
    descripcion: 'Sistema videoconferencia HD',
    cantidad: 8,
    cotizacionId: 'cot-com-003',
    cotizacionNombre: 'COT-COM-2024-103',
    proveedor: 'Video Communications',
    responsable: 'Fernando Ruiz',
    proceso: 'comprados',
    estado: 'success',
    fechaSolicitud: '2024-10-01',
    fechaEstimada: '2024-12-20',
    precioUnitario: 1200.00,
    precioTotal: 9600.00
  },
  {
    id: 'prod-com-005',
    sku: 'ARC-MET-001',
    descripcion: 'Archivador metálico 4 gavetas',
    cantidad: 30,
    cotizacionId: 'cot-com-004',
    cotizacionNombre: 'COT-COM-2024-104',
    proveedor: 'Office Supplies Ltd',
    responsable: 'Gabriela Mendoza',
    proceso: 'cotizados',
    estado: 'warn',
    fechaSolicitud: '2024-11-15',
    fechaEstimada: '2025-01-20',
    precioUnitario: 320.00,
    precioTotal: 9600.00
  },
  {
    id: 'prod-com-006',
    sku: 'ALF-PERS-001',
    descripcion: 'Alfombra persa 3x4m oficina',
    cantidad: 6,
    cotizacionId: 'cot-com-005',
    cotizacionNombre: 'COT-COM-2024-105',
    proveedor: 'Decoraciones Elegantes',
    responsable: 'Héctor Vargas',
    proceso: 'enBL',
    estado: 'success',
    fechaSolicitud: '2024-08-10',
    fechaEstimada: '2024-10-25',
    precioUnitario: 890.00,
    precioTotal: 5340.00,
    observaciones: 'En aduana'
  }
];