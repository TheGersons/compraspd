import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, X, FileText, CalendarIcon, ExternalLink } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { getToken } from "../../../lib/api";

// ============================================================================
// TYPES
// ============================================================================

type TimelineItemData = {
  estado: string;
  label: string;
  completado: boolean;
  fecha?: Date | string | null;
  fechaLimite?: Date | string | null;       // Fecha base (inmutable)
  fechaReal?: Date | string | null;         // Fecha real (editable por supervisor)
  tieneFechaReal?: boolean;                 // Si este estado tiene fecha real
  diasRetraso: number;
  enTiempo: boolean;
  evidencia?: string;
  tieneEvidencia: boolean;
  esNoAplica: boolean;
  // Documentos del sistema nuevo (opcional, para transición)
  documentos?: {
    totalRequeridos: number;
    completados: number;
    completo: boolean;
  };
};

type EstadoProductoData = {
  id: string;
  sku: string;
  cotizacionId?: string;
  proveedor?: string;
  timeline?: TimelineItemData[];
  cotizacion?: {
    id: string;
    tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
  };
  [key: string]: any;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Mapeo para evidencias (13 estados)
const EVIDENCE_CONFIG: Record<string, { dbField: string; storageType: string }> = {
  cotizado: { dbField: 'evidenciaCotizado', storageType: 'otros' },
  conDescuento: { dbField: 'evidenciaConDescuento', storageType: 'comprobantes_descuento' },
  aprobacionCompra: { dbField: 'evidenciaAprobacionCompra', storageType: 'evidencia_aprobacionCompra' },
  comprado: { dbField: 'evidenciaComprado', storageType: 'evidencia_comprado' },
  pagado: { dbField: 'evidenciaPagado', storageType: 'evidencia_pagado' },
  aprobacionPlanos: { dbField: 'evidenciaAprobacionPlanos', storageType: 'evidencia_aprobacionPlanos' },
  primerSeguimiento: { dbField: 'evidenciaPrimerSeguimiento', storageType: 'evidencia_primerSeguimiento' },
  enFOB: { dbField: 'evidenciaEnFOB', storageType: 'evidencia_enFOB' },
  cotizacionFleteInternacional: { dbField: 'evidenciaCotizacionFleteInternacional', storageType: 'evidencia_cotizacionFleteInternacional' },
  conBL: { dbField: 'evidenciaConBL', storageType: 'evidencia_conBL' },
  segundoSeguimiento: { dbField: 'evidenciaSegundoSeguimiento', storageType: 'evidencia_segundoSeguimiento' },
  enCIF: { dbField: 'evidenciaEnCIF', storageType: 'evidencia_enCIF' },
  recibido: { dbField: 'evidenciaRecibido', storageType: 'evidencia_recibido' }
};


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("es-HN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================================
// COMPONENT
// ============================================================================

interface TimelineItemProps {
  item: TimelineItemData;
  producto: EstadoProductoData;
  sku: string;
  onRefresh?: () => void;
}

export const TimelineItem = ({ item, producto, sku, onRefresh }: TimelineItemProps) => {
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [loadingDateUpdate, setLoadingDateUpdate] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  // ============================================================================
  // VALIDACIONES PARA EDICIÓN DE FECHA REAL
  // ============================================================================

  /**
   * Determina si la fecha REAL de este estado es editable.
   * Solo estados con tieneFechaReal=true, no completados, no N/A
   */
  const esFechaRealEditable = (): boolean => {
    if (!item.tieneFechaReal) return false;
    if (item.completado) return false;
    if (item.esNoAplica) return false;
    return true;
  };

  /**
   * Fecha mínima: hoy (no tiene sentido poner una fecha pasada como fecha real)
   */
  const calcularFechaMinima = (): Date | undefined => {
    // La mínima es la fecha real actual (no puede poner una fecha menor)
    if (item.fechaReal) {
      const fecha = new Date(item.fechaReal);
      fecha.setHours(0, 0, 0, 0);
      return fecha;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  };
  const calcularFechaMaxima = (): Date | undefined => {
    if (!producto.timeline) return undefined;
    const indexActual = producto.timeline.findIndex(t => t.estado === item.estado);
    if (indexActual >= 0 && indexActual < producto.timeline.length - 1) {
      const siguienteEstado = producto.timeline[indexActual + 1];
      // Usar fechaReal del siguiente si existe, sino fechaLimite
      const siguienteFecha = siguienteEstado.fechaReal || siguienteEstado.fechaLimite;
      if (siguienteFecha) {
        return new Date(siguienteFecha);
      }
    }
    return undefined;
  };


  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Actualizar fecha real via endpoint
   */
  const handleUpdateFechaReal = async (newDate: Date | undefined) => {
    if (!newDate) return;

    const fechaMinima = calcularFechaMinima();
    if (fechaMinima && newDate < fechaMinima) {
      toast.error("La fecha no puede ser anterior a hoy");
      return;
    }

    setLoadingDateUpdate(true);
    const toastId = toast.loading("Actualizando fecha real...");

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/estado-productos/${producto.id}/update-fecha-real`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: item.estado,
            nuevaFechaReal: newDate.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar fecha");
      }

      toast.success("Fecha real actualizada", { id: toastId });
      setIsDatePopoverOpen(false);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error("Error updating fecha real:", error);
      toast.error(error.message || "Error al actualizar fecha", { id: toastId });
    } finally {
      setLoadingDateUpdate(false);
    }
  };



  /**
   * Manejar acciones de evidencia (ver/descargar)
   */
  const handleEvidenceAction = async (action: 'view' | 'download') => {
    const config = EVIDENCE_CONFIG[item.estado];
    if (!config) {
      toast.error("Configuración de evidencia no encontrada");
      return;
    }

    const filenameOrUrl = producto[config.dbField];
    if (!filenameOrUrl) {
      toast.error("No se encontró el archivo");
      return;
    }

    // Si es URL pública
    if (filenameOrUrl.startsWith('http')) {
      let url = filenameOrUrl;
      if (action === 'download' && !url.endsWith('/download')) {
        url = `${url.replace(/\/$/, '')}/download`;
      }
      window.open(url, '_blank');
      setShowEvidenceModal(false);
      return;
    }

    // Archivo interno - usar backend proxy
    setLoadingEvidence(true);
    const toastId = toast.loading(action === 'view' ? "Cargando archivo..." : "Preparando descarga...");

    try {
      const token = getToken();
      const query = new URLSearchParams({
        cotizacionId: producto.cotizacion?.id || producto.cotizacionId || '',
        sku: sku,
        proveedor: producto.proveedor || 'SinProveedor',
        tipo: config.storageType,
        filename: filenameOrUrl,
        mode: action === 'view' ? 'inline' : 'attachment'
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/storage/download?${query.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Error al obtener archivo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.download = filenameOrUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, '_blank');
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      toast.dismiss(toastId);
      setShowEvidenceModal(false);
    } catch (error) {
      console.error("Error fetching file:", error);
      toast.error("Error al obtener el archivo", { id: toastId });
    } finally {
      setLoadingEvidence(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const fechaRealEditable = esFechaRealEditable();
  const fechaMinima = calcularFechaMinima();
  const fechaMaxima = calcularFechaMaxima();

  // Calcular diferencia entre fecha base y fecha real
  const calcularDiferencia = (): { dias: number; texto: string; color: string } | null => {
    if (!item.tieneFechaReal || !item.fechaLimite || !item.fechaReal) return null;
    const base = new Date(item.fechaLimite);
    const real = new Date(item.fechaReal);
    const diffDias = Math.round((real.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return null;
    return {
      dias: diffDias,
      texto: diffDias > 0 ? `+${diffDias}d` : `${diffDias}d`,
      color: diffDias > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400',
    };
  };

  const diferencia = calcularDiferencia();

  return (
    <>
      <div>
        <h5 className="font-medium text-gray-900 dark:text-white">
          {item.label || item.estado}
        </h5>

        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          {/* 1. Fecha de cumplimiento (si completado) */}
          {item.fecha && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              ✅ {formatDate(item.fecha)}
            </span>
          )}

          {/* 2. Fecha Base (SIEMPRE estática, inmutable) */}
          {item.fechaLimite && (
            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 cursor-default">
              <CalendarIcon size={14} />
              📌 Base: {formatDate(item.fechaLimite)}
            </span>
          )}

          {/* 3. Fecha Real (editable si aplica) */}
          {item.tieneFechaReal && item.fechaReal && (
            fechaRealEditable ? (
              // VISTA INTERACTIVA: Popover con calendario
              <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    disabled={loadingDateUpdate}
                    className="group flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 hover:underline transition-all cursor-pointer disabled:opacity-50"
                    title="Clic para modificar fecha real"
                  >
                    <CalendarIcon size={14} className="group-hover:scale-110 transition-transform" />
                    🎯 Real: {formatDate(item.fechaReal)}
                    <span className="ml-1 text-[10px] opacity-60">(editar)</span>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 z-[5001]" align="start">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Ajustar fecha real: {item.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      Base original: {formatDate(item.fechaLimite)}
                      {fechaMaxima && ` · Máximo: ${formatDate(fechaMaxima)}`}
                    </p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={item.fechaReal ? new Date(item.fechaReal) : undefined}
                    defaultMonth={item.fechaReal ? new Date(item.fechaReal) : undefined}
                    onSelect={handleUpdateFechaReal}
                    disabled={(date) => {
                      if (fechaMinima && date < fechaMinima) return true;
                      if (fechaMaxima && date > fechaMaxima) return true;
                      return false;
                    }}
                    locale={es}
                    initialFocus
                    classNames={{
                      day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-500",
                      day_today: "bg-blue-100 text-blue-900 font-bold dark:bg-blue-900/30 dark:text-blue-300",
                    }}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              // VISTA ESTÁTICA: Solo texto, no editable
              <span className="flex items-center gap-1 text-blue-400 dark:text-blue-500 cursor-default">
                <CalendarIcon size={14} />
                🎯 Real: {formatDate(item.fechaReal)}
                {item.completado && <span className="ml-1 text-[10px]">(completado)</span>}
              </span>
            )
          )}

          {/* 4. Indicador de diferencia Base vs Real */}
          {diferencia && (
            <span className={`text-[10px] font-medium ${diferencia.color}`}>
              {diferencia.texto} vs base
            </span>
          )}

          {/* 5. Documentos del sistema nuevo */}
          {item.documentos && item.documentos.totalRequeridos > 0 && (
            <Link
              to={`/shopping/documents?producto=${producto.id}`}
              className={`group flex items-center gap-1 transition-all hover:underline ${item.documentos.completo
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
                }`}
              title="Ver documentos de este estado"
            >
              <FileText size={14} className="group-hover:scale-110 transition-transform" />
              📄 {item.documentos.completados}/{item.documentos.totalRequeridos} docs
              <ExternalLink size={10} className="opacity-50" />
            </Link>
          )}

          {/* 5b. Evidencia del sistema viejo (compatibilidad) */}
          {!item.documentos && item.tieneEvidencia && (
            item.esNoAplica ? (
              <span className="text-gray-400 flex items-center gap-1">
                ➖ N/A
              </span>
            ) : (
              <button
                onClick={() => setShowEvidenceModal(true)}
                className="group flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline transition-all"
                title="Ver evidencia adjunta"
              >
                <FileText size={14} className="group-hover:scale-110 transition-transform" />
                📎 Ver evidencia
              </button>
            )
          )}
        </div>
      </div>

      {/* Modal de Evidencia */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                📎 Evidencia: {item.label}
              </h3>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                Selecciona una acción para el archivo
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleEvidenceAction('view')}
                  disabled={loadingEvidence}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all group disabled:opacity-50"
                >
                  <Eye className="w-7 h-7 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Ver Online</span>
                </button>

                <button
                  onClick={() => handleEvidenceAction('download')}
                  disabled={loadingEvidence}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all group disabled:opacity-50"
                >
                  <Download className="w-7 h-7 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Descargar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimelineItem;