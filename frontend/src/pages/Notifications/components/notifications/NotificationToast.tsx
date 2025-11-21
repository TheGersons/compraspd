// components/notifications/NotificationToast.tsx
import { useEffect, useState } from 'react';
import { ToastNotification } from '../../types/notification.types';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationToastProps {
  notification: ToastNotification;
}

export default function NotificationToast({ notification }: NotificationToastProps) {
  const { dismissNotification, markAsRead } = useNotifications();
  const [isExiting, setIsExiting] = useState(false);

  const colors = {
    info: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/30',
      border: 'border-cyan-200 dark:border-cyan-700',
      icon: 'text-cyan-600 dark:text-cyan-400',
      title: 'text-cyan-900 dark:text-cyan-100',
      message: 'text-cyan-700 dark:text-cyan-300',
      progress: 'bg-cyan-500'
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-700',
      icon: 'text-emerald-600 dark:text-emerald-400',
      title: 'text-emerald-900 dark:text-emerald-100',
      message: 'text-emerald-700 dark:text-emerald-300',
      progress: 'bg-emerald-500'
    },
    warn: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-700',
      icon: 'text-amber-600 dark:text-amber-400',
      title: 'text-amber-900 dark:text-amber-100',
      message: 'text-amber-700 dark:text-amber-300',
      progress: 'bg-amber-500'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-200 dark:border-rose-700',
      icon: 'text-rose-600 dark:text-rose-400',
      title: 'text-rose-900 dark:text-rose-100',
      message: 'text-rose-700 dark:text-rose-300',
      progress: 'bg-rose-500'
    }
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warn: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const theme = colors[notification.type];

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 300);
  };

  // Auto-marcar como leído después de 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      markAsRead(notification.id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notification.id, markAsRead]);

  // Calcular tiempo restante para el progress bar
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    if (!notification.expiresAt) return;

    const duration = notification.expiresAt.getTime() - notification.timestamp.getTime();
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [notification.expiresAt, notification.timestamp]);

  return (
    <div
      className={`
        relative w-80 rounded-lg border shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${theme.bg} ${theme.border}
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      {/* Progress bar (solo si tiene expiresAt) */}
      {notification.expiresAt && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/30 dark:bg-gray-700/30 rounded-b-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${theme.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${theme.icon}`}>
            {icons[notification.type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className={`text-sm font-semibold ${theme.title}`}>
                  {notification.title}
                </p>
                <p className={`mt-1 text-xs ${theme.message}`}>
                  {notification.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Metadata */}
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {notification.source && (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-current" />
                  {notification.source}
                </span>
              )}
              <span>
                {new Date(notification.timestamp).toLocaleTimeString('es-HN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {notification.showCount > 1 && (
                <span className="font-medium">
                  ({notification.showCount}/{notification.maxShows})
                </span>
              )}
            </div>

            {/* Action button */}
            {notification.actionUrl && (
              <button
                className={`mt-2 text-xs font-medium ${theme.icon} hover:underline`}
                onClick={() => {
                  // Aquí iría la navegación
                  console.log('Navigate to:', notification.actionUrl);
                }}
              >
                Ver detalles →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}