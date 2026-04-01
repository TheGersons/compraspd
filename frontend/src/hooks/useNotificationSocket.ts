import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type BackendNotification = {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  creada: string;
  completada: boolean;
  chatId?: string;
  cotizacionId?: string;
};

type Options = {
  onNotification: (n: BackendNotification) => void;
};

/**
 * Conecta al WebSocket /notifications y llama onNotification cada vez
 * que llega un evento 'nueva_notificacion' del servidor.
 */
export function useNotificationSocket({ onNotification }: Options) {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNotification);

  // Mantener referencia actualizada sin reconectar
  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(`${API_BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Conectado al canal de notificaciones');
    });

    socket.on('nueva_notificacion', (data: BackendNotification) => {
      callbackRef.current(data);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Error de conexión:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Solo conecta una vez al montar
}
