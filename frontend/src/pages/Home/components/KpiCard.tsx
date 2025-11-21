// src/pages/Quotes/components/KpiCard.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import KpiTableModal from './KpiTableModal';
import { useKpiData } from '../hooks/useKpiData';
import { KpiColumn } from '../types/kpi.types';

export type KpiTone = "success" | "warn" | "danger" | "info";
export type KpiType = "summary" | "table";

const colors: Record<KpiTone, {
  dot: string;
  bg: string;
  border: string;
  hoverBorder: string;
  hoverBg: string;
}> = {
  success: {
    dot: "bg-emerald-500 dark:bg-emerald-400",
    bg: "bg-emerald-50/50 dark:bg-emerald-900/28",
    border: "border-emerald-200 dark:border-emerald-700/45",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-400",
    hoverBg: "hover:bg-emerald-100/50 dark:hover:bg-emerald-900/38"
  },

  warn: {
    dot: "bg-amber-500 dark:bg-amber-400",
    bg: "bg-amber-50/50 dark:bg-amber-900/28",
    border: "border-amber-200 dark:border-amber-700/45",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-400",
    hoverBg: "hover:bg-amber-100/50 dark:hover:bg-amber-900/38"
  },

  danger: {
    dot: "bg-rose-500 dark:bg-rose-400",
    bg: "bg-rose-50/50 dark:bg-rose-900/28",
    border: "border-rose-200 dark:border-rose-700/45",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-400",
    hoverBg: "hover:bg-rose-100/50 dark:hover:bg-rose-900/38"
  },

  info: {
    dot: "bg-cyan-500 dark:bg-cyan-400",
    bg: "bg-cyan-50/50 dark:bg-cyan-900/28",
    border: "border-cyan-200 dark:border-cyan-700/45",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-400",
    hoverBg: "hover:bg-cyan-100/50 dark:hover:bg-cyan-900/38"
  }
};

export default function KpiCard({
  id,
  title,
  value,
  hint,
  tone = "info",
  type = "summary",
  columns,
  icon,
  onClick
}: {
  id: string;
  title: string;
  value: string | number;
  hint?: string;
  tone?: KpiTone;
  type?: KpiType;
  columns?: KpiColumn[];
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const { data, loading } = useKpiData(id);
  const theme = colors[tone];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Modal para tipo "summary"
  const summaryModalContent = showModal && type === 'summary' && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <span className={`inline-block size-3 rounded-full ${theme.dot} mt-1`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Detalles del indicador
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Valor Actual
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>

          {data && 'source' in data && (
            <>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Fuente de datos
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {data.source}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Última actualización
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {data.lastUpdate}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tendencia
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {data.trend}
                </p>
              </div>
            </>
          )}

          {hint && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Nota
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {hint}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleCloseModal}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          group
          relative
          rounded-xl border
          p-4
          transition-all duration-300 ease-out
          cursor-pointer
          shadow-md
          hover:shadow-2xl
          ${theme.bg}
          ${theme.border}
          ${theme.hoverBorder}
          ${theme.hoverBg}
          hover:scale-[1.03]
          hover:-translate-y-1
          active:scale-[0.98]
          active:translate-y-0
        `}
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className={`inline-block size-2 rounded-full ${theme.dot} animate-pulse`} />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
            {title}
          </p>
          {icon && (
            <span className="ml-auto opacity-70 transition-opacity group-hover:opacity-100">
              {icon}
            </span>
          )}
        </div>

        {/* Value */}
        <p className="mt-2.5 text-2xl font-bold text-gray-900 dark:text-white/95 tracking-tight">
          {loading ? '...' : value}
        </p>

        {/* Hint */}
        {hint && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
            {hint}
          </p>
        )}

        {/* Click indicator */}
        <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-50">
          <svg
            className="size-3 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Modal Summary */}
      {typeof document !== 'undefined' && summaryModalContent && createPortal(
        summaryModalContent,
        document.body
      )}

      {/* Modal Table */}
      {type === 'table' && columns && data && 'rows' in data && (
        <KpiTableModal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={title}
          columns={columns}
          data={data.rows}
          tone={tone}
        />
      )}
    </>
  );
}