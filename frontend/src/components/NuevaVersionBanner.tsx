import { useState } from 'react';
import { useAppVersion } from '@/hooks/useAppVersion';

export default function NuevaVersionBanner() {
  const { hayNueva } = useAppVersion();
  const [oculto, setOculto] = useState(false);

  if (!hayNueva || oculto) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-lg dark:border-blue-800 dark:bg-blue-950">
      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
        Nueva versión disponible
      </span>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
      >
        Recargar ahora
      </button>
      <button
        onClick={() => setOculto(true)}
        className="rounded-lg border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
      >
        Más tarde
      </button>
    </div>
  );
}
