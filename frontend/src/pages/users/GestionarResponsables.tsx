import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type Asignable = {
  id: string;
  nombre: string;
  email: string;
  puedeSerAsignado: boolean;
  rol: { nombre: string };
  _count: { seguimientosAsignados: number; cotizacionesSupervisadas: number };
};

const api = {
  async getAsignables(): Promise<Asignable[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/asignables`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar usuarios");
    return res.json();
  },
  async toggleAsignable(id: string, puedeSerAsignado: boolean) {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/${id}/asignable`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ puedeSerAsignado }),
    });
    if (!res.ok) throw new Error("Error al actualizar");
    return res.json();
  },
};

const rolLabel: Record<string, string> = {
  SUPERVISOR: "Supervisor",
  JEFE_COMPRAS: "Jefe de Compras",
  ADMIN: "Admin",
};

export default function GestionarResponsables() {
  const [usuarios, setUsuarios] = useState<Asignable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setUsuarios(await api.getAsignables());
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (u: Asignable) => {
    setToggling(u.id);
    try {
      const updated = await api.toggleAsignable(u.id, !u.puedeSerAsignado);
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, puedeSerAsignado: updated.puedeSerAsignado } : x))
      );
      toast.success(
        updated.puedeSerAsignado
          ? `${u.nombre} puede ser asignado`
          : `${u.nombre} ya no puede ser asignado`
      );
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setToggling(null);
    }
  };

  const filtrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const asignables = filtrados.filter((u) => u.puedeSerAsignado);
  const noAsignables = filtrados.filter((u) => !u.puedeSerAsignado);

  return (
    <>
      <PageMeta title="Gestionar Responsables" description="Gestionar responsables asignables" />
      <PageBreadcrumb pageTitle="Gestionar Responsables" />

      <div className="mx-auto max-w-4xl space-y-6 p-4">
        {/* Header */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="font-semibold text-blue-800 dark:text-blue-300">¿Qué hace esta página?</h2>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
            Define qué supervisores y jefes de compras aparecen en los selectores de "Responsable Asignado"
            al asignar una cotización o compra. Los usuarios desactivados siguen teniendo su rol y permisos,
            solo dejan de aparecer como opción para asignación.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Asignables */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pueden ser asignados ({asignables.length})
                </h3>
              </div>
              <div className="space-y-2">
                {asignables.length === 0 && (
                  <p className="text-sm text-gray-400">Ninguno en esta categoría.</p>
                )}
                {asignables.map((u) => (
                  <UserRow key={u.id} u={u} toggling={toggling} onToggle={toggle} />
                ))}
              </div>
            </section>

            {/* No asignables */}
            {noAsignables.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    No asignables ({noAsignables.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {noAsignables.map((u) => (
                    <UserRow key={u.id} u={u} toggling={toggling} onToggle={toggle} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function UserRow({
  u,
  toggling,
  onToggle,
}: {
  u: Asignable;
  toggling: string | null;
  onToggle: (u: Asignable) => void;
}) {
  const isLoading = toggling === u.id;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
        u.puedeSerAsignado
          ? "border-green-200 bg-white dark:border-green-800/50 dark:bg-gray-800"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              u.puedeSerAsignado
                ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {u.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className={`truncate text-sm font-medium ${u.puedeSerAsignado ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
              {u.nombre}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
          </div>
        </div>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-4">
        <div className="hidden text-right sm:block">
          <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {rolLabel[u.rol.nombre] ?? u.rol.nombre}
          </span>
          <p className="mt-0.5 text-[10px] text-gray-400">
            {u._count.seguimientosAsignados} seg. · {u._count.cotizacionesSupervisadas} cot.
          </p>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onToggle(u)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            u.puedeSerAsignado ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
          title={u.puedeSerAsignado ? "Desactivar asignación" : "Activar asignación"}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              u.puedeSerAsignado ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
