// examples/NotificationExamples.tsx
import { useNotifications } from '../context/NotificationContext';

export default function NotificationExamples() {
  const { addNotification } = useNotifications();

  // Ejemplo 1: Notificación informativa (se muestra 1 vez)
  const showInfo = () => {
    addNotification(
      'info',
      'Actualización disponible',
      'Hay una nueva versión del sistema disponible para instalar.',
      {
        priority: 'low',
        source: 'Sistema',
        actionUrl: '/settings/updates'
      }
    );
  };

  // Ejemplo 2: Notificación de éxito (se muestra 1 vez)
  const showSuccess = () => {
    addNotification(
      'success',
      'Orden completada',
      'La orden de compra OC-2024-125 ha sido procesada exitosamente.',
      {
        priority: 'medium',
        source: 'Compras',
        actionUrl: '/compras/OC-2024-125',
        metadata: { orderId: 'OC-2024-125' }
      }
    );
  };

  // Ejemplo 3: Advertencia (se muestra 2 veces)
  const showWarning = () => {
    addNotification(
      'warn',
      'Fecha límite próxima',
      'La cotización COT-2024-026 vence en 2 días. Requiere atención.',
      {
        priority: 'high',
        source: 'Cotizaciones',
        actionUrl: '/cotizaciones/COT-2024-026',
        metadata: { cotizacionId: 'COT-2024-026', daysRemaining: 2 }
      }
    );
  };

  // Ejemplo 4: Crítica (se muestra hasta resolver)
  const showCritical = () => {
    addNotification(
      'danger',
      'KPI en estado crítico',
      'Hay 12 cotizaciones vencidas que requieren acción inmediata.',
      {
        priority: 'critical',
        source: 'KPI Monitor',
        actionUrl: '/dashboard?kpi=cot-vencidas',
        metadata: { kpiId: 'cot-vencidas', value: 12 }
      }
    );
  };

  // Ejemplo 5: Múltiples notificaciones de diferentes tipos
  const showMultiple = () => {
    // Esta se mostrará hasta 2 veces
    addNotification(
      'warn',
      'Documentos pendientes',
      '3 importaciones requieren documentación adicional.',
      { priority: 'high', source: 'Import/Export' }
    );

    // Esta se mostrará indefinidamente hasta resolverse
    addNotification(
      'danger',
      'Retraso crítico',
      'La orden OC-2024-130 tiene 15 días de retraso.',
      { priority: 'critical', source: 'Compras' }
    );

    // Esta solo 1 vez
    addNotification(
      'info',
      'Recordatorio',
      'Reunión de revisión de KPIs mañana a las 10:00 AM.',
      { priority: 'low', source: 'Calendario' }
    );

    // Esta solo 1 vez
    addNotification(
      'success',
      'Objetivo alcanzado',
      'Se completaron 100 órdenes de compra este mes. ¡Felicitaciones!',
      { priority: 'medium', source: 'Sistema' }
    );
  };

  // Ejemplo 6: Notificación desde KPI
  const triggerFromKPI = () => {
    // Simular que un KPI entró en estado peligroso
    addNotification(
      'danger',
      'KPI Crítico: Cotizaciones vencidas',
      'El número de cotizaciones vencidas ha superado el umbral crítico (8 vencidas).',
      {
        priority: 'critical',
        source: 'KPI',
        actionUrl: '/dashboard?kpi=cot-vencidas',
        metadata: {
          kpiId: 'cot-vencidas',
          currentValue: 8,
          threshold: 3,
          type: 'threshold_exceeded'
        }
      }
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Ejemplos de Notificaciones
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Info */}
        <button
          onClick={showInfo}
          className="p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors text-left dark:bg-cyan-900/20 dark:border-cyan-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="font-semibold text-cyan-900 dark:text-cyan-100">
              Informativa
            </span>
          </div>
          <p className="text-sm text-cyan-700 dark:text-cyan-300">
            Se muestra 1 vez. Para información general.
          </p>
        </button>

        {/* Success */}
        <button
          onClick={showSuccess}
          className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-left dark:bg-emerald-900/20 dark:border-emerald-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
              Completada
            </span>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Se muestra 1 vez. Para acciones exitosas.
          </p>
        </button>

        {/* Warning */}
        <button
          onClick={showWarning}
          className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-left dark:bg-amber-900/20 dark:border-amber-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="font-semibold text-amber-900 dark:text-amber-100">
              Advertencia
            </span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Se muestra hasta 2 veces. Requiere atención.
          </p>
        </button>

        {/* Critical */}
        <button
          onClick={showCritical}
          className="p-4 bg-rose-50 border-2 border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-left dark:bg-rose-900/20 dark:border-rose-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="font-semibold text-rose-900 dark:text-rose-100">
              Crítica
            </span>
          </div>
          <p className="text-sm text-rose-700 dark:text-rose-300">
            Se muestra hasta resolver. No se cierra automáticamente.
          </p>
        </button>

        {/* Multiple */}
        <button
          onClick={showMultiple}
          className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left dark:bg-purple-900/20 dark:border-purple-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-purple-900 dark:text-purple-100">
              Múltiples
            </span>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Mostrar varias notificaciones a la vez.
          </p>
        </button>

        {/* From KPI */}
        <button
          onClick={triggerFromKPI}
          className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left dark:bg-blue-900/20 dark:border-blue-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              Desde KPI
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Simular notificación desde un KPI crítico.
          </p>
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reglas de Repetición
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-cyan-500">•</span>
            <span><strong>Informativa:</strong> Se muestra 1 vez. Auto-cierre en 5 segundos.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">•</span>
            <span><strong>Completada:</strong> Se muestra 1 vez. Auto-cierre en 4 segundos.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span><strong>Advertencia:</strong> Se muestra hasta 2 veces. Auto-cierre en 7 segundos.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500">•</span>
            <span><strong>Crítica:</strong> Se muestra hasta que se resuelva manualmente. NO se cierra automáticamente.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}