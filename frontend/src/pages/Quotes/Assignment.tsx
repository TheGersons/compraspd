// pages/Quotes/Assignment.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Filters, { QuoteFilters } from "../../components/quotes/filters";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { api } from "../../lib/api";
import { FormatDateApi } from "../../lib/FormatDateApi"
import getDeadlineMessage from "./lib/Deadline";




// ============================================================================
// TYPES
// ============================================================================

type requestCategory = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type Scope = "nacional" | "internacional" | "NACIONAL" | "INTERNACIONAL";
type DeliveryPlace = "almacen" | "proyecto";
type Urgency = "critical" | "high" | "medium" | "low" | "normal";
type AlertVariant = "success" | "error" | "warning" | "info";

interface AssignmentRequest {
  id: string;
  reference: string;
  finalClient: string;            // siempre string
  createdAt: string;
  quoteDeadlineISO: string;
  quoteDeadline: string;
  requestCategory: requestCategory;
  procuremet: Scope;              // <- typo preservado
  deliveryPlace: DeliveryPlace;   // derivado de deliveryType
  projectId?: string;
  description: string;
  assignedTo?: string;
  requesterName: string;          // nombre de la persona asignada o undefined
  // extras útiles
  assignedToId?: string;
  progress?: number;
  followStatus?: string;
  items?: RequestItem[];
}

type ApiPurchaseRequest = {
  id: string;
  reference: string;
  createdAt: string;
  quoteDeadline: string;
  requestCategory: string;     // "SUMINISTROS" | ...
  procurement: string;         // "NATIONAL" | "INTERNATIONAL"
  deliveryType: string;        // "WAREHOUSE" | "PROJECT"
  description: string | null;
  finalClient: string;
  items: Array<{
    id: string;
    sku?: string;
    description: string;
    quantity: number;
    unit: string;
    extraSpecs?: Record<string, any>;
  }>[][] | null;
  requester: {
    id: string;
    fullName: string;
  };
  assignments: Array<{
    id: string;
    assignedToId: string | null;
    progress: number | null;
    followStatus: string | null;
    assignedTo: { id: string; fullName: string } | null;
  }>;
};

type Supervisor = {
  id: string;
  fullName: string;
  email: string;
}


