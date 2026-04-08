// mocks/mocks_areas.ts
import { Area, ResumenProcesos } from '../types/gerencia.types';

/**
 * MOCKS CONSISTENTES - ÁREAS PRINCIPALES
 * Estos números deben coincidir con la suma de proyectos en cada área
 */

// ÁREA PROYECTOS - 6 proyectos, 147 productos totales
const resumenProyectos: ResumenProcesos = {
  totalProductos: 147,
  cotizado: 142,
  conDescuento: 98,
  aprobacionCompra: 92,
  comprado: 89,
  pagado: 78,
  aprobacionPlanos: 72,
  primerSeguimiento: 67,
  enFOB: 56,
  cotizacionFleteInternacional: 50,
  conBL: 45,
  segundoSeguimiento: 34,
  enCIF: 28,
  recibido: 23
};

// ÁREA COMERCIAL - 4 proyectos, 98 productos totales
const resumenComercial: ResumenProcesos = {
  totalProductos: 98,
  cotizado: 95,
  conDescuento: 67,
  aprobacionCompra: 60,
  comprado: 54,
  pagado: 49,
  aprobacionPlanos: 46,
  primerSeguimiento: 43,
  enFOB: 38,
  cotizacionFleteInternacional: 35,
  conBL: 32,
  segundoSeguimiento: 27,
  enCIF: 24,
  recibido: 21
};

// ÁREA TÉCNICA - 3 proyectos, 76 productos totales
const resumenTecnica: ResumenProcesos = {
  totalProductos: 76,
  cotizado: 73,
  conDescuento: 52,
  aprobacionCompra: 50,
  comprado: 48,
  pagado: 42,
  aprobacionPlanos: 40,
  primerSeguimiento: 37,
  enFOB: 31,
  cotizacionFleteInternacional: 28,
  conBL: 26,
  segundoSeguimiento: 21,
  enCIF: 18,
  recibido: 16
};

// ÁREA OPERATIVA - 5 proyectos, 112 productos totales
const resumenOperativa: ResumenProcesos = {
  totalProductos: 112,
  cotizado: 108,
  conDescuento: 78,
  aprobacionCompra: 75,
  comprado: 71,
  pagado: 63,
  aprobacionPlanos: 59,
  primerSeguimiento: 55,
  enFOB: 47,
  cotizacionFleteInternacional: 43,
  conBL: 39,
  segundoSeguimiento: 31,
  enCIF: 27,
  recibido: 24
};

export const AREAS_PRINCIPALES: Area[] = [
  {
    id: 'area-001',
    nombre: 'Proyectos',
    tipo: 'proyectos',
    icono: '🏗️',
    resumen: resumenProyectos
  },
  {
    id: 'area-002',
    nombre: 'Comercial',
    tipo: 'comercial',
    icono: '💼',
    resumen: resumenComercial
  },
  {
    id: 'area-003',
    nombre: 'Área Técnica',
    tipo: 'tecnica',
    icono: '⚙️',
    resumen: resumenTecnica
  },
  {
    id: 'area-004',
    nombre: 'Área Operativa',
    tipo: 'operativa',
    icono: '📊',
    resumen: resumenOperativa
  }
];