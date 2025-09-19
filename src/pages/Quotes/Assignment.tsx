// pages/Quotes/Assignment.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Filters, { QuoteFilters } from "../../components/quotes/filters";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";

// Modelo base (alineado con Nueva cotización)
type AssignmentRequest = {
  id: string;
  reference: string;
  finalClient: string;
  createdAt: string;   // ISO YYYY-MM-DD
  deadline: string;    // ISO YYYY-MM-DD
  requestType: "licitaciones" | "proyectos" | "suministros" | "inventarios";
  scope: "nacional" | "internacional";
  deliveryPlace: "almacen" | "proyecto";
  projectId?: string;
  comments: string;
  assignedTo?: string;
};

type Urgency = "critical" | "high" | "medium" | "low" | "normal";
type AlertVariant = "success" | "error" | "warning" | "info";

// ---- Utilidades de urgencia (5 niveles) ----
const getUrgency = (isoDeadline: string): Urgency => {
  const days = Math.floor((new Date(isoDeadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return "critical";   // vencida
  if (days <= 1) return "high";      // 0–1 día
  if (days <= 3) return "medium";    // 2–3 días
  if (days <= 7) return "low";       // 4–7 días
  return "normal";                   // > 7 días
};

const urgencyToAlert: Record<Urgency, AlertVariant> = {
  critical: "error",    // rojo
  high: "warning",      // amarillo
  medium: "info",       // azul
  low: "success",       // verde
  normal: "success",    // verde
};

// añade helper
const detailTextColor: Record<Urgency, string> = {
  //el normal sera Blanco si el fondo es oscuro y Gris oscuro si el fondo es claro
  normal: "text-gray-700 dark:text-gray-300",
  critical: "text-gray-700 dark:text-gray-300",
  high: "text-gray-700 dark:text-gray-300",
  medium: "text-gray-700 dark:text-gray-300",
  low: "text-gray-700 dark:text-gray-300",
};

// --- estilos del pill a la derecha ---
const urgencyPill: Record<Urgency, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  low: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
  normal: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
};

const urgencyLabel = (u: Urgency) =>
  u === "critical" ? "Crítica" :
    u === "high" ? "Alta" :
      u === "medium" ? "Media" :
        u === "low" ? "Baja" : "Normal";

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "2-digit", year: "2-digit" })
    .format(new Date(date));

// ---- Mock de datos (6) ----
const MOCK: AssignmentRequest[] = [
  {
    id: "REQ-2025-0012",
    reference: "REF-UPS-1KVA",
    finalClient: "Acme SA",
    createdAt: "2025-09-10",
    deadline: "2025-10-20",
    requestType: "proyectos",
    scope: "nacional",
    deliveryPlace: "almacen",
    comments: "UPS de respaldo para planta solar.",
  },
  {
    id: "REQ-2025-0011",
    reference: "REF-GEN-DIESEL-30KVA",
    finalClient: "Globex",
    createdAt: "2025-09-09",
    deadline: "2025-09-20",
    requestType: "suministros",
    scope: "internacional",
    deliveryPlace: "proyecto",
    projectId: "PRJ-002",
    comments: "Generador diesel con entrega en sitio.",
  },
  {
    id: "REQ-2025-0010",
    reference: "REF-CABLE-CAT6",
    finalClient: "Walmart",
    createdAt: "2025-09-08",
    deadline: "2025-09-22",
    requestType: "inventarios",
    scope: "nacional",
    deliveryPlace: "almacen",
    comments: "Cableado estructurado para nueva tienda.",
    assignedTo: "Carlos",
  },
  {
    id: "REQ-2025-0009",
    reference: "REF-SERV-MANTTO",
    finalClient: "Initech",
    createdAt: "2025-09-07",
    deadline: "2025-09-30",
    requestType: "proyectos",
    scope: "internacional",
    deliveryPlace: "proyecto",
    projectId: "PRJ-003",
    comments: "Mantenimiento preventivo anual.",
    assignedTo: "Ana",
  },
  {
    id: "REQ-2025-0008",
    reference: "REF-SW-24P-POE",
    finalClient: "Umbrella Corp",
    createdAt: "2025-09-06",
    deadline: "2025-09-18",
    requestType: "proyectos",
    scope: "nacional",
    deliveryPlace: "almacen",
    comments: "Conmutadores PoE para centro de datos.",
  },
  {
    id: "REQ-2025-0007",
    reference: "REF-GEN-DIESEL-30KVA",
    finalClient: "Soylent",
    createdAt: "2025-09-05",
    deadline: "2025-09-25",
    requestType: "suministros",
    scope: "internacional",
    deliveryPlace: "almacen",
    comments: "Entrega inmediata requerida.",
    assignedTo: "Luis",
  },
];

