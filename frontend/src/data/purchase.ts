export const purchaseMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const purchasesPerMonth = [10, 20, 15, 25, 20, 22, 18, 24, 30, 28, 26, 31];
export const amountPurchasesPerMonth = [300, 450, 500, 475, 520, 480, 510, 600, 680, 650, 700, 720]; // en miles
export const purchasesByStatus = { pendiente: 4, ordenada: 7, recibida: 10, cancelada: 1, vencida: 2 };

export type PurchaseStatus = keyof typeof purchasesByStatus;

export type Purchase = {
  id: string;
  supplier: string;
  createdAt: string;   // ISO
  dueAt: string;       // ISO
  responsible?: string;
  amount: number;
  currency: "USD" | "HNL";
  status: PurchaseStatus;
};

export const purchases: Purchase[] = [
  { id: "P-2025-0001", supplier: "Proveedor A", createdAt: "2025-09-10", dueAt: "2025-10-05", responsible: "María", amount: 25000, currency: "USD", status: "pendiente" },
  { id: "P-2025-0002", supplier: "Proveedor B", createdAt: "2025-09-09", dueAt: "2025-09-20", amount: 45000, currency: "HNL", status: "ordenada" },
  { id: "P-2025-0003", supplier: "Proveedor C", createdAt: "2025-09-08", dueAt: "2025-09-22", responsible: "Carlos", amount: 15000, currency: "USD", status: "recibida" },
  { id: "P-2025-0004", supplier: "Proveedor D", createdAt: "2025-09-07", dueAt: "2025-09-18", responsible: "Ana", amount: 35000, currency: "USD", status: "cancelada" },
  { id: "P-2025-0005", supplier: "Proveedor E", createdAt: "2025-09-06", dueAt: "2025-09-15", amount: 28000, currency: "HNL", status: "ordenada" },
  { id: "P-2025-0006", supplier: "Proveedor F", createdAt: "2025-09-05", dueAt: "2025-09-25", responsible: "Luis", amount: 32000, currency: "USD", status: "vencida" },
  { id: "P-2025-0007", supplier: "Proveedor G", createdAt: "2025-09-04", dueAt: "2025-09-30", responsible: "María", amount: 22000, currency: "USD", status: "recibida" },
  { id: "P-2025-0008", supplier: "Proveedor H", createdAt: "2025-09-03", dueAt: "2025-09-23", amount: 40000, currency: "HNL", status: "pendiente" },
];
