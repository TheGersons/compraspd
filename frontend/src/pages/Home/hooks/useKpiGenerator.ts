// hooks/useKpiGenerator.ts
import { useState, useEffect } from 'react';
import { COTIZACIONES_KPIS, COMPRAS_KPIS, IMPORT_EXPORT_KPIS } from '../config/kpiConfig';
import { KpiData } from '../types/kpi.types';

export function useKpiGenerator() {
  const [cotizacionesKpis, setCotizacionesKpis] = useState<KpiData[]>([]);
  const [comprasKpis, setComprasKpis] = useState<KpiData[]>([]);
  const [importExportKpis, setImportExportKpis] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateKpis = async () => {
      try {
        // Generar KPIs de Cotizaciones
        const cotizacionesData = await Promise.all(
          COTIZACIONES_KPIS.map(async (config) => {
            try {
              const data = await config.fetchData();
              let value: string | number;
              
              if (config.type === 'table') {
                value = (data as any).total || 0;
              } else {
                // Para summary, asignar valores específicos por ID
                if (config.id === 'cot-aprobadas') value = 7;
                else if (config.id === 'cot-monto-total') value = 'L 2.5M';
                else if (config.id === 'cot-promedio-dias') value = '4.2';
                else value = 0;
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

        // Generar KPIs de Compras
        const comprasData = await Promise.all(
          COMPRAS_KPIS.map(async (config) => {
            try {
              const data = await config.fetchData();
              let value: string | number;
              
              if (config.type === 'table') {
                value = (data as any).total || 0;
              } else {
                // Para summary, asignar valores específicos por ID
                if (config.id === 'comp-completadas') value = 234;
                else if (config.id === 'comp-monto-mes') value = 'L 1.8M';
                else value = 0;
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

        // Generar KPIs de Import/Export
        const importExportData = await Promise.all(
          IMPORT_EXPORT_KPIS.map(async (config) => {
            try {
              const data = await config.fetchData();
              let value: string | number;
              
              if (config.type === 'table') {
                value = (data as any).total || 0;
              } else {
                // Para summary, asignar valores específicos por ID
                if (config.id === 'ie-valor-total') value = '$850K';
                else if (config.id === 'ie-dias-promedio') value = '12.5';
                else value = 0;
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

        setCotizacionesKpis(cotizacionesData);
        setComprasKpis(comprasData);
        setImportExportKpis(importExportData);
      } catch (error) {
        console.error('Error generating KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    generateKpis();
  }, []);

  return {
    cotizacionesKpis,
    comprasKpis,
    importExportKpis,
    loading
  };
}