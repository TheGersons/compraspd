import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useMyAssignments, useAssignmentChat, useUpdateFollowUp, useSendChat, loadItems } from "../Quotes/hooks/useAssignments";
import { assignmentsApi } from "../Quotes/services/assignmentsApi";
import { RequestedItemsTable } from "./components/RequestedItemsTable";
// ============================================================================
// TYPES - Actualizado para coincidir con el backend
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
    sender?: {  // ✅ Añade esto
        id: string;
        fullName: string;
    };
};

// Tipo que coincide con la respuesta del backend
type AssignmentRequest = {
    id: string;
    assignmentId: string;
    assignedToId: string;
    progress: number;
    eta?: string;
    followStatus: FollowStatus;
    priorityRequested: boolean;
    createdAt: string;
    updatedAt: string;

    // Datos anidados de purchaseRequest
    purchaseRequest: {
        id: string;
        reference: string;
        finalClient: string;
        createdAt: string;
        quoteDeadline: string;
        requestCategory: RequestCategory;
        procurement: Procurement;
        deliveryType: DeliveryType;
        projectId: string | null;
        comments: string;
    } | null;

    // Datos del asignado
    assignedTo: {
        fullName: string;
    };
};

// ============================================================================
// UTILITIES
// ============================================================================

const formatDateForInput = (isoDate: string | null | undefined): string => {
    if (!isoDate) return "";
    try {
        const date = new Date(isoDate);
        // Formato yyyy-MM-dd para input type="date"
        return date.toISOString().split('T')[0];
    } catch {
        return "";
    }
};

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