interface UrgencyConfig {
  variant: AlertVariant;
  pill: string;
  label: string;
  textColor: string;
  borderClass?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const URGENCY_CONFIG: Record<Urgency, UrgencyConfig> = {
  critical: {
    variant: "error",
    pill: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
    label: "Crítica",
    textColor: "text-gray-700 dark:text-gray-300",
    borderClass: "border-l-4 border-red-600 bg-red-50/50 hover:bg-red-100/70",
  },
  high: {
    variant: "warning",
    pill: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    label: "Alta",
    textColor: "text-gray-700 dark:text-gray-300",
    borderClass: "border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-100/70",
  },
  medium: {
    variant: "info",
    pill: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
    label: "Media",
    textColor: "text-gray-700 dark:text-gray-300",
    borderClass: "border-l-4 border-blue-500 bg-blue-50/50 hover:bg-blue-100/70",
  },
  low: {
    variant: "success",
    pill: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
    label: "Baja",
    textColor: "text-gray-700 dark:text-gray-300",
    borderClass: "border-l-4 border-green-500 bg-green-50/50 hover:bg-green-100/70",
  },
  normal: {
    variant: "success",
    pill: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
    label: "Normal",
    textColor: "text-gray-700 dark:text-gray-300",
    borderClass: "border-l-4 border-gray-300 bg-white hover:bg-gray-50",
  },
};


const calculateDaysDifference = (deadline: string): number => {
  return Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
};

const getUrgency = (deadline: string): Urgency => {
  const days = calculateDaysDifference(deadline);

  if (days < 0) return "critical"; // Vencida
  if (days <= 1) return "high";     // Hoy y mañana
  if (days <= 5) return "medium";   // 2 a 5 días
  if (days <= 14) return "low";     // 6 a 14 días
  return "normal";                  // Más de 14 días
};


const calculateUrgencyScore = (request: AssignmentRequest): number => {
  const days = calculateDaysDifference(request.quoteDeadlineISO);
  if (days < 0) return -2;
  if (days <= 1) return -1;
  return days;
};

// ============================================================================
// HOOKS
// ============================================================================

// Asegúrate de que calculateDaysDifference esté importada y use el string ISO.

const useFilteredRequests = (
  requests: AssignmentRequest[],
  filters: QuoteFilters
) => {
  return useMemo(() => {
    // 1. Determinar el número MÁXIMO de días restantes permitidos
    //    Si el preset es '7d', queremos requests que venzan en 7 días o menos (incluyendo vencidas).

    let maxDays: number | null = null;

    if (filters.preset === "7d") {
      maxDays = 7;
    } else if (filters.preset === "30d") {
      maxDays = 30;
    } else if (filters.preset === "90d") {
      maxDays = 90;
    }

    // Si no hay un filtro de días activo, retorna la lista completa
    if (maxDays === null) {
      return requests;
    }

    // 2. Filtrar
    return requests.filter((r) => {
      // Obtiene los días restantes (positivos para futuro, 0 para hoy, negativos para vencidas)
      const diffDays = calculateDaysDifference(r.quoteDeadlineISO);
      // Ejemplo: si maxDays es 7, esto incluye: -5 (vencida), 0 (hoy), 7 (en 7 días).
      return diffDays <= maxDays;
    });
  }, [requests, filters.preset]);
};

const useSortedRequests = (requests: AssignmentRequest[]) => {
  return useMemo(() => {
    return [...requests].sort((a, b) => {
      const sa = Number.isFinite(calculateUrgencyScore(a)) ? calculateUrgencyScore(a) : 0;
      const sb = Number.isFinite(calculateUrgencyScore(b)) ? calculateUrgencyScore(b) : 0;
      return sa - sb;
    });
  }, [requests]);
};

const usePartitionedRequests = (requests: AssignmentRequest[]) => {
  return useMemo(() => {
    const pending = requests.filter(r => !r.assignedTo);
    const assigned = requests.filter(r => !!r.assignedTo);
    return { pending, assigned };
  }, [requests]);
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface RequestRowProps {
  request: AssignmentRequest;
  onSelect: (id: string) => void;
}

const RequestRow = ({ request, onSelect }: RequestRowProps) => {
  const urgency = getUrgency(request.quoteDeadlineISO);
  const config = URGENCY_CONFIG[urgency];

  return (
    <li
      className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
      onClick={() => onSelect(request.id)}
    >
      <div className="flex items-start gap-2">
        <Alert
          variant={config.variant}
          title={`${request.requestCategory} – ${request.requesterName}`}
          message={`${request.assignedTo ? `Asignado a ${request.assignedTo} • ` : ""
            }${getDeadlineMessage(request.quoteDeadline)}`}
        />
        <span
          className={`mt-1 px-2 py-0.5 rounded-full text-xs shrink-0 ${config.pill}`}
        >
          {config.label}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {request.description}
      </div>
    </li>
  );
};

interface RequestListProps {
  title: string;
  requests: AssignmentRequest[];
  onSelectRequest: (id: string) => void;
  emptyMessage?: string;
  itemsPerPage?: number;
}

const RequestList = ({
  title,
  requests,
  onSelectRequest,
  emptyMessage = "No hay solicitudes.",
  itemsPerPage = 4,
}: RequestListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  //ordenar requests por urgencia
  const sortedRequests = useSortedRequests(requests);

  // Calcular paginación
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

  //imprimimos la sorted requests para debug
  useEffect(() => {
    console.log("Sorted Requests:", sortedRequests);
    console.log("Paginated Requests:", paginatedRequests);
    console.log("Requests", requests);
    console.log("lengths:", { sorted: sortedRequests.length, paginated: paginatedRequests.length, original: requests.length });
  }, [sortedRequests]);

  // Resetear a página 1 si hay cambios en los requests
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <ComponentCard title={title}>
      {requests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 p-4">{emptyMessage}</p>
      ) : (
        <>
          {/* Lista paginada */}
          <ul className="space-y-2">
            {paginatedRequests.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                onSelect={onSelectRequest}
              />
            ))}
          </ul>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 dark:text-gray-300">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {startIndex + 1} - {Math.min(endIndex, requests.length)} de {requests.length}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                >
                  ← Anterior
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 text-sm rounded ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </ComponentCard>
  );
};

