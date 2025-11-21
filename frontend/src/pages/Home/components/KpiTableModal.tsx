// components/KpiTableModal.tsx
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { KpiColumn, TableRow } from '../types/kpi.types';

interface KpiTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: KpiColumn[];
  data: TableRow[];
  tone: 'success' | 'danger' | 'warn' | 'info';
}

export default function KpiTableModal({
  isOpen,
  onClose,
  title,
  columns,
  data,
  tone
}: KpiTableModalProps) {
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ordenamiento
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>(columns[0]?.key || '');

  // Colores según tone
  const toneColors = {
    success: {
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    danger: {
      dot: 'bg-rose-500 dark:bg-rose-400',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    },
    warn: {
      dot: 'bg-amber-500 dark:bg-amber-400',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    },
    info: {
      dot: 'bg-cyan-500 dark:bg-cyan-400',
      badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    }
  };

  const colors = toneColors[tone];

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => {
      const value = String(row[searchColumn] || '').toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchColumn]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Manejar números
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Manejar strings
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginar datos
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage]);

  // Handlers
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className={`inline-block size-3 rounded-full ${colors.dot}`} />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {sortedData.length} registro{sortedData.length !== 1 ? 's' : ''} encontrado{sortedData.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {columns.map(col => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {columns.map(column => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && (
                          <span className="text-gray-400">
                            {sortColumn === column.key ? (
                              sortDirection === 'asc' ? '↑' : '↓'
                            ) : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {String(row[column.key] || '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedData.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No se encontraron resultados
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? `${colors.badge}`
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}