// types/kpi.types.ts

export type KpiType = 'summary' | 'table';
export type KpiTone = 'success' | 'danger' | 'warn' | 'info';
export type KpiCategory = 'cotizaciones' | 'compras' | 'import-export';

export interface KpiColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface KpiConfig {
  id: string;
  category: KpiCategory;
  title: string;
  type: KpiType;
  hint?: string;
  columns?: KpiColumn[];
  colorCriteria: (value: number | string) => KpiTone;
  fetchData: () => Promise<any>;
}

export interface KpiData {
  id: string;
  title: string;
  value: number | string;
  hint?: string;
  tone: KpiTone;
  type: KpiType;
  columns?: KpiColumn[];
  details?: {
    source?: string;
    lastUpdate?: string;
    trend?: string;
  };
}

// Datos para tabla
export interface TableRow {
  [key: string]: string | number | boolean;
}

export interface TableData {
  rows: TableRow[];
  total: number;
}

// Datos para summary
export interface SummaryData {
  source: string;
  lastUpdate: string;
  trend: string;
  additionalInfo?: Record<string, any>;
}