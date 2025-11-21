// hooks/useKpiMonitor.ts
import { useEffect, useRef } from 'react';
import { KpiData } from '../types/kpi.types';
import { useNotifications } from '../../Notifications/context/NotificationContext';

interface KpiThreshold {
  kpiId: string;
  warnThreshold: number;
  dangerThreshold: number;
  checkCondition: (value: number | string) => 'ok' | 'warn' | 'danger';
}

const KPI_THRESHOLDS: KpiThreshold[] = [
  // Cotizaciones
  {
    kpiId: 'cot-vencidas',
    warnThreshold: 3,
    dangerThreshold: 6,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 6) return 'danger';
      if (num >= 3) return 'warn';
      return 'ok';
    }
  },
  {
    kpiId: 'cot-pendientes',
    warnThreshold: 5,
    dangerThreshold: 10,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 10) return 'danger';
      if (num >= 5) return 'warn';
      return 'ok';
    }
  },
  {
    kpiId: 'cot-sin-ofertas',
    warnThreshold: 3,
    dangerThreshold: 5,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 5) return 'danger';
      if (num >= 3) return 'warn';
      return 'ok';
    }
  },
  
  // Compras
  {
    kpiId: 'comp-retrasadas',
    warnThreshold: 3,
    dangerThreshold: 5,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 5) return 'danger';
      if (num >= 3) return 'warn';
      return 'ok';
    }
  },
  {
    kpiId: 'comp-fors',
    warnThreshold: 5,
    dangerThreshold: 8,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 8) return 'danger';
      if (num >= 5) return 'warn';
      return 'ok';
    }
  },
  
  // Import/Export
  {
    kpiId: 'ie-en-aduana',
    warnThreshold: 4,
    dangerThreshold: 6,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 6) return 'danger';
      if (num >= 4) return 'warn';
      return 'ok';
    }
  },
  {
    kpiId: 'ie-retenidas',
    warnThreshold: 2,
    dangerThreshold: 3,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 3) return 'danger';
      if (num >= 2) return 'warn';
      return 'ok';
    }
  },
  {
    kpiId: 'ie-documentos-pendientes',
    warnThreshold: 3,
    dangerThreshold: 5,
    checkCondition: (value) => {
      const num = Number(value);
      if (num >= 5) return 'danger';
      if (num >= 3) return 'warn';
      return 'ok';
    }
  }
];

const KPI_TITLES: Record<string, string> = {
  'cot-vencidas': 'Cotizaciones Vencidas',
  'cot-pendientes': 'Cotizaciones Pendientes',
  'cot-sin-ofertas': 'Cotizaciones Sin Ofertas',
  'comp-retrasadas': 'Compras Retrasadas',
  'comp-fors': 'Compras en FORS',
  'ie-en-aduana': 'Importaciones en Aduana',
  'ie-retenidas': 'Importaciones Retenidas',
  'ie-documentos-pendientes': 'Documentos Pendientes'
};

export function useKpiMonitor(
  cotizacionesKpis: KpiData[],
  comprasKpis: KpiData[],
  importExportKpis: KpiData[]
) {
  const { addNotification } = useNotifications();
  const previousStatesRef = useRef<Map<string, 'ok' | 'warn' | 'danger'>>(new Map());
  const allKpis = [...cotizacionesKpis, ...comprasKpis, ...importExportKpis];

  useEffect(() => {
    // Solo ejecutar si hay KPIs cargados
    if (allKpis.length === 0) return;

    allKpis.forEach(kpi => {
      const threshold = KPI_THRESHOLDS.find(t => t.kpiId === kpi.id);
      if (!threshold) return;

      const currentState = threshold.checkCondition(kpi.value);
      const previousState = previousStatesRef.current.get(kpi.id);

      // Si el estado cambió o es la primera vez
      if (currentState !== 'ok' && currentState !== previousState) {
        const kpiTitle = KPI_TITLES[kpi.id] || kpi.title;
        
        if (currentState === 'danger') {
          addNotification(
            'danger',
            `⚠️ KPI Crítico: ${kpiTitle}`,
            `El valor actual (${kpi.value}) ha alcanzado el umbral crítico. Requiere atención inmediata.`,
            {
              priority: 'critical',
              source: 'Monitor de KPIs',
              actionUrl: `/dashboard?highlight=${kpi.id}`,
              metadata: {
                kpiId: kpi.id,
                value: kpi.value,
                threshold: threshold.dangerThreshold,
                previousState
              }
            }
          );
        } else if (currentState === 'warn') {
          addNotification(
            'warn',
            `⚠️ Advertencia: ${kpiTitle}`,
            `El valor actual (${kpi.value}) se acerca al umbral crítico. Considere tomar acción preventiva.`,
            {
              priority: 'high',
              source: 'Monitor de KPIs',
              actionUrl: `/dashboard?highlight=${kpi.id}`,
              metadata: {
                kpiId: kpi.id,
                value: kpi.value,
                threshold: threshold.warnThreshold,
                previousState
              }
            }
          );
        }

        previousStatesRef.current.set(kpi.id, currentState);
      } else if (currentState === 'ok' && previousState && previousState !== 'ok') {
        // El KPI volvió a estado normal
        const kpiTitle = KPI_TITLES[kpi.id] || kpi.title;
        addNotification(
          'success',
          `✅ KPI Normalizado: ${kpiTitle}`,
          `El valor actual (${kpi.value}) ha vuelto a niveles normales.`,
          {
            priority: 'medium',
            source: 'Monitor de KPIs',
            actionUrl: `/dashboard?highlight=${kpi.id}`,
            metadata: {
              kpiId: kpi.id,
              value: kpi.value,
              previousState
            }
          }
        );
        
        previousStatesRef.current.set(kpi.id, currentState);
      }
    });
  }, [allKpis, addNotification]);

  return {
    monitoredKpis: KPI_THRESHOLDS.map(t => t.kpiId),
    currentStates: previousStatesRef.current
  };
}