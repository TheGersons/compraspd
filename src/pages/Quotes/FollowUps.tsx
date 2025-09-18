import PageMeta from "../../components/common/PageMeta";

// pages/Quotes/FollowUps.tsx
export default function QuotesFollowUps() {
  return (
    <>
      <PageMeta
        title="Seguimiento de Solicitudes | Compras Energia PD"
        description="Esta es la página de seguimiento de solicitudes para Compras Energia PD"
      />
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Seguimiento de solicitudes</h2>
        {/* Kanban o tabla de pendientes */}
      </div>
    </>
  );
}