interface DetailFieldProps {
  label: string;
  value: string;
}

const DetailField = ({ label, value }: DetailFieldProps) => {
  return (
    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
};

interface RequestDetailProps {
  request: AssignmentRequest | null;
  onAssign: () => void;
  onReassign: () => void;
  onFollowUp: () => void;
}

interface RequestItem {
  id: string;
  sku?: string;
  description: string;
  quantity: number;
  unit: string;
  extraSpecs?: Record<string, any>;
}

const RequestDetail = ({
  request,
  onAssign,
  onReassign,
  onFollowUp,
}: RequestDetailProps) => {
  if (!request) {
    return (
      <ComponentCard title="Detalle">
        <p className="text-gray-500 dark:text-gray-400 p-4">
          Selecciona una solicitud para ver sus detalles.
        </p>
      </ComponentCard>
    );
  }

  const urgency = getUrgency(request.quoteDeadlineISO);
  const config = URGENCY_CONFIG[urgency];
  const items: RequestItem[] = request.items || [];

  return (
    <div className="space-y-6">
      {/* Card de Info General */}
      <ComponentCard title="Detalle General">
        <div className={`space-y-3 p-2 ${config.textColor}`}>
          <h3 className="text-lg font-medium">
            {request.requestCategory} – {request.requesterName}
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailField label="Referencia" value={request.reference} />
            <DetailField
              label="Tipo"
              value={
                request.requestCategory.charAt(0).toUpperCase() +
                request.requestCategory.slice(1)
              }
            />
            <DetailField
              label="Creada"
              value={FormatDateApi(request.createdAt)}
            />
            <DetailField
              label="Fecha límite"
              value={FormatDateApi(request.quoteDeadline)}
            />
            <DetailField
              label="Entrega"
              value={
                request.deliveryPlace === "almacen" ? "Almacén" : "Proyecto"
              }
            />
            <DetailField
              label="Asignado a"
              value={request.assignedTo ?? "Sin asignar"}
            />
          </div>

          {request.projectId && (
            <p className="text-sm">
              <span className="font-medium">Proyecto:</span> {request.projectId}
            </p>
          )}

          <p className="text-sm">
            <span className="font-medium">Comentarios:</span>{' '}
            {request.description || 'N/A'}
          </p>
        </div>
        {/* Card de Productos */}
      {items.length > 0 && (
        <ComponentCard
          title="Productos Solicitados"
          desc={`${items.length} producto${items.length !== 1 ? 's' : ''}`}
        >
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-sm table-auto">
              <thead className="sticky top-0 bg-white dark:bg-[#101828] z-10">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                    SKU
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                    Cantidad
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                    Unidad
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody className="align-top">
                {items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      {item.sku || '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-800 dark:text-gray-200">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-gray-800 dark:text-gray-200">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                      {item.unit}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      {item.extraSpecs ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 dark:text-blue-400 hover:underline">
                            Ver
                          </summary>
                          <pre className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(item.extraSpecs, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
        
      )}
      <div className="pt-2 flex gap-2 flex-wrap">
            {request.assignedTo ? (
              <Button size="sm" variant="outline" onClick={onReassign}>
                Reasignar
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={onAssign}>
                Asignar
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={onFollowUp}>
              Dar seguimiento
            </Button>
          </div>
      </ComponentCard>
    </div>
  );
};



const useSupervisors = (enabled: boolean) => {
  const [data, setData] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api<Supervisor[]>('/api/v1/users/supervisors');
        if (mounted) setData(res || []);
      } catch (e) {
        if (mounted) setError('No se pudieron cargar supervisores');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [enabled]);

  return { data, loading, error };
};

type SupervisorAssignModalProps = {
  open: boolean;
  defaultAssigneeId?: string | null;
  onClose: () => void;
  onSubmit: (assigneeId: string) => void;
  mode: 'assign' | 'reassign';
};

const SupervisorAssignModal = ({
  open, defaultAssigneeId, onClose, onSubmit, mode
}: SupervisorAssignModalProps) => {
  const { data: supervisors, loading, error } = useSupervisors(open);
  const [assigneeId, setAssigneeId] = useState<string>("");

  useEffect(() => {
    setAssigneeId(defaultAssigneeId ?? "");
  }, [defaultAssigneeId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-xl bg-white p-4 dark:bg-[#101828] dark:text-gray-100">
        <h3 className="text-base font-semibold mb-3">
          {mode === 'assign' ? 'Asignar solicitud' : 'Reasignar solicitud'}
        </h3>

        {loading && <p className="text-sm">Cargando supervisores…</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}

        {!loading && !error && (
          <select
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828]"
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
          >
            <option value="">Selecciona un supervisor…</option>
            {supervisors.map(u => (
              <option key={u.id} value={u.id}>
                {u.fullName} {u.email ? `(${u.email})` : ""}
              </option>
            ))}
          </select>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 text-sm rounded-lg border" onClick={onClose}>Cancelar</button>
          <button
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
            disabled={!assigneeId}
            onClick={() => onSubmit(assigneeId)}
          >
            {mode === 'assign' ? 'Asignar' : 'Reasignar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QuotesAssignment() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<QuoteFilters>({
    preset: "30d",
    estado: "todas",
    tipoSolicitud: "todas",
    tipoCompra: "todas",
    proyectoId: "todos",
    asignadoA: "todos",
    origen: "todos",
    ordenar: "recientes",
    q: "",
  });
  const [data, setData] = useState<AssignmentRequest[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevenir memory leaks

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await ObtenerCotizaciones();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup si se desmonta
    };
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Processing pipeline
  const sortedRequests = useSortedRequests(data);
  const { pending, assigned } = usePartitionedRequests(sortedRequests);
  const pendingFiltered = useFilteredRequests(pending, filters);
  const assignedFiltered = useFilteredRequests(assigned, filters);

  const selectedRequest = useMemo(
    () => sortedRequests.find((r) => r.id === selectedId) ?? null,
    [sortedRequests, selectedId]
  );

  //despues de click de seleccionar request, ir al inicio de la pagina
  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedId]);

  // Event handlers

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<'assign' | 'reassign'>('assign');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  const openAssign = () => {
    setAssignMode('assign');
    setSelectedAssigneeId(null);
    setAssignOpen(true);
  };
  const openReassign = () => {
    setAssignMode('reassign');
    setSelectedAssigneeId(selectedRequest?.assignedToId ?? null);
    setAssignOpen(true);
  };

  // enviar
  const submitAssign = async (assigneeId: string) => {
    if (!selectedRequest) return;

    try {
      await api('/api/v1/assignments', {
        method: 'POST',
        body: JSON.stringify({
          entityType: 'PURCHASE_REQUEST',
          entityId: selectedRequest.id,
          assignedToId: assigneeId,
          role: 'SUPERVISOR',
        }),
      });

      // 3) Notificar y refrescar
      alert("Solicitud asignada correctamente.");

      setAssignOpen(false);

      window.location.reload();

    } catch (err) {
      console.error("Error asignando:", err);
      const msg = err instanceof Error ? err.message : "Error desconocido";
      alert(`No se pudo asignar: ${msg}`);
    }
  };

  const handleFollowUp = () => {
    navigate("/quotes/follow-ups", {
      state: { fromAssignment: true, selected: selectedRequest },
    });
  };

  return (
    <>
      <PageMeta
        title="Asignación de solicitudes"
        description="Gestiona solicitudes pendientes y asignadas según prioridad y vencimiento"
      />

      <div className="pb-6">
        <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
          Asignación de solicitudes
        </h1>
      </div>

      <div className="mb-6">
        <Filters
          value={filters}
          onChange={setFilters}
          proyectos={MOCK_PROJECTS}
          usuarios={MOCK_USERS}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className={`${selectedRequest ? 'lg:col-span-2' : 'lg:col-span-5'} space-y-6`}>

          <RequestList
            title="Pendientes"
            requests={pendingFiltered}
            onSelectRequest={setSelectedId}
            emptyMessage="Sin pendientes."
          />

          <RequestList
            title="Asignadas"
            requests={assignedFiltered}
            onSelectRequest={setSelectedId}
            emptyMessage="Sin asignadas."
          />
        </div>

        <div className={`${selectedRequest ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <RequestDetail
            request={selectedRequest}
            onAssign={openAssign}
            onReassign={openReassign}
            onFollowUp={handleFollowUp}
          />

          <SupervisorAssignModal
            open={assignOpen}
            defaultAssigneeId={selectedAssigneeId}
            mode={assignMode}
            onClose={() => setAssignOpen(false)}
            onSubmit={submitAssign}
          />

        </div>
      </div>
    </>
  );
}
////////////////////
/*
  FUNCIONES PARA CONECTAR CON BACKEND
  - fetchAssignments(filters): Promise<AssignmentRequest[]>
  - assignRequest(requestId, userId): Promise<void>
  - reassignRequest(requestId, newUserId): Promise<void>
  - followUpRequest(requestId): void (navega a la página de seguimiento)
*/
async function ObtenerCotizaciones(): Promise<AssignmentRequest[]> {
  try {
    const raw = await api<ApiPurchaseRequest[]>('/api/v1/assignments');
    console.log("Cotizaciones obtenidas:", raw);

    const toScope = (p: string): Scope =>
      p === 'INTERNATIONAL' ? 'internacional' : 'nacional';

    const toDeliveryPlace = (d: string): DeliveryPlace =>
      d === 'PROJECT' ? 'proyecto' : 'almacen';

    return raw.map((r) => {
      const first = r.assignments?.[0] ?? null;

      

      const flattenItems = (nested: ApiPurchaseRequest["items"]): RequestItem[] => {
        if (!nested) return [];
        // Aplanar cualquier nivel de anidación
        const flat = (Array.isArray(nested) && (nested as any).flat)
          ? (nested as any).flat(Infinity)
          : ([] as any[]).concat(...(nested as any));
        return flat
          .filter(Boolean)
          .map((it: any): RequestItem => ({
            id: String(it.id),
            sku: it.sku ?? undefined,
            description: String(it.description ?? ''),
            quantity: Number(it.quantity ?? 0),
            unit: String(it.unit ?? ''),
            extraSpecs: it.extraSpecs ?? undefined,
          }));
      };

      const items: RequestItem[] = flattenItems(r.items);

      const finalClientName =
        r.finalClient ??
        'Cliente no especificado';

      const createdAt = FormatDateApi(r.createdAt) || r.createdAt;
      const quoteDeadlineISO = r.quoteDeadline;
      const quoteDeadline = FormatDateApi(r.quoteDeadline) || r.quoteDeadline;

      return {
        id: r.id,
        reference: r.reference,
        finalClient: finalClientName,
        createdAt,
        quoteDeadlineISO,
        quoteDeadline,
        requesterName: r.requester?.fullName ?? 'Solicitante no especificado',
        requestCategory: r.requestCategory as unknown as requestCategory,
        procuremet: toScope(r.procurement),
        deliveryPlace: toDeliveryPlace(r.deliveryType),
        description: r.description ?? '',
        assignedTo: first?.assignedTo?.fullName ?? undefined,
        assignedToId: first?.assignedToId ?? undefined,
        progress: first?.progress ?? 0,
        followStatus: first?.followStatus ?? 'UNASSIGNED',
        items,
      };
    });
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    return [];
  }
}
