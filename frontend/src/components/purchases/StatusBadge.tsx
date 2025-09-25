export type PurchaseStatus = "pendiente" | "ordenada" | "recibida" | "cancelada" | "vencida";

const cls: Record<PurchaseStatus, string> = {
  pendiente: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  ordenada: "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-300",
  recibida: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  cancelada: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  vencida:   "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300",
};

const label: Record<PurchaseStatus, string> = {
  pendiente: "Pendiente",
  ordenada: "Ordenada",
  recibida: "Recibida",
  cancelada: "Cancelada",
  vencida: "Vencida",
};

export default function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  return <span className={`${cls[status]} px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap`}>{label[status]}</span>;
}
