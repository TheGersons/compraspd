// pages/Quotes/components/ChartCard.tsx
export default function ChartCard({ title, children }:{title:string; children:React.ReactNode}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4
                    dark:border-white/10 dark:bg-[#101828]"> {/* azul oscuro */}
      <p className="mb-2 text-sm text-gray-500 dark:text-gray-300">{title}</p>
      {children}
    </div>
  );
}
