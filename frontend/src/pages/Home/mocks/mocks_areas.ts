// mocks/mocks_areas.ts
import { Area, ResumenProcesos } from '../types/gerencia.types';

// Resumen agregado de todas las áreas de proyectos
const resumenProyectos: ResumenProcesos = {
  totalProductos: 450,
  cotizados: 385,
  conDescuento: 142,
  comprados: 298,
  pagados: 267,
  primerSeguimiento: 234,
  enFOB: 189,
  conBL: 156,
  segundoSeguimiento: 145,
  enCIF: 123
};

const resumenComercial: ResumenProcesos = {
  totalProductos: 380,
  cotizados: 342,
  conDescuento: 128,
  comprados: 276,
  pagados: 245,
  primerSeguimiento: 198,
  enFOB: 167,
  conBL: 145,
  segundoSeguimiento: 134,
  enCIF: 112
};

const resumenTecnica: ResumenProcesos = {
  totalProductos: 290,
  cotizados: 256,
  conDescuento: 89,
  comprados: 198,
  pagados: 178,
  primerSeguimiento: 156,
  enFOB: 134,
  conBL: 112,
  segundoSeguimiento: 98,
  enCIF: 87
};

const resumenOperativa: ResumenProcesos = {
  totalProductos: 520,
  cotizados: 467,
  conDescuento: 176,
  comprados: 389,
  pagados: 345,
  primerSeguimiento: 298,
  enFOB: 256,
  conBL: 223,
  segundoSeguimiento: 198,
  enCIF: 178
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
    icono: '🔌',
    resumen: resumenTecnica
  },
  {
    id: 'area-004',
    nombre: 'Área Operativa',
    tipo: 'operativa',
    icono: '🖥️',
    resumen: resumenOperativa
  }
];