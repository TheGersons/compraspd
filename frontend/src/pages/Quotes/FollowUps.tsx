import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

// ============================================================================
// COMPONENTES EXTERNOS (Reemplazar con tus rutas reales)
// ============================================================================
// import PageMeta from "../../components/common/PageMeta";
// import ComponentCard from "../../components/common/ComponentCard";
// import Button from "../../components/ui/button/Button";

// ============================================================================
// TYPES
// ============================================================================

type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type Scope = "nacional" | "internacional";
type DeliveryPlace = "almacen" | "proyecto";
type FollowStatus = "EN_PROGRESO" | "PAUSADO" | "CANCELADO" | "FINALIZADO";

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
};

type AssignmentRequest = {
    assignmentId: string;
    progress: number;
    eta?: string;
    followStatus: FollowStatus;
    priorityRequested: boolean;
    assignedTo: string;
    id: string;
    reference: string;
    finalClient: string;
    createdAt: string;
    deadline: string;
    requestType: RequestType;
    scope: Scope;
    deliveryPlace: DeliveryPlace;
    projectId?: string;
    comments: string;
};

// ============================================================================
// UTILITIES
// ============================================================================

const formatDate = (date: string | number | Date) =>
    new Intl.DateTimeFormat("es-HN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "2-digit", 
        hour: "2-digit", 
        minute: "2-digit" 
    }).format(new Date(date));

const shortDate = (date: string) =>
    new Intl.DateTimeFormat("es-HN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "2-digit" 
    }).format(new Date(date));

const getStatusLabel = (s: FollowStatus) => s.replace(/_/g, " ");

const calculateDaysLeft = (deadline: string): number => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.floor(diff / 86400000);
};

// ============================================================================
// CUSTOM HOOKS (Simulated - Replace with real API)
// ============================================================================

const useAuth = () => ({ 
    user: { 
        sub: "USER-CARLOS", 
        fullName: "Carlos (Encargado)" 
    } 
});

const useFetchMyAssignedRequests = () => {
    const MOCK_DATA: AssignmentRequest[] = [
        {
            assignmentId: "ASSIGN-001",
            id: "REQ-2025-0010",
            reference: "REF-CABLE-CAT6",
            finalClient: "Walmart (Solicitante)",
            createdAt: "2025-09-08",
            deadline: "2025-09-16",
            requestType: "inventarios",
            scope: "nacional",
            deliveryPlace: "almacen",
            comments: "Cableado estructurado para nueva tienda.",
            assignedTo: "Carlos (Encargado)",
            progress: 10,
            eta: "2025-09-15",
            followStatus: "EN_PROGRESO",
            priorityRequested: false,
        },
    ];

    return { 
        data: MOCK_DATA, 
        isLoading: false, 
        refetch: () => console.log("Refetching...") 
    };
};

