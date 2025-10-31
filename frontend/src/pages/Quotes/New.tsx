// pages/Quotes/New.tsx
import { useMemo, useState, useEffect, useCallback } from "react";
import ScrollArea from "../../components/common/ScrollArea";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

import {
  CreatePurchaseRequestDto,
  DeliveryType,
  ProcurementType,
  RequestCategory
} from "../../types/backend-enums";
import { mapProcurement, toNumberString } from "../../utils/mappers";
import { useUsers } from "../users/hooks/useUsers";
import UserComboBox from "./components/ComboBoxUsers";

// ============================================================================
// TYPES
// ============================================================================

type Scope = "nacional" | "internacional";
type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type DeliveryPlace = "almacen" | "proyecto";
type Unit = "und" | "caja" | "kg" | "M" | "Lb";

type ProductLine = {
  id: string;
  sku: string;
  description: string;
  quantity: number | "";
  unit: Unit;
  extraSpecs: string;
};

type FormState = {
  scope: Scope;
  requestType: RequestType;
  reference: string;
  requesterId?: string;
  deadline: string;
  deliveryPlace: DeliveryPlace;
  projectId?: string;
  warehouseId?: string;
  comments: string;
  lines: ProductLine[];
};


type Project = {
  id: string;
  name: string;
};

type Warehouse = {
  id: string;
  name: string;
  type: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const UNITS: Unit[] = ["und", "caja", "kg", "M", "Lb"];
const STANDARD_REFS = [
  "REF-UPS-1KVA",
  "REF-CABLE-CAT6",
  "REF-SERV-MANTTO",
  "REF-GEN-DIESEL-30KVA",
  "REF-SW-24P-POE"
];

const PROJECTS: Project[] = [
  { id: "PRJ-001", name: "Planta Solar Choluteca" },
  { id: "PRJ-002", name: "Hospital SPS" },
  { id: "PRJ-003", name: "Data Center TGU" },
];

const MIN_DAYS_AHEAD = 5;
const MIN_COMMENT_LENGTH = 10;
const SKU_REGEX = /^[A-Za-z0-9._-]{3,32}$/;

// ============================================================================
// UTILITIES
// ============================================================================

const formatDateYYYYMMDD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (base: Date, days: number): Date => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const generateId = (): string =>
  Math.random().toString(36).substring(2, 9);

const extractErrorMessage = (err: unknown): string => {
  if (!(err instanceof Error) || !err.message) {
    return "Error desconocido";
  }

  try {
    const parsed = JSON.parse(err.message);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.message) {
      return Array.isArray(parsed.message)
        ? parsed.message.join(", ")
        : parsed.message;
    }

    return JSON.stringify(parsed);
  } catch {
    return err.message;
  }
};

// ============================================================================
// VALIDATION
// ============================================================================

type ValidationErrors = Record<string, string>;

const validateForm = (form: FormState, minDeadline: string): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Reference validation
  if (!form.reference) {
    errors.reference = "Selecciona una referencia";
  } else if (!STANDARD_REFS.includes(form.reference)) {
    errors.reference = "Referencia no estandarizada";
  }

   //Solicitante
  if (!form.requesterId) {
    errors.requesterId = "Selecciona un solicitante";
  }

  // Deadline validation
  if (!form.deadline) {
    errors.deadline = "Requerido";
  } else if (form.deadline < minDeadline) {
    errors.deadline = `Mínimo ${minDeadline}`;
  }

  // Delivery place validation
  if (form.deliveryPlace === "proyecto" && !form.projectId) {
    errors.projectId = "Selecciona un proyecto";
  }
  if (form.deliveryPlace === "almacen" && !form.warehouseId) {
    errors.warehouseId = "Selecciona un almacén";
  }

  // Comments validation
  if (!form.comments || form.comments.trim().length < MIN_COMMENT_LENGTH) {
    errors.comments = `Mínimo ${MIN_COMMENT_LENGTH} caracteres`;
  }

  // Product lines validation
  form.lines.forEach((ln, i) => {
    if (!ln.sku || !SKU_REGEX.test(ln.sku)) {
      errors[`lines.${i}.sku`] = "SKU inválido (3-32, A-Z 0-9 . _ -)";
    }

    if (!ln.description || ln.description.trim().length < 3) {
      errors[`lines.${i}.description`] = "Descripción muy corta";
    }

    const qty = Number(ln.quantity);
    if (ln.quantity === "" || Number.isNaN(qty) || qty <= 0 || !Number.isFinite(qty)) {
      errors[`lines.${i}.quantity`] = "Cantidad > 0";
    } else if (!Number.isInteger(qty)) {
      errors[`lines.${i}.quantity`] = "Debe ser entero";
    }

    if (!UNITS.includes(ln.unit)) {
      errors[`lines.${i}.unit`] = "Unidad inválida";
    }

    if (ln.extraSpecs.trim().length > 0 && ln.extraSpecs.trim().length < 2) {
      errors[`lines.${i}.extraSpecs`] = "Especificaciones muy cortas";
    }
  });

  return errors;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================


