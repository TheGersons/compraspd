import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, uploadWithProgress, getToken } from '../../lib/api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  contenido: string;
  tipoMensaje: string;
  creado: string;
  emisor: { id: string; nombre: string; email: string };
  adjuntos: Adjunto[];
}

interface Adjunto {
  id: string;
  direccionArchivo: string;
  tipoArchivo: string;
  tamanio: number;
  nombreArchivo?: string;
  previewUrl?: string;
}

interface MentionableUser {
  id: string;
  nombre: string;
  rol: { nombre: string };
}

// ─── API helpers ─────────────────────────────────────────────────────────────

const chatApi = {
  async getMessages(chatId: string): Promise<ChatMessage[]> {
    const res = await apiFetch(`${API_BASE_URL}/api/v1/messages/${chatId}/messages`);
    if (!res.ok) throw new Error('Error al cargar mensajes');
    const data = await res.json();
    const items: ChatMessage[] = data.items || data || [];
    return items.sort((a, b) => new Date(a.creado).getTime() - new Date(b.creado).getTime());
  },

  async sendMessage(chatId: string, contenido: string, menciones: string[]): Promise<ChatMessage> {
    const res = await apiFetch(`${API_BASE_URL}/api/v1/messages/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, contenido, menciones }),
    });
    if (!res.ok) throw new Error('Error al enviar mensaje');
    return res.json();
  },

  async sendFile(
    chatId: string,
    file: File,
    onProgress: (pct: number) => void,
  ): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await uploadWithProgress(
      `${API_BASE_URL}/api/v1/messages/${chatId}/upload`,
      form,
      onProgress,
    );
  },

  async getMentionableUsers(): Promise<MentionableUser[]> {
    const res = await apiFetch(`${API_BASE_URL}/api/v1/messages/mentionable-users`);
    if (!res.ok) return [];
    return res.json();
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-HN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// Render message content highlighting @mentions
function MensajeContenido({ contenido, esPropio }: { contenido: string; esPropio: boolean }) {
  const parts = contenido.split(/(@\S[^@]*?)(?=\s|@|$)/g);
  return (
    <p className="text-sm whitespace-pre-wrap break-words max-w-[500px]">
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span
            key={i}
            className={`font-semibold rounded px-0.5 ${esPropio
              ? 'text-blue-100 bg-blue-500/40'
              : 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40'
              }`}
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ChatPanelProps {
  chatId: string | null | undefined;
  currentUserId: string;
  /** Role del usuario actual (normalizado a mayúsculas) */
  userRole: string;
}

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatPanel({ chatId, currentUserId, userRole }: ChatPanelProps) {
  // ── Messages state ────────────────────────────────────────────────────────
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);

  // ── Input state ───────────────────────────────────────────────────────────
  const [texto, setTexto] = useState('');

  // ── Upload progress ───────────────────────────────────────────────────────
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);

  // ── Image modal ───────────────────────────────────────────────────────────
  const [imagenModal, setImagenModal] = useState<{
    src: string; nombre: string; downloadUrl: string;
  } | null>(null);

  // ── PDF / Excel modal ─────────────────────────────────────────────────────
  type ArchivoModalTipo = 'pdf' | 'excel';
  const [archivoModal, setArchivoModal] = useState<{
    tipo: ArchivoModalTipo;
    nombre: string;
    downloadUrl: string;
    blobUrl?: string;
    excelData?: { headers: string[]; rows: string[][] }[];
    loading: boolean;
    error?: string;
  } | null>(null);

  const abrirArchivoModal = useCallback(async (tipo: ArchivoModalTipo, nombre: string, downloadUrl: string) => {
    setArchivoModal({ tipo, nombre, downloadUrl, loading: true });
    try {
      const token = getToken();
      const res = await fetch(`${downloadUrl}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('No se pudo cargar el archivo');
      const blob = await res.blob();

      if (tipo === 'pdf') {
        const blobUrl = URL.createObjectURL(blob);
        setArchivoModal((prev) => prev ? { ...prev, blobUrl, loading: false } : null);
      } else {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheets: { headers: string[]; rows: string[][] }[] = workbook.SheetNames.map((sheetName) => {
          const ws = workbook.Sheets[sheetName];
          const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][];
          const headers = (data[0] ?? []).map(String);
          const rows = data.slice(1).map((r) => r.map(String));
          return { headers, rows };
        });
        setArchivoModal((prev) => prev ? { ...prev, excelData: sheets, loading: false } : null);
      }
    } catch (e) {
      setArchivoModal((prev) => prev ? { ...prev, loading: false, error: 'No se pudo cargar el archivo' } : null);
    }
  }, []);

  const cerrarArchivoModal = useCallback(() => {
    setArchivoModal((prev) => {
      if (prev?.blobUrl) URL.revokeObjectURL(prev.blobUrl);
      return null;
    });
  }, []);

  const [excelSheetIdx, setExcelSheetIdx] = useState(0);
  useEffect(() => { if (!archivoModal) setExcelSheetIdx(0); }, [archivoModal]);

  // ── Mention state ─────────────────────────────────────────────────────────
  const canMention = userRole !== 'USUARIO';
  const [mentionableUsers, setMentionableUsers] = useState<MentionableUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null); // null = dropdown cerrado
  const [mentionIndex, setMentionIndex] = useState(0);
  const [pendingMenciones, setPendingMenciones] = useState<MentionableUser[]>([]);
  // Posición del '@' en el input (para reemplazar después de selección)
  const mentionStartRef = useRef<number>(-1);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load messages ─────────────────────────────────────────────────────────
  const cargarMensajes = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoadingChat(true);
      setMensajes(await chatApi.getMessages(chatId));
    } catch {
      toast.error('Error al cargar mensajes');
    } finally {
      setLoadingChat(false);
    }
  }, [chatId]);

  useEffect(() => {
    setMensajes([]);
    cargarMensajes();
  }, [cargarMensajes]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Load mentionable users once (only if user can mention)
  useEffect(() => {
    if (canMention) {
      chatApi.getMentionableUsers().then(setMentionableUsers).catch(() => { });
    }
  }, [canMention]);

  // ── Mention dropdown filter ───────────────────────────────────────────────
  const mentionSuggestions =
    mentionQuery !== null
      ? mentionableUsers.filter((u) =>
        u.nombre.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
      : [];

  // ── Input change handler ──────────────────────────────────────────────────
  const handleTextoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTexto(val);

    if (!canMention) return;

    // Find the last '@' before the cursor
    const cursor = e.target.selectionStart ?? val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1) {
      const query = textBeforeCursor.slice(lastAt + 1);
      // Only open dropdown if query has no spaces (still typing the name)
      if (!query.includes(' ') || query === '') {
        mentionStartRef.current = lastAt;
        setMentionQuery(query);
        setMentionIndex(0);
        return;
      }
    }
    // Close dropdown
    setMentionQuery(null);
  };

  // ── Select a mention from the dropdown ───────────────────────────────────
  const selectMention = (user: MentionableUser) => {
    const start = mentionStartRef.current;
    if (start === -1) return;

    const before = texto.slice(0, start);
    const after = texto.slice(inputRef.current?.selectionStart ?? texto.length);
    const newText = `${before}@${user.nombre} ${after}`;

    setTexto(newText);
    setPendingMenciones((prev) => {
      if (prev.find((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
    setMentionQuery(null);
    mentionStartRef.current = -1;

    // Restore focus and position cursor after the mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const pos = before.length + user.nombre.length + 2; // '@' + name + space
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  // ── Keyboard navigation in dropdown ──────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If mention dropdown is open, intercept navigation keys
    if (mentionQuery !== null && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        return;
      }
      if (e.key === 'Enter') {
        // Select the highlighted suggestion — DO NOT send the message
        e.preventDefault();
        selectMention(mentionSuggestions[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    // Normal Enter → send message (only when dropdown is closed)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const enviarMensaje = async () => {
    if (!texto.trim() || !chatId) return;

    const contenido = texto.trim();
    const mencionIds = pendingMenciones.map((u) => u.id);

    try {
      setSendingMessage(true);
      setTexto('');
      setPendingMenciones([]);
      setMentionQuery(null);

      await chatApi.sendMessage(chatId, contenido, mencionIds);
      await cargarMensajes();
    } catch {
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  // ── Send files ────────────────────────────────────────────────────────────
  const enviarArchivos = async (files: File[]) => {
    if (!files.length || !chatId) return;
    const tooLarge = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge.length > 0) {
      toast.error(`Archivo(s) superan 200MB: ${tooLarge.map((f) => f.name).join(', ')}`);
      return;
    }
    setSendingFile(true);
    let errorCount = 0;
    for (const file of files) {
      setUploadFileName(file.name);
      setUploadProgress(0);
      try {
        await chatApi.sendFile(chatId, file, (pct) => setUploadProgress(pct));
      } catch (e: any) {
        errorCount++;
        toast.error(e.message || `Error al enviar ${file.name}`);
      }
    }
    setUploadProgress(null);
    setUploadFileName('');
    setSendingFile(false);
    if (fileRef.current) fileRef.current.value = '';
    if (errorCount < files.length) {
      await cargarMensajes();
      if (files.length - errorCount > 0) {
        toast.success(
          files.length === 1 ? 'Archivo enviado' : `${files.length - errorCount} archivo(s) enviados`,
        );
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Image modal */}
      {imagenModal && (
        <div
          className="fixed inset-0 z-20000 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImagenModal(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagenModal.src}
              alt={imagenModal.nombre}
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm text-white/80">{imagenModal.nombre}</span>
              <a
                href={imagenModal.downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/30"
              >
                Descargar
              </a>
            </div>
            <button
              onClick={() => setImagenModal(null)}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* PDF / Excel modal */}
      {archivoModal && (
        <div
          className="fixed inset-0 z-20000 flex items-center justify-center bg-black/80 p-4"
          onClick={cerrarArchivoModal}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-gray-700">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xl">{archivoModal.tipo === 'pdf' ? '📄' : '📊'}</span>
                <span className="truncate text-sm font-semibold text-gray-800 dark:text-white">{archivoModal.nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={archivoModal.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Descargar
                </a>
                <button
                  onClick={cerrarArchivoModal}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {archivoModal.loading && (
                <div className="flex flex-1 items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              )}
              {archivoModal.error && (
                <div className="flex flex-1 items-center justify-center py-20 text-sm text-red-500">
                  {archivoModal.error}
                </div>
              )}

              {/* PDF */}
              {!archivoModal.loading && !archivoModal.error && archivoModal.tipo === 'pdf' && archivoModal.blobUrl && (
                <iframe
                  src={archivoModal.blobUrl}
                  className="h-[75vh] w-full rounded-b-2xl border-0"
                  title={archivoModal.nombre}
                />
              )}

              {/* Excel */}
              {!archivoModal.loading && !archivoModal.error && archivoModal.tipo === 'excel' && archivoModal.excelData && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Sheet tabs */}
                  {archivoModal.excelData.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-2 dark:border-gray-700">
                      {archivoModal.excelData.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setExcelSheetIdx(idx)}
                          className={`shrink-0 rounded-t-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            idx === excelSheetIdx
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          Hoja {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 overflow-auto p-4">
                    {(() => {
                      const sheet = archivoModal.excelData[excelSheetIdx];
                      if (!sheet) return null;
                      return (
                        <table className="w-full border-collapse text-xs">
                          {sheet.headers.length > 0 && (
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-800">
                                {sheet.headers.map((h, i) => (
                                  <th
                                    key={i}
                                    className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                                  >
                                    {h || ' '}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {sheet.rows.map((row, ri) => (
                              <tr key={ri} className="even:bg-gray-50 dark:even:bg-gray-800/40">
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className="border border-gray-200 px-3 py-1.5 text-gray-800 dark:border-gray-700 dark:text-gray-200"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat container */}
      <div
        className={`relative flex h-[400px] flex-col transition-colors ${isDragging ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) enviarArchivos(files);
        }}
      >
        {/* Drop overlay */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80 dark:bg-blue-900/50">
            <svg className="mb-2 h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Suelta los archivos aquí</span>
            <span className="mt-1 text-xs text-blue-500">Máx. 200MB por archivo</span>
          </div>
        )}

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {loadingChat ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : mensajes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No hay mensajes. ¡Sé el primero en escribir!</p>
            </div>
          ) : (
            <>
              {mensajes.map((mensaje) => {
                const esPropio = mensaje.emisor.id === currentUserId;
                return (
                  <div key={mensaje.id} className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${esPropio ? 'items-end' : 'items-start'}`}>
                      {!esPropio && (
                        <span className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {mensaje.emisor.nombre}
                        </span>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${esPropio ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'}`}>
                        {/* Attachments */}
                        {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                          <div className="mb-2">
                            {mensaje.adjuntos.map((adj) => {
                              const esImagen = adj.tipoArchivo?.startsWith('image/');
                              const nombre = adj.nombreArchivo || adj.direccionArchivo?.split('/').pop() || 'Archivo';
                              const esPdf = adj.tipoArchivo?.includes('pdf') || nombre.toLowerCase().endsWith('.pdf');
                              const esExcel = adj.tipoArchivo?.includes('sheet') || adj.tipoArchivo?.includes('excel') || /\.(xlsx?|ods|csv)$/i.test(nombre);
                              return (
                                <div key={adj.id}>
                                  {esImagen && adj.previewUrl ? (
                                    <div
                                      className="cursor-pointer"
                                      onClick={() => setImagenModal({ src: adj.direccionArchivo + '/download', nombre, downloadUrl: adj.direccionArchivo })}
                                    >
                                      <img
                                        src={adj.previewUrl}
                                        alt={nombre}
                                        className="max-w-[280px] max-h-[200px] rounded-lg hover:opacity-90 transition-opacity"
                                        loading="lazy"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                      <div className="hidden mt-1">
                                        <span className={`inline-flex items-center gap-1 text-xs underline ${esPropio ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                                          📎 {nombre}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (esPdf || esExcel) ? (
                                    <button
                                      type="button"
                                      onClick={() => abrirArchivoModal(esPdf ? 'pdf' : 'excel', nombre, adj.direccionArchivo)}
                                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${esPropio ? 'border-blue-400 text-blue-100 hover:bg-blue-500' : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                                    >
                                      <span className="text-base">{esPdf ? '📄' : '📊'}</span>
                                      <span className="max-w-[180px] truncate">{nombre}</span>
                                      <span className="text-[10px] opacity-70">
                                        {adj.tamanio ? `${(Number(adj.tamanio) / 1024).toFixed(0)}KB` : ''}
                                      </span>
                                      <span className={`text-[10px] ${esPropio ? 'text-blue-200' : 'text-blue-500 dark:text-blue-400'}`}>Vista previa</span>
                                    </button>
                                  ) : (
                                    <a
                                      href={adj.direccionArchivo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${esPropio ? 'border-blue-400 text-blue-100 hover:bg-blue-500' : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                                    >
                                      <span className="text-base">
                                        {adj.tipoArchivo?.includes('word') || adj.tipoArchivo?.includes('document') ? '📝' : '📎'}
                                      </span>
                                      <span className="max-w-[180px] truncate">{nombre}</span>
                                      <span className="text-[10px] opacity-70">
                                        {adj.tamanio ? `${(Number(adj.tamanio) / 1024).toFixed(0)}KB` : ''}
                                      </span>
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Text content */}
                        {mensaje.contenido &&
                          !(mensaje.tipoMensaje === 'ARCHIVO' && mensaje.adjuntos?.length > 0 && mensaje.contenido.startsWith('📎')) && (
                            <MensajeContenido contenido={mensaje.contenido} esPropio={esPropio} />
                          )}
                      </div>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {formatFecha(mensaje.creado)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="relative border-t border-gray-200 pt-4 dark:border-gray-700">
          {/* Mention hint */}
          {canMention && (
            <p className="mb-1.5 text-[10px] text-gray-400 dark:text-gray-500">
              Escribe <span className="font-semibold text-purple-500">@nombre</span> para mencionar a un supervisor o jefe de compras
            </p>
          )}

          {/* Mention dropdown */}
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 z-30 mb-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
              {mentionSuggestions.map((user, idx) => (
                <button
                  key={user.id}
                  type="button"
                  onMouseDown={(e) => {
                    // Use onMouseDown to fire before onBlur on the input
                    e.preventDefault();
                    selectMention(user);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${idx === mentionIndex
                    ? 'bg-purple-50 dark:bg-purple-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{user.nombre}</p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400">{user.rol.nombre.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Upload progress bar */}
          {uploadProgress !== null && (
            <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="max-w-[220px] truncate text-xs font-medium text-blue-700 dark:text-blue-300">
                  {uploadFileName}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/50">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* File input (hidden) */}
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp,.tiff,.tif,.svg,.heic,.heif,.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm,.m4v,.3gp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.csv,.txt,.json,.xml,.zip,.rar,.7z,.tar,.gz,.dwg,.dxf,.dwf,.rvt,.ifc,.step,.stp,.iges,.igs,.stl,.mpp,.vsd,.vsdx"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) enviarArchivos(files);
              }}
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={sendingFile || sendingMessage}
              title="Adjuntar archivos (máx. 200MB c/u)"
              className="rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              {sendingFile ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={texto}
              onChange={handleTextoChange}
              onKeyDown={handleKeyDown}
              placeholder={
                canMention
                  ? 'Escribe un mensaje, @ para mencionar, o arrastra archivos aquí...'
                  : 'Escribe un mensaje o arrastra archivos aquí...'
              }
              disabled={sendingMessage || sendingFile}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            />

            {/* Send button */}
            <button
              type="button"
              onClick={enviarMensaje}
              disabled={!texto.trim() || sendingMessage}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {sendingMessage ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
