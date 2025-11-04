import React, { useEffect, useMemo, useRef, useState, /*useCallback*/ } from "react";
import { useLocation } from "react-router-dom";
import { useMyRequests, useSendRequestChat, useRequestChat } from "./hooks/useMyRequests";
import { myRequestsApi } from "./services/myRequestsApi";
import { RequestedItemsTable } from "./components/RequestedItemsTable";
import { loadItems } from "./hooks/useAssignments";
//import { myRequestsApi } from "./services/myRequestsApi";

// ============================================================================
// TYPES
// ============================================================================

type FollowStatus = "SUMMITED" | "IN_PROGRESS" | "PAUSED" | "CANCELLED" | "COMPLETED";
type RequestCategory = "LICITACIONES" | "PROYECTOS" | "SUMINISTROS" | "INVENTARIOS";
type Procurement = "NACIONAL" | "INTERNACIONAL";
type DeliveryType = "ALMACEN" | "PROYECTO" | "WAREHOUSE" | "PROJECT";

type ChatFile = {
    id: string;
    name: string;
    sizeBytes: number;
    url: string;
};

type ChatMsg = {
    id: string;
    senderId: string;
    body?: string;
    createdAt: string;
    files: ChatFile[];
    sender?: {
        id: string;
        fullName: string;
    };
};

type Assignment = {
    id: string;
    progress: number;
    eta?: string;
    followStatus: FollowStatus;
    assignedTo: {
        fullName: string;
    };
};

type MyRequest = {
    id: string;
    reference: string;
    title: string;
    finalClient: string;
    createdAt: string;
    quotedeadline: string;
    requestCategory: RequestCategory;
    procurement: Procurement;
    deliveryType: DeliveryType;
    projectId: string | null;
    comments: string;
    status: string;
    assignment?: Assignment;
};

// ============================================================================
// UTILITIES
// ============================================================================

const formatDate = (date: string | number | Date | undefined | null) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";

    return new Intl.DateTimeFormat("es-HN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(d);
}

const shortDate = (date: string | undefined | null) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";

    return new Intl.DateTimeFormat("es-HN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    }).format(d);
}

const calculateDaysLeft = (quotedeadline: string | undefined | null): number => {
    if (!quotedeadline) return 99999;
    console.log(quotedeadline)
    const quotedeadlineDate = new Date(quotedeadline);
    if (isNaN(quotedeadlineDate.getTime())) return 99999;

    const diff = quotedeadlineDate.getTime() - Date.now();
    console.log(quotedeadlineDate)
    console.log(diff)
    return Math.floor(diff / 86400000);
};

