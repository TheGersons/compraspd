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
  ordenCompraId?: string | null;
};

type OrdenCompra = {
  id: string;
  nombre: string;
  numeroOC?: string | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  cotizacionId: string;
  cotizacionNombre: string;
  productos: Producto[];
  ordenesExistentes: OrdenCompra[];
  onSuccess: () => void;
}

const esProductoElegible = (p: Producto) =>
  !(p.enFOB || p.enCIF || p.recibido || p.conBL);

export function SplitOrdenCompraModal({
  open,
  onClose,
  cotizacionId,
  cotizacionNombre,
  productos,
  ordenesExistentes,
  onSuccess,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [numeroOC, setNumeroOC] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [guardando, setGuardando] = useState(false);

  const elegibles = useMemo(
    () => productos.filter(esProductoElegible),
    [productos],
  );

  useEffect(() => {
    if (open) {
      const siguiente = ordenesExistentes.length + 2;
      setNombre(`${cotizacionNombre} - OC ${siguiente}`);
      setNumeroOC("");
      setSeleccionados(new Set());
    }
  }, [open, cotizacionNombre, ordenesExistentes.length]);

  const hayCompradoSeleccionado = useMemo(
    () => elegibles.some((p) => seleccionados.has(p.id) && p.comprado),
    [elegibles, seleccionados],
  );

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

  const validar = (): string | null => {
    const n = nombre.trim();
    if (!n) return "El nombre es obligatorio";
    if (n.toLowerCase() === cotizacionNombre.trim().toLowerCase()) {
      return "El nombre debe ser distinto al de la cotización original";
    }
    const duplicado = ordenesExistentes.some(
      (oc) => oc.nombre.trim().toLowerCase() === n.toLowerCase(),
    );
    if (duplicado) return "Ya existe otra OC con ese nombre en esta cotización";
    if (seleccionados.size === 0) return "Seleccione al menos un producto";
    if (hayCompradoSeleccionado && !numeroOC.trim()) {
      return "El número de OC es obligatorio al dividir productos ya comprados";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) {
      toast.error(err);
      return;
    }
    try {
      setGuardando(true);
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/ordenes-compra`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cotizacionId,
          nombre: nombre.trim(),
          numeroOC: numeroOC.trim() || undefined,
          estadoProductoIds: Array.from(seleccionados),
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al crear OC");
      }
      toast.success("Orden de compra creada");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Error al crear OC");
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
            Nueva Orden de Compra
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
            Cotización: <span className="font-medium">{cotizacionNombre}</span>
          </p>

          {/* Nombre */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Nombre de la OC (debe ser distinto al de la cotización)
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Número OC */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Número de OC {hayCompradoSeleccionado ? (
                <span className="text-red-600 dark:text-red-400">(obligatorio — hay productos ya comprados)</span>
              ) : (
                <span className="text-gray-400">(opcional)</span>
              )}
            </label>
            <input
              type="text"
              value={numeroOC}
              onChange={(e) => setNumeroOC(e.target.value)}
              placeholder="Ej. OC-2026-001"
              className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none dark:bg-gray-700 dark:text-white ${
                hayCompradoSeleccionado && !numeroOC.trim()
                  ? "border-red-400 focus:border-red-500 dark:border-red-600"
                  : "border-gray-300 focus:border-blue-500 dark:border-gray-600"
              }`}
            />
          </div>

          {/* Productos */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Productos a incluir ({seleccionados.size}/{elegibles.length})
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
                No hay productos elegibles. Productos ya en embarque
                (FOB/CIF/BL/recibido) no se pueden mover.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-600">
                {elegibles.map((p) => {
                  const checked = seleccionados.has(p.id);
                  const yaAsignado = !!p.ordenCompraId;
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
                        {yaAsignado && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400">
                            Actualmente en otra OC — se moverá
                          </p>
                        )}
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
            {guardando ? "Creando..." : "Crear OC"}
          </button>
        </div>
      </div>
    </div>
  );
}
