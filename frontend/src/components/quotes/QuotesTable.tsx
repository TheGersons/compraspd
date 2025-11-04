import { memo, useEffect, useMemo, useState } from "react";
import StatusBadge, { QuoteStatus } from "./StatusBadge";

export type Quote = {
  id: string;
  reference: string;
  customer: string;
  createdAt: string;
  dueAt: string;
  assignedTo?: string;
  items: number;
  currency: "HNL" | "USD";
  status: QuoteStatus;
};

type Props = {
  data: Quote[];
  pageSize?: number;
};

export default memo( function QuotesTable({ data, pageSize = 5 }: Props) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Quote | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setPage(1);
  }, [data.length]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    const copy = [...data];
    if (!sortField) return copy;

    copy.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Fechas
      if (sortField === "dueAt" || sortField === "createdAt") {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
      }

      // Números
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Strings / otros
      const aStr = (aVal ?? "").toString();
      const bStr = (bVal ?? "").toString();
      const comp = aStr.localeCompare(bStr);
      return sortDirection === "asc" ? comp : -comp;
    });

    return copy;
  }, [data, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sortedData.slice(start, start + pageSize);


  console.log('🔍 Debug Paginación:', {
  page: currentPage,
  pageSize,
  totalData: data.length,
  sortedData: sortedData.length,
  start,
  end: start + pageSize,
  visibleCount: visible.length
  });

  const handleSort = (field: keyof Quote) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const renderSortIndicator = (field: keyof Quote) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-[10px]">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  console.log('🎯 Renderizando tabla con', visible.length, 'items visibles');

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("reference")}
            >
              Código
              {renderSortIndicator("reference")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("customer")}
            >
              Cliente
              {renderSortIndicator("customer")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("assignedTo")}
            >
              Asignado a
              {renderSortIndicator("assignedTo")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("status")}
            >
              Estado
              {renderSortIndicator("status")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("dueAt")}
            >
              Vence
              {renderSortIndicator("dueAt")}
            </th>
            <th
              className="px-4 py-3 text-right cursor-pointer select-none"
              onClick={() => handleSort("items")}
            >
              Items
              {renderSortIndicator("items")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {visible.map((q) => (
            <tr
              key={q.id}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                {q.reference}
              </td>
              <td className="px-4 py-3">{q.customer}</td>
              <td className="px-4 py-3">
                {q.assignedTo ?? (
                  <span className="text-gray-400">Sin asignar</span>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={q.status} />
              </td>
              <td className="px-4 py-3">
                {new Date(q.dueAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                {q.items}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages} · Mostrando{" "}
            {visible.length} de {data.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md border border-brand-500 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {pages.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={[
                  "px-3 py-1 text-sm rounded-md border",
                  p === currentPage
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md border border-brand-500 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
