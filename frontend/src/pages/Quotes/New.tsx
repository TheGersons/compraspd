// pages/Quotes/New.tsx
import { useMemo, useState, useEffect } from "react";
import ScrollArea from "../../components/common/ScrollArea";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import { api } from "../../lib/api"
import { useAuth } from "../../context/AuthContext";


import {
  CreatePurchaseRequestDto,
  DeliveryType,
  ProcurementType,
  RequestCategory
} from "../../types/backend-enums";
import { /*mapDeliveryType,*/ mapProcurement, toNumberString } from "../../utils/mappers";

type Scope = "nacional" | "internacional";
type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type DeliveryPlace = "almacen" | "proyecto";

type ProductLine = {
  // AÑADE ESTO:
  id: string;
  sku: string;
  description: string;
  quantity: number | "";
  unit: "und" | "caja" | "kg" | "M" | "Lb";
  extraSpecs: string;
};

type FormState = {
  scope: Scope;
  requestType: RequestType;
  reference: string;              // <-- única referencia
  finalClientId?: string;
  deadline: string;               // YYYY-MM-DD
  deliveryPlace: DeliveryPlace;
  projectId?: string;
  warehouseId?: string;           // ASUMIDO: Añadimos warehouseId aquí
  comments: string;
  lines: ProductLine[];
};

type ClientData = {
  id: string;
  name: string;
  taxId?: string;
};
let warehouseIds: string[] | undefined; // ID del almacén seleccionado
const UNITS: ProductLine["unit"][] = ["und", "caja", "kg", "M", "Lb"];

// Mock
const STANDARD_REFS = ["REF-UPS-1KVA", "REF-CABLE-CAT6", "REF-SERV-MANTTO", "REF-GEN-DIESEL-30KVA", "REF-SW-24P-POE"];
const PROJECTS = [
  { id: "PRJ-001", name: "Planta Solar Choluteca" },
  { id: "PRJ-002", name: "Hospital SPS" },
  { id: "PRJ-003", name: "Data Center TGU" },
];
// Mock para almacén (usarías un hook de datos aquí)
const WAREHOUSE_MOCK_ID = "Almacén / Oficina";

function formatDateYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(base: Date, days: number) { const d = new Date(base); d.setDate(d.getDate() + days); return d; }