const useAssignmentsApi = () => {
    const uploadFiles = useCallback(async (files: File[]): Promise<ChatFile[]> => {
        console.log("API: Uploading files...", files.map(f => f.name));
        return files.map(f => ({
            id: `FILE-${Math.random().toString(36).slice(2)}`,
            name: f.name,
            sizeBytes: f.size,
            url: `/api/files/${f.name}`,
        }));
    }, []);

    const sendChat = useCallback(async (assignmentId: string, body: string | null, fileIds: string[]): Promise<ChatMsg> => {
        console.log(`API: Sending chat to ${assignmentId}. Files: ${fileIds.length}`);
        return {
            id: Math.random().toString(36).slice(2),
            senderId: "USER-CARLOS",
            body: body || undefined,
            createdAt: new Date().toISOString(),
            files: [],
        };
    }, []);

    const listChat = useCallback(async (assignmentId: string): Promise<ChatMsg[]> => {
        console.log(`API: Listing chat for ${assignmentId}`);
        return [
            {
                id: "M1",
                senderId: "USER-WALMART",
                body: "Adjunto el pliego de condiciones actualizado.",
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                files: [{ id: 'F1', name: 'Pliego_v2.pdf', sizeBytes: 150000, url: '#' }]
            },
            {
                id: "M2",
                senderId: "USER-CARLOS",
                body: "Recibido. Estamos revisando la viabilidad.",
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                files: []
            },
        ];
    }, []);

    const updateFollowUp = useCallback(async (assignmentId: string, data: Partial<AssignmentRequest>) => {
        console.log(`API: Updating follow-up ${assignmentId}`, data);
        return true;
    }, []);

    return { uploadFiles, sendChat, listChat, updateFollowUp };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const AssignmentListItem = React.memo(({ 
    req, 
    isSelected, 
    onClick 
}: { 
    req: AssignmentRequest; 
    isSelected: boolean; 
    onClick: () => void;
}) => (
    <button
        className={`w-full text-left p-3 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 ${
            isSelected ? "outline outline-2 outline-blue-500" : ""
        }`}
        onClick={onClick}
    >
        <div className="font-medium truncate font-semibold text-black-800 dark:text-white/90">
            {req.id} – {req.finalClient}
        </div>
        <div className="text-xs text-black-800 dark:text-white/90">
            Asignado a {req.assignedTo} • Estado: {getStatusLabel(req.followStatus)}
        </div>
    </button>
));

const DetailHeader = React.memo(({ 
    current, 
    daysLeft 
}: { 
    current: AssignmentRequest; 
    daysLeft: number;
}) => (
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
            Límite {shortDate(current.deadline)}
            {daysLeft >= 0 ? ` • ${daysLeft} días restantes` : ' • atrasada'}
        </div>
    </div>
));

const ProgressControl = React.memo(({ 
    progress, 
    eta, 
    priorityRequested,
    disabled,
    onProgressChange, 
    onEtaChange, 
    onRequestPriority 
}: {
    progress: number;
    eta: string;
    priorityRequested: boolean;
    disabled: boolean;
    onProgressChange: (value: number) => void;
    onEtaChange: (value: string) => void;
    onRequestPriority: () => void;
}) => (
    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
            <div className="text-xs font-semibold text-black-800 dark:text-white/90 mb-1">
                Progreso actual: {progress}%
            </div>
            <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => onProgressChange(Number(e.target.value))}
                className="w-full"
                disabled={disabled}
            />
            <div className="text-sm font-semibold text-black-800 dark:text-white/90 mt-1">
                {progress}%
            </div>
        </div>
        <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Fecha de finalización (estimada)
            </div>
            <input
                type="date"
                value={eta}
                onChange={(e) => onEtaChange(e.target.value)}
                className="w-full rounded-md ring-1 ring-inset ring-gray-300 bg-white px-2 py-1 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
                disabled={disabled}
            />
        </div>
        <div className="flex items-end gap-2">
            <button
                className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
                    priorityRequested 
                        ? "ring-1 ring-gray-300 text-gray-600 dark:ring-gray-700 dark:text-gray-400" 
                        : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={onRequestPriority}
                disabled={priorityRequested || disabled}
            >
                {priorityRequested ? "Solicitud enviada" : "Solicitar prioridad"}
            </button>
        </div>
    </div>
));

