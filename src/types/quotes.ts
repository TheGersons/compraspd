// src/types/quotes.ts
export type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
export type Scope = "nacional" | "internacional";
export type HistoryStatus = "ganada" | "perdida" | "cancelada" | "cerrada" | "enviada";

export type QuoteItem = { sku: string; desc: string; qty: number; unitPrice: number; currency?: string };

export type QuoteHistory = {
  id: string;
  reference: string;
  requester: string;
  assignedTo?: string;
  requestType: string;
  scope: string;
  createdAt: string;
  closedAt?: string;
  amount?: number;
  currency?: string;
  status: string;
  notes?: string;
  items?: { sku: string; description: string; quantity: number; unitPrice: number; currency?: string }[];
}