export default function QuotesNew() {

  const auth = useAuth();
  const minDateObj = useMemo(() => addDays(new Date(), 5), []);
  const minDeadline = useMemo(() => formatDateYYYYMMDD(minDateObj), [minDateObj]);

  const [refQuery, setRefQuery] = useState("");
  const filteredRefs = useMemo(
    () => STANDARD_REFS.filter(r => r.toLowerCase().includes(refQuery.toLowerCase())),
    [refQuery]
  );

  const [allClients, setAllClients] = useState<ClientData[]>([]); // Lista completa
  const [clientQuery, setClientQuery] = useState(""); // El texto que el usuario teclea en el buscador
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const [form, setForm] = useState<FormState>({
    scope: "nacional",
    requestType: "suministros",
    reference: "",
    finalClientId: undefined,
    deadline: "",
    deliveryPlace: "almacen",
    projectId: undefined,
    warehouseId: WAREHOUSE_MOCK_ID, // Usamos el ID de mock por defecto si es a almacén
    comments: "",
    lines: [{ id: generateId(), sku: "", description: "", quantity: "", unit: "und", extraSpecs: "" }],
  });

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        // ASUMIMOS que la API devuelve { items: ClientData[] }
        const response = await api<{ items: ClientData[] }>("/api/v1/clients");

        // La clave: Extraemos la lista de la propiedad 'items'
        const clientsArray = response.items || [];

        console.log("Clientes cargados:", clientsArray.length);
        setAllClients(clientsArray);

      } catch (error) {
        console.error("Error al cargar clientes:", error);
        setAllClients([]);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await api<{ id: string; name: string; type: string }[]>("/api/v1/locations/warehouses");

        const warehouses = response || [];

        warehouseIds = warehouses.map(wh => wh.id);
        // Aquí podrías cargar las ubicaciones si es necesario
        console.log("Almacenes cargados:", warehouses.length, warehouseIds);
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };

    loadLocations();
  }, []);

  // --- LÓGICA DE FILTRADO (Cliente) ---
  const filteredClients = useMemo(() => {
    if (!clientQuery) return allClients;
    const lowerQuery = clientQuery.toLowerCase();
    return allClients.filter(
      c => c.name.toLowerCase().includes(lowerQuery) || c.id.toLowerCase().includes(lowerQuery)
    );
  }, [clientQuery, allClients]);

  // Cliente seleccionado (obtenido del ID en el estado del formulario)
  const selectedClient = useMemo(
    () => allClients.find(c => c.id === form.finalClientId),
    [form.finalClientId, allClients]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const updateLine = (idx: number, patch: Partial<ProductLine>) =>
    setForm(prev => {
      const next = [...prev.lines];
      next[idx] = { ...next[idx], ...patch }; // <-- Aquí el patch se aplica
      return { ...prev, lines: next };
    });

  const addLine = () => setForm(prev => ({
    ...prev,
    // Añadir ID al nuevo elemento
    lines: [...prev.lines, { id: generateId(), sku: "", description: "", quantity: "", unit: "und", extraSpecs: "" }],
  }));
  const removeLine = (idx: number) =>
    setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== idx) }));

  const chooseReference = (ref: string) => setForm(prev => ({ ...prev, reference: ref || "" }));
  const clearReference = () => chooseReference("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    // ... (Tu lógica de validación se mantiene) ...

    // Validación de campos principales
    if (!form.reference) e.reference = "Selecciona una referencia";
    else if (!STANDARD_REFS.includes(form.reference)) e.reference = "Referencia no estandarizada";

    if (!form.finalClientId) e.finalClient = "Selecciona o crea un Cliente final";

    if (!form.deadline) e.deadline = "Requerido";
    else if (form.deadline < minDeadline) e.deadline = `Mínimo ${minDeadline}`;

    if (form.deliveryPlace === "proyecto" && !form.projectId) e.projectId = "Selecciona un proyecto";
    // Añadir validación para warehouseId si es a almacén
    if (form.deliveryPlace === "almacen" && !form.warehouseId) e.warehouseId = "Selecciona un almacén";


    if (!form.comments || form.comments.trim().length < 10) e.comments = "Mínimo 10 caracteres";

    const skuRe = /^[A-Za-z0-9._-]{3,32}$/;
    form.lines.forEach((ln, i) => {
      if (!ln.sku || !skuRe.test(ln.sku)) e[`lines.${i}.sku`] = "SKU inválido (3-32, A-Z 0-9 . _ -)";
      if (!ln.description || ln.description.trim().length < 3) {
        e[`lines.${i}.description`] = "Descripción muy corta";
      }
      if (ln.quantity === "" || Number.isNaN(Number(ln.quantity)) || Number(ln.quantity) <= 0 || !Number.isFinite(Number(ln.quantity))) {
        e[`lines.${i}.quantity`] = "Cantidad > 0";
      } else if (!Number.isInteger(Number(ln.quantity))) {
        e[`lines.${i}.quantity`] = "Debe ser entero";
      }
      if (!UNITS.includes(ln.unit)) e[`lines.${i}.unit`] = "Unidad inválida";
      if (ln.extraSpecs.trim().length > 0 && ln.extraSpecs.trim().length < 2) { e[`lines.${i}.extraSpecs`] = "Especificaciones muy cortas"; }
    });

    alert(form.lines[0].extraSpecs);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;


    const finalRequestCategory = form.requestType.toUpperCase() as RequestCategory;

    const payload: CreatePurchaseRequestDto = {
      requesterId: auth.user?.id.toString() ?? "",
      departmentId: auth.user?.departmentId?.toString() ?? "",
      procurement: mapProcurement(form.scope) as ProcurementType,
      requestCategory: finalRequestCategory,
      reference: form.reference,
      clientId: form.finalClientId || null,
      quoteDeadline: form.deadline
        ? `${form.deadline}T00:00:00.000Z`
        : "2020-10-08T11:49:00.000000-05:00",
      dueDate: form.deadline
        ? `${form.deadline}T00:00:00.000Z`
        : "2021-10-08T11:49:00.000000-05:00",
      deliveryType: form.deliveryPlace.toString().toUpperCase() as DeliveryType,
      warehouseId: warehouseIds?.[0] || null, // Usamos el ID del almacén mock o null
      locationId: warehouseIds?.[0] || null, // locationId es lo mismo que warehouseId en este contexto
      locationName: warehouseIds?.[1] || null, // Nombre del almacén
      projectId: form.projectId ? "" : "",
      comment: form.comments.trim() || null,
      title: `Solicitud - ${finalRequestCategory} - ${form.reference}`,
      description: form.comments.trim() || "Sin descripcion",
      items: form.lines.map((l) => ({
        sku: l.sku.trim(),
        description: l.description.trim(),
        quantity: toNumberString(l.quantity),
        unit: l.unit.toUpperCase(),
        extraSpecs: l.extraSpecs || "",
        requiredCurrency: form.scope === "nacional" ? "HNL" : "USD",
        productId: null,
        itemType: "PRODUCT",
      })),
    };
    alert(form.lines.map((l) => l.extraSpecs));
    alert(payload.items[0].extraSpecs);
    // Log útil antes de enviar
    console.log("Enviando payload a la API:", payload);

    try {
      // Llama al backend
      const created = await api<{ id: string }>("/api/v1/purchase-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Log de la respuesta completa
      console.log("Respuesta de creación:", created);

      alert(`Solicitud creada correctamente con id: ${created.id}`);
      // Aquí puedes redirigir con react-router si lo deseas
    } catch (err: any) {
      // Muestra siempre el error en consola para depurar
      console.error("Error recibido de la API:", err);

      // Intenta extraer un mensaje útil del error.message (que contiene el cuerpo)
      let mensaje = "Error desconocido";
      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (typeof parsed === "string") {
            mensaje = parsed;
          } else if (parsed?.message) {
            // Si message es un array (como suele devolver Nest), únelo
            mensaje = Array.isArray(parsed.message)
              ? parsed.message.join(", ")
              : parsed.message;
          } else {
            mensaje = JSON.stringify(parsed);
          }
        } catch {
          // Si no es JSON, muestra el texto tal cual
          mensaje = err.message;
        }
      }

      // Log del mensaje extraído
      console.log("Mensaje de error procesado:", mensaje);

      // Notificación emergente o alert con el mensaje procesado
      alert(`Ocurrió un error al enviar la solicitud: ${mensaje}`);
    }
  };

  return (
    <>
      <PageMeta
        title="Nueva Cotización | Compras Energia PD"
        description="Esta es la página para crear una nueva cotización en Compras Energia PD"
      />
      <div className="rounded-xl border border-gray-200 p-6 bg-white dark:border-white/10 dark:bg-[#101828]">
        <h2 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">Nueva cotización</h2>

        {/* Espacio en blanco */}
        <div className="h-6" />
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Tipo de compra / solicitud */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tipo de compra</label>
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
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tipo de solicitud</label>
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
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Cliente final</label>

              {isLoadingClients && (
                <p className="text-sm text-gray-500">Cargando clientes...</p>
              )}

              {!selectedClient && !isLoadingClients && (
                <div className="space-y-2">
                  {/* Campo de búsqueda */}
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                    placeholder="Buscar Cliente (ej: Empresa X)"
                    value={clientQuery}
                    onChange={e => setClientQuery(e.target.value)}
                  />

                  {/* Select con opciones filtradas */}
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                    value={""} // Siempre "vacío" para que la opción elegida se refleje en selectedClient
                    onChange={e => setField("finalClientId", e.target.value)}
                  >
                    <option value="">Selecciona un cliente…</option>
                    {filteredClients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id.substring(0, 4)})</option>)}

                    {filteredClients.length === 0 && clientQuery && (
                      <option value="CREATE_NEW_CLIENT" className="font-bold">
                        + Crear nuevo cliente "{clientQuery}" (FALTA IMPLEMENTAR)
                      </option>
                    )}
                  </select>
                </div>
              )}

              {/* Cliente Seleccionado: Mostrar y permitir deseleccionar */}
              {selectedClient && (
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-white/10 dark:text-brand-300">
                  {selectedClient.name}
                  <button
                    type="button"
                    onClick={() => setField("finalClientId", undefined)} // Deselecciona
                    className="opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              )}

              {errors.finalClient && <p className="mt-1 text-xs text-rose-400">{errors.finalClient}</p>}
            </div>

            {/* DatePicker con mínimo 5 días */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Fecha límite de cotización</label>
              <DatePicker
                id="deadline"
                defaultDate={form.deadline || undefined}
                minDate={minDateObj}
                onChange={(dates) => setField("deadline", dates[0] ? formatDateYYYYMMDD(dates[0]) : "")}
              />

              {errors.deadline && <p className="mt-1 text-xs text-rose-400">{errors.deadline}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mínimo 5 días a partir de hoy.</p>
            </div>
          </section>

          {/* Lugar de entrega */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Lugar de entrega</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                value={form.deliveryPlace}
                onChange={e => {
                  const val = e.target.value as DeliveryPlace;
                  setField("deliveryPlace", val);
                  // Limpia el campo opuesto al cambiar
                  if (val === "almacen") {
                    setField("projectId", undefined);
                  } else {
                    setField("warehouseId", undefined);
                  }
                }}
              >
                <option value="almacen">Almacén</option>
                <option value="proyecto">Proyecto</option>
              </select>
            </div>

            {form.deliveryPlace === "proyecto" && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Proyecto</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                  value={form.projectId ?? ""}
                  onChange={e => setField("projectId", e.target.value || undefined)}
                >
                  <option value="">Selecciona…</option>
                  {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.projectId && <p className="mt-1 text-xs text-rose-400">{errors.projectId}</p>}
              </div>
            )}
            {/* AÑADIR CAMPO DE ALMACÉN si es necesario. Por ahora asumimos WAREHOUSE_MOCK_ID */}
            {form.deliveryPlace === "almacen" && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Almacén (Mock)</label>
                <p className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100">
                  {WAREHOUSE_MOCK_ID} (ID Fijo)
                </p>
              </div>
            )}
          </section>

          {/* Referencia estandarizada única */}
          <section className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-300">Referencia estandarizada</label>

            {!form.reference ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                  placeholder="Buscar…"
                  value={refQuery}
                  onChange={e => setRefQuery(e.target.value)}
                />
                <select
                  className="min-w-60 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                  onChange={e => { chooseReference(e.target.value); e.currentTarget.selectedIndex = 0; }}
                >
                  <option value="">Selecciona…</option>
                  {filteredRefs.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-white/10 dark:text-brand-300">
                {form.reference}
                <button type="button" onClick={clearReference} className="opacity-70 hover:opacity-100">×</button>
              </div>
            )}

            {errors.reference && <p className="text-xs text-rose-400">{errors.reference}</p>}
          </section>

          {/* Comentarios */}
          <section>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Comentarios / Justificación</label>
            <textarea
              rows={4}
              maxLength={1500}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
              placeholder="Detalles y razón de la solicitud…"
              value={form.comments}
              onChange={e => setField("comments", e.target.value)}
            />
            {errors.comments && <p className="mt-1 text-xs text-rose-400">{errors.comments}</p>}
          </section>

          {/* Detalle de productos */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Detalle de productos</h3>
              <Button size="sm" onClick={addLine}>+ Agregar ítem</Button>
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
                    <tr key={ln.id} className="text-sm text-gray-700 dark:text-gray-200">
                      <td className="px-3 py-2 align-top">
                        <input
                          value={ln.sku}
                          onChange={e => updateLine(i, { sku: e.target.value })}
                          placeholder="ABC-123"
                          className="w-40 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                        />
                        {errors[`lines.${i}.sku`] && <p className="mt-1 text-xs text-rose-400">{errors[`lines.${i}.sku`]}</p>}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          value={ln.description}
                          onChange={e => updateLine(i, { description: e.target.value })}
                          placeholder="Descripción del producto"
                          className="min-w-64 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                        />
                        {errors[`lines.${i}.description`] && <p className="mt-1 text-xs text-rose-400">{errors[`lines.${i}.description`]}</p>}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          inputMode="numeric" pattern="[0-9]*"
                          value={ln.quantity}
                          onChange={e => {
                            const v = e.target.value;
                            updateLine(i, { quantity: v === "" ? "" : Number(v.replace(/\D/g, "")) });
                          }}
                          className="w-24 rounded-lg border border-gray-300 bg-white p-2 text-sm text-right dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                        />
                        {errors[`lines.${i}.quantity`] && <p className="mt-1 text-xs text-rose-400">{errors[`lines.${i}.quantity`]}</p>}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <select
                          value={ln.unit}
                          onChange={e => updateLine(i, { unit: e.target.value as ProductLine["unit"] })}
                          className="w-28 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          value={ln.extraSpecs}
                          onChange={e => updateLine(i, { extraSpecs: e.target.value })}
                          placeholder="Especificaciones adicionales"
                          className="min-w-64 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                        />
                        {errors[`lines.${i}.extraSpecs`] && <p className="mt-1 text-xs text-rose-400">{errors[`lines.${i}.extraSpecs`]}</p>}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Button size="xs" variant="danger" onClick={() => removeLine(i)}>
                          Quitar
                        </Button>
                      </td>
                    </tr>
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

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button variant="danger" onClick={() => history.back()}>Cancelar</Button>
            <Button>Guardar solicitud</Button>
          </div>
        </form>
      </div>
    </>
  );
}
