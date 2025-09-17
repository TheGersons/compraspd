// pages/Quotes/components/QuotesTable.tsx
import StatusBadge, { QuoteStatus } from "./StatusBadge";

export type Quote = {
  id: string; customer: string; createdAt: string; dueAt: string;
  assignedTo?: string; amount: number; currency: "HNL" | "USD"; status: QuoteStatus;
};

export default function QuotesTable({ data }: { data: Quote[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Asignado a</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Vence</th>
            <th className="px-4 py-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map(q => (
            <tr key={q.id} className="text-sm text-gray-700 dark:text-gray-300">
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{q.id}</td>
              <td className="px-4 py-3">{q.customer}</td>
              <td className="px-4 py-3">{q.assignedTo ?? <span className="text-gray-400">Sin asignar</span>}</td>
              <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
              <td className="px-4 py-3">{new Date(q.dueAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right">
                {q.amount.toLocaleString(undefined, { style: "currency", currency: q.currency })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
