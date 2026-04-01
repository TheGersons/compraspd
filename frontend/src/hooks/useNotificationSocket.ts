import { useEffect, useRef } from 'react';
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
 * Conecta al endpoint SSE /notificaciones/stream y llama onNotification
 * cada vez que llega una notificación en tiempo real.
 * Usa fetch + ReadableStream para poder enviar el header Authorization.
 */
export function useNotificationSocket({ onNotification }: Options) {
  const callbackRef = useRef(onNotification);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    let active = true;

    async function connect() {
      const token = getToken();
      if (!token) return;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/notificaciones/stream`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'text/event-stream',
            },
            signal: controller.signal,
          },
        );

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ''; // Guardar línea incompleta

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const raw = line.slice(6).trim();
                const parsed = JSON.parse(raw);
                // NestJS SSE wraps: { data: "...string..." }
                const data = typeof parsed === 'string'
                  ? JSON.parse(parsed)
                  : parsed;
                callbackRef.current(data as BackendNotification);
              } catch {
                // Ignorar líneas malformadas
              }
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // Reconectar tras 5 s en caso de error de red
        if (active) setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);
}
