// pages/Quotes/History.tsx
import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";

type Scope = "nacional" | "internacional";
type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type HistoryStatus = "ganada" | "perdida" | "cancelada" | "cerrada" | "enviada";

type QuoteHistory = {
  id: string;
  reference: string;
  finalClient: string;
  requester: string;
  assignedTo?: string;
  requestType: RequestType;
  scope: Scope;
  createdAt: string;  // ISO
  closedAt?: string;  // ISO
  amount?: number;
  currency?: string;
  status: HistoryStatus;
  notes?: string;
};

// --- Mock inicial (conecta a tu API luego) ---
const MOCK: QuoteHistory[] = [
  {
    id: "Q-2025-0101",
    reference: "UPS-1KVA",
    finalClient: "Acme SA",
    requester: "Gabriela",
    assignedTo: "Carlos",
    requestType: "proyectos",
    scope: "nacional",
    createdAt: "2025-08-28",
    closedAt: "2025-09-02",
    amount: 12500,
    currency: "USD",
    status: "ganada",
    notes: "Incluye mantenimiento 12m",
  },
  {
    id: "Q-2025-0097",
    reference: "GEN-30KVA",
    finalClient: "Globex",
    requester: "Mario",
    assignedTo: "Ana",
    requestType: "suministros",
    scope: "internacional",
    createdAt: "2025-08-25",
    closedAt: "2025-08-30",
    amount: 28900,
    currency: "USD",
    status: "perdida",
    notes: "Precio fuera de presupuesto",
  },
  {
    id: "Q-2025-0094",
    reference: "CABLE-CAT6",
    finalClient: "Walmart",
    requester: "Sofía",
    assignedTo: "Luis",
    requestType: "inventarios",
    scope: "nacional",
    createdAt: "2025-08-20",
    closedAt: "2025-08-29",
    amount: 5600,
    currency: "USD",
    status: "cerrada",
    notes: "Cierre administrativo",
  },
  {
    id: "Q-2025-0088",
    reference: "SW-24P-POE",
    finalClient: "Umbrella",
    requester: "Pedro",
    assignedTo: "Ana",
    requestType: "proyectos",
    scope: "nacional",
    createdAt: "2025-07-12",
    closedAt: "2025-07-28",
    amount: 9800,
    currency: "USD",
    status: "cancelada",
    notes: "Cancelada por el cliente",
  },
  {
    id: "Q-2025-0110",
    reference: "SERV-MANTTO",
    finalClient: "Initech",
    requester: "Carolina",
    assignedTo: "Carlos",
    requestType: "proyectos",
    scope: "internacional",
    createdAt: "2025-09-05",
    amount: 4100,
    currency: "USD",
    status: "enviada",
    notes: "Esperando respuesta",
  },
];

// --- Filtros ---
type SortKey = "createdAt" | "closedAt" | "amount";
type SortDir = "asc" | "desc";

type Filters = {
  q: string;
  status: "todos" | HistoryStatus;
  type: "todos" | RequestType;
  scope: "todos" | Scope;
  assignee: "todos" | string;
  requester: "todos" | string;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  minAmount?: string;
  maxAmount?: string;
  preset: "30d" | "90d" | "thisYear" | "all";
  sortKey: SortKey;
  sortDir: SortDir;
};

const initialFilters: Filters = {
  q: "",
  status: "todos",
  type: "todos",
  scope: "todos",
  assignee: "todos",
  requester: "todos",
  dateFrom: undefined,
  dateTo: undefined,
  minAmount: "",
  maxAmount: "",
  preset: "30d",
  sortKey: "createdAt",
  sortDir: "desc",
};

// --- Utils ---
const currency = (n?: number, c = "USD") =>
  n == null ? "—" : `${c} ${n.toLocaleString()}`;

const fmt = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("es-HN", { year: "2-digit", month: "2-digit", day: "2-digit" }).format(new Date(iso)) : "—";

const withinPreset = (d: string, preset: Filters["preset"]) => {
  if (preset === "all") return true;
  const now = new Date();
  let from = new Date(0);
  if (preset === "30d") {
    from = new Date(now); from.setDate(now.getDate() - 30);
  } else if (preset === "90d") {
    from = new Date(now); from.setDate(now.getDate() - 90);
  } else if (preset === "thisYear") {
    from = new Date(now.getFullYear(), 0, 1);
  }
  return new Date(d) >= from;
};

