import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { getToken } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type ProductoToAprobar = {
  estadoProductoId: string;
  cotizacionDetalleId: string;
  sku: string;
  descripcion: string;
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
  productos: ProductoToAprobar[];
  ordenesExistentes: OrdenCompra[];
  onSuccess: () => void;
}

type ProductoForm = {
  selected: boolean;
  precio: string;
  comprobanteStatus: "aplica" | "no_aplica" | "";
  comprobanteUrl: string | null;
  comprobanteFileName: string | null;
  precioDescuento: string;
  uploadingFile: boolean;
};

export function AprobarYAsignarOCModal({
  open,
  onClose,
  cotizacionId,
  cotizacionNombre,
  productos,
  ordenesExistentes,
  onSuccess,
}: Props) {
  const [destinoId, setDestinoId] = useState<string>("");
  const [forms, setForms] = useState<Record<string, ProductoForm>>({});
  const [guardando, setGuardando] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (open) {
      setDestinoId(ordenesExistentes[0]?.id ?? "");
      const initial: Record<string, ProductoForm> = {};
      productos.forEach((p) => {
        initial[p.estadoProductoId] = {
          selected: true,
          precio: "",
          comprobanteStatus: "",
          comprobanteUrl: null,
          comprobanteFileName: null,
          precioDescuento: "",
          uploadingFile: false,
        };
      });
      setForms(initial);
    }
  }, [open, productos, ordenesExistentes]);

  if (!open) return null;

  const updateForm = (id: string, update: Partial<ProductoForm>) => {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], ...update } }));
  };

  const handleFileChange = async (id: string, sku: string, file: File) => {
    updateForm(id, { uploadingFile: true });
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("cotizacionId", cotizacionId);
      formData.append("sku", sku);
      formData.append("proveedorNombre", "asignacion-oc");
      formData.append("tipo", "comprobantes_descuento");
      const res = await fetch(`${API_BASE_URL}/api/v1/storage/upload`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al subir comprobante");
      }
      const data = await res.json();
      updateForm(id, {
        comprobanteUrl: data.url || data.fileName,
        comprobanteFileName: file.name,
        uploadingFile: false,
      });
      toast.success("Comprobante subido");
    } catch (e: any) {
      toast.error(e.message || "Error al subir comprobante");
      updateForm(id, { uploadingFile: false });
    }
  };

  const selectedProducts = productos.filter(
    (p) => forms[p.estadoProductoId]?.selected,
  );

  const handleSubmit = async () => {
    if (!destinoId) {
      toast.error("Seleccione una OC destino");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Seleccione al menos un producto");
      return;
    }

    for (const p of selectedProducts) {
      const form = forms[p.estadoProductoId];
      const precio = parseFloat(form.precio);
      if (!form.precio || isNaN(precio) || precio <= 0) {
        toast.error(`Ingrese el precio para "${p.sku}"`);
        return;
      }
      if (!form.comprobanteStatus) {
        toast.error(`Seleccione el estado de descuento para "${p.sku}"`);
        return;
      }
      if (form.comprobanteStatus === "aplica") {
        if (!form.comprobanteUrl) {
          toast.error(`Suba el comprobante de descuento para "${p.sku}"`);
          return;
        }
        const precioDesc = parseFloat(form.precioDescuento);
        if (!form.precioDescuento || isNaN(precioDesc) || precioDesc <= 0) {
          toast.error(`Ingrese el precio con descuento para "${p.sku}"`);
          return;
        }
        if (precioDesc > precio) {
          toast.error(
            `El precio con descuento no puede ser mayor al precio original para "${p.sku}"`,
          );
          return;
        }
      }
    }

    try {
      setGuardando(true);
      const token = getToken();
      const body = {
        ordenCompraId: destinoId,
        productos: selectedProducts.map((p) => {
          const form = forms[p.estadoProductoId];
          return {
            estadoProductoId: p.estadoProductoId,
            precio: parseFloat(form.precio),
            comprobanteDescuento:
              form.comprobanteStatus === "no_aplica"
                ? "no_aplica"
                : form.comprobanteUrl!,
            precioDescuento:
              form.comprobanteStatus === "aplica"
                ? parseFloat(form.precioDescuento)
                : undefined,
          };
        }),
      };

      const res = await fetch(
        `${API_BASE_URL}/api/v1/followups/${cotizacionId}/aprobar-y-asignar-oc`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al procesar");
      }

      toast.success(
        `${selectedProducts.length} producto(s) aprobados y asignados a la OC`,
      );
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Error al procesar");
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
        className="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Aprobar y asignar a OC
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {cotizacionNombre}
            </p>
          </div>
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
          {/* OC destino */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              OC destino
            </label>
            {ordenesExistentes.length === 0 ? (
              <p className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700">
                No hay OCs disponibles.
              </p>
            ) : (
              <select
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {ordenesExistentes.map((oc) => (
                  <option key={oc.id} value={oc.id}>
                    {oc.nombre}
                    {oc.numeroOC ? ` (${oc.numeroOC})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Info banner */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            ⚠️ Los productos seleccionados aún no están aprobados. Configura
            precio y comprobante para aprobarlos y asignarlos directamente a la
            OC.
          </div>

          {/* Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Productos a aprobar ({selectedProducts.length}/{productos.length})
              </label>
              {productos.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const allSelected =
                      selectedProducts.length === productos.length;
                    const updated: Record<string, ProductoForm> = {};
                    productos.forEach((p) => {
                      updated[p.estadoProductoId] = {
                        ...forms[p.estadoProductoId],
                        selected: !allSelected,
                      };
                    });
                    setForms((prev) => ({ ...prev, ...updated }));
                  }}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  {selectedProducts.length === productos.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              )}
            </div>

            {productos.map((p) => {
              const form = forms[p.estadoProductoId];
              if (!form) return null;
              return (
                <div
                  key={p.estadoProductoId}
                  className={`rounded-lg border transition-colors ${
                    form.selected
                      ? "border-blue-300 dark:border-blue-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Product header row */}
                  <div
                    className={`flex cursor-pointer items-center gap-2 rounded-t-lg px-3 py-2 ${
                      form.selected
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-gray-50 dark:bg-gray-900/20"
                    }`}
                    onClick={() =>
                      updateForm(p.estadoProductoId, {
                        selected: !form.selected,
                      })
                    }
                  >
                    <input
                      type="checkbox"
                      checked={form.selected}
                      onChange={() =>
                        updateForm(p.estadoProductoId, {
                          selected: !form.selected,
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {p.sku}
                      </span>
                      <span
                        className="ml-2 truncate text-xs text-gray-500 dark:text-gray-400"
                        title={p.descripcion}
                      >
                        {p.descripcion}
                      </span>
                    </div>
                  </div>

                  {/* Inline form if selected */}
                  {form.selected && (
                    <div className="space-y-2 px-3 py-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Precio */}
                        <div>
                          <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Precio <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={form.precio}
                            onChange={(e) =>
                              updateForm(p.estadoProductoId, {
                                precio: e.target.value,
                              })
                            }
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        {/* Comprobante descuento */}
                        <div>
                          <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Descuento <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.comprobanteStatus}
                            onChange={(e) =>
                              updateForm(p.estadoProductoId, {
                                comprobanteStatus: e.target.value as any,
                                comprobanteUrl:
                                  e.target.value === "no_aplica"
                                    ? null
                                    : form.comprobanteUrl,
                                comprobanteFileName:
                                  e.target.value === "no_aplica"
                                    ? null
                                    : form.comprobanteFileName,
                                precioDescuento:
                                  e.target.value === "no_aplica"
                                    ? ""
                                    : form.precioDescuento,
                              })
                            }
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Seleccionar</option>
                            <option value="no_aplica">No aplica descuento</option>
                            <option value="aplica">Aplica descuento</option>
                          </select>
                        </div>
                      </div>

                      {/* Fields for "aplica" */}
                      {form.comprobanteStatus === "aplica" && (
                        <div className="grid grid-cols-2 gap-2">
                          {/* File upload */}
                          <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Comprobante{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={form.uploadingFile}
                                onClick={() =>
                                  fileInputRefs.current[
                                    p.estadoProductoId
                                  ]?.click()
                                }
                                className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                <Upload size={12} />
                                {form.uploadingFile
                                  ? "Subiendo..."
                                  : form.comprobanteFileName
                                    ? "Cambiar"
                                    : "Subir"}
                              </button>
                              {form.comprobanteFileName && (
                                <span
                                  className="max-w-[120px] truncate text-xs text-green-600 dark:text-green-400"
                                  title={form.comprobanteFileName}
                                >
                                  ✓ {form.comprobanteFileName}
                                </span>
                              )}
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[p.estadoProductoId] =
                                    el;
                                }}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleFileChange(
                                      p.estadoProductoId,
                                      p.sku,
                                      file,
                                    );
                                  e.target.value = "";
                                }}
                              />
                            </div>
                          </div>

                          {/* Precio con descuento */}
                          <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Precio c/descuento{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={form.precioDescuento}
                              onChange={(e) =>
                                updateForm(p.estadoProductoId, {
                                  precioDescuento: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selectedProducts.length} de {productos.length} producto(s)
            seleccionados
          </span>
          <div className="flex items-center gap-2">
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
                selectedProducts.length === 0 ||
                !destinoId ||
                ordenesExistentes.length === 0
              }
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Procesando..."
                : `Aprobar y asignar (${selectedProducts.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
