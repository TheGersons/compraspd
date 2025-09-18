import PageMeta from "../../components/common/PageMeta";

// pages/Quotes/Assignment.tsx
export default function QuotesAssignment() {
  return (
    <>
      <PageMeta
        title="Asignación de Cotizaciones | Compras Energia PD"
        description="Esta es la página de asignación de cotizaciones para Compras Energia PD"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Asignación de cotizaciones</h2>

          </div>
        </div>
      </div>
    </>
  );
}


