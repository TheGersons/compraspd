// src/pages/Quotes/components/KpiCard.tsx
export type KpiTone = "default" | "success" | "warn" | "danger" | "brand";

const dot: Record<KpiTone, string> = {
  default: "bg-gray-300",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
  danger: "bg-rose-500",
  brand: "bg-brand-500",
};

export default function KpiCard(
  { title, value, hint, tone="default", icon }:
  { title:string; value:string|number; hint?:string; tone?:KpiTone; icon?:React.ReactNode }
) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] my-8">
      <div className="flex items-center gap-2">
        <span className={`inline-block size-2 rounded-full ${dot[tone]}`} />
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {icon && <span className="ml-auto opacity-80">{icon}</span>}
      </div>
      <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
