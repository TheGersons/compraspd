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
  quoteDeadline: string;
  requestCategory: requestCategory;
  procuremet: Scope;              // <- typo preservado
  deliveryPlace: DeliveryPlace;   // derivado de deliveryType
  projectId?: string;
  description: string;
  assignedTo?: string;            // nombre de la persona asignada o undefined
  // extras útiles
  assignedToId?: string;
  progress?: number;
  followStatus?: string;
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
  assignments: Array<{
    id: string;
    assignedToId: string | null;
    progress: number | null;
    followStatus: string | null;
    assignedTo: { id: string; fullName: string } | null;
  }>;
};


interface UrgencyConfig {
  variant: AlertVariant;
  pill: string;
  label: string;
  textColor: string;
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
  },
  high: {
    variant: "warning",
    pill: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    label: "Alta",
    textColor: "text-gray-700 dark:text-gray-300",
  },
  medium: {
    variant: "info",
    pill: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
    label: "Media",
    textColor: "text-gray-700 dark:text-gray-300",
  },
  low: {
    variant: "success",
    pill: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
    label: "Baja",
    textColor: "text-gray-700 dark:text-gray-300",
  },
  normal: {
    variant: "success",
    pill: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
    label: "Normal",
    textColor: "text-gray-700 dark:text-gray-300",
  },
};
/*
const MOCK_DATA: AssignmentRequest[] = [
  {
    id: "REQ-2025-0012",
    reference: "REF-UPS-1KVA",
    finalClient: "Acme SA",
    createdAt: "2025-09-10",
    deadline: "2025-10-20",
    requestCategory: "proyectos",
    scope: "nacional",
    deliveryPlace: "almacen",
    description: "UPS de respaldo para planta solar.",
  },
];

*/

const MOCK_PROJECTS = [
  { id: "PRJ-001", nombre: "Planta Solar Choluteca" },
  { id: "PRJ-002", nombre: "Hospital SPS" },
  { id: "PRJ-003", nombre: "Data Center TGU" },
];

const MOCK_USERS = [
  { id: "Ana", nombre: "Ana" },
  { id: "Carlos", nombre: "Carlos" },
  { id: "Luis", nombre: "Luis" },
];

//const cotizaciones = ObtenerCotizaciones();

// ============================================================================
// UTILITIES
// ============================================================================
//const formatDate = (date: string): string =>
//  new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "2-digit", year: "2-digit" })
//    .format(new Date(date));


const calculateDaysDifference = (deadline: string): number => {
  return Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
};

const getUrgency = (deadline: string): Urgency => {
  const days = calculateDaysDifference(deadline);

  if (days < 0) return "critical";
  if (days <= 1) return "high";
  if (days <= 3) return "medium";
  if (days <= 7) return "low";
  return "normal";
};



const calculateUrgencyScore = (request: AssignmentRequest): number => {
  const days = calculateDaysDifference(request.quoteDeadline);
  if (days < 0) return -2;
  if (days <= 1) return -1;
  return days;
};

//const getDeadlineMessage = (quoteDeadline: string): string => {
//  const diffDays = calculateDaysDifference(quoteDeadline);

//  console.log("Deadline:", quoteDeadline);
//  const formattedDate = FormatDateApi(quoteDeadline);

//  console.log("Formatted Date:", formattedDate);

//  if (diffDays < 0) return `Vence ${formattedDate} • Atrasada`;
//  return `Vence ${formattedDate} • ${diffDays} día${diffDays === 1 ? "" : "s"} restantes`;
//};

// ============================================================================
// HOOKS
// ============================================================================

const useFilteredRequests = (
  requests: AssignmentRequest[],
  filters: QuoteFilters
) => {
  return useMemo(() => {
    const now = new Date();
    let minDate = 0;

    if (filters.preset === "7d") {
      const d = new Date(now); d.setDate(d.getDate() - 7);  minDate = +d;
    } else if (filters.preset === "30d") {
      const d = new Date(now); d.setDate(d.getDate() - 30); minDate = +d;
    } else if (filters.preset === "90d") {
      const d = new Date(now); d.setDate(d.getDate() - 90); minDate = +d;
    }

    const safeTime = (iso: string) => {
      const t = +new Date(iso);
      return Number.isFinite(t) ? t : 0;
    };

    return minDate
      ? requests.filter(r => safeTime(r.createdAt) >= minDate)
      : requests;
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
    const pending   = requests.filter(r => !r.assignedTo);
    const assigned  = requests.filter(r => !!r.assignedTo);
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
  const urgency = getUrgency(request.quoteDeadline);
  const config = URGENCY_CONFIG[urgency];

  return (
    <li
      className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
      onClick={() => onSelect(request.id)}
    >
      <div className="flex items-start gap-2">
        <Alert
          variant={config.variant}
          title={`${request.requestCategory} – ${request.finalClient}`}
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
}

const RequestList = ({
  title,
  requests,
  onSelectRequest,
  emptyMessage = "No hay solicitudes.",
}: RequestListProps) => {
  return (
    <ComponentCard title={title}>
      {requests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 p-4">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <RequestRow key={req.id} request={req} onSelect={onSelectRequest} />
          ))}
        </ul>
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

  const urgency = getUrgency(request.quoteDeadline);
  const config = URGENCY_CONFIG[urgency];

  return (
    <ComponentCard title="Detalle">
      <div className={`space-y-3 p-2 ${config.textColor}`}>
        <h3 className="text-lg font-medium">
          {request.id} – {request.finalClient}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <DetailField label="Referencia" value={request.reference} />
          <DetailField
            label="Tipo"
            value={request.requestCategory.charAt(0).toUpperCase() + request.requestCategory.slice(1)}
          />
          <DetailField label="Creada" value={FormatDateApi(request.createdAt)} />
          <DetailField label="Fecha límite" value={FormatDateApi(request.quoteDeadline)} />
          <DetailField
            label="Entrega"
            value={request.deliveryPlace === "almacen" ? "Almacén" : "Proyecto"}
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
          <span className="font-medium">Comentarios:</span> {request.description}
        </p>

        <div className="pt-2 flex gap-2">
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
      </div>
    </ComponentCard>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default  function QuotesAssignment() {
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

  // Event handlers
  const handleAssign = () => {
    console.log("Asignar solicitud:", selectedRequest);
    // TODO: Implementar lógica de asignación
  };

  const handleReassign = () => {
    console.log("Reasignar solicitud:", selectedRequest);
    // TODO: Implementar lógica de reasignación
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

        <div className="lg:col-span-1">
          <RequestDetail
            request={selectedRequest}
            onAssign={handleAssign}
            onReassign={handleReassign}
            onFollowUp={handleFollowUp}
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

      const finalClientName =
        r.finalClient ??
        'Cliente no especificado';

      const createdAt = FormatDateApi(r.createdAt) || r.createdAt;
      const quoteDeadline = FormatDateApi(r.quoteDeadline) || r.quoteDeadline;

      return {
        id: r.id,
        reference: r.reference,
        finalClient: finalClientName,
        createdAt,
        quoteDeadline,
        requestCategory: r.requestCategory as unknown as requestCategory,
        procuremet: toScope(r.procurement),
        deliveryPlace: toDeliveryPlace(r.deliveryType),
        description: r.description ?? '',
        assignedTo: first?.assignedTo?.fullName ?? undefined,
        assignedToId: first?.assignedToId ?? undefined,
        progress: first?.progress ?? 0,
        followStatus: first?.followStatus ?? 'UNASSIGNED',
      };
    });
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    return [];
  }
}
