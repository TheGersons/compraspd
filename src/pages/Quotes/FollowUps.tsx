// pages/Quotes/FollowUps.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";

// Tipos alineados con Assignment
type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type Scope = "nacional" | "internacional";
type DeliveryPlace = "almacen" | "proyecto";
type FollowStatus = "en_progreso" | "pausado" | "cancelado" | "finalizado";

type AssignmentRequest = {
  id: string;
  reference: string;
  finalClient: string;
  createdAt: string;  // ISO YYYY-MM-DD
  deadline: string;   // ISO YYYY-MM-DD
  requestType: RequestType;
  scope: Scope;
  deliveryPlace: DeliveryPlace;
  projectId?: string;
  comments: string;
  assignedTo: string; // en seguimiento solo trabajamos asignadas
};

type ChatFile = { name: string; size: number; type: string };
type ChatMsg = {
  id: string;
  role: "solicitante" | "encargado";
  text: string;
  at: string; // ISO
  files?: ChatFile[];
};

const formatDate = (date: string | number | Date) =>
  new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
    .format(new Date(date));

const shortDate = (date: string) =>
  new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "2-digit", year: "2-digit" })
    .format(new Date(date));

const MOCK_ASSIGNED: AssignmentRequest[] = [
  {
    id: "REQ-2025-0010",
    reference: "REF-CABLE-CAT6",
    finalClient: "Walmart",
    createdAt: "2025-09-08",
    deadline: "2025-09-16",
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
    deadline: "2025-09-09",
    requestType: "proyectos",
    scope: "internacional",
    deliveryPlace: "proyecto",
    projectId: "PRJ-003",
    comments: "Mantenimiento preventivo anual.",
    assignedTo: "Ana",
  },
  {
    id: "REQ-2025-0007",
    reference: "REF-GEN-DIESEL-30KVA",
    finalClient: "Soylent",
    createdAt: "2025-09-05",
    deadline: "2025-09-05",
    requestType: "suministros",
    scope: "internacional",
    deliveryPlace: "almacen",
    comments: "Entrega inmediata requerida.",
    assignedTo: "Luis",
  },
];

