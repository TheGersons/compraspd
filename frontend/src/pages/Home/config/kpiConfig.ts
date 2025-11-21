// config/kpiConfig.ts
import { KpiConfig } from '../types/kpi.types';
import * as kpiFetchers from '../services/kpiFetchers';

// ============================================================================
// COTIZACIONES - 8 KPIs
// ============================================================================

export const COTIZACIONES_KPIS: KpiConfig[] = [

    {
        id: 'cot-sin-ofertas',
        category: 'cotizaciones',
        title: 'Total en curso',
        type: 'table',
        hint: 'Más de 3 días',
        columns: [
            { key: 'ordenCotizacion', label: 'Orden Cotización', sortable: true },
            { key: 'area', label: 'Área', sortable: true },
            { key: 'fechaEnvio', label: 'Fecha Envío', sortable: true },
            { key: 'diasSinOferta', label: 'Días Sin Oferta', sortable: true },
            { key: 'proveedoresContactados', label: 'Proveedores Contactados', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 3) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchCotizacionesSinOfertas
    },
    {
        id: 'cot-rechazadas',
        category: 'cotizaciones',
        title: 'Finalizadas',
        type: 'table',
        hint: 'Último mes',
        columns: [
            { key: 'ordenCotizacion', label: 'Orden Cotización', sortable: true },
            { key: 'motivoRechazo', label: 'Motivo Rechazo', sortable: false },
            { key: 'fechaRechazo', label: 'Fecha Rechazo', sortable: true },
            { key: 'rechazadoPor', label: 'Rechazado Por', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 5) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchCotizacionesRechazadas
    },
    {
        id: 'cot-vencidas',
        category: 'cotizaciones',
        title: 'Vencidas',
        type: 'table',
        hint: 'Último mes',
        columns: [
            { key: 'area', label: 'Área', sortable: true },
            { key: 'tipo', label: 'Tipo', sortable: true },
            { key: 'ordenCotizacion', label: 'Orden Cotización', sortable: true },
            { key: 'asignado', label: 'Asignado', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'cantidadItems', label: 'Cantidad Items', sortable: true },
            { key: 'diasVencida', label: 'Días Vencida', sortable: true },
            { key: 'prioridad', label: 'Prioridad', sortable: true },
            { key: 'solicitoDescuento', label: 'Se solicitó descuento', sortable: false },
            { key: 'status', label: 'Status', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 3) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchCotizacionesVencidas
    },
    {
        id: 'cot-en-revision',
        category: 'cotizaciones',
        title: 'items sin solicitud de descuento',
        type: 'table',
        hint: 'Requieren atención',
        columns: [
            { key: 'ordenCotizacion', label: 'Orden Cotización', sortable: true },
            { key: 'revisor', label: 'Revisor', sortable: true },
            { key: 'fechaIngreso', label: 'Fecha Ingreso', sortable: true },
            { key: 'diasEnRevision', label: 'Días en Revisión', sortable: true },
            { key: 'cantidadOfertas', label: 'Ofertas Recibidas', sortable: true },
            { key: 'prioridad', label: 'Prioridad', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 10) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchCotizacionesEnRevision
    },
    {
        id: 'cot-pendientes',
        category: 'cotizaciones',
        title: 'Productos sin Cotizar',
        type: 'table',
        hint: 'Sin asignar',
        columns: [
            { key: 'ordenCotizacion', label: 'Orden Cotización', sortable: true },
            { key: 'area', label: 'Área', sortable: true },
            { key: 'tipo', label: 'Tipo', sortable: true },
            { key: 'solicitante', label: 'Solicitante', sortable: true },
            { key: 'fechaSolicitud', label: 'Fecha Solicitud', sortable: true },
            { key: 'diasPendiente', label: 'Días Pendiente', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 5) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchCotizacionesPendientes
    },
    {
        id: 'cot-aprobadas',
        category: 'cotizaciones',
        title: 'Sin responsable asignado',
        type: 'summary',
        hint: 'Este mes',
        colorCriteria: (value) => {
            const num = Number(value);
            if (num >= 10) return 'danger';
            if (num >= 5) return 'warn';
            if (num >= 1) return 'info';
            return 'success';
        },
        fetchData: kpiFetchers.fetchCotizacionesAprobadas
    },
    {
        id: 'cot-monto-total',
        category: 'cotizaciones',
        title: 'Monto Total',
        type: 'summary',
        hint: 'En proceso',
        colorCriteria: (value) => {
            const str = String(value).replace(/[^\d.]/g, '');
            const num = parseFloat(str);
            if (num >= 2000000) return 'success';
            if (num >= 1000000) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchCotizacionesMontoTotal
    },
    {
        id: 'cot-promedio-dias',
        category: 'cotizaciones',
        title: 'Promedio Días',
        type: 'summary',
        hint: 'Tiempo respuesta',
        colorCriteria: (value) => {
            const num = parseFloat(String(value));
            if (num <= 3) return 'success';
            if (num <= 5) return 'info';
            if (num <= 7) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchCotizacionesPromedioDias
    }
];

// ============================================================================
// COMPRAS - 8 KPIs
// ============================================================================

export const COMPRAS_KPIS: KpiConfig[] = [
    {
        id: 'comp-ordenes-activas',
        category: 'compras',
        title: 'Órdenes Activas',
        type: 'table',
        hint: 'En tránsito',
        columns: [
            { key: 'ordenCompra', label: 'Orden Compra', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'estado', label: 'Estado', sortable: true },
            { key: 'cantidadItems', label: 'Items', sortable: true },
            { key: 'montoTotal', label: 'Monto', sortable: true },
            { key: 'fechaOrden', label: 'Fecha Orden', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 20) return 'success';
            if (num <= 40) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchComprasOrdenesActivas
    },
    {
        id: 'comp-pre-compra',
        category: 'compras',
        title: 'Pre-Compra',
        type: 'table',
        hint: 'Por confirmar',
        columns: [
            { key: 'ordenCompra', label: 'Orden Compra', sortable: true },
            { key: 'item', label: 'Item', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'diasEnEstado', label: 'Días en Estado', sortable: true },
            { key: 'responsable', label: 'Responsable', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 10) return 'success';
            if (num <= 20) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchComprasPreCompra
    },
    {
        id: 'comp-fabricacion',
        category: 'compras',
        title: 'Fabricación',
        type: 'table',
        hint: 'En producción',
        columns: [
            { key: 'ordenCompra', label: 'Orden Compra', sortable: true },
            { key: 'item', label: 'Item', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'fechaInicio', label: 'Inicio Fabricación', sortable: true },
            { key: 'diasFabricacion', label: 'Días Fabricación', sortable: true },
            { key: 'fechaEstimadaTermino', label: 'Fecha Estimada', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 8) return 'success';
            if (num <= 15) return 'info';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchComprasFabricacion
    },
    {
        id: 'comp-fors',
        category: 'compras',
        title: 'En FORS',
        type: 'table',
        hint: 'Documentación',
        columns: [
            { key: 'ordenCompra', label: 'Orden Compra', sortable: true },
            { key: 'item', label: 'Item', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'fechaFors', label: 'Fecha FORS', sortable: true },
            { key: 'documentosPendientes', label: 'Documentos Pendientes', sortable: false },
            { key: 'responsable', label: 'Responsable', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 5) return 'success';
            if (num <= 10) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchComprasFors
    },
    {
        id: 'comp-cif',
        category: 'compras',
        title: 'CIF',
        type: 'table',
        hint: 'Por recibir',
        columns: [
            { key: 'ordenCompra', label: 'Orden Compra', sortable: true },
            { key: 'item', label: 'Item', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'fechaLlegadaAduana', label: 'Llegada Aduana', sortable: true },
            { key: 'diasEnAduana', label: 'Días en Aduana', sortable: true },
            { key: 'estatusLiberacion', label: 'Estatus Liberación', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 3) return 'success';
            if (num <= 6) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchComprasCif
    },
    {
        id: 'comp-completadas',
        category: 'compras',
        title: 'Completadas',
        type: 'summary',
        hint: 'Este año',
        colorCriteria: (value) => {
            const num = Number(value);
            if (num >= 200) return 'success';
            if (num >= 100) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchComprasCompletadas
    },
    {
        id: 'comp-retrasadas',
        category: 'compras',
        title: 'Retrasadas',
        type: 'table',
        hint: 'Fuera de tiempo',
        columns: [
            { key: 'ordenCompra', label: 'Orden Compra', sortable: true },
            { key: 'item', label: 'Item', sortable: true },
            { key: 'estadoActual', label: 'Estado Actual', sortable: true },
            { key: 'fechaEstimada', label: 'Fecha Estimada', sortable: true },
            { key: 'diasRetraso', label: 'Días Retraso', sortable: true },
            { key: 'motivoRetraso', label: 'Motivo Retraso', sortable: false }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 5) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchComprasRetrasadas
    },
    {
        id: 'comp-monto-mes',
        category: 'compras',
        title: 'Monto del Mes',
        type: 'summary',
        hint: 'Compras completadas',
        colorCriteria: (value) => {
            const str = String(value).replace(/[^\d.]/g, '');
            const num = parseFloat(str);
            if (num >= 500000) return 'success';
            if (num >= 250000) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchComprasMontoMes
    }
];

// ============================================================================
// IMPORT/EXPORT - 8 KPIs
// ============================================================================

export const IMPORT_EXPORT_KPIS: KpiConfig[] = [
    {
        id: 'ie-importaciones-activas',
        category: 'import-export',
        title: 'Importaciones Activas',
        type: 'table',
        hint: 'En proceso',
        columns: [
            { key: 'numeroImportacion', label: 'N° Importación', sortable: true },
            { key: 'proveedor', label: 'Proveedor', sortable: true },
            { key: 'paisOrigen', label: 'País Origen', sortable: true },
            { key: 'estadoActual', label: 'Estado Actual', sortable: true },
            { key: 'valorCIF', label: 'Valor CIF', sortable: true },
            { key: 'fechaEstimadaLlegada', label: 'Fecha Est. Llegada', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 10) return 'success';
            if (num <= 20) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchImportacionesActivas
    },
    {
        id: 'ie-en-aduana',
        category: 'import-export',
        title: 'En Aduana',
        type: 'table',
        hint: 'Por liberar',
        columns: [
            { key: 'numeroImportacion', label: 'N° Importación', sortable: true },
            { key: 'fechaLlegada', label: 'Fecha Llegada', sortable: true },
            { key: 'diasEnAduana', label: 'Días en Aduana', sortable: true },
            { key: 'documentosFaltantes', label: 'Documentos Faltantes', sortable: false },
            { key: 'agenciaAduanal', label: 'Agencia Aduanal', sortable: true },
            { key: 'estatusLiberacion', label: 'Estatus', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num <= 3) return 'success';
            if (num <= 6) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchImportacionesEnAduana
    },
    {
        id: 'ie-exportaciones',
        category: 'import-export',
        title: 'Exportaciones',
        type: 'table',
        hint: 'Este mes',
        columns: [
            { key: 'numeroExportacion', label: 'N° Exportación', sortable: true },
            { key: 'cliente', label: 'Cliente', sortable: true },
            { key: 'paisDestino', label: 'País Destino', sortable: true },
            { key: 'fechaEmbarque', label: 'Fecha Embarque', sortable: true },
            { key: 'valorFOB', label: 'Valor FOB', sortable: true },
            { key: 'estado', label: 'Estado', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num >= 10) return 'success';
            if (num >= 5) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchExportaciones
    },
    {
        id: 'ie-documentos-pendientes',
        category: 'import-export',
        title: 'Documentos Pendientes',
        type: 'table',
        hint: 'Requieren acción',
        columns: [
            { key: 'numeroOperacion', label: 'N° Operación', sortable: true },
            { key: 'tipoOperacion', label: 'Tipo', sortable: true },
            { key: 'documentoPendiente', label: 'Documento Pendiente', sortable: true },
            { key: 'responsable', label: 'Responsable', sortable: true },
            { key: 'diasPendiente', label: 'Días Pendiente', sortable: true },
            { key: 'prioridad', label: 'Prioridad', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 3) return 'info';
            if (num <= 5) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchDocumentosPendientes
    },
    {
        id: 'ie-valor-total',
        category: 'import-export',
        title: 'Valor Total',
        type: 'summary',
        hint: 'En tránsito',
        colorCriteria: (value) => {
            const str = String(value).replace(/[^\d.]/g, '');
            const num = parseFloat(str);
            if (num >= 1000000) return 'success';
            if (num >= 500000) return 'info';
            return 'warn';
        },
        fetchData: kpiFetchers.fetchImportExportValorTotal
    },
    {
        id: 'ie-dias-promedio',
        category: 'import-export',
        title: 'Días Promedio',
        type: 'summary',
        hint: 'Tiempo despacho',
        colorCriteria: (value) => {
            const num = parseFloat(String(value));
            if (num <= 10) return 'success';
            if (num <= 15) return 'info';
            if (num <= 20) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchImportExportDiasPromedio
    },
    {
        id: 'ie-incidencias',
        category: 'import-export',
        title: 'Incidencias',
        type: 'table',
        hint: 'Último mes',
        columns: [
            { key: 'numeroOperacion', label: 'N° Operación', sortable: true },
            { key: 'tipoIncidencia', label: 'Tipo Incidencia', sortable: true },
            { key: 'fechaIncidencia', label: 'Fecha', sortable: true },
            { key: 'descripcion', label: 'Descripción', sortable: false },
            { key: 'responsable', label: 'Responsable', sortable: true },
            { key: 'estado', label: 'Estado', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 3) return 'info';
            if (num <= 5) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchIncidencias
    },
    {
        id: 'ie-retenidas',
        category: 'import-export',
        title: 'Retenidas',
        type: 'table',
        hint: 'En aduana',
        columns: [
            { key: 'numeroImportacion', label: 'N° Importación', sortable: true },
            { key: 'motivoRetencion', label: 'Motivo Retención', sortable: false },
            { key: 'fechaRetencion', label: 'Fecha Retención', sortable: true },
            { key: 'diasRetenida', label: 'Días Retenida', sortable: true },
            { key: 'accionRequerida', label: 'Acción Requerida', sortable: false },
            { key: 'responsable', label: 'Responsable', sortable: true }
        ],
        colorCriteria: (value) => {
            const num = Number(value);
            if (num === 0) return 'success';
            if (num <= 2) return 'warn';
            return 'danger';
        },
        fetchData: kpiFetchers.fetchImportacionesRetenidas
    }
];

// ============================================================================
// EXPORTAR TODOS LOS KPIs
// ============================================================================

export const ALL_KPIS: KpiConfig[] = [
    ...COTIZACIONES_KPIS,
    ...COMPRAS_KPIS,
    ...IMPORT_EXPORT_KPIS
];

export const getKpiById = (id: string): KpiConfig | undefined => {
    return ALL_KPIS.find(kpi => kpi.id === id);
};