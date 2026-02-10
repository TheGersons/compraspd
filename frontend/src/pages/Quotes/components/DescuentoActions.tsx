import { useState, useRef } from 'react';
import { getToken } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Precio = {
  id: string;
  precio: number;
  precioDescuento?: number;
  ComprobanteDescuento?: string;
  seleccionado: boolean;
  proveedor: {
    id: string;
    nombre: string;
    rtn?: string;
  };
  creado: string;
};

type Props = {
  precio: Precio;
  productoId: string;
  cotizacionId: string;
  sku: string;
  onUpdate: () => void;
  onNotification: (type: 'success' | 'danger' | 'warn', title: string, message: string) => void;
};

export default function DescuentoActions({ 
  precio, 
  productoId, 
  cotizacionId, 
  sku, 
  onUpdate,
  onNotification 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [precioDescuento, setPrecioDescuento] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tieneComprobante = !!precio.ComprobanteDescuento;
  const tieneResultado = precio.precioDescuento !== null && precio.precioDescuento !== undefined;
  const esNoAplica = precio.ComprobanteDescuento?.startsWith('NO_APLICA_');

  // Marcar como "No aplica descuento"
  const handleNoAplica = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      // 1. Generar comprobante NO_APLICA
      const noAplicaRes = await fetch(`${API_BASE_URL}/api/v1/storage/no-aplica`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!noAplicaRes.ok) throw new Error('Error al generar comprobante');
      const { comprobante } = await noAplicaRes.json();

      // 2. Solicitar descuento con comprobante automático
      const solicitarRes = await fetch(`${API_BASE_URL}/api/v1/precios/${precio.id}/solicitar-descuento`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comprobanteDescuento: comprobante }),
      });

      if (!solicitarRes.ok) throw new Error('Error al solicitar descuento');

      // 3. Automáticamente establecer precio descuento = precio original (sin descuento)
      const resultadoRes = await fetch(`${API_BASE_URL}/api/v1/precios/${precio.id}/resultado-descuento`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ precioDescuento: precio.precio }),
      });

      if (!resultadoRes.ok) throw new Error('Error al registrar resultado');

      onNotification('success', 'Éxito', 'Marcado como "No aplica descuento"');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      onNotification('danger', 'Error', 'No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Subir archivo de comprobante
  const handleUploadFile = async (file: File) => {
    setLoading(true);
    try {
      const token = getToken();

      // 1. Subir archivo a Nextcloud
      const formData = new FormData();
      formData.append('file', file);
      formData.append('cotizacionId', cotizacionId);
      formData.append('sku', sku);
      formData.append('proveedorNombre', precio.proveedor.nombre);
      formData.append('tipo', 'comprobantes_descuento');

      const uploadRes = await fetch(`${API_BASE_URL}/api/v1/storage/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.message || 'Error al subir archivo');
      }

      const { url, fileName } = await uploadRes.json();

      // 2. Registrar comprobante en el precio
      const solicitarRes = await fetch(`${API_BASE_URL}/api/v1/precios/${precio.id}/solicitar-descuento`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comprobanteDescuento: url || fileName }),
      });

      if (!solicitarRes.ok) throw new Error('Error al registrar comprobante');

      onNotification('success', 'Éxito', 'Comprobante subido correctamente');
      setShowUploadModal(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error:', error);
      onNotification('danger', 'Error', error.message || 'No se pudo subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  // Registrar resultado del descuento
  const handleResultadoDescuento = async () => {
    if (!precioDescuento || parseFloat(precioDescuento) <= 0) {
      onNotification('warn', 'Advertencia', 'Ingresa un precio válido');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/api/v1/precios/${precio.id}/resultado-descuento`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ precioDescuento: parseFloat(precioDescuento) }),
      });

      if (!response.ok) throw new Error('Error al registrar resultado');

      const data = await response.json();
      onNotification('success', 'Éxito', data.aprobado ? 'Descuento aprobado' : 'Descuento denegado');
      setShowResultModal(false);
      setPrecioDescuento('');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      onNotification('danger', 'Error', 'No se pudo registrar el resultado');
    } finally {
      setLoading(false);
    }
  };

  // Si ya tiene resultado de descuento, mostrar solo el estado
  if (tieneResultado) {
    return (
      <div className="mt-2 flex items-center gap-2">
        {esNoAplica ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            ➖ No aplica descuento
          </span>
        ) : Number(precio.precioDescuento) < Number(precio.precio) ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✓ Descuento aprobado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            ✗ Descuento denegado
          </span>
        )}
      </div>
    );
  }

  // Si tiene comprobante pero no resultado, mostrar botón para agregar resultado
  if (tieneComprobante && !tieneResultado) {
    return (
      <>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            ⏳ Pendiente resultado
          </span>
          <button
            onClick={() => {
              setPrecioDescuento(String(precio.precio));
              setShowResultModal(true);
            }}
            disabled={loading}
            className="rounded px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            Agregar resultado
          </button>
        </div>

        {/* Modal resultado */}
        {showResultModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Resultado del Descuento
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Precio original: <strong>L. {Number(precio.precio).toFixed(2)}</strong>
              </p>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio final (con o sin descuento)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioDescuento}
                  onChange={(e) => setPrecioDescuento(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Si el descuento fue denegado, ingresa el precio original
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResultadoDescuento}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Estado inicial: mostrar botones para solicitar descuento
  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={handleNoAplica}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {loading ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : (
            '➖'
          )}
          No aplica descuento
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          📎 Subir comprobante
        </button>
      </div>

      {/* Modal subir archivo */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Subir Comprobante de Descuento
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Sube una imagen o PDF del comprobante de solicitud de descuento.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
              }}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Subiendo...</p>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, PNG, JPG hasta 10MB</p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}