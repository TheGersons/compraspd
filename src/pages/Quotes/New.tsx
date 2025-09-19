// pages/Quotes/New.tsx
import { useMemo, useState } from "react";
import ScrollArea from "../../components/common/ScrollArea";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";


type Scope = "nacional" | "internacional";
type RequestType = "licitaciones" | "proyectos" | "suministros" | "inventarios";
type DeliveryPlace = "almacen" | "proyecto";

type ProductLine = {
    sku: string;
    description: string;
    quantity: number | "";
    unit: "und" | "caja" | "kg" | "M" | "Lb";
    notes?: string;
};

type FormState = {
    scope: Scope;
    requestType: RequestType;
    reference: string;              // <-- única referencia
    finalClient: string;
    deadline: string;               // YYYY-MM-DD
    deliveryPlace: DeliveryPlace;
    projectId?: string;
    comments: string;
    lines: ProductLine[];
};

const UNITS: ProductLine["unit"][] = ["und", "caja", "kg", "M", "Lb"];

// Mock
const STANDARD_REFS = ["REF-UPS-1KVA", "REF-CABLE-CAT6", "REF-SERV-MANTTO", "REF-GEN-DIESEL-30KVA", "REF-SW-24P-POE"];
const PROJECTS = [
    { id: "PRJ-001", name: "Planta Solar Choluteca" },
    { id: "PRJ-002", name: "Hospital SPS" },
    { id: "PRJ-003", name: "Data Center TGU" },
];

function formatDateYYYYMMDD(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function addDays(base: Date, days: number) { const d = new Date(base); d.setDate(d.getDate() + days); return d; }

export default function QuotesNew() {
    const minDateObj = useMemo(() => addDays(new Date(), 5), []);
    const minDeadline = useMemo(() => formatDateYYYYMMDD(minDateObj), [minDateObj]);

    const [refQuery, setRefQuery] = useState("");
    const filteredRefs = useMemo(
        () => STANDARD_REFS.filter(r => r.toLowerCase().includes(refQuery.toLowerCase())),
        [refQuery]
    );

    const [form, setForm] = useState<FormState>({
        scope: "nacional",
        requestType: "suministros",
        reference: "",                // <-- única
        finalClient: "",
        deadline: "",
        deliveryPlace: "almacen",
        projectId: undefined,
        comments: "",
        lines: [{ sku: "", description: "", quantity: "", unit: "und", notes: "" }],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const updateLine = (idx: number, patch: Partial<ProductLine>) =>
        setForm(prev => {
            const next = [...prev.lines];
            next[idx] = { ...next[idx], ...patch };
            return { ...prev, lines: next };
        });

    const addLine = () => setForm(prev => ({
        ...prev,
        lines: [...prev.lines, { sku: "", description: "", quantity: "", unit: "und", notes: "" }],
    }));
    const removeLine = (idx: number) =>
        setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== idx) }));

    const chooseReference = (ref: string) => setForm(prev => ({ ...prev, reference: ref || "" }));
    const clearReference = () => chooseReference("");

    const validate = (): boolean => {
        const e: Record<string, string> = {};

        if (!form.reference) e.reference = "Selecciona una referencia";
        else if (!STANDARD_REFS.includes(form.reference)) e.reference = "Referencia no estandarizada";

        if (!form.finalClient.trim()) e.finalClient = "Requerido";

        if (!form.deadline) e.deadline = "Requerido";
        else if (form.deadline < minDeadline) e.deadline = `Mínimo ${minDeadline}`;

        if (form.deliveryPlace === "proyecto" && !form.projectId) e.projectId = "Selecciona un proyecto";

        if (!form.comments || form.comments.trim().length < 10) e.comments = "Mínimo 10 caracteres";

        const skuRe = /^[A-Za-z0-9._-]{3,32}$/;
        form.lines.forEach((ln, i) => {
            if (!ln.sku || !skuRe.test(ln.sku)) e[`lines.${i}.sku`] = "SKU inválido (3-32, A-Z 0-9 . _ -)";
            if (!ln.description || ln.description.trim().length < 3) e[`lines.${i}.description`] = "Descripción muy corta";
            if (ln.quantity === "" || Number.isNaN(Number(ln.quantity)) || Number(ln.quantity) <= 0 || !Number.isFinite(Number(ln.quantity))) {
                e[`lines.${i}.quantity`] = "Cantidad > 0";
            } else if (!Number.isInteger(Number(ln.quantity))) {
                e[`lines.${i}.quantity`] = "Debe ser entero";
            }
            if (!UNITS.includes(ln.unit)) e[`lines.${i}.unit`] = "Unidad inválida";
        });

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;

        const payload = {
            scope: form.scope,
            requestType: form.requestType,
            reference: form.reference, // única
            finalClient: form.finalClient.trim(),
            deadline: form.deadline,
            delivery: {
                place: form.deliveryPlace,
                projectId: form.deliveryPlace === "proyecto" ? form.projectId! : null,
            },
            comments: form.comments.trim(),
            lines: form.lines.map(l => ({
                sku: l.sku.trim(),
                description: l.description.trim(),
                quantity: Number(l.quantity),
                unit: l.unit,
                notes: l.notes?.trim() || "",
            })),
            createdAt: new Date().toISOString(),
        };

        console.log("QUOTE_NEW_PAYLOAD", payload);
        alert("Solicitud validada y lista para enviar.");
    };

    return (
        <>
            <PageMeta
                title="Nueva Cotización | Compras Energia PD"
                description="Esta es la página para crear una nueva cotización en Compras Energia PD"
            />
            <div className="rounded-xl border border-gray-200 p-6 bg-white dark:border-white/10 dark:bg-[#101828]">
                <h2 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">Nueva cotización</h2>

                {// Espacio en blanco
}
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
                            <input
                                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm placeholder-gray-400 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                                placeholder="Empresa / Unidad interna"
                                value={form.finalClient}
                                onChange={e => setField("finalClient", e.target.value)}
                            />
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
                                onChange={e => setField("deliveryPlace", e.target.value as DeliveryPlace)}
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
                                        <tr key={i} className="text-sm text-gray-700 dark:text-gray-200">
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
                                                {errors[`lines.${i}.unit`] && <p className="mt-1 text-xs text-rose-400">{errors[`lines.${i}.unit`]}</p>}
                                            </td>
                                            <td className="px-3 py-2 align-top">
                                                <input
                                                    value={ln.notes || ""}
                                                    onChange={e => updateLine(i, { notes: e.target.value })}
                                                    placeholder="Opcional"
                                                    className="min-w-56 rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                                                />
                                            </td>
                                            <td className="px-3 py-2 align-top">
                                                <button type="button" onClick={() => removeLine(i)}
                                                    className="rounded-md px-2 py-1 text-xs text-rose-500 hover:bg-rose-500/10">
                                                    Quitar
                                                </button>
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
                        <Button variant="outline" onClick={() => history.back()}>Cancelar</Button>
                        <Button>Guardar solicitud</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
