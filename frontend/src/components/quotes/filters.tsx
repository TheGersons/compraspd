import { useState, useMemo } from "react";
import DatePicker from "../form/date-picker";
import Button from "../ui/button/Button";
import IconSearch from "../common/IconSearch";

export type QuoteFilters = {
    preset?: "7d" | "30d" | "90d" | "custom" | undefined;
    range?: { start?: string; end?: string }; // YYYY-MM-DD
    estado?: "todas" | "abiertas" | "cerradas" | "pendientes" | "en_revision" | "vencidas" | undefined;
    tipoSolicitud?: "todas" | "licitaciones" | "proyectos" | "suministros" | "inventarios" | undefined;
    tipoCompra?: "todas" | "nacional" | "internacional" |"NATIONAL"|"INTERNATIONAL" | undefined;
    proyectoId?: string | "todos" | undefined;
    asignadoA?: string | "todos" | "sin_asignar" | undefined;
    origen?: "todos" | "crm" | "web" | "manual" | undefined; // opcional
    ordenar?: "recientes" | "antiguas" | "monto_asc" | "monto_desc" | "vence_pronto" | undefined;
    q?: string;
    placeholder?: string;
};

export default function Filters({
    value,
    onChange,
    proyectos = [],
    tipos = [], // ✅ Añadido
    areas = [], // ✅ Añadido
    usuarios = [],
}: {
    value: QuoteFilters;
    onChange: (f: QuoteFilters) => void;
    proyectos?: { id: string; nombre: string }[];
    tipos?: { id: string; nombre: string }[]; // ✅ Nueva prop
    areas?: { nombreArea: string }[]; // ✅ Nueva prop
    usuarios?: { id: string; nombre: string }[];
}) {
    const [local, setLocal] = useState<QuoteFilters>(value);
    let Placeholder = "Rango personalizado";
    const set = (patch: Partial<QuoteFilters>) =>
        setLocal((prev) => ({ ...prev, ...patch }));

    const applyPreset = (p: QuoteFilters["preset"]) => {
        if (p === "custom") return set({ preset: "custom" });
        set({ preset: p, range: undefined });
        //limpiamos el calendario
        set({ range: undefined });
        set({ placeholder: Placeholder });
        onChange({ ...local, preset: p, range: undefined });
    };

    const apply = () => onChange(local);
    const clear = () =>
        onChange({
            preset: "30d",
            estado: "todas",
            tipoSolicitud: "todas",
            tipoCompra: "todas",
            proyectoId: "todos",
            asignadoA: "todos",
            origen: "todos",
            ordenar: "recientes",
            q: "",
        });

    const chips = useMemo(() => {
        const arr: string[] = [];
        if (local.estado && local.estado !== "todas") arr.push(`Estado: ${local.estado}`);
        if (local.tipoSolicitud && local.tipoSolicitud !== "todas") arr.push(`Tipo: ${local.tipoSolicitud}`);
        if (local.tipoCompra && local.tipoCompra !== "todas") arr.push(`Compra: ${local.tipoCompra}`);
        if (local.proyectoId && local.proyectoId !== "todos") arr.push("Proyecto");
        if (local.asignadoA && local.asignadoA !== "todos") arr.push(
            local.asignadoA === "sin_asignar" ? "Sin asignar" : "Asignado"
        );
        if (local.origen && local.origen !== "todos") arr.push(`Origen: ${local.origen}`);
        if (local.preset === "custom" && local.range?.start) arr.push("Rango: personalizado");
        if (local.q) arr.push(`Busq: "${local.q}"`);
        return arr;
    }, [local]);

    return (
        <div className="flex flex-col gap-3">
            {/* Presets + resumen */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {local.preset === "7d" && "Resumen últimos 7 días"}
                    {local.preset === "30d" && "Resumen últimos 30 días"}
                    {local.preset === "90d" && "Resumen últimos 90 días"}
                    {local.preset === "custom" && "Resumen rango personalizado"}
                    {!local.preset && "Resumen"}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={local.preset === "7d" ? "primary" : "secondary"} onClick={() => applyPreset("7d")}>7 días</Button>
                    <Button size="sm" variant={local.preset === "30d" ? "primary" : "secondary"} onClick={() => applyPreset("30d")}>30 días</Button>
                    <Button size="sm" variant={local.preset === "90d" ? "primary" : "secondary"} onClick={() => applyPreset("90d")}>90 días</Button>
                    <Button size="sm" variant={local.preset === "custom" ? "primary" : "secondary"} onClick={() => applyPreset("custom")}>Personalizado</Button>
                </div>
            </div>

            {/* Línea 2: búsqueda + selects principales */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                    <div className="relative">
                        <input
                            placeholder="Buscar por #, cliente, SKU, descripción"
                            className="h-11 w-full rounded-lg border px-10 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
                            value={local.q || ""}
                            onChange={(e) => set({ q: e.target.value })}
                        />
                        <IconSearch className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.estado || "todas"}
                    onChange={(e) => set({ estado: e.target.value as QuoteFilters["estado"] })}
                >
                    <option value="todas">Estado: todas</option>
                    <option value="abiertas">Abiertas</option>
                    <option value="en_revision">En revisión</option>
                    <option value="pendientes">Pendientes</option>
                    <option value="cerradas">Cerradas</option>
                    <option value="vencidas">Vencidas</option>
                </select>
                
                {/* ✅ Select dinámico de Tipos */}
                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.tipoSolicitud || "todas"}
                    onChange={(e) => set({ tipoSolicitud: e.target.value as QuoteFilters["tipoSolicitud"] })}
                >
                    <option value="todas">Tipo: todas</option>
                    {tipos.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                </select>
                
                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.tipoCompra || "todas"}
                    onChange={(e) => set({ tipoCompra: e.target.value as QuoteFilters["tipoCompra"] })}
                >
                    <option value="todas">Compra: todas</option>
                    <option value="NATIONAL">Nacional</option>
                    <option value="INTERNATIONAL">Internacional</option>
                </select>
            </div>

            {/* Línea 3: proyecto, asignado, área, ordenar, rango */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.proyectoId || "todos"}
                    onChange={(e) => set({ proyectoId: e.target.value })}
                >
                    <option value="todos">Proyecto: todos</option>
                    {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>

                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.asignadoA || "todos"}
                    onChange={(e) => set({ asignadoA: e.target.value as QuoteFilters["asignadoA"] })}
                >
                    <option value="todos">Asignado: todos</option>
                    <option value="sin_asignar">Sin asignar</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>

                {/* ✅ Select dinámico de Áreas */}
                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.origen || "todos"}
                    onChange={(e) => set({ origen: e.target.value as QuoteFilters["origen"] })}
                >
                    <option value="todos">Área: todas</option>
                    {areas.map((area, idx) => (
                        <option key={idx} value={area.nombreArea}>{area.nombreArea}</option>
                    ))}
                </select>

                <select
                    className="h-11 rounded-lg border px-3 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                    value={local.ordenar || "recientes"}
                    onChange={(e) => set({ ordenar: e.target.value as QuoteFilters["ordenar"] })}
                >
                    <option value="recientes">Ordenar: más recientes</option>
                    <option value="antiguas">Más antiguas</option>
                    <option value="monto_desc">Monto ↓</option>
                    <option value="monto_asc">Monto ↑</option>
                    <option value="vence_pronto">Vence pronto</option>
                </select>

                {/* Rango personalizado solo si preset=custom */}
                <div className="flex items-center gap-2">
                    <DatePicker
                        id="quotes-range"
                        mode="range"
                        placeholder={Placeholder}
                        action={() => set({ 
                            preset: "custom",
                        })}
                    />
                </div>
            </div>

            {/* Chips + acciones */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {chips.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                            {c}
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={clear}>Limpiar</Button>
                    <Button size="sm" onClick={apply}>Aplicar</Button>
                </div>
            </div>
        </div>
    );
}