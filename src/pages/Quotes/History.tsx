import PageMeta from "../../components/common/PageMeta";

// pages/Quotes/History.tsx
export default function QuotesHistory() {
  return (
    <>
      <PageMeta
        title="Historial de Cotizaciones | Compras Energia PD"
        description="Esta es la página de historial de cotizaciones para Compras Energia PD"
      />
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Historial</h2>
        {/* filtros por fecha, cliente, estado */}
      </div>
    </>
  );
}
