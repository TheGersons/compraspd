// types/notification.types.ts

export type NotificationType = 'info' | 'success' | 'warn' | 'danger';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isDismissed: boolean;
  showCount: number; // Cuántas veces se ha mostrado
  maxShows: number;  // Máximo de veces que se puede mostrar
  source?: string;   // De dónde viene (ej: "KPI", "System", "User")
  actionUrl?: string; // URL opcional para acción
  metadata?: Record<string, any>;
}

export interface NotificationConfig {
  // Configuración de repetición según tipo
  repeatConfig: {
    info: number;      // 1 vez
    success: number;   // 1 vez
    warn: number;      // 2 veces
    danger: number;    // Hasta eliminar (999)
  };
  // Duración del toast en ms
  autoCloseDuration: {
    info: number;      // 5 segundos
    success: number;   // 4 segundos
    warn: number;      // 7 segundos
    danger: number;    // No se cierra automáticamente
  };
  // Sonido
  playSound: boolean;
  // Máximo de toasts visibles simultáneamente
  maxVisible: number;
}

export interface ToastNotification extends Notification {
  isVisible: boolean;
  expiresAt?: Date;
}