export default function QuotesAssignment() {
  const navigate = useNavigate();

  // Filtros del módulo
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

  // Datos en memoria (conectarse a API después)
  const [data] = useState<AssignmentRequest[]>(MOCK);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Orden por prioridad (vencidas y próximas primero)
  const sorted = useMemo(() => {
    const score = (r: AssignmentRequest) => {
      const days = (new Date(r.deadline).getTime() - Date.now()) / 86400000;
      if (days < 0) return -2;   // más urgente
      if (days <= 1) return -1;
      return days;               // mayor = menos urgente
    };
    return [...data].sort((a, b) => score(a) - score(b));
  }, [data]);

  // Split por estado de asignación
  const pending = sorted.filter(r => !r.assignedTo);
  const assigned = sorted.filter(r => r.assignedTo);

  // Filtro básico por preset de fecha de creación
  const applyPreset = (list: AssignmentRequest[]) => {
    const now = new Date();
    const min = (() => {
      if (filters.preset === "7d") { const d = new Date(now); d.setDate(d.getDate() - 7); return +d; }
      if (filters.preset === "30d") { const d = new Date(now); d.setDate(d.getDate() - 30); return +d; }
      if (filters.preset === "90d") { const d = new Date(now); d.setDate(d.getDate() - 90); return +d; }
      return 0;
    })();
    return min ? list.filter(r => +new Date(r.createdAt) >= min) : list;
  };

  const pendingFiltered = applyPreset(pending);
  const assignedFiltered = applyPreset(assigned);

  const selected = useMemo(
    () => sorted.find(r => r.id === selectedId) ?? null,
    [sorted, selectedId]
  );

  // Render de una fila
  const Row = ({ req }: { req: AssignmentRequest }) => {
    const u = getUrgency(req.deadline);
    const variant = urgencyToAlert[u];
    const diffDays = Math.floor((new Date(req.deadline).getTime() - Date.now()) / 86400000);
    return (
      <li
        className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"
        onClick={() => setSelectedId(req.id)}
      >
        <div className="flex items-start gap-2">
          <Alert
            variant={variant}
            title={`${req.id} – ${req.finalClient}`}
            message={`${req.assignedTo ? `Asignado a ${req.assignedTo} • ` : ""}Vence ${formatDate(req.deadline)}${diffDays >= 0 ? ` • ${diffDays} día${diffDays === 1 ? "" : "s"} restantes` : " • Atrasada"}`}
          />
          <span className={`mt-1 px-2 py-0.5 rounded-full text-xs shrink-0 ${urgencyPill[u]}`}>
            {urgencyLabel(u)}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{req.comments}</div>
      </li>
    );
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

      {/* Filtros (reutiliza tu componente) */}
      <div className="mb-6">
        <Filters
          value={filters}
          onChange={setFilters}
          proyectos={[
            { id: "PRJ-001", nombre: "Planta Solar Choluteca" },
            { id: "PRJ-002", nombre: "Hospital SPS" },
            { id: "PRJ-003", nombre: "Data Center TGU" },
          ]}
          usuarios={[
            { id: "Ana", nombre: "Ana" },
            { id: "Carlos", nombre: "Carlos" },
            { id: "Luis", nombre: "Luis" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listas */}
        <div className="lg:col-span-2 space-y-6">
          <ComponentCard title="Pendientes">
            {pendingFiltered.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 p-4">Sin pendientes.</p>
            ) : (
              <ul className="space-y-2">
                {pendingFiltered.map((r) => <Row key={r.id} req={r} />)}
              </ul>
            )}
          </ComponentCard>

          <ComponentCard title="Asignadas">
            {assignedFiltered.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 p-4">Sin asignadas.</p>
            ) : (
              <ul className="space-y-2">
                {assignedFiltered.map((r) => <Row key={r.id} req={r} />)}
              </ul>
            )}
          </ComponentCard>
        </div>

        {/* Detalle */}
        <div className="lg:col-span-1">
          <ComponentCard title="Detalle">
            {!selected ? (
              <p className="text-gray-500 dark:text-gray-400 p-4">
                Selecciona una solicitud para ver sus detalles.
              </p>
            ) : (
              <div className={`space-y-3 p-2 ${detailTextColor[getUrgency(selected.deadline)]}`}>
                <h3 className="text-lg font-medium">
                  {selected.id} – {selected.finalClient}
                </h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                    <div className="text-xs opacity-70">Referencia</div>
                    <div className="font-medium">{selected.reference}</div>
                  </div>
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                    <div className="text-xs opacity-70">Tipo</div>
                    <div className="font-medium capitalize">{selected.requestType}</div>
                  </div>
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                    <div className="text-xs opacity-70">Creada</div>
                    <div className="font-medium">{formatDate(selected.createdAt)}</div>
                  </div>
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                    <div className="text-xs opacity-70">Fecha límite</div>
                    <div className="font-medium">{formatDate(selected.deadline)}</div>
                  </div>
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                    <div className="text-xs opacity-70">Entrega</div>
                    <div className="font-medium">
                      {selected.deliveryPlace === "almacen" ? "Almacén" : "Proyecto"}
                    </div>
                  </div>
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                    <div className="text-xs opacity-70">Asignado a</div>
                    <div className="font-medium">{selected.assignedTo ?? "Sin asignar"}</div>
                  </div>
                </div>

                {selected.projectId && (
                  <p className="text-sm">
                    <span className="font-medium">Proyecto:</span> {selected.projectId}
                  </p>
                )}

                <p className="text-sm">
                  <span className="font-medium">Comentarios:</span> {selected.comments}
                </p>

                <div className="pt-2 flex gap-2">
                  {selected.assignedTo ? (
                    <Button size="sm" variant="outline">Reasignar</Button>
                  ) : (
                    <Button size="sm" variant="primary">Asignar</Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate("/quotes/follow-ups", {
                        state: { fromAssignment: true, selected },
                      })
                    }
                  >
                    Dar seguimiento
                  </Button>
                </div>
              </div>

            )}
          </ComponentCard>
        </div>

      </div>
    </>
  );
}
