// context/NotificationContext.tsx
import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
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
    danger: 999 
  },
  autoCloseDuration: {
    info: 5000,
    success: 4000,
    warn: 7000,
    danger: 0 
  },
  playSound: false,
  maxVisible: 4
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Ref para acceder al estado más reciente dentro de los callbacks sin añadirlos como dependencia
  const notificationsRef = useRef<Notification[]>([]);
  const toastsRef = useRef<ToastNotification[]>([]);

  // Sincronizar Refs con el Estado
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem('app_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const loaded = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(loaded);
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

  // ✅ CORREGIDO: Lógica para evitar keys duplicadas en Toasts
  const showToast = useCallback((notification: Notification) => {
    setToasts(prev => {
      // 1. Verificar límite de visualización
      const visibleCount = prev.filter(t => t.isVisible).length;
      if (visibleCount >= defaultConfig.maxVisible) {
        // Si ya hay muchos, reemplazamos el más antiguo o simplemente no mostramos (depende de tu UX)
        // Aquí opto por eliminar el más antiguo si está lleno, o retornar prev si prefieres bloquear
        if (visibleCount >= defaultConfig.maxVisible) {
             const [first, ...rest] = prev;
             return [...rest]; // Rotación simple
        }
      }

      const duration = defaultConfig.autoCloseDuration[notification.type];
      const expiresAt = duration > 0 ? new Date(Date.now() + duration) : undefined;

      const toast: ToastNotification = {
        ...notification,
        isVisible: true,
        expiresAt
      };

      // 2. CRÍTICO: Filtrar si ya existe un toast con este ID para evitar "Duplicate keys"
      // Al filtrar, eliminamos la versión vieja y metemos la nueva (reseteando el timer visualmente)
      const cleanPrev = prev.filter(t => t.id !== notification.id);
      
      return [...cleanPrev, toast];
    });

    // Auto-cerrar si tiene duración
    const duration = defaultConfig.autoCloseDuration[notification.type];
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== notification.id));
      }, duration);
    }
  }, []);

  // ✅ CORREGIDO: Uso de Refs para lógica de duplicados y eliminación de dependencias cíclicas
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

    // Usamos el Ref para chequear duplicados instantáneamente sin esperar re-render
    const currentNotifications = notificationsRef.current;
    
    const existing = currentNotifications.find(
      n => n.title === title && n.message === message && !n.isDismissed
    );

    if (existing) {
      if (existing.showCount >= existing.maxShows) {
        return;
      }

      // Actualizar estado funcionalmente
      setNotifications(prev =>
        prev.map(n =>
          n.id === existing.id
            ? { ...n, showCount: n.showCount + 1, timestamp: new Date() } // Actualizamos fecha para que suba arriba si ordenas por fecha
            : n
        )
      );

      if (existing.showCount < maxShows) {
        // Pasamos el existente actualizado
        showToast({ ...existing, showCount: existing.showCount + 1 });
      }
    } else {
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
  }, [showToast]); // Solo dependemos de showToast (que es estable)

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
    // Usamos el ref o el estado, pero como es para renderizar, mejor el estado directo
    // Pero para evitar dependencia en useCallback, usamos el estado en el componente que consume,
    // o simplemente dejamos notifications como dependencia aquí ya que es lectura.
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