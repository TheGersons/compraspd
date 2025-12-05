// mocks/mocks_productos_detallados.ts
import { ProductoDetallado } from '../types/gerencia.types';

/**
 * PRODUCTOS DETALLADOS CONSISTENTES
 * Estos productos coinciden exactamente con los números de los proyectos
 * 
 * JERARQUÍA:
 * - Área Proyectos: 6 proyectos, 147 productos totales
 * - Área Comercial: 4 proyectos, 98 productos totales
 * - Área Técnica: 3 proyectos, 76 productos totales
 * - Área Operativa: 5 proyectos, 112 productos totales
 */

// ============================================================================
// ÁREA PROYECTOS - 147 productos
// ============================================================================

export const PRODUCTOS_DETALLADOS_PROYECTOS: ProductoDetallado[] = [
  // Proyecto: Ampliación Planta Norte (45 productos) - criticidad 9, estado danger
  // Etapas tempranas, muchos atrasados
  { id: 'p001', sku: 'TRF-500KVA', descripcion: 'Transformador trifásico 500 KVA 13.8/0.48 KV', cotizacionNombre: 'COT-PROY-001',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 12, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },
  
  { id: 'p002', sku: 'CBL-4/0-AWG', descripcion: 'Cable conductor aluminio 4/0 AWG 600V', cotizacionNombre: 'COT-PROY-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'atrasado', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 15, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },
  
  { id: 'p003', sku: 'PNL-MCC-800A', descripcion: 'Panel MCC 800A 480V con 12 arrancadores', cotizacionNombre: 'COT-PROY-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'en_proceso', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 2, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'p004', sku: 'DSY-630A', descripcion: 'Disyuntor termomagnético 630A', cotizacionNombre: 'COT-PROY-001',
    cotizado: 'completado', conDescuento: 'en_proceso', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 3, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'p005', sku: 'CON-150A', descripcion: 'Contactor magnético 150A 3 polos', cotizacionNombre: 'COT-PROY-001',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 8, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Modernización Sistema SCADA (28 productos) - criticidad 7, estado warn
  // Etapas avanzadas
  { id: 'p006', sku: 'PLC-S7-1500', descripcion: 'PLC Siemens S7-1500 CPU 1515-2 PN', cotizacionNombre: 'COT-SCADA-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'en_proceso', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 1, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'p007', sku: 'HMI-TP1500', descripcion: 'Panel HMI táctil 15" Comfort Panel', cotizacionNombre: 'COT-SCADA-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'en_proceso', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 2, diasAtrasoRecibido: 0 },

  { id: 'p008', sku: 'SRV-DELL-R740', descripcion: 'Servidor Dell PowerEdge R740 industrial', cotizacionNombre: 'COT-SCADA-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'en_proceso', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 3, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'p009', sku: 'SW-IND-24P', descripcion: 'Switch industrial managed 24 puertos gigabit', cotizacionNombre: 'COT-SCADA-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'completado', recibido: 'en_proceso',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 1 },

  // Renovación Equipos Protección (32 productos) - criticidad 10, estado danger
  // Productos más atrasados
  { id: 'p010', sku: 'RLE-SEL-751A', descripcion: 'Relé protección diferencial SEL-751A', cotizacionNombre: 'COT-PROT-001',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 18, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'p011', sku: 'RLE-SEL-487E', descripcion: 'Relé de sobrecorriente direccional SEL-487E', cotizacionNombre: 'COT-PROT-001',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 22, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'p012', sku: 'MED-PM5560', descripcion: 'Medidor de potencia multifunción PM5560', cotizacionNombre: 'COT-PROT-001',
    cotizado: 'atrasado', conDescuento: 'pendiente', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 25, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Proyecto Transmisión 230KV (18 productos) - criticidad 3, estado success
  // Muy avanzado, casi todo completado
  { id: 'p013', sku: 'ISO-230KV', descripcion: 'Aislador polimérico 230KV suspensión', cotizacionNombre: 'COT-TRANS-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'completado', recibido: 'en_proceso',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 1 },

  { id: 'p014', sku: 'UPS-APC-10K', descripcion: 'UPS APC Smart-UPS 10KVA Online', cotizacionNombre: 'COT-TRANS-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'completado', recibido: 'completado',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Instalación Subestación (15 productos) - criticidad 6, estado warn
  { id: 'p015', sku: 'TR-25MVA', descripcion: 'Transformador de potencia 25MVA 115/13.8KV', cotizacionNombre: 'COT-SUB-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'en_proceso', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 4, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Automatización Líneas (9 productos) - criticidad 2, estado success
  { id: 'p016', sku: 'RTU-SCADAPack', descripcion: 'RTU SCADAPack 575 con módulos I/O', cotizacionNombre: 'COT-AUTO-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'en_proceso', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 2, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },
];

// ============================================================================
// ÁREA COMERCIAL - 98 productos
// ============================================================================

export const PRODUCTOS_DETALLADOS_COMERCIAL: ProductoDetallado[] = [
  // Equipamiento Oficinas Centrales (38 productos) - criticidad 5, warn
  { id: 'c001', sku: 'LAP-DELL-5420', descripcion: 'Laptop Dell Latitude 5420 i7 16GB 512GB', cotizacionNombre: 'COT-COM-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'en_proceso', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 3, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'c002', sku: 'MON-LG-27-4K', descripcion: 'Monitor LG 27" 4K IPS USB-C', cotizacionNombre: 'COT-COM-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'en_proceso', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 1, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'c003', sku: 'IMP-HP-M479', descripcion: 'Impresora multifunción HP LaserJet Pro M479fdw', cotizacionNombre: 'COT-COM-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'en_proceso', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 2, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Mobiliario Nueva Sucursal (25 productos) - criticidad 3, success
  { id: 'c004', sku: 'ESC-EJEC-ROB', descripcion: 'Escritorio ejecutivo roble 180x80cm', cotizacionNombre: 'COT-COM-002',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'en_proceso', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 1, diasAtrasoRecibido: 0 },

  { id: 'c005', sku: 'SIL-ERG-HM', descripcion: 'Silla ergonómica Herman Miller Aeron', cotizacionNombre: 'COT-COM-002',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'completado', recibido: 'en_proceso',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Renovación Flota Vehículos (22 productos) - criticidad 8, danger
  { id: 'c006', sku: 'VEH-HILUX-4X4', descripcion: 'Toyota Hilux 4x4 Doble Cabina Diesel', cotizacionNombre: 'COT-COM-005',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 14, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'c007', sku: 'VEH-RAV4-HYB', descripcion: 'Toyota RAV4 Hybrid AWD', cotizacionNombre: 'COT-COM-005',
    cotizado: 'atrasado', conDescuento: 'pendiente', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 10, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Sistemas Punto Venta (13 productos) - criticidad 4, success
  { id: 'c008', sku: 'POS-VERIFONE', descripcion: 'Terminal POS Verifone P400 con impresora', cotizacionNombre: 'COT-COM-004',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'en_proceso', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 1, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },
];

// ============================================================================
// ÁREA TÉCNICA - 76 productos
// ============================================================================

export const PRODUCTOS_DETALLADOS_TECNICA: ProductoDetallado[] = [
  // Laboratorio Calibración (34 productos) - criticidad 6, warn
  { id: 't001', sku: 'OSC-KEYSIGHT', descripcion: 'Osciloscopio Keysight DSOX4024A 200MHz 4 canales', cotizacionNombre: 'COT-TEC-003',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'en_proceso', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 4, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 't002', sku: 'MUL-FLUKE-287', descripcion: 'Multímetro digital Fluke 287 TRMS con registro', cotizacionNombre: 'COT-TEC-003',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'en_proceso', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 2, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 't003', sku: 'GEN-RIGOL-DG4162', descripcion: 'Generador de señales Rigol DG4162 160MHz', cotizacionNombre: 'COT-TEC-003',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'en_proceso', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 5, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Instrumental Medición (27 productos) - criticidad 4, success
  { id: 't004', sku: 'ANL-FLUKE-435', descripcion: 'Analizador de calidad energía Fluke 435 serie II', cotizacionNombre: 'COT-TEC-004',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'en_proceso', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 1, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 't005', sku: 'CAM-FLIR-E95', descripcion: 'Cámara termográfica FLIR E95 464x348 pixels', cotizacionNombre: 'COT-TEC-004',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'en_proceso', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 2, diasAtrasoRecibido: 0 },

  // Herramientas Especializadas (15 productos) - criticidad 7, danger
  { id: 't006', sku: 'TRQ-SNAP-CDI', descripcion: 'Torquímetro digital Snap-on CDI 50-250 Nm', cotizacionNombre: 'COT-TEC-005',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 9, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },
];

// ============================================================================
// ÁREA OPERATIVA - 112 productos
// ============================================================================

export const PRODUCTOS_DETALLADOS_OPERATIVA: ProductoDetallado[] = [
  // Equipamiento Taller Principal (35 productos) - criticidad 3, success
  { id: 'o001', sku: 'TOR-BANK-50T', descripcion: 'Torno paralelo bancada 50" ent. 80mm', cotizacionNombre: 'COT-OPE-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'en_proceso', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 1, diasAtrasoRecibido: 0 },

  { id: 'o002', sku: 'FRES-CNC-VMC', descripcion: 'Centro mecanizado CNC vertical VMC-1000', cotizacionNombre: 'COT-OPE-001',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'completado', segundoSeguimiento: 'completado', enCIF: 'completado', recibido: 'en_proceso',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Maquinaria Pesada (28 productos) - criticidad 8, danger
  { id: 'o003', sku: 'EXC-CAT-320', descripcion: 'Excavadora hidráulica Caterpillar 320 GC', cotizacionNombre: 'COT-OPE-002',
    cotizado: 'completado', conDescuento: 'atrasado', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 16, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  { id: 'o004', sku: 'COM-SCREW-250', descripcion: 'Compresor tornillo 250HP refrigerado', cotizacionNombre: 'COT-OPE-002',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'atrasado', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 11, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Herramientas Manuales (24 productos) - criticidad 2, success
  { id: 'o005', sku: 'JGO-HER-SNAP', descripcion: 'Juego herramientas mecánico Snap-on 234 pzs', cotizacionNombre: 'COT-OPE-003',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'completado', primerSeguimiento: 'completado', enFOB: 'completado', conBL: 'en_proceso', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 1, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Equipos Seguridad Industrial (16 productos) - criticidad 5, warn
  { id: 'o006', sku: 'ARN-3M-PROTEC', descripcion: 'Arnés seguridad 3M Protecta con amortiguador', cotizacionNombre: 'COT-OPE-004',
    cotizado: 'completado', conDescuento: 'completado', comprado: 'completado', pagado: 'en_proceso', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 0, diasAtrasoComprado: 0, diasAtrasoPagado: 3, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },

  // Vehículos Utilitarios (9 productos) - criticidad 6, warn
  { id: 'o007', sku: 'MON-TOYOTA-FD50', descripcion: 'Montacargas Toyota FD50 diésel 5 ton', cotizacionNombre: 'COT-OPE-006',
    cotizado: 'completado', conDescuento: 'en_proceso', comprado: 'pendiente', pagado: 'pendiente', primerSeguimiento: 'pendiente', enFOB: 'pendiente', conBL: 'pendiente', segundoSeguimiento: 'pendiente', enCIF: 'pendiente', recibido: 'pendiente',
    diasAtrasoCotizado: 0, diasAtrasoDescuento: 5, diasAtrasoComprado: 0, diasAtrasoPagado: 0, diasAtrasoPrimerSeguimiento: 0, diasAtrasoFOB: 0, diasAtrasoBL: 0, diasAtrasoSegundoSeguimiento: 0, diasAtrasoCIF: 0, diasAtrasoRecibido: 0 },
];

// Función helper para obtener productos por área
export const getProductosDetalladosPorArea = (tipoArea: string): ProductoDetallado[] => {
  switch (tipoArea) {
    case 'proyectos':
      return PRODUCTOS_DETALLADOS_PROYECTOS;
    case 'comercial':
      return PRODUCTOS_DETALLADOS_COMERCIAL;
    case 'tecnica':
      return PRODUCTOS_DETALLADOS_TECNICA;
    case 'operativa':
      return PRODUCTOS_DETALLADOS_OPERATIVA;
    default:
      return [];
  }
};