const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
        PAUSED: { label: 'En pausa', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        IN_PROGRESS: { label: 'En Progreso', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        COMPLETED: { label: 'Completada', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
        REJECTED: { label: 'Rechazada', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    };

    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const RequestListItem = React.memo(({
    request,
    isSelected,
    onClick
}: {
    request: MyRequest;
    isSelected: boolean;
    onClick: () => void;
}) => {
    const statusBadge = getStatusBadge(request.status);
    const daysLeft = calculateDaysLeft(request.quotedeadline);
    console.log(daysLeft)
    return (
        <button
            className={`w-full text-left p-3 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isSelected ? "outline outline-2 outline-blue-500" : ""
                }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium truncate font-semibold text-black-800 dark:text-white/90">
                    {request.reference} — {request.finalClient}
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}>
                    {statusBadge.label}
                </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                {request.title}
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                    {request.assignment ? `Asignado a: ${request.assignment.assignedTo.fullName}` : 'Sin asignar'}
                </span>
                {daysLeft >= 0 && daysLeft < 99999 && (
                    <span className={`font-medium ${daysLeft <= 2 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {daysLeft} días
                    </span>
                )}
            </div>
        </button>
    );
});

const DetailHeader = React.memo(({
    current,
    daysLeft
}: {
    current: MyRequest;
    daysLeft: number;
}) => {
    const statusBadge = getStatusBadge(current.status);

    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-black-800 dark:text-white/90">
                        {current.reference} — {current.finalClient}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {current.title}
                    </p>
                    <div className="text-xs text-black-800 dark:text-white/90 mt-2">
                        Tipo {current.requestCategory} • {current.procurement}
                    </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}>
                    {statusBadge.label}
                </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Creada {shortDate(current.createdAt)}</span>
                <span>•</span>
                <span>Límite {shortDate(current.quotedeadline)}</span>
                {daysLeft >= 0 && daysLeft < 99999 && (
                    <>
                        <span>•</span>
                        <span className={daysLeft <= 2 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                            {daysLeft} días restantes
                        </span>
                    </>
                )}
            </div>
        </div>
    );
});

const ProgressIndicator = React.memo(({
    assignment
}: {
    assignment?: Assignment;
}) => {
    if (!assignment) {
        return (
            <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta solicitud aún no ha sido asignada a un supervisor.
                </p>
            </div>
        );
    }

    const statusMap: Record<string, { label: string; color: string }> = {
        IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-500' },
        PAUSED: { label: 'Pausada', color: 'bg-yellow-500' },
        CANCELLED: { label: 'Cancelada', color: 'bg-red-500' },
        COMPLETED: { label: 'Completada', color: 'bg-green-500' },
    };

    const status = statusMap[assignment.followStatus] || { label: assignment.followStatus, color: 'bg-gray-500' };

    return (
        <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Asignado a: {assignment.assignedTo.fullName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Estado: <span className="font-medium">{status.label}</span>
                    </div>
                </div>
                {assignment.eta && (
                    <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Finalización estimada</div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {shortDate(assignment.eta)}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Progreso: {assignment.progress}%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div
                        className={`h-full ${status.color} transition-all duration-300`}
                        style={{ width: `${assignment.progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
});

const ChatMessage = React.memo(({
    message,
    isFromCurrentUser,
    senderName
}: {
    message: ChatMsg;
    isFromCurrentUser: boolean;
    senderName: string;
}) => (
    <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${isFromCurrentUser
            ? "ml-auto bg-blue-500 text-white"
            : "mr-auto bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-50 ring-1 ring-gray-300 dark:ring-gray-700"
            }`}
    >

        <div className="text-[11px] opacity-70 mb-0.5">
            {senderName} • {formatDate(message.createdAt)}
        </div>
        {message.body && <div className="whitespace-pre-wrap">{message.body}</div>}
        {message.files?.length > 0 && (
            <ul className="mt-1 space-y-1">
                {message.files.map(f => (
                    <li key={f.id} className="text-[12px] underline break-all">
                        <a href={f.url} target="_blank" rel="noopener noreferrer">
                            {f.name}
                        </a>
                        <span className="opacity-70"> ({Math.round(f.sizeBytes / 1024)} KB)</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyQuotes() {
    type LocationState = {
        fromNewQuote?: boolean;
        selected?: MyRequest
    };
    const locationState = useLocation().state as LocationState | undefined;

    // React Query hooks
    const { data: requests = [], isLoading } = useMyRequests();
    const sendChatMutation = useSendRequestChat();

    // State
    const [current, setCurrent] = useState<MyRequest | null>(null);
    const [input, setInput] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Chat query - solo se ejecuta cuando hay un current seleccionado
    const { data: chat = [] } = useRequestChat(current?.id || null);

    // Derived state
    const daysLeft = useMemo(() =>
        current?.quotedeadline ? calculateDaysLeft(current.quotedeadline) : 0,
        [current]
    );

    const [isTableVisible, setIsTableVisible] = useState(false)
    const tableContentRef = useRef<HTMLDivElement>(null);
    const { data: items = [], } = loadItems(current?.id !== undefined ? current.id : null);

    const toggleTable = () => {
        setIsTableVisible(prev => !prev);
    }


    // Filter requests
    const filteredRequests = useMemo(() => {
        if (!searchQuery.trim()) return requests;

        const query = searchQuery.toLowerCase();
        return requests.filter(req =>
            req.reference.toLowerCase().includes(query) ||
            req.title.toLowerCase().includes(query) ||
            req.finalClient.toLowerCase().includes(query)
        );
    }, [requests, searchQuery]);


    // Handlers
    const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files;
        if (!list) return;
        setFiles(prev => [...prev, ...Array.from(list)]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const sendMsg = async () => {
        if (!current || (!input.trim() && files.length === 0)) return;

        try {
            let uploadedFiles: ChatFile[] = [];
            if (files.length > 0) {
                uploadedFiles = await myRequestsApi.uploadFiles(files);
            }

            const fileIds = uploadedFiles.map(f => f.id);
            await sendChatMutation.mutateAsync({
                requestId: current.id,
                body: input.trim() || null,
                fileIds
            });

            setInput("");
            setFiles([]);

            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Effects
    useEffect(() => {
        if (locationState?.selected) {
            setCurrent(locationState.selected);
            //} else if (requests.length > 0 && !current) {
            //setCurrent(requests[0]);
        }

    }, [locationState, requests, current]);

    if (isLoading) return <div className="p-6 text-center">Cargando mis solicitudes...</div>;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Mis Cotizaciones
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Realiza seguimiento a tus solicitudes de cotización
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request List */}
                <div className="lg:col-span-1">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 my-8 shadow-xl p-4">
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Buscar por referencia o cliente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white/90">
                            Mis Solicitudes ({filteredRequests.length})
                        </h3>

                        {!filteredRequests?.length ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {searchQuery ? 'No se encontraron solicitudes.' : 'No tienes solicitudes aún.'}
                            </p>
                        ) : (
                            <ul className="space-y-2 max-h-[600px] overflow-y-auto">
                                {/* filtar la lista para solo mostrar las cuyo estado es IN_PROGESS, PAUSED*/}

                                {filteredRequests.map(req => (

                                    <li key={req.id}>
                                        <RequestListItem
                                            request={req}
                                            isSelected={current?.id === req.id}
                                            onClick={() => setCurrent(req)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Detail & Chat */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detail Card */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 my-8 shadow-xl p-4">
                        <h3 className="font-semibold mb-4 text-gray-800 dark:text-white/90">Detalle de Solicitud</h3>
                        {!current ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selecciona una solicitud para ver los detalles.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <DetailHeader current={current} daysLeft={daysLeft} />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Entrega</div>
                                        <div className="font-semibold text-black-800 dark:text-white/90">
                                            {current.deliveryType === "WAREHOUSE" ? "Almacén" : "Proyecto"}
                                        </div>
                                    </div>
                                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Proyecto</div>
                                        <div className="font-semibold text-black-800 dark:text-white/90">
                                            {current.projectId ?? "—"}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Comentarios</div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {current.comments || "Sin comentarios"}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleTable}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                                                            ${isTableVisible
                                            ? 'bg-gray-400 text-gray-800 hover:bg-gray-500' // Estilo al mostrar
                                            : 'bg-blue-500 text-white hover:bg-blue-600'  // Estilo al ocultar
                                        }`}
                                >
                                    {/* 5. Cambiar el texto del botón */}
                                    {isTableVisible ? 'Ocultar productos' : `Ver ${items.length} productos solicitados`}
                                </button>

                                {/* 6. WRAPPER ANIMADO */}
                                <div
                                    ref={tableContentRef}
                                    style={{
                                        // Controla la altura. Si está visible, usa la altura real del contenido. Si no, 0.
                                        height: isTableVisible ? tableContentRef.current?.scrollHeight : 0,
                                    }}
                                    className="overflow-hidden transition-all duration-300 ease-in-out mt-4" // Clases de Tailwind para la animación
                                >
                                    {/* 7. Renderiza el componente de la tabla */}
                                    <RequestedItemsTable items={items} />
                                </div>

                                <ProgressIndicator assignment={current.assignment} />
                            </div>
                        )}
                    </div>

                    {/* Chat Card */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 my-8 shadow-xl p-4">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white/90">
                            Chat con {current?.assignment ? 'el supervisor' : 'el equipo'}
                        </h3>
                        {!current ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selecciona una solicitud para iniciar el chat.
                            </p>
                        ) : (
                            <div className="flex flex-col h-[420px]">
                                <div className="flex-1 overflow-auto rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3 space-y-3">
                                    {chat.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No hay mensajes aún. Inicia la conversación.
                                        </p>
                                    ) : (
                                        chat.map(m => {
                                            const isFromMe = m.sender?.fullName !== current.assignment?.assignedTo.fullName;
                                            return (
                                                <ChatMessage
                                                    key={m.id}
                                                    message={m}
                                                    isFromCurrentUser={isFromMe}
                                                    senderName={m.sender?.fullName || (isFromMe ? 'Tú' : 'Supervisor')}
                                                />
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {files.length > 0 && (
                                    <div className="mt-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adjuntos:</div>
                                        <ul className="flex flex-wrap gap-2">
                                            {files.map(f => (
                                                <li key={f.name} className="text-xs rounded-md px-2 py-1 ring-1 ring-gray-200 dark:ring-gray-800 dark:text-white">
                                                    {f.name}
                                                    <button
                                                        className="ml-2 underline text-red-500"
                                                        onClick={() => setFiles(prev => prev.filter(file => file.name !== f.name))}
                                                    >
                                                        quitar
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-2 flex items-end gap-2">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMsg();
                                            }
                                        }}
                                        className="flex-1 min-h-[44px] max-h-40 rounded-lg ring-1 ring-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
                                        placeholder="Escribe un mensaje... (Enter para enviar)"
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleAttach}
                                        className="hidden"
                                    />
                                    <button
                                        className="px-4 py-2 rounded-lg ring-1 ring-gray-300 text-sm font-medium hover:bg-gray-50 dark:ring-gray-700 dark:hover:bg-gray-800 dark:text-white"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        📎
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                                        onClick={sendMsg}
                                        disabled={!input.trim() && files.length === 0}
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}