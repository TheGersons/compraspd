import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Adjunto = {
  id: number;
  name: string;
  mimetype: string;
  file_size: number;
  res_id: number;
  create_date: string;
};

type Mensaje = {
  id: number;
  body: string;
  author_id: [number, string] | false;
  date: string;
  message_type: string;
};

type Lead = {
  id: number;
  name: string;
  partner_id: [number, string] | false;
  stage_id: [number, string] | false;
  user_id: [number, string] | false;
  responsable_id: [number, string] | false;
  create_date: string;
  write_date: string;
  date_deadline: string | false;
  planned_revenue: number;
  probability: number;
  description: string | false;
  email_from: string | false;
  phone: string | false;
  adjuntos: Adjunto[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function fmtDate(d: string | false | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function rel(name: [number, string] | false): string {
  return Array.isArray(name) ? name[1] : "—";
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const EXCEL_MIMES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

function fileIcon(mimetype: string, name: string) {
  const isExcel = EXCEL_MIMES.includes(mimetype) || /\.xlsx?$/i.test(name);
  const isPDF   = mimetype === "application/pdf";
  const isImage = mimetype.startsWith("image/");
  const isWord  = mimetype.includes("wordprocessingml") || /\.docx?$/i.test(name);

  if (isExcel) return { icon: "📊", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800" };
  if (isPDF)   return { icon: "📄", cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800" };
  if (isImage) return { icon: "🖼️", cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800" };
  if (isWord)  return { icon: "📝", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" };
  return { icon: "📎", cls: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" };
}

const STAGE_COLORS: Record<string, string> = {
  "New":         "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  "Proposition": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Won":         "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Lost":        "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rosese-300",
};
function stageCls(stage: string) {
  return STAGE_COLORS[stage] ?? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
}

function defaultDesde() {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}
function defaultHasta() { return new Date().toISOString().slice(0, 10); }

const PAGE_SIZE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────

function MensajesDrawer({ leadId, leadName, onClose }: { leadId: number; leadName: string; onClose: () => void }) {
  const [msgs, setMsgs]       = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Mensaje[]>(`/api/v1/odoo/oportunidades/${leadId}/mensajes`)
      .then(setMsgs)
      .finally(() => setLoading(false));
  }, [leadId]);

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Conversación</p>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-1">{leadName}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : msgs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="mb-2 text-3xl">💬</span>
            <p className="text-sm text-gray-400">Sin mensajes registrados</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {msgs.map((m) => (
              <li key={m.id} className="px-5 py-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {Array.isArray(m.author_id) ? m.author_id[1] : "Sistema"}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDate(m.date)}</span>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {stripHtml(m.body) || <span className="italic text-gray-400">(sin texto)</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OdooOportunidades() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [desde, setDesde]         = useState(defaultDesde());
  const [hasta, setHasta]         = useState(defaultHasta());
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit:  String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
        ...(desde  ? { desde }  : {}),
        ...(hasta  ? { hasta }  : {}),
        ...(search ? { search } : {}),
      });
      const data = await apiFetch<{ leads: Lead[]; total: number }>(`/api/v1/odoo/oportunidades?${params}`);
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, desde, hasta, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const downloadUrl = (id: number) =>
    `${API_BASE_URL}/api/v1/odoo/adjuntos/${id}/descargar`;

  return (
    <>
      <PageMeta title="Oportunidades Odoo" description="Oportunidades CRM desde Odoo" />

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <div>
            <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
              Oportunidades Odoo
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Vista temporal · CRM sincronizado en tiempo real
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
          <input type="date" value={desde}
            onChange={(e) => { setDesde(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
          <input type="date" value={hasta}
            onChange={(e) => { setHasta(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <input
          type="text"
          placeholder="Buscar oportunidad…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-52 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {total} oportunidad{total !== 1 ? "es" : ""}
          </span>
          <button
            onClick={() => { setDesde(defaultDesde()); setHasta(defaultHasta()); setSearch(""); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Resetear
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50 py-12 text-center dark:border-rose-800 dark:bg-rose-900/20">
          <span className="mb-2 text-3xl">⚠️</span>
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Error al conectar con Odoo</p>
          <p className="mt-1 text-xs text-rose-500">{error}</p>
          <button onClick={fetchData} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700">
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="mb-2 text-4xl">🔍</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sin oportunidades en este rango</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const isOpen   = expanded.has(lead.id);
            const stage    = Array.isArray(lead.stage_id) ? lead.stage_id[1] : "—";
            const excelCnt = lead.adjuntos.filter(
              (a) => EXCEL_MIMES.includes(a.mimetype) || /\.xlsx?$/i.test(a.name)
            ).length;

            return (
              <div
                key={lead.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Card header — siempre visible */}
                <button
                  className="w-full px-5 py-4 text-left"
                  onClick={() => toggleExpand(lead.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Chevron */}
                    <svg
                      width="16" height="16"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`mt-0.5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    >
                      <path d="m9 18 6-6-6-6"/>
                    </svg>

                    {/* Info principal */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {lead.name}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageCls(stage)}`}>
                          {stage}
                        </span>
                        {excelCnt > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            📊 {excelCnt} Excel
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>🏢 {rel(lead.partner_id)}</span>
                        <span>👤 {rel(lead.user_id)}</span>
                        <span>📅 {fmtDate(lead.create_date)}</span>
                        {lead.date_deadline && (
                          <span>⏰ Vence {fmtDate(lead.date_deadline)}</span>
                        )}
                        <span>📎 {lead.adjuntos.length} adjunto{lead.adjuntos.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    {/* Botón mensajes */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDrawerLead(lead); }}
                      className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                      title="Ver conversación"
                    >
                      💬 Chat
                    </button>
                  </div>
                </button>

                {/* Panel expandible */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100 dark:divide-gray-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">

                      {/* Datos de la oportunidad */}
                      <div className="p-5">
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          Datos
                        </h4>
                        <dl className="space-y-2">
                          {[
                            { label: "Cliente",     value: rel(lead.partner_id) },
                            { label: "Responsable", value: rel(lead.user_id) },
                            { label: "Etapa",       value: stage },
                            { label: "Creado",      value: fmtDate(lead.create_date) },
                            { label: "Modificado",  value: fmtDate(lead.write_date) },
                            { label: "Vencimiento", value: fmtDate(lead.date_deadline) },
                            { label: "Email",       value: lead.email_from || "—" },
                            { label: "Teléfono",    value: lead.phone || "—" },
                            { label: "Probabilidad",value: lead.probability != null ? `${lead.probability}%` : "—" },
                            { label: "Ingreso est.", value: lead.planned_revenue ? `$${lead.planned_revenue.toLocaleString()}` : "—" },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex gap-2 text-xs">
                              <dt className="w-28 shrink-0 font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                              <dd className="text-gray-700 dark:text-gray-200">{value}</dd>
                            </div>
                          ))}
                        </dl>

                        {lead.description && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Descripción</p>
                            <p className="rounded-lg bg-gray-50 p-2.5 text-xs leading-relaxed text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {stripHtml(lead.description)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Adjuntos */}
                      <div className="p-5">
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          Adjuntos ({lead.adjuntos.length})
                        </h4>

                        {lead.adjuntos.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500">Sin adjuntos</p>
                        ) : (
                          <ul className="space-y-2">
                            {lead.adjuntos.map((att) => {
                              const { icon, cls } = fileIcon(att.mimetype, att.name);
                              return (
                                <li key={att.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${cls}`}>
                                  <span className="text-base">{icon}</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium" title={att.name}>{att.name}</p>
                                    <p className="text-xs opacity-70">{fmtSize(att.file_size)} · {fmtDate(att.create_date)}</p>
                                  </div>
                                  <a
                                    href={`${downloadUrl(att.id)}?token=${getToken()}`}
                                    download={att.name}
                                    onClick={(e) => {
                                      // Descarga autenticada via fetch + blob
                                      e.preventDefault();
                                      fetch(`${API_BASE_URL}/api/v1/odoo/adjuntos/${att.id}/descargar`, {
                                        headers: { Authorization: `Bearer ${getToken()}` },
                                        credentials: "include",
                                      })
                                        .then((r) => r.blob())
                                        .then((blob) => {
                                          const url = URL.createObjectURL(blob);
                                          const a   = document.createElement("a");
                                          a.href     = url;
                                          a.download = att.name;
                                          a.click();
                                          URL.revokeObjectURL(url);
                                        });
                                    }}
                                    className="shrink-0 rounded-md p-1.5 opacity-70 transition hover:opacity-100"
                                    title="Descargar"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                      <polyline points="7 10 12 15 17 10"/>
                                      <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">«</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">‹</button>

              {(() => {
                const pages: (number | "…")[] = [];
                if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
                else {
                  pages.push(1);
                  if (page > 3) pages.push("…");
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                  if (page < totalPages - 2) pages.push("…");
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === "…" ? <span key={`e${i}`} className="px-1 text-xs text-gray-400">…</span> : (
                    <button key={p} onClick={() => setPage(p as number)}
                      className={`min-w-[32px] rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${p === page ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
                      {p}
                    </button>
                  )
                );
              })()}

              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">»</button>
            </div>
          )}
        </div>
      )}

      {/* Drawer mensajes */}
      {drawerLead && (
        <MensajesDrawer
          leadId={drawerLead.id}
          leadName={drawerLead.name}
          onClose={() => setDrawerLead(null)}
        />
      )}
    </>
  );
}