export default function QuotesFollowUps() {
  const { state } = useLocation() as { state?: { fromAssignment?: boolean; selected?: AssignmentRequest } };

  // Data base: en real, traer desde API y filtrar por assigned
  const [assignedList, setAssignedList] = useState<AssignmentRequest[]>(MOCK_ASSIGNED);

  // Selección actual
  const [current, setCurrent] = useState<AssignmentRequest | null>(null);

  // Estado de seguimiento
  const [status, setStatus] = useState<FollowStatus>("en_progreso");
  const [progress, setProgress] = useState<number>(0);
  const [eta, setEta] = useState<string>(""); // YYYY-MM-DD
  const [priorityRequested, setPriorityRequested] = useState<boolean>(false);

  // Chat
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState<string>("");
  const [files, setFiles] = useState<ChatFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Cargar seleccionado si viene desde Assignment
  useEffect(() => {
    if (state?.selected) {
      // Garantizar que esté en la lista
      setAssignedList(prev => {
        const exists = prev.some(p => p.id === state.selected!.id);
        return exists ? prev : [state.selected!, ...prev];
      });
      setCurrent(state.selected);
    }
  }, [state?.selected]);

  // Scroll al final al enviar/recibir
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const daysLeft = useMemo(() => {
    if (!current) return null;
    const diff = new Date(current.deadline).getTime() - Date.now();
    return Math.floor(diff / 86400000);
  }, [current]);

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const next: ChatFile[] = Array.from(list).map(f => ({ name: f.name, size: f.size, type: f.type }));
    setFiles(prev => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMsg = (role: ChatMsg["role"]) => {
    if (!input.trim() && files.length === 0) return;
    const msg: ChatMsg = {
      id: Math.random().toString(36).slice(2),
      role,
      text: input.trim(),
      at: new Date().toISOString(),
      files: files.length ? files : undefined,
    };
    setChat(prev => [...prev, msg]);
    setInput("");
    setFiles([]);
  };

  const removeDraftFile = (name: string) =>
    setFiles(prev => prev.filter(f => f.name !== name));

  const requestPriorityBump = () => {
    setPriorityRequested(true);
    alert("Solicitud de aumento de prioridad enviada.");
  };

  const actionSetStatus = (s: FollowStatus) => {
    setStatus(s);
    alert(`Estado actualizado a: ${s.replace("_", " ")}`);
  };

  return (
    <>
      <PageMeta
        title="Seguimiento de Solicitudes | Compras Energia PD"
        description="Esta es la página de seguimiento de solicitudes para Compras Energia PD"
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Seguimiento de solicitudes</h2>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: listado asignadas si no venimos con selección */}
          <div className="lg:col-span-1">
            <ComponentCard title="Asignadas">
              {assignedList.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 p-2">No hay solicitudes asignadas.</p>
              ) : (
                <ul className="space-y-2">
                  {assignedList.map(req => (
                    <li key={req.id}>
                      <button
                        className={`w-full text-left p-3 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 ${
                          current?.id === req.id ? "outline outline-2 outline-brand-500" : ""
                        }`}
                        onClick={() => setCurrent(req)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-medium truncate font-semibold text-black-800 dark:text-white/90">{req.id} – {req.finalClient}</div>
                            <div className="text-xs text-black-800 dark:text-white/90">
                              Asignado a {req.assignedTo} • Vence {shortDate(req.deadline)}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ComponentCard>
          </div>

          {/* Columna central: detalle + acciones */}
          <div className="lg:col-span-2 space-y-6">
            <ComponentCard title="Detalle">
              {!current ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 p-2">
                  Selecciona una solicitud asignada para ver su detalle.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-black-800 dark:text-white/90">
                        {current.id} – {current.finalClient}
                      </h3>
                      <div className="text-xs text-black-800 dark:text-white/90">
                        Referencia {current.reference} • Tipo {current.requestType} • Asignado a {current.assignedTo}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      Creada {shortDate(current.createdAt)}<br />
                      Límite {shortDate(current.deadline)}{daysLeft !== null ? ` • ${daysLeft >= 0 ? `${daysLeft} días restantes` : ` atrasada`}` : ""}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Entrega</div>
                      <div className="font-medium font-semibold text-black-800 dark:text-white/90">
                        {current.deliveryPlace === "almacen" ? "Almacén" : "Proyecto"}
                      </div>
                    </div>
                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Proyecto</div>
                      <div className="font-medium font-semibold text-black-800 dark:text-white/90">{current.projectId ?? "—"}</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Comentarios:</span> {current.comments}
                  </p>

                  {/* Progreso y ETA */}
                  <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs font-semibold text-black-800 dark:text-white/90 mb-1">Progreso (%)</div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm font-semibold text-black-800 dark:text-white/90 mt-1">{progress}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ETA (estimado)</div>
                      <input
                        type="date"
                        value={eta}
                        onChange={(e) => setEta(e.target.value)}
                        className="w-full rounded-md ring-1 ring-inset ring-gray-300 bg-white px-2 py-1 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        variant={priorityRequested ? "outline" : "primary"}
                        onClick={requestPriorityBump}
                        disabled={priorityRequested}
                      >
                        {priorityRequested ? "Solicitud enviada" : "Solicitar aumento de prioridad"}
                      </Button>
                    </div>
                  </div>

                  {/* Acciones de estado */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant={status === "en_progreso" ? "primary" : "outline"} onClick={() => actionSetStatus("en_progreso")}>
                      En progreso
                    </Button>
                    <Button variant={status === "pausado" ? "primary" : "outline"} onClick={() => actionSetStatus("pausado")}>
                      Pausar
                    </Button>
                    <Button variant={status === "cancelado" ? "primary" : "outline"} onClick={() => actionSetStatus("cancelado")}>
                      Cancelar
                    </Button>
                    <Button variant={status === "finalizado" ? "primary" : "outline"} onClick={() => actionSetStatus("finalizado")}>
                      Finalizar
                    </Button>
                  </div>
                </div>
              )}
            </ComponentCard>

            {/* Chat de seguimiento */}
            <ComponentCard title="Chat con solicitante">
              {!current ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 p-2">Selecciona una solicitud para chatear.</p>
              ) : (
                <div className="flex flex-col h-[420px]">
                  {/* Mensajes */}
                  <div className="flex-1 overflow-auto rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3 space-y-3">
                    {chat.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sin mensajes aún.</p>
                    ) : (
                      chat.map(m => (
                        <div
                          key={m.id}
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            m.role === "encargado"
                              ? "ml-auto bg-brand-500 text-white"
                              : "mr-auto ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <div className="text-[11px] opacity-70 mb-0.5">
                            {m.role === "encargado" ? current.assignedTo : current.finalClient} • {formatDate(m.at)}
                          </div>
                          {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                          {m.files && m.files.length > 0 && (
                            <ul className="mt-1 space-y-1">
                              {m.files.map(f => (
                                <li key={f.name} className="text-[12px] underline break-all">
                                  {f.name} <span className="opacity-70">({Math.round(f.size / 1024)} KB)</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Adjuntos en borrador */}
                  {files.length > 0 && (
                    <div className="mt-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adjuntos:</div>
                      <ul className="flex flex-wrap gap-2">
                        {files.map(f => (
                          <li key={f.name} className="text-xs rounded-md px-2 py-1 ring-1 ring-gray-200 dark:ring-gray-800">
                            {f.name}
                            <button className="ml-2 underline" onClick={() => removeDraftFile(f.name)}>quitar</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Composer */}
                  <div className="mt-2 flex items-end gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 min-h-[44px] max-h-40 rounded-lg ring-1 ring-inset ring-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
                      placeholder="Escribe un mensaje…"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleAttach}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Adjuntar
                    </Button>
                    <Button variant="primary" onClick={() => sendMsg("encargado")}>
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </ComponentCard>
          </div>
        </div>
      </div>
    </>
  );
}
