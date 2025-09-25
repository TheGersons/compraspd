import PurchaseStatusBadge from "./StatusBadge";
import type { Purchase } from "../../data/purchase";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(iso));

export default function PurchasesTable({ data }: { data: Purchase[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <Th>Codigo</Th><Th>Proveedor</Th><Th>Responsable</Th><Th>Vence</Th><Th>Monto</Th><Th>Estado</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map(p => (
            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <Td>{p.id}</Td>
              <Td>{p.supplier}</Td>
              <Td>{p.responsible ?? "Sin asignar"}</Td>
              <Td>{fmtDate(p.dueAt)}</Td>
              <Td>{p.amount.toLocaleString(undefined, { style: "currency", currency: p.currency })}</Td>
              <Td><PurchaseStatusBadge status={p.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{children}</td>;
}