const StatusActions = React.memo(({ 
    currentStatus, 
    disabled,
    onSetStatus 
}: {
    currentStatus: FollowStatus;
    disabled: boolean;
    onSetStatus: (status: FollowStatus) => void;
}) => {
    const isFinalized = currentStatus === "CANCELADO" || currentStatus === "FINALIZADO";
    
    return (
        <div className="flex flex-wrap gap-2">
            <button
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                onClick={() => onSetStatus("EN_PROGRESO")}
                disabled={currentStatus === "EN_PROGRESO" || disabled}
            >
                En progreso
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                onClick={() => onSetStatus(currentStatus !== "PAUSADO" ? "PAUSADO" : "EN_PROGRESO")}
                disabled={isFinalized || disabled}
            >
                {currentStatus !== "PAUSADO" ? "Pausar" : "Reanudar"}
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                onClick={() => onSetStatus("CANCELADO")}
                disabled={isFinalized || disabled}
            >
                Cancelar
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                onClick={() => onSetStatus("FINALIZADO")}
                disabled={isFinalized || disabled}
            >
                Finalizar
            </button>
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
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
            isFromCurrentUser
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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

export default function QuotesFollowUps() {
    const { user } = useAuth();
    const { state } = useLocation() as { state?: { selected?: AssignmentRequest } };
    
    const { data: assignedList, isLoading } = useFetchMyAssignedRequests();
    const { uploadFiles, sendChat, listChat, updateFollowUp } = useAssignmentsApi();

    // State
    const [current, setCurrent] = useState<AssignmentRequest | null>(null);
    const [status, setStatus] = useState<FollowStatus>("EN_PROGRESO");
    const [progress, setProgress] = useState<number>(0);
    const [eta, setEta] = useState<string>("");
    const [priorityRequested, setPriorityRequested] = useState<boolean>(false);
    const [chat, setChat] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Derived state
    const isCurrentAssignee = current?.assignedTo.includes(user.fullName) ?? false;
    const daysLeft = useMemo(() => 
        current ? calculateDaysLeft(current.deadline) : 0, 
        [current]
    );

    // Handlers
    const handleSaveProgress = useCallback(async () => {
        if (!current) return;
        console.log("Saving progress: ", progress, eta); // Agregado para ver la acción
        try {
            await updateFollowUp(current.assignmentId, { progress, eta: eta || undefined });
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    }, [current, progress, eta, updateFollowUp]);

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
                uploadedFiles = await uploadFiles(files);
            }

            const fileIds = uploadedFiles.map(f => f.id);
            const newMsg = await sendChat(current.assignmentId, input.trim() || null, fileIds);

            setChat(prev => [...prev, { ...newMsg, files: uploadedFiles }]);
            setInput("");
            setFiles([]);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const requestPriorityBump = async () => {
        if (!current) return;
        try {
            await updateFollowUp(current.assignmentId, { priorityRequested: true });
            setPriorityRequested(true);
        } catch (error) {
            console.error("Error requesting priority:", error);
        }
    };

    const actionSetStatus = async (s: FollowStatus) => {
        if (!current) return;
        try {
            await updateFollowUp(current.assignmentId, { followStatus: s });
            setStatus(s);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Effects
    useEffect(() => {
        if (state?.selected) setCurrent(state.selected);
    }, [state?.selected]);

    // Sincroniza estado local y carga chat al cambiar la solicitud
    useEffect(() => {
        if (!current) return;
        
        setStatus(current.followStatus);
        setProgress(current.progress);
        setEta(current.eta || "");
        setPriorityRequested(current.priorityRequested);

        listChat(current.assignmentId)
            .then(setChat)
            .catch(() => setChat([]));
    }, [current?.assignmentId, listChat]);

    // Guarda Progreso/ETA automáticamente (Debounce Simulado) -> SOLUCIÓN
    useEffect(() => {
        if (!current) return;
        
        const delayDebounceFn = setTimeout(() => {
            handleSaveProgress();
        }, 1500); 

        return () => clearTimeout(delayDebounceFn);
    }, [progress, eta, handleSaveProgress, current]); // Se agrega 'current' como dependencia por si la tarea cambia

    // Scroll al final del chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    if (isLoading) return <div>Cargando asignaciones...</div>;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Seguimiento de solicitudes
            </h2>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment List */}
                <div className="lg:col-span-1">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white/90">Mis Asignadas</h3>
                        {!assignedList?.length ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                No hay solicitudes asignadas.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {assignedList.map(req => (
                                    <li key={req.assignmentId}>
                                        <AssignmentListItem
                                            req={req}
                                            isSelected={current?.assignmentId === req.assignmentId}
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
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white/90">Detalle y Avance</h3>
                        {!current ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selecciona una solicitud.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <DetailHeader current={current} daysLeft={daysLeft} />
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Entrega</div>
                                        <div className="font-semibold text-black-800 dark:text-white/90">
                                            {current.deliveryPlace === "almacen" ? "Almacén" : "Proyecto"}
                                        </div>
                                    </div>
                                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Proyecto</div>
                                        <div className="font-semibold text-black-800 dark:text-white/90">
                                            {current.projectId ?? "—"}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Comentarios:</span> {current.comments}
                                </p>

                                <ProgressControl
                                    progress={progress}
                                    eta={eta}
                                    priorityRequested={priorityRequested}
                                    disabled={!isCurrentAssignee}
                                    onProgressChange={setProgress}
                                    onEtaChange={setEta}
                                    onRequestPriority={requestPriorityBump}
                                />

                                <StatusActions
                                    currentStatus={status}
                                    disabled={!isCurrentAssignee}
                                    onSetStatus={actionSetStatus}
                                />
                            </div>
                        )}
                    </div>

                    {/* Chat Card */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white/90">Chat con solicitante</h3>
                        {!current ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selecciona una solicitud.
                            </p>
                        ) : (
                            <div className="flex flex-col h-[420px]">
                                <div className="flex-1 overflow-auto rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3 space-y-3">
                                    {chat.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Sin mensajes.</p>
                                    ) : (
                                        chat.map(m => (
                                            <ChatMessage
                                                key={m.id}
                                                message={m}
                                                isFromCurrentUser={m.senderId === user.sub}
                                                senderName={m.senderId === user.sub ? current.assignedTo : current.finalClient}
                                            />
                                        ))
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
                                        className="flex-1 min-h-[44px] max-h-40 rounded-lg ring-1 ring-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
                                        placeholder="Escribe un mensaje…"
                                        disabled={!isCurrentAssignee}
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleAttach}
                                        className="hidden"
                                        disabled={!isCurrentAssignee}
                                    />
                                    <button
                                        className="px-4 py-2 rounded-lg ring-1 ring-gray-300 text-sm font-medium hover:bg-gray-50 dark:ring-gray-700 dark:hover:bg-gray-800 dark:text-white disabled:opacity-50"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={!isCurrentAssignee}
                                    >
                                        Adjuntar
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                                        onClick={sendMsg}
                                        disabled={!isCurrentAssignee || (!input.trim() && files.length === 0)}
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