const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setIsLoading(true);

      try {
        const response = await api<Warehouse[]>("/api/v1/locations/warehouses");
        setWarehouses(response || []);
        console.log("Warehouses loaded:", response?.length);
      } catch (err) {
        console.error("Error loading warehouses:", err);
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return { warehouses, isLoading };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================


const ReferenceSelector = ({
  selectedRef,
  query,
  onQueryChange,
  onSelectRef,
  onClearRef
}: {
  selectedRef: string;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectRef: (ref: string) => void;
  onClearRef: () => void;
}) => {
  const filteredRefs = useMemo(
    () => STANDARD_REFS.filter(r => r.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  if (selectedRef) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-white/10 dark:text-brand-300">
        {selectedRef}
        <button
          type="button"
          onClick={onClearRef}
          className="opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded-lg border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
        placeholder="Buscar…"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
      />
      <select
        className="min-w-60 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
        onChange={e => {
          onSelectRef(e.target.value);
          e.currentTarget.selectedIndex = 0;
        }}
      >
        <option value="">Selecciona…</option>
        {filteredRefs.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
};

const ProductLineRow = ({
  line,
  index,
  errors,
  onChange,
  onRemove
}: {
  line: ProductLine;
  index: number;
  errors: ValidationErrors;
  onChange: (index: number, patch: Partial<ProductLine>) => void;
  onRemove: (index: number) => void;
}) => (
  <tr className="text-sm text-gray-700 dark:text-gray-200">
    <td className="px-3 py-2 align-top">
      <input
        value={line.sku}
        onChange={e => onChange(index, { sku: e.target.value })}
        placeholder="ABC-123"
        className="w-40 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
      />
      {errors[`lines.${index}.sku`] && (
        <p className="mt-1 text-xs text-rose-400">{errors[`lines.${index}.sku`]}</p>
      )}
    </td>

    <td className="px-3 py-2 align-top">
      <input
        value={line.description}
        onChange={e => onChange(index, { description: e.target.value })}
        placeholder="Descripción del producto"
        className="min-w-64 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
      />
      {errors[`lines.${index}.description`] && (
        <p className="mt-1 text-xs text-rose-400">{errors[`lines.${index}.description`]}</p>
      )}
    </td>

    <td className="px-3 py-2 align-top">
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={line.quantity}
        onChange={e => {
          const v = e.target.value;
          onChange(index, { quantity: v === "" ? "" : Number(v.replace(/\D/g, "")) });
        }}
        className="w-24 rounded-lg border border-gray-300 bg-white p-2 text-sm text-right dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
      />
      {errors[`lines.${index}.quantity`] && (
        <p className="mt-1 text-xs text-rose-400">{errors[`lines.${index}.quantity`]}</p>
      )}
    </td>

    <td className="px-3 py-2 align-top">
      <select
        value={line.unit}
        onChange={e => onChange(index, { unit: e.target.value as Unit })}
        className="w-28 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
      >
        {UNITS.map(u => (
          <option key={u} value={u}>{u.toUpperCase()}</option>
        ))}
      </select>
    </td>

    <td className="px-3 py-2 align-top">
      <input
        value={line.extraSpecs}
        onChange={e => onChange(index, { extraSpecs: e.target.value })}
        placeholder="Especificaciones adicionales"
        className="min-w-64 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
      />
      {errors[`lines.${index}.extraSpecs`] && (
        <p className="mt-1 text-xs text-rose-400">{errors[`lines.${index}.extraSpecs`]}</p>
      )}
    </td>

    <td className="px-3 py-2 align-top">
      <Button size="xs" variant="danger" onClick={() => onRemove(index)}>
        Quitar
      </Button>
    </td>
  </tr>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QuotesNew() {
  const auth = useAuth();
  const { warehouses } = useWarehouses();

  // Date constraints
  const minDateObj = useMemo(() => addDays(new Date(), MIN_DAYS_AHEAD), []);
  const minDeadline = useMemo(() => formatDateYYYYMMDD(minDateObj), [minDateObj]);

  // Search queries
  const [refQuery, setRefQuery] = useState("");

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const UserId = auth.user?.id;
  const [userQuery,] = useState("");

  // Filtrar usuarios activos y por búsqueda
  const filteredUsers = useMemo(() => {
    const active = users.filter(u => u.isActive);
    if (!userQuery) return active;
    const q = userQuery.toLowerCase();
    return active.filter(u => u.fullName.toLowerCase().includes(q));
  }, [users, userQuery]);

  const requester = users.find(user => user.id === UserId) || null;


  // Form state
  const [form, setForm] = useState<FormState>({
    scope: "nacional",
    requestType: "suministros",
    reference: "",
    requesterId: UserId,
    deadline: "",
    deliveryPlace: "almacen",
    projectId: undefined,
    warehouseId: warehouses[0]?.id,
    comments: "",
    lines: [{
      id: generateId(),
      sku: "",
      description: "",
      quantity: "",
      unit: "und",
      extraSpecs: ""
    }],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // Update warehouse when available
  useEffect(() => {
    if (warehouses.length > 0 && !form.warehouseId) {
      setForm(prev => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, form.warehouseId]);

  // Form field setters
  const setField = useCallback(<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateLine = useCallback((idx: number, patch: Partial<ProductLine>) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === idx ? { ...line, ...patch } : line
      )
    }));
  }, []);

  const addLine = useCallback(() => {
    setForm(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: generateId(),
          sku: "",
          description: "",
          quantity: "",
          unit: "und",
          extraSpecs: ""
        }
      ]
    }));
  }, []);


  const removeLine = useCallback((idx: number) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx)
    }));
  }, []);

  const handleDeliveryPlaceChange = useCallback((place: DeliveryPlace) => {
    setForm(prev => ({
      ...prev,
      deliveryPlace: place,
      projectId: place === "almacen" ? undefined : prev.projectId,
      warehouseId: place === "proyecto" ? undefined : prev.warehouseId
    }));
  }, []);

  const buildPayload = useCallback((formData: FormState): CreatePurchaseRequestDto => {
    return {
      requesterId: UserId !== undefined ? UserId : "",
      departmentId: requester?.departmentId ?? "",
      procurement: mapProcurement(formData.scope) as ProcurementType,
      requestCategory: formData.requestType.toUpperCase() as RequestCategory,
      reference: formData.reference,
      clientId: formData.requesterId || null,
      quoteDeadline: `${formData.deadline}T00:00:00.000Z`,
      dueDate: `${formData.deadline}T00:00:00.000Z`,
      deliveryType: formData.deliveryPlace.toUpperCase() as DeliveryType,
      warehouseId: warehouses[0]?.id || null,
      locationId: warehouses[0]?.id || null,
      locationName: warehouses[0]?.name || null,
      projectId: formData.projectId || "",
      comments: formData.comments.trim() || null,
      title: `Solicitud - ${formData.requestType.toUpperCase()} - ${formData.reference}`,
      description: formData.comments.trim() || "Sin descripción",
      items: formData.lines.map(l => ({
        sku: l.sku.trim(),
        description: l.description.trim(),
        quantity: toNumberString(l.quantity),
        unit: l.unit.toUpperCase(),
        extraSpecs: l.extraSpecs || "",
        requiredCurrency: formData.scope === "nacional" ? "HNL" : "USD",
        productId: null,
        itemType: "PRODUCT",
      })),
    };
  }, [auth.user, warehouses]);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const validationErrors = validateForm(form, minDeadline);
    setErrors(validationErrors);
    console.log(Object.keys(validationErrors))
    console.log(Object.keys(validationErrors).length)
    console.log(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(form);
      console.log("Sending payload:", payload);

      const created = await api<{ id: string }>("/api/v1/purchase-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Created response:", created);
      alert(`Solicitud creada correctamente con id: ${created.id}`);

      window.location.href = "/quotes/new";
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      console.error("API Error:", errorMessage);
      alert(`Ocurrió un error al enviar la solicitud: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Nueva Cotización | Compras Energia PD"
        description="Crear nueva cotización en Compras Energia PD"
      />

      <div className="rounded-xl border border-gray-200 p-6 bg-white dark:border-white/10 dark:bg-[#101828]">
        <h2 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
          Nueva cotización
        </h2>

        <div className="h-6" />

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Purchase Type Section */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Tipo de compra
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                value={form.scope}
                onChange={e => setField("scope", e.target.value as Scope)}
              >
                <option value="nacional">Nacional</option>
                <option value="internacional">Internacional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Tipo de solicitud
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                value={form.requestType}
                onChange={e => setField("requestType", e.target.value as RequestType)}
              >
                <option value="licitaciones">Licitaciones</option>
                <option value="proyectos">Proyectos</option>
                <option value="suministros">Suministros</option>
                <option value="inventarios">Inventarios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Solicitante
              </label>
              <UserComboBox
                users={filteredUsers}             // o users si quieres todos
                value={form.requesterId ?? UserId}
                onChange={(id) => setField("requesterId", id)}
                disabled={isLoadingUsers}
              />
              {errors.requesterId && (
                <p className="mt-1 text-xs text-rose-400">{errors.requesterId}</p>
              )}
            </div>


            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Fecha límite de cotización
              </label>
              <DatePicker
                id="deadline"
                defaultDate={form.deadline || undefined}
                minDate={minDateObj}
                onChange={dates =>
                  setField("deadline", dates[0] ? formatDateYYYYMMDD(dates[0]) : "")
                }
              />
              {errors.deadline && (
                <p className="mt-1 text-xs text-rose-400">{errors.deadline}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo {MIN_DAYS_AHEAD} días a partir de hoy.
              </p>
            </div>
          </section>

          {/* Delivery Section */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                Lugar de entrega
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                value={form.deliveryPlace}
                onChange={e => handleDeliveryPlaceChange(e.target.value as DeliveryPlace)}
              >
                <option value="almacen">Almacén</option>
                <option value="proyecto">Proyecto</option>
              </select>
            </div>

            {form.deliveryPlace === "proyecto" && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Proyecto
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                  value={form.projectId ?? ""}
                  onChange={e => setField("projectId", e.target.value || undefined)}
                >
                  <option value="">Selecciona…</option>
                  {PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="mt-1 text-xs text-rose-400">{errors.projectId}</p>
                )}
              </div>
            )}

            {form.deliveryPlace === "almacen" && warehouses.length > 0 && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Almacén
                </label>
                <p className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100">
                  {warehouses[0]?.name || "Cargando..."}
                </p>
              </div>
            )}
          </section>

          {/* Reference Section */}
          <section className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Referencia estandarizada
            </label>
            <ReferenceSelector
              selectedRef={form.reference}
              query={refQuery}
              onQueryChange={setRefQuery}
              onSelectRef={ref => setField("reference", ref)}
              onClearRef={() => setField("reference", "")}
            />
            {errors.reference && (
              <p className="text-xs text-rose-400">{errors.reference}</p>
            )}
          </section>

          {/* Comments Section */}
          <section>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Comentarios / Justificación
            </label>
            <textarea
              rows={4}
              maxLength={1500}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
              placeholder="Detalles y razón de la solicitud…"
              value={form.comments}
              onChange={e => setField("comments", e.target.value)}
            />
            {errors.comments && (
              <p className="mt-1 text-xs text-rose-400">{errors.comments}</p>
            )}
          </section>

          {/* Product Lines Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Detalle de productos
              </h3>
              <Button size="sm" onClick={addLine}>
                + Agregar ítem
              </Button>
            </div>

            <ScrollArea orientation="x">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-[#101828] dark:text-gray-300">
                  <tr>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Descripción</th>
                    <th className="px-3 py-2">Cantidad</th>
                    <th className="px-3 py-2">Unidad</th>
                    <th className="px-3 py-2">Notas</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {form.lines.map((ln, i) => (
                    <ProductLineRow
                      key={ln.id}
                      line={ln}
                      index={i}
                      errors={errors}
                      onChange={updateLine}
                      onRemove={removeLine}
                    />
                  ))}
                  {form.lines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                        No hay ítems. Agrega el primero.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="danger"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}