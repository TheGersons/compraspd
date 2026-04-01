import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { getToken } from "../../lib/api";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import "../../components/common/datepick.css";
import DatePicker from "../../components/common/DatePicker";


// ============================================================================
// TYPES
// ============================================================================

type TipoCompra = "NACIONAL" | "INTERNACIONAL";
type LugarEntrega = "ALMACEN" | "OFICINA" | "PROYECTO";
type TipoUnidad = "UNIDAD" | "CAJA" | "PAQUETE" | "METRO" | "Pies" | "KILOGRAMO" | "LITRO" | "OTRO";

interface ArchivoAdjunto {
  file: File;
  id: string; // local key para el preview
  estado: "pendiente" | "subiendo" | "ok" | "error";
  error?: string;
}

interface ItemCotizacion {
  numeroParte: string;
  descripcionProducto: string;
  cantidad: number;
  tipoUnidad: TipoUnidad;
  notas: string;
}

interface Tipo {
  id: string;
  nombre: string;
  areaId: string;
  area: {
    id: string;
    nombreArea: string;
    tipo: string;
  };
}

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  departamento: {
    nombre: string;
  };
  rol: {
    nombre: string;
    descripcion: string;
  };
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: boolean;
  areaId?: string;
  area?: { id: string; nombreArea: string; tipo: string };
}

interface AreaCategoria {
  id: string;
  nombreArea: string;
  tipo: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const api = {

  async getCurrentUser(): Promise<Usuario> {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener usuario actual");
      return response.json();
    } catch (error) {
      throw error;
    } finally {

    }

  },

  async getTipos(): Promise<Tipo[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/tipos`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al cargar tipos");
    return response.json();
  },

  async getUsuarios(): Promise<Usuario[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/users/all`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al cargar usuarios");
    return response.json();
  },

  async getProyectos(): Promise<Proyecto[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al cargar proyectos");
    return response.json();
  },

  async crearCotizacion(data: any) {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/quotations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear cotización");
    }