export default function QuotesHistory() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [rows] = useState<QuoteHistory[]>(MOCK);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // opciones dinámicas
  const assignees = useMemo(() => {
    const s = new Set<string>();
    rows.forEach(r => r.assignedTo && s.add(r.assignedTo));
    return ["todos", ...Array.from(s)];
  }, [rows]);
  const requesters = useMemo(() => {
    const s = new Set<string>();
    rows.forEach(r => r.requester && s.add(r.requester));
    return ["todos", ...Array.from(s)];
  }, [rows]);

  // filtrado
  const filtered = useMemo(() => {
    const f = rows.filter(r => {
      if (filters.preset && !withinPreset(r.createdAt, filters.preset)) return false;

      if (filters.dateFrom && new Date(r.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(r.createdAt) > new Date(filters.dateTo)) return false;

      if (filters.status !== "todos" && r.status !== filters.status) return false;
      if (filters.type !== "todos" && r.requestType !== filters.type) return false;
      if (filters.scope !== "todos" && r.scope !== filters.scope) return false;

      if (filters.assignee !== "todos" && r.assignedTo !== filters.assignee) return false;
      if (filters.requester !== "todos" && r.requester !== filters.requester) return false;

      const minA = filters.minAmount ? Number(filters.minAmount) : undefined;
      const maxA = filters.maxAmount ? Number(filters.maxAmount) : undefined;
      if (minA != null && (r.amount ?? 0) < minA) return false;
      if (maxA != null && (r.amount ?? 0) > maxA) return false;

      const q = filters.q.trim().toLowerCase();
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q) ||
        r.finalClient.toLowerCase().includes(q) ||
        r.requester.toLowerCase().includes(q) ||
        (r.assignedTo ?? "").toLowerCase().includes(q)
      );
    });

    const dir = filters.sortDir === "asc" ? 1 : -1;
    const key = filters.sortKey;
    f.sort((a, b) => {
      const av = key === "amount" ? (a.amount ?? 0) : +(new Date((a as any)[key] ?? 0));
      const bv = key === "amount" ? (b.amount ?? 0) : +(new Date((b as any)[key] ?? 0));
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });

    return f;
  }, [rows, filters]);

  // paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const resetFilters = () => setFilters(initialFilters);

  const exportCSV = () => {
    const header = [
      "ID", "Referencia", "Cliente", "Solicitante", "Asignado a",
      "Tipo", "Alcance", "Creada", "Cerrada", "Monto", "Moneda", "Estado", "Notas",
    ];
    const lines = filtered.map(r => [
      r.id, r.reference, r.finalClient, r.requester, r.assignedTo ?? "",
      r.requestType, r.scope, r.createdAt, r.closedAt ?? "", r.amount ?? "", r.currency ?? "USD", r.status, r.notes ?? "",
    ]);
    const csv = [header, ...lines].map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_cotizaciones_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageMeta
        title="Historial de Cotizaciones | Compras Energia PD"
        description="Consulta y filtra el historial de cotizaciones con múltiples criterios"
      />

      <div className="pb-6">
        <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">Historial de cotizaciones</h1>
      </div>

      {/* Filtros */}
      <ComponentCard title="Filtros">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* búsqueda */}
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                value={filters.q}
                onChange={e => { setPage(1); setFilters({ ...filters, q: e.target.value }); }}
                placeholder="Buscar por ID, referencia, cliente, solicitante o asignado…"
                className="w-full pl-9 pr-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-brand-500 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
              />
              <svg className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
              </svg>
            </div>
          </div>

          {/* estado */}
          <select
            value={filters.status}
            onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value as Filters["status"] }); }}
            className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
          >
            <option value="todos">Estado: todos</option>
            <option value="enviada">Enviada</option>
            <option value="ganada">Ganada</option>
            <option value="perdida">Perdida</option>
            <option value="cancelada">Cancelada</option>
            <option value="cerrada">Cerrada</option>
          </select>

          {/* tipo */}
          <select
            value={filters.type}
            onChange={(e) => { setPage(1); setFilters({ ...filters, type: e.target.value as Filters["type"] }); }}
            className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
          >
            <option value="todos">Tipo: todos</option>
            <option value="licitaciones">Licitaciones</option>
            <option value="proyectos">Proyectos</option>
            <option value="suministros">Suministros</option>
            <option value="inventarios">Inventarios</option>
          </select>

          {/* alcance */}
          <select
            value={filters.scope}
            onChange={(e) => { setPage(1); setFilters({ ...filters, scope: e.target.value as Filters["scope"] }); }}
            className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
          >
            <option value="todos">Alcance: todos</option>
            <option value="nacional">Nacional</option>
            <option value="internacional">Internacional</option>
          </select>

          {/* asignado */}
          <select
            value={filters.assignee}
            onChange={(e) => { setPage(1); setFilters({ ...filters, assignee: e.target.value as Filters["assignee"] }); }}
            className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
          >
            {assignees.map(a => <option key={a} value={a}>{a === "todos" ? "Asignado: todos" : a}</option>)}
          </select>

          {/* solicitante */}
          <select
            value={filters.requester}
            onChange={(e) => { setPage(1); setFilters({ ...filters, requester: e.target.value as Filters["requester"] }); }}
            className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
          >
            {requesters.map(a => <option key={a} value={a}>{a === "todos" ? "Solicitante: todos" : a}</option>)}
          </select>

          {/* rango de fechas */}
          <input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => { setPage(1); setFilters({ ...filters, dateFrom: e.target.value || undefined }); }}
            className="rounded-lg ring-1 ring-inset ring-gray-300 bg-white px-2 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            placeholder="Desde"
          />
          <input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => { setPage(1); setFilters({ ...filters, dateTo: e.target.value || undefined }); }}
            className="rounded-lg ring-1 ring-inset ring-gray-300 bg-white px-2 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            placeholder="Hasta"
          />

          {/* monto */}
          <input
            type="number"
            inputMode="numeric"
            value={filters.minAmount}
            onChange={(e) => { setPage(1); setFilters({ ...filters, minAmount: e.target.value }); }}
            className="rounded-lg ring-1 ring-inset ring-gray-300 bg-white px-2 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            placeholder="Monto mínimo"
          />
          <input
            type="number"
            inputMode="numeric"
            value={filters.maxAmount}
            onChange={(e) => { setPage(1); setFilters({ ...filters, maxAmount: e.target.value }); }}
            className="rounded-lg ring-1 ring-inset ring-gray-300 bg-white px-2 py-2 text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            placeholder="Monto máximo"
          />

          {/* presets y orden */}
          <div className="flex gap-2">
            {(["30d", "90d", "thisYear", "all"] as const).map(p => (
              <Button
                key={p}
                size="sm"
                variant={filters.preset === p ? "primary" : "outline"}
                onClick={() => { setPage(1); setFilters({ ...filters, preset: p }); }}
              >
                {p === "30d" ? "30d" : p === "90d" ? "90d" : p === "thisYear" ? "Año" : "Todo"}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={filters.sortKey}
              onChange={(e) => setFilters({ ...filters, sortKey: e.target.value as SortKey })}
              className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            >
              <option value="createdAt">Ordenar por: Creada</option>
              <option value="closedAt">Ordenar por: Cerrada</option>
              <option value="amount">Ordenar por: Monto</option>
            </select>
            <select
              value={filters.sortDir}
              onChange={(e) => setFilters({ ...filters, sortDir: e.target.value as SortDir })}
              className="px-3 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-sm dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          {/* acciones */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetFilters}>Limpiar</Button>
            <Button variant="primary" onClick={exportCSV}>Exportar CSV</Button>
          </div>
        </div>
      </ComponentCard>

      {/* Resultados */}
      <ComponentCard title={`Resultados (${filtered.length})`}>
        <div className="overflow-auto rounded-lg ring-1 ring-gray-200 dark:ring-gray-800">
          <table className="min-w-full text-sm dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Referencia</th>
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Solicitante</th>
                <th className="px-3 py-2 text-left">Asignado</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Alcance</th>
                <th className="px-3 py-2 text-left">Creada</th>
                <th className="px-3 py-2 text-left">Cerrada</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                    Sin resultados.
                  </td>
                </tr>
              ) : (
                pageRows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.reference}</td>
                    <td className="px-3 py-2">{r.finalClient}</td>
                    <td className="px-3 py-2">{r.requester}</td>
                    <td className="px-3 py-2">{r.assignedTo ?? "—"}</td>
                    <td className="px-3 py-2 capitalize">{r.requestType}</td>
                    <td className="px-3 py-2 capitalize">{r.scope}</td>
                    <td className="px-3 py-2">{fmt(r.createdAt)}</td>
                    <td className="px-3 py-2">{fmt(r.closedAt)}</td>
                    <td className="px-3 py-2 text-right">{currency(r.amount, r.currency)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs
                        ${r.status === "ganada" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : r.status === "perdida" ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                          : r.status === "cancelada" ? "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300"
                          : r.status === "cerrada" ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-[280px] truncate" title={r.notes ?? ""}>
                      {r.notes ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Anterior
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              Siguiente
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
