// src/components/common/AccessDeniedDialog.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigateWithRole } from '../../hooks/useNavigateWithRole';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AccessDeniedDialog({ isOpen, onClose, message }: Props) {
  const navigate = useNavigate();
  const { navigateSafe, canAccess, getHomeRoute } = useNavigateWithRole();

  useEffect(() => {
    if (isOpen) {
      // Auto cerrar y redirigir después de 3 segundos
      const timer = setTimeout(() => {
        onClose();
        navigate(-1); // o navigate('/quotes')
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Acceso Denegado
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {message || 'No tienes permisos para acceder a esta página'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              onClose();
              navigateSafe('/quotes');
            }}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ir al inicio
          </button>
          <button
            onClick={() => {
              onClose();
              navigate(-1);
            }}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
          >
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}