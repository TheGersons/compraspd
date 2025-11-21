// pages/Quotes/components/StatusBadge.tsx
export type QuoteStatus = "open" | "in_review" | "approved" | "rejected" | "expired" | "cancelled";

const cls: Record<QuoteStatus, string> = {
  open:      "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-300",
  in_review: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  approved:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  rejected:  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  expired:   "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300",
  cancelled: "bg-red-100 text-gray-700 dark:bg-red-500/10 dark:text-gray-300",
};

export default function StatusBadge({ status }: { status: QuoteStatus }) {
  const label = { open:"Abierta", in_review:"En revisión", approved:"Aprobada", rejected:"Rechazada", expired:"Vencida", cancelled:"Cancelada" }[status];
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${cls[status]}`}>{label}</span>;
}
