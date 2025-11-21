// components/notifications/NotificationPanel.tsx
import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../types/notification.types';

export default function NotificationPanel() {
  const { notifications, dismissNotification, markAsRead, clearAll, getUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (n.isDismissed) return false;
    if (filter === 'unread' && n.isRead) return false;
    return true;
  });

  const unreadCount = getUnreadCount();

  const colors = {
    info: {
      badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      dot: 'bg-cyan-500'
    },
    success: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      dot: 'bg-emerald-500'
    },
    warn: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    danger: {
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      dot: 'bg-rose-500'
    }
  };

  const typeLabels = {
    info: 'Información',
    success: 'Completada',
    warn: 'Advertencia',
    danger: 'Crítica'
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9998] flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-rose-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed left-0 top-0 bottom-0 z-[9999] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notificaciones
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} sin leer
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 p-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Todas ({filteredNotifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Sin leer ({unreadCount})
              </button>
              {filteredNotifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="ml-auto px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    No hay notificaciones
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cuando recibas notificaciones aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      colors={colors}
                      typeLabels={typeLabels}
                      onDismiss={dismissNotification}
                      onMarkRead={markAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Componente individual de notificación en el panel
function NotificationItem({
  notification,
  colors,
  typeLabels,
  onDismiss,
  onMarkRead
}: {
  notification: Notification;
  colors: any;
  typeLabels: any;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const theme = colors[notification.type];

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      }`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className={`inline-block w-2 h-2 rounded-full ${theme.dot} mt-1.5 flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded ${theme.badge}`}>
              {typeLabels[notification.type]}
            </span>
            
            {notification.source && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {notification.source}
              </span>
            )}
            
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {new Date(notification.timestamp).toLocaleDateString('es-HN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            
            {notification.showCount > 1 && (
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                Mostrado {notification.showCount}/{notification.maxShows} veces
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}