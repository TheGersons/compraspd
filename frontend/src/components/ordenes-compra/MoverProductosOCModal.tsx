import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { getToken } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Producto = {
  id: string;
  sku: string;
  descripcion: string;
  comprado?: boolean;
  pagado?: boolean;
  enFOB?: boolean;
  enCIF?: boolean;
  recibido?: boolean;
  conBL?: boolean;
};

type OrdenCompra = {
  id: string;
  nombre: string;
  numeroOC?: string | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  ordenOrigen: OrdenCompra;
  ordenesDestino: OrdenCompra[];
  productos: Producto[];
  onSuccess: () => void;
}

const esProductoElegible = (p: Producto) =>
  !(p.comprado || p.pagado || p.enFOB || p.enCIF || p.recibido || p.conBL);

export function MoverProductosOCModal({
  open,
  onClose,
  ordenOrigen,
  ordenesDestino,
  productos,
  onSuccess,
}: Props) {
  const [destinoId, setDestinoId] = useState<string | "NULL">("NULL");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [guardando, setGuardando] = useState(false);

  const elegibles = useMemo(
    () => productos.filter(esProductoElegible),
    [productos],
  );

  useEffect(() => {
    if (open) {
      setSeleccionados(new Set());
      setDestinoId(ordenesDestino.length > 0 ? ordenesDestino[0].id : "NULL");
    }
  }, [open, ordenesDestino]);

  if (!open) return null;

  const toggleTodos = () => {
    if (seleccionados.size === elegibles.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(elegibles.map((p) => p.id)));
    }
  };

  const toggle = (id: string) => {
    const nuevo = new Set(seleccionados);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setSeleccionados(nuevo);
  };

  const handleSubmit = async () => {
    if (seleccionados.size === 0) {
      toast.error("Seleccione al menos un producto");
      return;
    }
    try {
      setGuardando(true);
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/v1/ordenes-compra/${ordenOrigen.id}/mover-productos`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estadoProductoIds: Array.from(seleccionados),
            ordenDestinoId: destinoId === "NULL" ? null : destinoId,
          }),
        },
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al mover productos");
      }
      toast.success(`${seleccionados.size} producto(s) movidos`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Error al mover productos");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Mover productos de OC
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Origen: <span className="font-medium">{ordenOrigen.nombre}</span>
            {ordenOrigen.numeroOC && (
              <span className="text-gray-500"> ({ordenOrigen.numeroOC})</span>
            )}
          </p>

          {/* Destino */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Destino
            </label>
            <select
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value as any)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {ordenesDestino.map((oc) => (
                <option key={oc.id} value={oc.id}>
                  {oc.nombre}{oc.numeroOC ? ` (${oc.numeroOC})` : ""}
                </option>
              ))}
              <option value="NULL">— Sin OC (devolver a la cotización base)</option>
            </select>
          </div>

          {/* Productos */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Productos a mover ({seleccionados.size}/{elegibles.length})
              </label>
              <button
                type="button"
                onClick={toggleTodos}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                {seleccionados.size === elegibles.length
                  ? "Deseleccionar todos"
                  : "Seleccionar todos"}
              </button>
            </div>

            {elegibles.length === 0 ? (
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                No hay productos elegibles en esta OC. Solo se pueden mover
                productos que aún no estén en estado "comprado" o posterior.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-600">
                {elegibles.map((p) => {
                  const checked = seleccionados.has(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-2 border-b border-gray-200 px-3 py-2 text-sm last:border-b-0 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                        checked ? "bg-blue-50 dark:bg-gray-700" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(p.id)}
                        className="mt-0.5 h-4 w-4 rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900 dark:text-white">
                          {p.sku}
                        </p>
                        <p
                          className="truncate text-xs text-gray-500 dark:text-gray-400"
                          title={p.descripcion}
                        >
                          {p.descripcion}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={guardando || seleccionados.size === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Moviendo..." : "Mover"}
          </button>
        </div>
      </div>
    </div>
  );
}
