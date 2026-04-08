// hooks/useKpiGenerator.ts
import { useState, useEffect } from 'react';
import { COTIZACIONES_KPIS, COMPRAS_KPIS, IMPORT_EXPORT_KPIS } from '../config/kpiConfig';
import { KpiData, SummaryData } from '../types/kpi.types';

async function generateKpiGroup(configs: typeof COTIZACIONES_KPIS): Promise<KpiData[]> {
  return Promise.all(
    configs.map(async (config) => {
      try {
        const data = await config.fetchData();
        let value: string | number;

        if (config.type === 'table') {
          value = (data as any).total || 0;
        } else {
          // Use apiValue from the fetcher if available
          const summaryData = data as SummaryData;
          value = summaryData.apiValue !== undefined ? summaryData.apiValue : 0;
        }

        return {
          id: config.id,
          title: config.title,
          value,
          hint: config.hint,
          tone: config.colorCriteria(value),
          type: config.type,
          columns: config.columns,
          details: config.type === 'summary' ? data as any : undefined
        };
      } catch (error) {
        console.error(`Error loading ${config.id}:`, error);
        return {
          id: config.id,
          title: config.title,
          value: 0,
          hint: config.hint,
          tone: 'info' as const,
          type: config.type,
          columns: config.columns
        };
      }
    })
  );
}

export function useKpiGenerator() {
  const [cotizacionesKpis, setCotizacionesKpis] = useState<KpiData[]>([]);
  const [comprasKpis, setComprasKpis] = useState<KpiData[]>([]);
  const [importExportKpis, setImportExportKpis] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKpis = async () => {
      try {
        const [cotizacionesData, comprasData, importExportData] = await Promise.all([
          generateKpiGroup(COTIZACIONES_KPIS),
          generateKpiGroup(COMPRAS_KPIS),
          generateKpiGroup(IMPORT_EXPORT_KPIS),
        ]);

        setCotizacionesKpis(cotizacionesData);
        setComprasKpis(comprasData);
        setImportExportKpis(importExportData);
      } catch (error) {
        console.error('Error generating KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKpis();
  }, []);

  return {
    cotizacionesKpis,
    comprasKpis,
    importExportKpis,
    loading
  };
}
