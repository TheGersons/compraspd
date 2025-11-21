// context/NotificationContext.tsx
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Notification, NotificationType, NotificationPriority, NotificationConfig, ToastNotification } from '../types/notification.types';

interface NotificationContextType {
  notifications: Notification[];
  toasts: ToastNotification[];
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: NotificationPriority;
      source?: string;
      actionUrl?: string;
      metadata?: Record<string, any>;
    }
  ) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

const defaultConfig: NotificationConfig = {
  repeatConfig: {
    info: 1,
    success: 1,
    warn: 2,
    danger: 999 // Prácticamente infinito hasta que se resuelva
  },
  autoCloseDuration: {
    info: 5000,
    success: 4000,
    warn: 7000,
    danger: 0 // No se cierra automáticamente
  },
  playSound: false,
  maxVisible: 4
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem('app_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: NotificationPriority;
      source?: string;
      actionUrl?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    const priority = options?.priority || 'medium';
    const maxShows = defaultConfig.repeatConfig[type];

    // Verificar si ya existe una notificación similar (mismo title y message)
    const existing = notifications.find(
      n => n.title === title && n.message === message && !n.isDismissed
    );

    if (existing) {
      // Si ya existe y ha alcanzado el máximo de shows, no hacer nada
      if (existing.showCount >= existing.maxShows) {
        return;
      }

      // Incrementar el contador de shows
      setNotifications(prev =>
        prev.map(n =>
          n.id === existing.id
            ? { ...n, showCount: n.showCount + 1 }
            : n
        )
      );

      // Mostrar toast solo si no ha alcanzado el máximo
      if (existing.showCount < maxShows) {
        showToast({ ...existing, showCount: existing.showCount + 1 });
      }
    } else {
      // Crear nueva notificación
      const newNotification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        priority,
        title,
        message,
        timestamp: new Date(),
        isRead: false,
        isDismissed: false,
        showCount: 1,
        maxShows,
        source: options?.source,
        actionUrl: options?.actionUrl,
        metadata: options?.metadata
      };

      setNotifications(prev => [newNotification, ...prev]);
      showToast(newNotification);
    }
  }, [notifications]);

  const showToast = useCallback((notification: Notification) => {
    // No mostrar si ya hay demasiados toasts visibles
    if (toasts.filter(t => t.isVisible).length >= defaultConfig.maxVisible) {
      return;
    }

    const duration = defaultConfig.autoCloseDuration[notification.type];
    const expiresAt = duration > 0 ? new Date(Date.now() + duration) : undefined;

    const toast: ToastNotification = {
      ...notification,
      isVisible: true,
      expiresAt
    };

    setToasts(prev => [...prev, toast]);

    // Auto-cerrar si tiene duración
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, duration);
    }
  }, [toasts]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isDismissed: true, isRead: true } : n
      )
    );
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isDismissed: true, isRead: true }))
    );
    setToasts([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.isRead && !n.isDismissed).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        addNotification,
        dismissNotification,
        markAsRead,
        clearAll,
        getUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}