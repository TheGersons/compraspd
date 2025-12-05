// mocks/mocks_areas.ts
import { Area, ResumenProcesos } from '../types/gerencia.types';

/**
 * MOCKS CONSISTENTES - ÁREAS PRINCIPALES
 * Estos números deben coincidir con la suma de proyectos en cada área
 */

// ÁREA PROYECTOS - 6 proyectos, 147 productos totales
const resumenProyectos: ResumenProcesos = {
  totalProductos: 147,
  cotizados: 142,
  conDescuento: 98,
  comprados: 89,
  pagados: 78,
  primerSeguimiento: 67,
  enFOB: 56,
  conBL: 45,
  segundoSeguimiento: 34,
  enCIF: 23
};

// ÁREA COMERCIAL - 4 proyectos, 98 productos totales
const resumenComercial: ResumenProcesos = {
  totalProductos: 98,
  cotizados: 95,
  conDescuento: 67,
  comprados: 54,
  pagados: 49,
  primerSeguimiento: 43,
  enFOB: 38,
  conBL: 32,
  segundoSeguimiento: 27,
  enCIF: 21
};

// ÁREA TÉCNICA - 3 proyectos, 76 productos totales
const resumenTecnica: ResumenProcesos = {
  totalProductos: 76,
  cotizados: 73,
  conDescuento: 52,
  comprados: 48,
  pagados: 42,
  primerSeguimiento: 37,
  enFOB: 31,
  conBL: 26,
  segundoSeguimiento: 21,
  enCIF: 16
};

// ÁREA OPERATIVA - 5 proyectos, 112 productos totales
const resumenOperativa: ResumenProcesos = {
  totalProductos: 112,
  cotizados: 108,
  conDescuento: 78,
  comprados: 71,
  pagados: 63,
  primerSeguimiento: 55,
  enFOB: 47,
  conBL: 39,
  segundoSeguimiento: 31,
  enCIF: 24
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