    return response.json();
  },

  async getAreas(): Promise<AreaCategoria[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/areas`, {
      credentials: "include", headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return response.json();
  },

  async crearProyecto(data: { nombre: string; areaId: string }): Promise<Proyecto> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos`, {
      method: "POST", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, criticidad: 5 }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al crear proyecto"); }
    return response.json();
  },

  async subirArchivosChat(chatId: string, archivos: File[]): Promise<{ ok: File[]; error: File[] }> {
    const ok: File[] = [];
    const error: File[] = [];
    await Promise.all(
      archivos.map(async (file) => {
        try {
          const token = await getToken();
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/upload`, {
            method: "POST",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (!response.ok) throw new Error("Error al subir archivo");
          ok.push(file);
        } catch {
          error.push(file);
        }
      })
    );
    return { ok, error };
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function New() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [nombreBase, setNombreBase] = useState("");
  const [tipoCompra, setTipoCompra] = useState<TipoCompra>("NACIONAL");
  const [lugarEntrega, setLugarEntrega] = useState<LugarEntrega>("ALMACEN");
  const [comentarios, setComentarios] = useState("");
  const [tipoId, setTipoId] = useState("");
  const { user, isLoading } = useAuth();

  const [solicitanteId, setSolicitanteId] = useState("");
  const [searchSolicitante, setSearchSolicitante] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [items, setItems] = useState<ItemCotizacion[]>([
    { numeroParte: "", descripcionProducto: "", cantidad: 1, tipoUnidad: "UNIDAD", notas: "" },
  ]);
  const [fechaLimite, setFechaLimite] = useState<Date | null>(null);

  // Calcular fecha mínima (+5 días hábiles desde hoy, sin contar sábados ni domingos)
  const minDate = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    let diasHabiles = 0;
    while (diasHabiles < 5) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) diasHabiles++;
    }
    return date;
  })();
  // Catálogos
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [areas, setAreas] = useState<AreaCategoria[]>([]);

  // Modal crear proyecto
  const [showNuevoProyecto, setShowNuevoProyecto] = useState(false);
  const [nuevoProyectoNombre, setNuevoProyectoNombre] = useState("");
  const [nuevoProyectoAreaId, setNuevoProyectoAreaId] = useState("");
  const [creandoProyecto, setCreandoProyecto] = useState(false);

  // Archivos adjuntos
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);


  // 1. LOADING
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  if (!user) {
    return null;
  }

  // Cargar catálogos al montar
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {

    try {
      setIsLoading(true);
      setLoadingCatalogos(true);
      setError(null);
      const [tiposResult, usuariosResult, proyectosResult, areasResult] = await Promise.allSettled([
        api.getTipos(),
        api.getUsuarios(),
        api.getProyectos(),
        api.getAreas(),
      ]);
      // 1. Manejar Tipos (CON VALIDACIÓN DE NULOS EXTRA)
      if (tiposResult.status === 'fulfilled') {
        const datosSeguros = tiposResult.value || [];
        setTipos(datosSeguros);
      } else {
        console.warn("⚠️ Error cargando Tipos:", tiposResult.reason);
        setTipos([]);
      }

      // 2. Manejar Usuarios
      if (usuariosResult.status === 'fulfilled') {
        // Validamos también aquí por seguridad básica
        const usuariosSeguros = usuariosResult.value || [];
        setUsuarios(usuariosSeguros.filter((u: any) => u.activo));
      } else {
        // Aquí suele caer el 401, lo manejamos silenciosamente
        console.warn("⚠️ Error cargando Usuarios (posible 401):", usuariosResult.reason);
        setUsuarios([]);
      }

      // 3. Manejar Proyectos
      if (proyectosResult.status === 'fulfilled') {
        const proyectosSeguros = proyectosResult.value || [];
        setProyectos(proyectosSeguros.filter((p: any) => p.estado));
      } else {
        console.warn("⚠️ Error cargando Proyectos:", proyectosResult.reason);
        setProyectos([]);
      }

      // 4. Manejar Áreas
      if (areasResult.status === 'fulfilled') {
        setAreas(areasResult.value || []);
      }

      // Obtener usuario actual del endpoint /auth/me
      try {
        setSolicitanteId(user.id);
      } catch (error) {
        console.log('⚠️ No se pudo obtener usuario actual:', error);
      }

    } catch (error) {
      console.error("Error al cargar catálogos:", error);
      setError("No se pudieron cargar los catálogos necesarios. Por favor, recarga la página.");
      addNotification(
        "danger",
        "Error al cargar datos",
        "No se pudieron cargar los catálogos necesarios. Por favor, recarga la página.",
        { priority: "critical", source: "Nueva Cotización" }
      );
    } finally {
      setIsLoading(false);
      setLoadingCatalogos(false);
    }
  };

  useEffect(() => {
    if (!proyectoId && lugarEntrega === "PROYECTO") {

      setLugarEntrega("ALMACEN");
      addNotification(
        "info",
        "Lugar de entrega actualizado",
        "Se cambió a Almacén porque no hay proyecto seleccionado.",
        { priority: "low" }
      );


    }
  }, [proyectoId]);

  // ─── Helpers para items ────────────────────────────────────────────────────
  const emptyItem = (): ItemCotizacion => ({
    numeroParte: "", descripcionProducto: "", cantidad: 1, tipoUnidad: "UNIDAD", notas: "",
  });

  const isRowTouched = (item: ItemCotizacion) =>
    !!(item.numeroParte.trim() || item.descripcionProducto.trim());

  // ─── Manejo de items ───────────────────────────────────────────────────────
  const eliminarItem = (index: number) => {
    const remaining = items.filter((_, i) => i !== index);
    const base = remaining.length === 0 ? [emptyItem()] : remaining;
    // Garantizar siempre una fila extra vacía al final
    if (isRowTouched(base[base.length - 1])) base.push(emptyItem());
    setItems(base);
  };

  const actualizarItem = (index: number, campo: keyof ItemCotizacion, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };

    // Auto-agregar fila vacía cuando la última fila recibe contenido
    const lastIdx = nuevosItems.length - 1;
    if (index === lastIdx && isRowTouched(nuevosItems[lastIdx])) {
      nuevosItems.push(emptyItem());
    }

    setItems(nuevosItems);
  };

  // ─── Excel: Importar items ─────────────────────────────────────────────────
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        // Saltar encabezado (primera fila)
        const dataRows = rows.slice(1).filter((r) =>
          r.some((cell) => String(cell).trim() !== "")
        );

        if (dataRows.length === 0) {
          addNotification("warn", "Archivo vacío", "El archivo no contiene datos.");
          return;
        }

        const UNIDADES: TipoUnidad[] = ["UNIDAD","CAJA","PAQUETE","METRO","Pies","KILOGRAMO","LITRO","OTRO"];

        // Normaliza texto: quita acentos, pasa a mayúsculas, recorta espacios
        const normalizar = (s: string) =>
          s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

        // Mapa de alias (valor normalizado → TipoUnidad exacto)
        const ALIAS: Record<string, TipoUnidad> = {
          UNIDAD: "UNIDAD", UNIDADES: "UNIDAD", UND: "UNIDAD", U: "UNIDAD",
          CAJA: "CAJA", CAJAS: "CAJA",
          PAQUETE: "PAQUETE", PAQUETES: "PAQUETE", PKT: "PAQUETE",
          METRO: "METRO", METROS: "METRO", MT: "METRO", M: "METRO",
          PIES: "Pies", PIE: "Pies", FT: "Pies",
          KILOGRAMO: "KILOGRAMO", KILOGRAMOS: "KILOGRAMO", KG: "KILOGRAMO", KILO: "KILOGRAMO", KILOS: "KILOGRAMO",
          LITRO: "LITRO", LITROS: "LITRO", LT: "LITRO", L: "LITRO",
          OTRO: "OTRO", OTROS: "OTRO",
        };

        const resolveUnidad = (raw: string): TipoUnidad =>
          ALIAS[normalizar(raw)] ?? "UNIDAD";

        const parsed: ItemCotizacion[] = dataRows.map((row) => ({
          numeroParte: String(row[0] ?? "").trim(),
          descripcionProducto: String(row[1] ?? "").trim(),
          cantidad: Math.max(1, parseInt(String(row[2])) || 1),
          tipoUnidad: resolveUnidad(String(row[3] ?? "")),
          notas: String(row[4] ?? "").trim(),
        }));

        // Agregar fila extra vacía al final
        setItems([...parsed, emptyItem()]);
        addNotification("success", "Items importados", `${parsed.length} items cargados desde Excel.`);
      } catch {
        addNotification("danger", "Error al importar", "No se pudo leer el archivo Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ""; // Reset input
  };

  // ─── Excel: Descargar plantilla ────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const wsData = [
      ["# de Parte", "Descripción", "Cantidad", "Tipo Unidad", "Notas"],
      ["PART-001", "Laptop Dell Latitude 5420", 2, "UNIDAD", "Con SSD 512GB, color negro"],
      ["PART-002", "Monitor 24 pulgadas", 1, "UNIDAD", "Resolución 1920x1080"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 15 }, { wch: 35 }, { wch: 10 }, { wch: 14 }, { wch: 30 }];

    // Hoja de referencia con tipos de unidad disponibles
    const refData = [
      ["Tipo Unidad (valor exacto)", "Alias aceptados", "Descripción"],
      ["UNIDAD",    "UNIDAD, UND, U",                  "Unidad individual"],
      ["CAJA",      "CAJA, CAJAS",                     "Caja o empaque colectivo"],
      ["PAQUETE",   "PAQUETE, PAQUETES, PKT",           "Paquete agrupado"],
      ["METRO",     "METRO, METROS, MT, M",             "Metro lineal"],
      ["Pies",      "PIES, PIE, FT",                   "Pie (foot)"],
      ["KILOGRAMO", "KILOGRAMO, KG, KILO, KILOS",      "Kilogramo de peso"],
      ["LITRO",     "LITRO, LITROS, LT, L",            "Litro de volumen"],
      ["OTRO",      "OTRO, OTROS",                     "Otro tipo de medida"],
    ];
    const wsRef = XLSX.utils.aoa_to_sheet(refData);
    wsRef["!cols"] = [{ wch: 22 }, { wch: 32 }, { wch: 28 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items");
    XLSX.utils.book_append_sheet(wb, wsRef, "Tipos de Unidad");
    XLSX.writeFile(wb, "plantilla_cotizacion.xlsx");
  };

  // Manejo de archivos adjuntos
  const agregarArchivos = (files: FileList | File[]) => {
    const nuevos: ArchivoAdjunto[] = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      estado: "pendiente" as const,
    }));
    setArchivos((prev) => [...prev, ...nuevos]);
  };

  const eliminarArchivo = (id: string) => {
    setArchivos((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) agregarArchivos(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📎";
  };

  // Validación
  const getFilledItems = () => items.filter(isRowTouched);

  const validarFormulario = (): string | null => {
    if (!nombreBase.trim()) return "El nombre de la cotización es obligatorio";
    if (!tipoId) return "Debe seleccionar un tipo de cotización";
    if (!solicitanteId) return "Debe seleccionar un solicitante";
    if (!proyectoId && lugarEntrega === 'PROYECTO') {
      return "Debe seleccionar un proyecto cuando el lugar de entrega es 'Proyecto'";
    }
    if (!fechaLimite) return "La fecha límite es obligatoria";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (new Date(fechaLimite) < hoy) return "La fecha límite no puede ser en el pasado";

    const filled = getFilledItems();
    if (filled.length === 0) return "Debes agregar al menos 1 ítem en la cotización";

    for (let i = 0; i < filled.length; i++) {
      const item = filled[i];
      if (!item.descripcionProducto.trim() && !item.numeroParte.trim()) continue;
      if (!item.descripcionProducto.trim()) return `La descripción del item ${i + 1} es obligatoria`;
      if (item.cantidad <= 0) return `La cantidad del item ${i + 1} debe ser mayor a 0`;
    }

    return null;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar
    const error = validarFormulario();
    if (error) {
      addNotification("warn", "Validación", error, { priority: "medium" });
      return;
    }

    try {
      setLoading(true);

      const fechaEstimadaDefault = new Date();
      fechaEstimadaDefault.setDate(fechaEstimadaDefault.getDate() + 30); // +30 días
      // Preparar datos (SKU eliminado del payload)
      const payload = {
        nombreCotizacion: nombreBase.trim(),
        tipoCompra,
        lugarEntrega,
        fechaLimite: fechaLimite?.toISOString(),
        fechaEstimada: fechaEstimadaDefault.toISOString(),
        comentarios: comentarios.trim() || undefined,
        tipoId,
        solicitanteId,
        proyectoId,
        items: getFilledItems().map(item => ({
          descripcionProducto: (
            item.numeroParte.trim() && item.descripcionProducto.trim()
              ? `${item.numeroParte.trim()} - ${item.descripcionProducto.trim()}`
              : item.numeroParte.trim() || item.descripcionProducto.trim()
          ),
          cantidad: item.cantidad,
          tipoUnidad: item.tipoUnidad,
          notas: item.notas.trim() || undefined,
        })),
      };

      const resultado = await api.crearCotizacion(payload);

      // Subir archivos adjuntos al chat (si hay)
      if (archivos.length > 0 && resultado.chatId) {
        // Marcar todos como "subiendo"
        setArchivos((prev) => prev.map((a) => ({ ...a, estado: "subiendo" as const })));

        const { ok, error: errores } = await api.subirArchivosChat(
          resultado.chatId,
          archivos.map((a) => a.file)
        );

        // Actualizar estados individuales
        setArchivos((prev) =>
          prev.map((a) => ({
            ...a,
            estado: errores.includes(a.file) ? ("error" as const) : ("ok" as const),
          }))
        );

        if (errores.length > 0 && ok.length === 0) {
          addNotification("warn", "Archivos no subidos", `La cotización se creó pero no se pudieron subir ${errores.length} archivo(s). Puedes adjuntarlos desde el chat en Mis Cotizaciones.`);
        } else if (errores.length > 0) {
          addNotification("warn", "Algunos archivos fallaron", `${ok.length} archivo(s) subidos, ${errores.length} fallaron. Puedes adjuntar los faltantes desde el chat.`);
        }
      }

      addNotification(
        "success",
        "¡Cotización creada!",
        `La cotización "${resultado.nombreCotizacion}" ha sido creada exitosamente.`,
        {
          priority: "medium",
          source: "Nueva Cotización",
          actionUrl: `/quotes/${resultado.id}`,
        }
      );

      // Redirigir
      setTimeout(() => {
        navigate("/quotes");
      }, 1500);
    } catch (error: any) {
      console.error("Error al crear cotización:", error);
      addNotification(
        "danger",
        "Error al crear cotización",
        error.message || "Ocurrió un error inesperado. Intenta nuevamente.",
        { priority: "critical", source: "Nueva Cotización" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading y error states
  if (loadingCatalogos) {
    return <LoadingScreen message="Cargando formulario de cotización..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarCatalogos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Nueva Cotización" description="Crear una nueva cotización" />

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Nueva Cotización
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Complete el formulario para crear una nueva solicitud de cotización
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Información General
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la Cotización <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nombreBase}
                onChange={(e) => setNombreBase(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                placeholder="Ej: Cotización Laptops Octubre"
                required
              />
            </div>

            {/* Tipo de Compra */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Compra <span className="text-rose-500">*</span>
              </label>
              <select
                value={tipoCompra}
                onChange={(e) => setTipoCompra(e.target.value as TipoCompra)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                required
              >
                <option value="NACIONAL">Nacional</option>
                <option value="INTERNACIONAL">Internacional</option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo/Categoría <span className="text-rose-500">*</span>
              </label>
              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                required
              >
                <option value="">Seleccione un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre} - {tipo.area.nombreArea}
                  </option>
                ))}
              </select>
            </div>

            {/* Proyecto - Filtrado por área del tipo seleccionado */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Proyecto <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value.length < 5 ? null : e.target.value)}
                  className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Seleccione un proyecto</option>
                  {(() => {
                    const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                    const areaNombre = tipoSeleccionado?.area?.nombreArea?.toLowerCase();
                    const proyectosFiltrados = areaNombre
                      ? proyectos.filter(p => p.area?.nombreArea?.toLowerCase() === areaNombre)
                      : proyectos;
                    return proyectosFiltrados.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre} {proyecto.area ? `(${proyecto.area.nombreArea})` : ''}
                      </option>
                    ));
                  })()}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                    setNuevoProyectoAreaId(tipoSeleccionado?.area?.id || '');
                    setNuevoProyectoNombre('');
                    setShowNuevoProyecto(true);
                  }}
                  className="rounded-lg border-2 border-dashed border-gray-300 px-3 py-2.5 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors dark:border-gray-600 dark:text-gray-400"
                  title="Crear nuevo proyecto"
                >
                  +
                </button>
              </div>
              {tipoId && (() => {
                const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                return tipoSeleccionado?.area ? (
                  <p className="mt-1 text-xs text-gray-500">Mostrando proyectos de: {tipoSeleccionado.area.nombreArea}</p>
                ) : null;
              })()}
            </div>

            {/* Solicitante - Combobox con búsqueda */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Solicitante <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                {solicitanteId ? (
                  // Mostrar usuario seleccionado con botón X
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      {usuarios.find(u => u.id === solicitanteId)?.nombre || 'Usuario seleccionado'}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {usuarios.find(u => u.id === solicitanteId)?.departamento.nombre}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSolicitanteId('');
                        setSearchSolicitante('');
                      }}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border-2 border-rose-300 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
                      title="Limpiar solicitante"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  // Input de búsqueda + lista filtrada
                  <div className="relative">
                    <input
                      type="text"
                      value={searchSolicitante}
                      onChange={(e) => setSearchSolicitante(e.target.value)}
                      placeholder="Buscar solicitante por nombre..."
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                    <svg
                      className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {searchSolicitante && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                        {usuarios
                          .filter(u =>
                            u.nombre.toLowerCase().includes(searchSolicitante.toLowerCase())
                          )
                          .slice(0, 20)
                          .map(usuario => (
                            <button
                              key={usuario.id}
                              type="button"
                              onClick={() => {
                                setSolicitanteId(usuario.id);
                                setSearchSolicitante('');
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">
                                {usuario.nombre}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {usuario.departamento.nombre} • {usuario.rol.nombre}
                              </div>
                            </button>
                          ))}
                        {usuarios.filter(u =>
                          u.nombre.toLowerCase().includes(searchSolicitante.toLowerCase())
                        ).length === 0 && (
                            <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No se encontraron resultados
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lugar de Entrega */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lugar de Entrega <span className="text-rose-500">*</span>
              </label>
              <select
                value={lugarEntrega}
                onChange={(e) => setLugarEntrega(e.target.value as LugarEntrega)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                required
              >
                <option value="ALMACEN">Almacén</option>
                <option value="OFICINA">Oficina</option>
                <option value="PROYECTO" disabled={!proyectoId}>
                  Proyecto {!proyectoId && "(seleccione proyecto primero)"}
                </option>
              </select>
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha Límite <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                selected={fechaLimite}
                onChange={(date) => setFechaLimite(date)}
                minDate={minDate}
                placeholder="Seleccionar fecha límite"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 5 días a partir de hoy
              </p>
            </div>

            {/* Comentarios */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comentarios o Instrucciones Especiales
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                placeholder="Añade cualquier comentario relevante..."
              />
            </div>
          </div>
        </div>

        {/* Items de la Cotización */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Cabecera */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Items de la Cotización
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                El # de parte del primer item se agrega automáticamente como prefijo al nombre.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Importar Excel */}
              <label
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                title="Importar items desde Excel"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importar Excel
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleImportExcel}
                />
              </label>

              {/* Descargar plantilla */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 rounded-lg border-2 border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                title="Descargar plantilla de ejemplo"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar Plantilla
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/60">
                  <th className="w-8 border-b border-gray-200 py-2.5 pl-3 text-center text-xs font-semibold text-gray-500 dark:border-gray-600 dark:text-gray-400">
                    #
                  </th>
                  <th className="w-32 border-b border-l border-gray-200 px-2.5 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                    # de Parte
                  </th>
                  <th className="border-b border-l border-gray-200 px-2.5 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                    Descripción <span className="text-rose-500">*</span>
                  </th>
                  <th className="w-20 border-b border-l border-gray-200 px-2.5 py-2.5 text-center text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                    Cantidad <span className="text-rose-500">*</span>
                  </th>
                  <th className="w-28 border-b border-l border-gray-200 px-2.5 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                    Tipo Unidad
                  </th>
                  <th className="w-40 border-b border-l border-gray-200 px-2.5 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">
                    Notas
                  </th>
                  <th className="w-10 border-b border-l border-gray-200 py-2.5 dark:border-gray-600" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const isEmpty = !isRowTouched(item);
                  const isLast = index === items.length - 1;
                  return (
                    <tr
                      key={index}
                      className={`group transition-colors ${
                        isEmpty
                          ? "bg-gray-50/50 dark:bg-gray-800/30"
                          : "bg-white dark:bg-gray-800"
                      } hover:bg-blue-50/30 dark:hover:bg-blue-900/10`}
                    >
                      {/* # row */}
                      <td className="border-b border-gray-100 py-1.5 pl-3 text-center text-xs text-gray-400 dark:border-gray-700">
                        {isEmpty ? (
                          <span className="text-gray-300 dark:text-gray-600">+</span>
                        ) : (
                          index + 1
                        )}
                      </td>

                      {/* # de Parte */}
                      <td className="border-b border-l border-gray-100 p-1 dark:border-gray-700">
                        <input
                          type="text"
                          value={item.numeroParte}
                          onChange={(e) => actualizarItem(index, "numeroParte", e.target.value)}
                          className="w-full rounded border-0 bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder-gray-300 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:text-gray-200 dark:placeholder-gray-600 dark:focus:bg-blue-900/20"
                          placeholder={isLast ? "Ej: PART-001" : ""}
                        />
                      </td>

                      {/* Descripción */}
                      <td className="border-b border-l border-gray-100 p-1 dark:border-gray-700">
                        <input
                          type="text"
                          value={item.descripcionProducto}
                          onChange={(e) => actualizarItem(index, "descripcionProducto", e.target.value)}
                          className="w-full rounded border-0 bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder-gray-300 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:text-gray-200 dark:placeholder-gray-600 dark:focus:bg-blue-900/20"
                          placeholder={isLast ? "Laptop Dell Latitude 5420" : ""}
                        />
                      </td>

                      {/* Cantidad */}
                      <td className="border-b border-l border-gray-100 p-1 dark:border-gray-700">
                        <input
                          type="number"
                          value={item.cantidad}
                          min="1"
                          onChange={(e) => actualizarItem(index, "cantidad", parseInt(e.target.value) || 1)}
                          className="w-full rounded border-0 bg-transparent px-2 py-1.5 text-center text-sm text-gray-800 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:text-gray-200 dark:focus:bg-blue-900/20"
                        />
                      </td>

                      {/* Tipo Unidad */}
                      <td className="border-b border-l border-gray-100 p-1 dark:border-gray-700">
                        <select
                          value={item.tipoUnidad}
                          onChange={(e) => actualizarItem(index, "tipoUnidad", e.target.value)}
                          className="w-full rounded border-0 bg-transparent px-1 py-1.5 text-sm text-gray-800 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:bg-transparent dark:text-gray-200 dark:focus:bg-blue-900/20"
                        >
                          <option value="UNIDAD">Unidad</option>
                          <option value="CAJA">Caja</option>
                          <option value="PAQUETE">Paquete</option>
                          <option value="METRO">Metro</option>
                          <option value="Pies">Pies</option>
                          <option value="KILOGRAMO">Kilogramo</option>
                          <option value="LITRO">Litro</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </td>

                      {/* Notas */}
                      <td className="border-b border-l border-gray-100 p-1 dark:border-gray-700">
                        <input
                          type="text"
                          value={item.notas}
                          onChange={(e) => actualizarItem(index, "notas", e.target.value)}
                          className="w-full rounded border-0 bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder-gray-300 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:text-gray-200 dark:placeholder-gray-600 dark:focus:bg-blue-900/20"
                          placeholder={isLast ? "Especificaciones..." : ""}
                        />
                      </td>

                      {/* Eliminar */}
                      <td className="border-b border-l border-gray-100 p-1 text-center dark:border-gray-700">
                        {!isEmpty && (
                          <button
                            type="button"
                            onClick={() => eliminarItem(index)}
                            className="rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-rose-100 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                            title="Eliminar fila"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-right text-xs text-gray-400 dark:text-gray-500">
            {getFilledItems().length} item{getFilledItems().length !== 1 ? "s" : ""} agregado{getFilledItems().length !== 1 ? "s" : ""}
            {" · "}La última fila vacía se agrega automáticamente
          </p>
        </div>

        {/* Archivos Adjuntos */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            Archivos Adjuntos
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Opcional — los archivos se enviarán directamente al chat de la cotización al crearla.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer
              ${isDragging
                ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500"
              }`}
            onClick={() => document.getElementById("file-input-new")?.click()}
          >
            <input
              id="file-input-new"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) { agregarArchivos(e.target.files); e.target.value = ""; } }}
            />
            <svg className={`mb-2 h-10 w-10 ${isDragging ? "text-blue-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              PDF, imágenes, Excel, Word — cualquier tipo de archivo
            </p>
          </div>

          {/* Lista de archivos seleccionados */}
          {archivos.length > 0 && (
            <div className="mt-4 space-y-2">
              {archivos.map((adjunto) => (
                <div
                  key={adjunto.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors
                    ${adjunto.estado === "ok" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                      : adjunto.estado === "error" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        : adjunto.estado === "subiendo" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                          : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700"}`}
                >
                  <span className="text-lg">{getFileIcon(adjunto.file)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {adjunto.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(adjunto.file.size)}
                    </p>
                  </div>
                  {/* Estado */}
                  {adjunto.estado === "subiendo" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  )}
                  {adjunto.estado === "ok" && (
                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {adjunto.estado === "error" && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Error</span>
                  )}
                  {adjunto.estado === "pendiente" && (
                    <button
                      type="button"
                      onClick={() => eliminarArchivo(adjunto.id)}
                      className="ml-1 rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <p className="text-right text-xs text-gray-400 dark:text-gray-500">
                {archivos.length} archivo{archivos.length !== 1 ? "s" : ""} seleccionado{archivos.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={() => navigate("/quotes")}
            variant="secondary"
            disabled={loading}
          >
            Cancelar
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                Creando...
              </>
            ) : (
              "Crear Cotización"
            )}
          </button>
        </div>
      </form>

      {/* Modal Crear Proyecto Rápido */}
      {showNuevoProyecto && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Proyecto</h3>
              <button onClick={() => setShowNuevoProyecto(false)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input type="text" value={nuevoProyectoNombre}
                  onChange={(e) => setNuevoProyectoNombre(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Nombre del proyecto" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Área *</label>
                <select value={nuevoProyectoAreaId}
                  onChange={(e) => setNuevoProyectoAreaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  <option value="">Seleccione un área</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombreArea}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
              <button onClick={() => setShowNuevoProyecto(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
              <button
                disabled={creandoProyecto || !nuevoProyectoNombre.trim() || !nuevoProyectoAreaId}
                onClick={async () => {
                  setCreandoProyecto(true);
                  try {
                    const nuevo = await api.crearProyecto({ nombre: nuevoProyectoNombre.trim(), areaId: nuevoProyectoAreaId });
                    // Recargar proyectos para tener el area incluida
                    const proyectosActualizados = await api.getProyectos();
                    setProyectos((proyectosActualizados || []).filter((p: any) => p.estado));
                    setProyectoId(nuevo.id);
                    setShowNuevoProyecto(false);
                    addNotification("success", "Proyecto creado", `"${nuevo.nombre}" creado exitosamente`);
                  } catch (e: any) {
                    addNotification("danger", "Error", e.message);
                  } finally { setCreandoProyecto(false); }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {creandoProyecto ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}