const calculateDaysLeft = (quoteDeadline: string | undefined | null): number => {
    if (!quoteDeadline) return 99999;

    const quoteDeadlineDate = new Date(quoteDeadline);
    if (isNaN(quoteDeadlineDate.getTime())) return 99999;

    const diff = quoteDeadlineDate.getTime() - Date.now();
    return Math.floor(diff / 86400000);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
// En FollowUps.tsx - Modifica ProgressControl para agregar botón de guardar


const ProgressControl2 = React.memo(({
    progress,
    eta,
    priorityRequested,
    disabled,
    onProgressChange,
    onEtaChange,
    onRequestPriority,
    onSave // ✅ NUEVO
}: {
    progress: number;
    eta: string;
    priorityRequested: boolean;
    disabled: boolean;
    onProgressChange: (value: number) => void;
    onEtaChange: (value: string) => void;
    onRequestPriority: () => void;
    onSave: () => void; // ✅ NUEVO
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
        <div className="flex flex-col gap-2">
            {/* ✅ NUEVO: Botón de guardar */}
            <button
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                onClick={onSave}
                disabled={disabled}
            >
                Guardar Progreso
            </button>
            <button
                className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${priorityRequested
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
        className={`w-full text-left p-3 rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 ${isSelected ? "outline outline-2 outline-blue-500" : ""
            }`}
        onClick={onClick}
    >
        <div className="font-medium truncate font-semibold text-black-800 dark:text-white/90">
            {req.purchaseRequest?.reference || req.id} — {req.purchaseRequest?.finalClient || "N/A"}
        </div>
        <div className="text-xs text-black-800 dark:text-white/90">
            Asignado a {req.assignedTo.fullName} • Estado: {req.followStatus}
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
                {current.purchaseRequest?.reference || current.id} — {current.purchaseRequest?.finalClient || "N/A"}
            </h3>
            <div className="text-xs text-black-800 dark:text-white/90">
                Tipo {current.purchaseRequest?.requestCategory} • {current.purchaseRequest?.procurement} •
                Asignado a {current.assignedTo.fullName}
            </div>
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            Creada {shortDate(current.purchaseRequest?.createdAt)}<br />
            Límite {shortDate(current.purchaseRequest?.quoteDeadline)}
            {daysLeft >= 0 ? ` • ${daysLeft} días restantes` : ' • atrasada'}
        </div>
    </div>
));

/*
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
                className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${priorityRequested
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
*/

const StatusActions = React.memo(({
    currentStatus,
    disabled,
    onSetStatus
}: {
    currentStatus: FollowStatus;
    disabled: boolean;
    onSetStatus: (status: FollowStatus) => void;
}) => {
    const isFinalized = currentStatus === "CANCELLED" || currentStatus === "COMPLETED";

    return (
        <div className="flex flex-wrap gap-2">
            <button
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                onClick={() => onSetStatus("IN_PROGRESS")}
                disabled={currentStatus === "IN_PROGRESS" || disabled}
            >
                En progreso
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                onClick={() => onSetStatus(currentStatus !== "PAUSED" ? "PAUSED" : "IN_PROGRESS")}
                disabled={isFinalized || disabled}
            >
                {currentStatus !== "PAUSED" ? "Pausar" : "Reanudar"}
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                onClick={() => onSetStatus("CANCELLED")}
                disabled={isFinalized || disabled}
            >
                Cancelar
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                onClick={() => onSetStatus("COMPLETED")}
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
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${isFromCurrentUser
            ? "ml-auto bg-blue-500 text-white"
            : "mr-auto bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-50 ring-1 ring-gray-300 dark:ring-gray-700"
            }`}
    >
        <div className="text-[11px] opacity-70 mb-0.5">
            {senderName} • {formatDateForInput(message.createdAt)}
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
    type LocationState = {
        fromAssignment?: boolean;
        selected?: AssignmentRequest
    };
    const locationState = useLocation().state as LocationState | undefined;

    // React Query hooks
    const { data: temporalList = [], isLoading } = useMyAssignments();
    //filtra las asignaciones que están en estado IN_PROGRESS, PAUSED o SUMMITED
    const assignedList = temporalList.filter(assignment =>
        ["IN_PROGRESS", "PAUSED", "SUBMITTED"].includes(assignment.followStatus)
    );
    const updateFollowUpMutation = useUpdateFollowUp();
    const sendChatMutation = useSendChat();

    // State
    const [current, setCurrent] = useState<AssignmentRequest | null>(null);
    const [status, setStatus] = useState<FollowStatus>("IN_PROGRESS");
    const [progress, setProgress] = useState<number>(0);
    const [eta, setEta] = useState<string>("");
    const [priorityRequested, setPriorityRequested] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Chat query - solo se ejecuta cuando hay un current seleccionado
    const { data: chat = [] } = useAssignmentChat(current?.id || null);

    // Derived state
    const isCurrentAssignee = true; // Siempre true porque solo ves tus asignaciones
    const daysLeft = useMemo(() =>
        current?.purchaseRequest?.quoteDeadline ? calculateDaysLeft(current.purchaseRequest.quoteDeadline) : 0,
        [current]
    );

    const [isTableVisible, setIsTableVisible] = useState(false)
    const tableContentRef = useRef<HTMLDivElement>(null);
    const { data: items = [], } = loadItems(current?.purchaseRequest?.id !== undefined ? current.purchaseRequest.id : null);

    const toggleTable = () => {
        setIsTableVisible(prev => !prev);
    }
    // Handlers
    const handleSaveProgress = useCallback(async () => {
        if (!current) return;

        try {
            await updateFollowUpMutation.mutateAsync({
                assignmentId: current.id,
                data: { progress, eta: eta || undefined }
            });
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    }, [current, progress, eta, updateFollowUpMutation]);

    const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files;
        if (!list) return;
        setFiles(prev => [...prev, ...Array.from(list)]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    const [isSendingMessage,] = useState(false);

    const sendMsg = async () => {
        if (!current || (!input.trim() && files.length === 0)) return;

        try {
            let uploadedFiles: ChatFile[] = [];
            if (files.length > 0) {
                uploadedFiles = await assignmentsApi.uploadFiles(files);
            }

            const fileIds = uploadedFiles.map(f => f.id);
            await sendChatMutation.mutateAsync({
                assignmentId: current.id,
                body: input.trim() || null,
                fileIds
            });

            setInput("");
            setFiles([]);

            // ✅ Scroll al final después de enviar
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const requestPriorityBump = async () => {
        if (!current) return;
        try {
            await updateFollowUpMutation.mutateAsync({
                assignmentId: current.id,
                data: { priorityRequested: true }
            });
            setPriorityRequested(true);
        } catch (error) {
            console.error("Error requesting priority:", error);
        }
    };

    const actionSetStatus = async (s: FollowStatus) => {
        if (!current) return;
        try {
            await updateFollowUpMutation.mutateAsync({
                assignmentId: current.id,
                data: { followStatus: s }
            });
            setStatus(s);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Effects
    useEffect(() => {
        if (locationState?.selected) {
            setCurrent(locationState.selected);
        } else if (assignedList.length > 0 && !current) {
            setCurrent(assignedList[0]);
        }
    }, [locationState, assignedList, current]);


    useEffect(() => {
        if (!current) {
            console.log('⚠️ No hay asignación seleccionada');
            return;
        }

        console.log('📋 Asignación seleccionada:', {
            id: current.id,
            assignmentId: current.assignmentId,
            reference: current.purchaseRequest?.reference
        });

        setStatus(current.followStatus);
        setProgress(current.progress);
        setEta(formatDateForInput(current.eta));
        setPriorityRequested(current.priorityRequested);


    }, [current?.id, chat.length]);

    useEffect(() => {
        console.log('Chat actualizado:', {
            assignmentId: current?.id,
            messageCount: chat.length,
            messages: chat
        });
    }, [chat, current?.id]);



    if (isLoading) return <div className="p-6 text-center">Cargando asignaciones...</div>;

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
                                    <li key={req.id}>
                                        <AssignmentListItem
                                            req={req}
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
                                            {current.purchaseRequest?.deliveryType === "WAREHOUSE" ? "Almacén" : "Proyecto"}
                                        </div>
                                    </div>
                                    <div className="rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Proyecto</div>
                                        <div className="font-semibold text-black-800 dark:text-white/90">
                                            {current.purchaseRequest?.deliveryType !== "WAREHOUSE" ? current.purchaseRequest?.projectId : "N/A"}
                                        </div>
                                    </div>
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

                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Comentarios:</span> {current.purchaseRequest?.comments || "Sin comentarios"}
                                </p>

                                <ProgressControl2
                                    progress={progress}
                                    eta={eta}
                                    priorityRequested={priorityRequested}
                                    disabled={!isCurrentAssignee}
                                    onProgressChange={setProgress}
                                    onEtaChange={setEta}
                                    onRequestPriority={requestPriorityBump}
                                    onSave={handleSaveProgress} // ✅ NUEVO
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
                                        chat.map(m => {
                                            console.log('🔍 Rendering message:', m); // Debug
                                            return (
                                                <ChatMessage
                                                    key={m.id}
                                                    message={m}
                                                    isFromCurrentUser={m.senderId === current.assignedToId}
                                                    senderName={
                                                        m.sender?.fullName ||
                                                        (m.senderId === current.assignedToId
                                                            ? current.assignedTo.fullName
                                                            : current.purchaseRequest?.finalClient || "Cliente")
                                                    }
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
                                        disabled={!isCurrentAssignee || (!input.trim() && files.length === 0) || isSendingMessage}
                                    >
                                        {isSendingMessage ? "Enviando..." : "Enviar"}
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