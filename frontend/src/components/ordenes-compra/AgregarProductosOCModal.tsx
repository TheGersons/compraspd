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
  cotizacionNombre: string;
  productosBase: Producto[]; // productos de la cotización SIN OC asignada
  ordenesExistentes: OrdenCompra[];
  onSuccess: () => void;
}

const esProductoElegible = (p: Producto) =>
  !(p.enFOB || p.enCIF || p.recibido || p.conBL);

export function AgregarProductosOCModal({
  open,
  onClose,
  cotizacionNombre,
  productosBase,
  ordenesExistentes,
  onSuccess,
}: Props) {
  const [destinoId, setDestinoId] = useState<string>("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [guardando, setGuardando] = useState(false);

  const elegibles = useMemo(
    () => productosBase.filter(esProductoElegible),
    [productosBase],
  );

  useEffect(() => {
    if (open) {
      setSeleccionados(new Set());
      setDestinoId(ordenesExistentes[0]?.id ?? "");
    }
  }, [open, ordenesExistentes]);

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
    if (!destinoId) {
      toast.error("Seleccione una OC destino");
      return;
    }
    if (seleccionados.size === 0) {
      toast.error("Seleccione al menos un producto");
      return;
    }
    try {
      setGuardando(true);
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/v1/ordenes-compra/${destinoId}/agregar-productos`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estadoProductoIds: Array.from(seleccionados),
          }),
        },
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al agregar productos");
      }
      toast.success(`${seleccionados.size} producto(s) agregados a la OC`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Error al agregar productos");
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
            Agregar productos a OC existente
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
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Cotización base: <span className="font-medium">{cotizacionNombre}</span>
          </p>

          {/* Destino */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              OC destino
            </label>
            {ordenesExistentes.length === 0 ? (
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                No hay OCs creadas todavía. Usá "Dividir OC" primero.
              </div>
            ) : (
              <select
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {ordenesExistentes.map((oc) => (
                  <option key={oc.id} value={oc.id}>
                    {oc.nombre}{oc.numeroOC ? ` (${oc.numeroOC})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Productos */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Productos a agregar ({seleccionados.size}/{elegibles.length})
              </label>
              {elegibles.length > 0 && (
                <button
                  type="button"
                  onClick={toggleTodos}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  {seleccionados.size === elegibles.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              )}
            </div>

            {elegibles.length === 0 ? (
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                No hay productos elegibles en la cotización base.
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
            disabled={
              guardando ||
              seleccionados.size === 0 ||
              !destinoId ||
              ordenesExistentes.length === 0
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Agregando..." : "Agregar a OC"}
          </button>
        </div>
      </div>
    </div>
  );
}
