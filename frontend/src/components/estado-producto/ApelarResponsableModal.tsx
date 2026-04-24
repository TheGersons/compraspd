import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { getToken } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Props {
  open: boolean;
  onClose: () => void;
  cotizacionId: string;
  cotizacionNombre: string;
  onSuccess: () => void;
}

export function ApelarResponsableModal({
  open,
  onClose,
  cotizacionId,
  cotizacionNombre,
  onSuccess,
}: Props) {
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (motivo.trim().length < 10) {
      toast.error("El motivo debe tener al menos 10 caracteres");
      return;
    }
    try {
      setGuardando(true);
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/v1/estado-productos/apelar-responsable`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cotizacionId, motivo: motivo.trim() }),
        },
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error al procesar la apelación");
      }
      toast.success("Apelación enviada. Los supervisores fueron notificados.");
      setMotivo("");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Error al procesar la apelación");
    } finally {
      setGuardando(false);
    }
  };

  const handleClose = () => {
    if (guardando) return;
    setMotivo("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Rechazar asignación de responsable
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estás por rechazar tu asignación como responsable de:{" "}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {cotizacionNombre}
            </span>
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            Los supervisores y jefe de compras recibirán una notificación con el motivo de tu rechazo.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder="Explica brevemente por qué no debes tener esta asignación..."
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {motivo.trim().length}/10 mín.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={guardando}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={guardando || motivo.trim().length < 10}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Enviando..." : "Confirmar rechazo"}
          </button>
        </div>
      </div>
    </div>
  );
}
