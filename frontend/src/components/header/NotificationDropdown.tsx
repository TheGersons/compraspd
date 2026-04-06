import { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
  useNotificationSocket,
  BackendNotification,
} from "../../hooks/useNotificationSocket";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Devuelve la ruta a la que debe navegar una notificación según su tipo,
 * los IDs disponibles y el rol del usuario.
 */
function resolveNotifUrl(
  n: BackendNotification,
  userRole: string | undefined,
): string | null {
  const isSupervisorOrAbove =
    userRole === "SUPERVISOR" || userRole === "ADMIN" || userRole === "COMERCIAL";

  if (n.tipo === "COMPRA_CREADA") {
    if (n.cotizacionId)
      return `/quotes/follow-ups?cotizacion=${n.cotizacionId}`;
    return "/quotes/follow-ups";
  }

  if (n.tipo === "COMENTARIO_NUEVO") {
    const base = isSupervisorOrAbove ? "/quotes/follow-ups" : "/quotes/my-quotes";
    if (n.cotizacionId) return `${base}?cotizacion=${n.cotizacionId}`;
    return base;
  }

  if (n.tipo === "ESTADO_ACTUALIZADO" || n.tipo === "COMPRA_COMPLETADA") {
    if (n.cotizacionId)
      return `/quotes/my-quotes?cotizacion=${n.cotizacionId}`;
    return "/quotes/my-quotes";
  }

  return null;
}

// Iconos por tipo de notificación
function NotifIcon({ tipo }: { tipo: string }) {
  const base = "flex h-9 w-9 items-center justify-center rounded-full text-lg flex-shrink-0";
  if (tipo === "COMENTARIO_NUEVO")
    return <span className={`${base} bg-blue-100 dark:bg-blue-900/40`}>💬</span>;
  if (tipo === "COMPRA_CREADA")
    return <span className={`${base} bg-emerald-100 dark:bg-emerald-900/40`}>📋</span>;
  if (tipo === "ESTADO_ACTUALIZADO")
    return <span className={`${base} bg-yellow-100 dark:bg-yellow-900/40`}>🔄</span>;
  if (tipo === "COMPRA_COMPLETADA")
    return <span className={`${base} bg-green-100 dark:bg-green-900/40`}>✅</span>;
  return <span className={`${base} bg-gray-100 dark:bg-gray-700`}>🔔</span>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = (user as any)?.rol?.nombre?.toUpperCase() as string | undefined;

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/notificaciones?pageSize=20`,
        { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notificaciones/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {}
  }, []);

  // Carga inicial + polling cada 60s
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  // Socket en tiempo real
  useNotificationSocket({
    onNotification: useCallback((n: BackendNotification) => {
      setNotifications((prev) => [n, ...prev.slice(0, 19)]);
      setUnreadCount((c) => c + 1);
    }, []),
  });

  const handleOpen = async () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      // Al abrir, marcar todas como leídas y refrescar lista
      const token = getToken();
      if (token && unreadCount > 0) {
        fetch(`${API_BASE_URL}/api/v1/notificaciones/read-all`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }).then(() => {
          setUnreadCount(0);
          setNotifications((prev) => prev.map((n) => ({ ...n, completada: true })));
        }).catch(() => {});
      }
      await fetchNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleOpen}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60"></span>
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notificaciones
          </h5>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Lista */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar flex-1">
          {loading && notifications.length === 0 && (
            <li className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </li>
          )}

          {!loading && notifications.length === 0 && (
            <li className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-4xl mb-3">🔔</span>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sin notificaciones por ahora
              </p>
            </li>
          )}

          {notifications.map((n) => {
            const destUrl = resolveNotifUrl(n, userRole);
            const handleClick = () => {
              setIsOpen(false);
              if (destUrl) navigate(destUrl);
            };
            return (
              <li key={n.id}>
                <div
                  role={destUrl ? "button" : undefined}
                  tabIndex={destUrl ? 0 : undefined}
                  onClick={destUrl ? handleClick : undefined}
                  onKeyDown={destUrl ? (e) => e.key === "Enter" && handleClick() : undefined}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 px-3 py-3 transition-colors dark:border-gray-800 ${
                    !n.completada ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                  } ${destUrl ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5" : ""}`}
                >
                  <NotifIcon tipo={n.tipo} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90 leading-tight">
                      {n.titulo}
                      {!n.completada && (
                        <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-blue-500 align-middle" />
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {n.descripcion}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {timeAgo(n.creada)}
                      </p>
                      {destUrl && (
                        <span className="text-[10px] font-medium text-blue-500 dark:text-blue-400">
                          Ver →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={() => setIsOpen(false)}
        >
          Ver todas las notificaciones
        </Link>
      </Dropdown>
    </div>
  );
}
