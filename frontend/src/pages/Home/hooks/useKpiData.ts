// hooks/useKpiData.ts
import { useState, useEffect } from 'react';
import { getKpiById } from '../config/kpiConfig';
import { TableData, SummaryData } from '../types/kpi.types';

export function useKpiData(kpiId: string) {
  const [data, setData] = useState<TableData | SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kpiConfig = getKpiById(kpiId);

  useEffect(() => {
    if (!kpiConfig) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await kpiConfig.fetchData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        console.error('Error loading KPI data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kpiId]);

  return { data, loading, error, kpiConfig };
}