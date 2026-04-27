import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { getToken, uploadWithProgress } from "../../lib/api";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import "../../components/common/datepick.css";
import DatePicker from "../../components/common/DatePicker";
import { SearchableSelect } from "../../components/ui/searchable-select";
import { useMonedas } from "../../hooks/useMonedas";


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
  progreso: number; // 0-100
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
  tipoId?: string;
  area?: { id: string; nombreArea: string; tipo: string };
  tipo?: { id: string; nombre: string; areaId: string };
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

  async crearProyecto(data: { nombre: string; areaId: string; tipoId?: string }): Promise<Proyecto> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos`, {
      method: "POST", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, criticidad: 5 }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al crear proyecto"); }
    return response.json();
  },

  async actualizarComentarios(id: string, comentarios: string) {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ comentarios }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al actualizar"); }
    return r.json();
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
// ALIAS UNIDADES (shared between Excel import and PDF parsing)
// ============================================================================

const UNIDADES_ALIAS: Record<string, TipoUnidad> = {
  UNIDAD: "UNIDAD", UNIDADES: "UNIDAD", UND: "UNIDAD", U: "UNIDAD",
  CAJA: "CAJA", CAJAS: "CAJA",
  PAQUETE: "PAQUETE", PAQUETES: "PAQUETE", PKT: "PAQUETE",
  METRO: "METRO", METROS: "METRO", MT: "METRO", M: "METRO",
  PIES: "Pies", PIE: "Pies", FT: "Pies",
  KILOGRAMO: "KILOGRAMO", KILOGRAMOS: "KILOGRAMO", KG: "KILOGRAMO", KILO: "KILOGRAMO", KILOS: "KILOGRAMO",
  LITRO: "LITRO", LITROS: "LITRO", LT: "LITRO", L: "LITRO",
  OTRO: "OTRO", OTROS: "OTRO",
};

const normalizarUnidad = (s: string): TipoUnidad => {
  const key = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  return UNIDADES_ALIAS[key] ?? "UNIDAD";
};

// ============================================================================
// PDF REQUISA PARSER
// ============================================================================

interface RequisaData {
  requisaNo?: string;
  proyecto?: string;
  creador?: string;
  acuerdoCompra?: string;
  presupuesto?: string;
  docOrigen?: string;
  items: Array<{ sku: string; descripcion: string; unidad: string; cantidad: number }>;
}

async function parseRequisa(file: File): Promise<RequisaData> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  // Helper: small delay to avoid blocking the main thread on large PDFs
  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    fullText += tc.items.map((it: any) => it.str).join(' ') + '\n';
    // Yield to event loop every page to maintain data integrity on large requisas
    await delay(20);
  }

  // Normalize whitespace
  const txt = fullText.replace(/\s+/g, ' ').trim();

  const extract = (re: RegExp) => re.exec(txt)?.[1]?.trim();

  const requisaNo     = extract(/REQUISA\s+No[:\s]+([A-Z0-9/]+)/i);
  const proyecto      = extract(/PROYECTO[:\s]+([\w\s\-.,()]+?)(?=\s+ACUERDO|\s+FECHA|\s+PRESUPUESTO)/i);
  const creador       = extract(/CREADOR[:\s]+([\wáéíóúñÁÉÍÓÚÑ\s]+?)(?=\s+ITEM|\s+RECIBIDO|\s*$)/i);
  const acuerdoCompra = extract(/ACUERDO\s+DE\s+COMPRA[:\s]+([A-Z0-9\-/]+)/i);
  const presupuesto   = extract(/PRESUPUESTO[:\s]+(\[[^\]]+\][\w\s]+?)(?=\s+DOCUMENTO|\s+CREADOR)/i);
  const docOrigen     = extract(/DOCUMENTO\s+ORIGEN[:\s]+([A-Z0-9]+)/i);

  // Parse items table: rows after "ITEM PRODUCTO DESCRIPCION UNIDAD DEMANDA HECHO"
  // Process in chunks to avoid regex backtracking issues on texts with 50-100+ rows
  const items: RequisaData['items'] = [];
  const afterHeader = txt.split(/ITEM\s+PRODUCTO\s+DESCRIPCI[OÓ]N\s+UNIDAD\s+DEMANDA\s+HECHO/i)[1];
  if (afterHeader) {
    // Pattern: row_num  SKU_CODE  description_text  unit  demand  done
    // SKU codes look like: CAB-00411, ELE-123, TUB-0001, etc.
    // Also captures SKUs with parenthesized cost variants: COP-00071-(COSTO), HRM-00238-(COSTO P)
    const rowRe = /\b(\d+)\s+([A-Z]{2,4}-\d+(?:[-\s]*\([^)]*\))?)\s+(.+?)\s+([A-Za-z]+)\s+([\d.]+)\s+[\d.]+/g;

    // Strips parenthesized suffix and the preceding char if it's a dash or space.
    // e.g. "COP-00071-(COSTO)" → "COP-00071"
    //      "HRM-00238-(COSTO P)" → "HRM-00238"
    //      "ACC-00143" → "ACC-00143" (unchanged)
    const cleanSku = (raw: string): string =>
      raw.replace(/[-\s]*\([^)]*\)/g, '').trimEnd();

    let m: RegExpExecArray | null;
    let matchCount = 0;
    while ((m = rowRe.exec(afterHeader)) !== null) {
      items.push({
        sku: cleanSku(m[2].trim()),
        descripcion: m[3].trim(),
        unidad: m[4].trim(),
        cantidad: parseFloat(m[5]),
      });
      matchCount++;
      // Yield to event loop every 10 items to avoid UI freezing on large requisas
      if (matchCount % 10 === 0) {
        await delay(10);
      }
    }
  }

  return { requisaNo, proyecto, creador, acuerdoCompra, presupuesto, docOrigen, items };
}

// ============================================================================
// ERROR MAPPING
// ============================================================================

const FIELD_LABELS: Record<string, string> = {
  proyectoId: "proyecto",
  solicitanteId: "solicitante",
  tipoId: "tipo / categoría",
  monedaId: "moneda",
  fechaLimite: "fecha límite",
  fechaEstimada: "fecha estimada",
  nombreCotizacion: "nombre de la cotización",
};

function humanizeBackendError(error: any): string {
  const raw =
    typeof error === "string"
      ? error
      : Array.isArray(error?.message)
      ? error.message.join("; ")
      : error?.message || "Ocurrió un error inesperado. Intenta nuevamente.";

  const lower = raw.toLowerCase();

  // class-validator: "<field> must be a UUID" → "Debe seleccionar un <field>"
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const re = new RegExp(`${key}\\s+must\\s+be\\s+(a\\s+)?uuid`, "i");
    if (re.test(raw)) {
      return `Debe seleccionar un${label.startsWith("f") ? "a" : ""} ${label}.`;
    }
  }

  // Patrones comunes de class-validator
  if (lower.includes("must not be empty") || lower.includes("should not be empty")) {
    return "Faltan campos obligatorios. Revisá el formulario.";
  }
  if (lower.includes("must be a string")) {
    return "Hay un campo de texto inválido. Revisá el formulario.";
  }
  if (lower.includes("must be a date") || lower.includes("must be a valid iso")) {
    return "Hay una fecha inválida. Revisá las fechas.";
  }

  return raw;
}

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
  const [monedaId, setMonedaId] = useState("");
  const [monedaTocada, setMonedaTocada] = useState(false);
  const { monedas, defaultPorTipoCompra } = useMonedas();
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


  // Archivos adjuntos
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Importar requisa PDF
  const [importandoRequisa, setImportandoRequisa] = useState(false);
  const requisaInputRef = useRef<HTMLInputElement>(null);

  // Modal pre-importación (datos que faltan de la requisa)
  const [showRequisaModal, setShowRequisaModal] = useState(false);
  const [pendingRequisaFile, setPendingRequisaFile] = useState<File | null>(null);
  const [modalTipoId, setModalTipoId] = useState("");
  const [modalTipoCompra, setModalTipoCompra] = useState<TipoCompra | "">("");
  const [modalFechaLimite, setModalFechaLimite] = useState<Date | null>(null);
  const [creandoProyectoAuto, setCreandoProyectoAuto] = useState(false);

  // Modal adjuntar archivos adicionales (post-creación vía requisa)
  const [showAdjuntarModal, setShowAdjuntarModal] = useState(false);
  const [adjuntarChatId, setAdjuntarChatId] = useState<string | null>(null);
  const [adjuntarCotizacionId, setAdjuntarCotizacionId] = useState<string | null>(null);
  const [archivosAdicionales, setArchivosAdicionales] = useState<ArchivoAdjunto[]>([]);
  const [subiendoAdicionales, setSubiendoAdicionales] = useState(false);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [creacionViaRequisa, setCreacionViaRequisa] = useState(false);
  const [comentariosModal, setComentariosModal] = useState("");

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Cargar catálogos al montar
  // NOTE: estos useEffect deben estar ANTES de cualquier return condicional (reglas de hooks)
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

  // Default de moneda según tipoCompra (mientras el usuario no la haya tocado manualmente)
  useEffect(() => {
    if (monedaTocada) return;
    if (monedas.length === 0) return;
    const sugerida = defaultPorTipoCompra(tipoCompra);
    if (sugerida && sugerida.id !== monedaId) {
      setMonedaId(sugerida.id);
    }
  }, [tipoCompra, monedas, monedaTocada]);

  // ── Early returns (después de todos los hooks para no violar las reglas de React) ──
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return null;
  }

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
    e.target.value = ""; // Reset input de inmediato para permitir re-selección

    const reader = new FileReader();

    reader.onerror = () => {
      addNotification("danger", "Error al leer archivo", "No se pudo leer el archivo. Verifica que no esté dañado.");
    };

    reader.onload = (ev) => {
      // Usar setTimeout(0) para no bloquear el hilo principal durante el parsing (XLSX es síncrono)
      setTimeout(() => {
        try {
          const result = ev.target?.result;
          if (!result) {
            addNotification("danger", "Error al importar", "El archivo está vacío o no se pudo leer.");
            return;
          }

          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          if (!workbook.SheetNames.length) {
            addNotification("warn", "Archivo sin hojas", "El archivo no contiene ninguna hoja.");
            return;
          }

          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          if (!sheet) {
            addNotification("warn", "Hoja no encontrada", "No se encontró la hoja de datos en el archivo.");
            return;
          }

          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

          // Saltar encabezado (primera fila) y filtrar filas vacías
          const dataRows = rows.slice(1).filter((r) =>
            Array.isArray(r) && r.some((cell) => String(cell ?? "").trim() !== "")
          );

          if (dataRows.length === 0) {
            addNotification("warn", "Archivo sin datos", "El archivo no contiene filas con datos. Asegúrate de llenar la hoja 'Items'.");
            return;
          }

          const parsed: ItemCotizacion[] = dataRows.map((row) => ({
            numeroParte: String(row[0] ?? "").trim(),
            descripcionProducto: String(row[1] ?? "").trim(),
            cantidad: Math.max(1, Number(String(row[2] ?? "1").replace(",", ".")) || 1),
            tipoUnidad: normalizarUnidad(String(row[3] ?? "")),
            notas: String(row[4] ?? "").trim(),
          }));

          setItems([...parsed, emptyItem()]);
          addNotification("success", "Items importados", `${parsed.length} item${parsed.length !== 1 ? "s" : ""} cargado${parsed.length !== 1 ? "s" : ""} desde Excel.`);
        } catch (err) {
          console.error("[ImportExcel] Error al procesar archivo:", err);
          addNotification("danger", "Error al importar", "No se pudo procesar el archivo. Verifica que sea un Excel válido y no tenga formato especial.");
        }
      }, 0);
    };

    reader.readAsArrayBuffer(file);
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

  // ─── Importar Requisa PDF ──────────────────────────────────────────────────
  const handleConfirmarImportacion = async () => {
    if (!pendingRequisaFile || !modalTipoId || !modalTipoCompra || !modalFechaLimite) return;

    // Aplicar valores del modal al formulario
    setTipoId(modalTipoId);
    setTipoCompra(modalTipoCompra as TipoCompra);
    setFechaLimite(modalFechaLimite);
    setShowRequisaModal(false);

    setImportandoRequisa(true);
    try {
      const data = await parseRequisa(pendingRequisaFile);

      // Nombre desde Acuerdo de Compra (queda en blanco si no existe en la requisa)
      if (data.acuerdoCompra) setNombreBase(data.acuerdoCompra);

      // Proyecto: buscar match → si no existe, crear automáticamente
      if (data.proyecto) {
        const needle = data.proyecto.trim().toLowerCase();
        const match = proyectos.find(p => {
          const hay = p.nombre.toLowerCase();
          return hay.includes(needle.substring(0, 15)) || needle.includes(hay.substring(0, 15));
        });
        if (match) {
          setProyectoId(match.id);
        } else {
          // Crear proyecto automáticamente con el área del tipo seleccionado
          const tipoSel = tipos.find(t => t.id === modalTipoId);
          if (tipoSel?.area?.id) {
            setCreandoProyectoAuto(true);
            try {
              const nuevo = await api.crearProyecto({ nombre: data.proyecto.trim(), areaId: tipoSel.area.id, tipoId: tipoSel.id });
              const proyectosActualizados = await api.getProyectos();
              setProyectos((proyectosActualizados || []).filter((p: any) => p.estado));
              setProyectoId(nuevo.id);
              addNotification("info", "Proyecto creado", `Proyecto "${data.proyecto.trim()}" creado automáticamente.`);
            } catch {
              addNotification("warn", "Proyecto no creado", `No se pudo crear el proyecto "${data.proyecto.trim()}". Selecciónalo manualmente.`);
            } finally {
              setCreandoProyectoAuto(false);
            }
          }
        }
      }

      // Comentarios con metadata
      const metaLines = [
        data.creador       && `Creador: ${data.creador}`,
        data.acuerdoCompra && `Acuerdo de compra: ${data.acuerdoCompra}`,
        data.presupuesto   && `Presupuesto: ${data.presupuesto}`,
        data.docOrigen     && `Documento origen: ${data.docOrigen}`,
      ].filter(Boolean) as string[];
      if (metaLines.length > 0) setComentarios(metaLines.join('\n'));

      // Items
      if (data.items.length > 0) {
        const parsed: ItemCotizacion[] = data.items.map(it => ({
          numeroParte: it.sku,
          descripcionProducto: it.descripcion,
          cantidad: Math.max(1, Math.round(it.cantidad)),
          tipoUnidad: normalizarUnidad(it.unidad),
          notas: "",
        }));
        setItems([...parsed, emptyItem()]);
      }

      // Auto-adjuntar el PDF
      setArchivos(prev => {
        const sinAnterior = prev.filter(a => a.file.name !== pendingRequisaFile.name);
        return [...sinAnterior, { file: pendingRequisaFile, id: `requisa-${Date.now()}`, estado: 'pendiente' as const, progreso: 0 }];
      });
      setCreacionViaRequisa(true);

      addNotification("success", "Requisa importada", `Datos cargados${data.requisaNo ? ` (${data.requisaNo})` : ''}. Revisa y envía el formulario.`);
    } catch (err) {
      console.error('Error parsing requisa:', err);
      addNotification("danger", "Error al leer requisa", "No se pudo extraer información del PDF. Verifica que sea una requisa válida.");
    } finally {
      setImportandoRequisa(false);
      setPendingRequisaFile(null);
    }
  };

  // ─── Modal adjuntar adicionales ────────────────────────────────────────────
  const agregarArchivosAdicionales = (files: FileList | File[]) => {
    const nuevos: ArchivoAdjunto[] = Array.from(files).map(f => ({
      file: f,
      id: `adicional-${f.name}-${Date.now()}-${Math.random()}`,
      estado: 'pendiente' as const,
      progreso: 0,
    }));
    setArchivosAdicionales(prev => [...prev, ...nuevos]);
  };

  const handleSubirAdicionales = async () => {
    setSubiendoAdicionales(true);
    try {
      // PATCH comentarios si fueron editados
      if (adjuntarCotizacionId && comentariosModal.trim() !== comentarios.trim()) {
        try {
          await api.actualizarComentarios(adjuntarCotizacionId, comentariosModal.trim());
        } catch {
          addNotification("warn", "Comentarios no guardados", "No se pudo actualizar los comentarios.");
        }
      }

      // Subir archivos si hay
      if (adjuntarChatId && archivosAdicionales.length > 0) {
        let errorCount = 0;
        for (const adjunto of archivosAdicionales) {
          setArchivosAdicionales((prev) =>
            prev.map((a) => a.id === adjunto.id ? { ...a, estado: 'subiendo' as const, progreso: 0 } : a)
          );
          try {
            const form = new FormData();
            form.append("file", adjunto.file);
            await uploadWithProgress(
              `${API_BASE_URL}/api/v1/messages/${adjuntarChatId}/upload`,
              form,
              (pct) => setArchivosAdicionales((prev) =>
                prev.map((a) => a.id === adjunto.id ? { ...a, progreso: pct } : a)
              ),
            );
            setArchivosAdicionales((prev) =>
              prev.map((a) => a.id === adjunto.id ? { ...a, estado: 'ok' as const, progreso: 100 } : a)
            );
          } catch {
            errorCount++;
            setArchivosAdicionales((prev) =>
              prev.map((a) => a.id === adjunto.id ? { ...a, estado: 'error' as const } : a)
            );
          }
        }
        const okCount = archivosAdicionales.length - errorCount;
        if (errorCount > 0) {
          addNotification("warn", "Algunos archivos fallaron", `${okCount} subidos, ${errorCount} fallaron.`);
        } else if (okCount > 0) {
          addNotification("success", "Archivos adjuntados", `${okCount} archivo(s) adjuntados al chat.`);
        }
      }

      setTimeout(() => navigate("/quotes"), 600);
    } finally {
      setSubiendoAdicionales(false);
    }
  };

  // Manejo de archivos adjuntos
  const agregarArchivos = (files: FileList | File[]) => {
    const nuevos: ArchivoAdjunto[] = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      estado: "pendiente" as const,
      progreso: 0,
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
    if (!monedaId) return "Debe seleccionar una moneda";
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
        proyectoId: proyectoId || undefined,
        monedaId: monedaId || undefined,
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
        let errorCount = 0;
        for (const adjunto of archivos) {
          setArchivos((prev) =>
            prev.map((a) => a.id === adjunto.id ? { ...a, estado: "subiendo" as const, progreso: 0 } : a)
          );
          try {
            const form = new FormData();
            form.append("file", adjunto.file);
            await uploadWithProgress(
              `${API_BASE_URL}/api/v1/messages/${resultado.chatId}/upload`,
              form,
              (pct) => setArchivos((prev) =>
                prev.map((a) => a.id === adjunto.id ? { ...a, progreso: pct } : a)
              ),
            );
            setArchivos((prev) =>
              prev.map((a) => a.id === adjunto.id ? { ...a, estado: "ok" as const, progreso: 100 } : a)
            );
          } catch {
            errorCount++;
            setArchivos((prev) =>
              prev.map((a) => a.id === adjunto.id ? { ...a, estado: "error" as const } : a)
            );
          }
        }
        const okCount = archivos.length - errorCount;
        if (errorCount > 0 && okCount === 0) {
          addNotification("warn", "Archivos no subidos", `La cotización se creó pero no se pudieron subir ${errorCount} archivo(s). Puedes adjuntarlos desde el chat en Mis Cotizaciones.`);
        } else if (errorCount > 0) {
          addNotification("warn", "Algunos archivos fallaron", `${okCount} archivo(s) subidos, ${errorCount} fallaron. Puedes adjuntar los faltantes desde el chat.`);
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

      // Si se creó vía requisa, mostrar modal para adjuntar más archivos
      if (creacionViaRequisa && resultado.chatId) {
        setAdjuntarChatId(resultado.chatId);
        setAdjuntarCotizacionId(resultado.id);
        setComentariosModal(comentarios.trim());
        setArchivosAdicionales([]);
        setShowAdjuntarModal(true);
      } else {
        setTimeout(() => navigate("/quotes"), 1500);
      }
    } catch (error: any) {
      console.error("Error al crear cotización:", error);
      addNotification(
        "danger",
        "Error al crear cotización",
        humanizeBackendError(error),
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

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Nueva Cotización
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Complete el formulario para crear una nueva solicitud de cotización
          </p>
        </div>
        <div>
          <input
            ref={requisaInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPendingRequisaFile(f);
                setModalTipoId("");
                setModalTipoCompra("");
                setModalFechaLimite(null);
                setShowRequisaModal(true);
              }
              if (requisaInputRef.current) requisaInputRef.current.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => requisaInputRef.current?.click()}
            disabled={importandoRequisa || creandoProyectoAuto}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-600 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
          >
            {importandoRequisa ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                Leyendo requisa...
              </>
            ) : creandoProyectoAuto ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                Creando proyecto...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Importar Requisa
              </>
            )}
          </button>
        </div>
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

            {/* Tipo de Compra + Moneda */}
            <div className="grid gap-4 sm:grid-cols-2">
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Moneda <span className="text-rose-500">*</span>
                </label>
                <select
                  value={monedaId}
                  onChange={(e) => { setMonedaId(e.target.value); setMonedaTocada(true); }}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  required
                >
                  <option value="">Seleccione una moneda</option>
                  {monedas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} — {m.nombre} ({m.simbolo})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Default según tipo de compra. Editable.
                </p>
              </div>
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

            {/* Proyecto - Filtrado por tipo (con fallback al área si el proyecto aún no tiene tipo asignado) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Proyecto <span className="text-rose-500">*</span>
              </label>
              {!tipoId && (
                <p className="mb-1 text-xs text-amber-600 dark:text-amber-400">Seleccione primero el Tipo/Categoría</p>
              )}
              <SearchableSelect
                value={proyectoId || ""}
                onChange={(val) => setProyectoId(val)}
                options={(() => {
                  const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                  if (!tipoSeleccionado) return proyectos;
                  const areaIdSel = tipoSeleccionado.area?.id;
                  return proyectos.filter(p => {
                    // Si el proyecto tiene tipo asignado, debe coincidir exactamente
                    if (p.tipoId) return p.tipoId === tipoId;
                    // Fallback: proyectos legacy sin tipo asignado, filtrar por área
                    return !!areaIdSel && p.areaId === areaIdSel;
                  });
                })()}
                allValue=""
                allLabel="Seleccione un proyecto"
                placeholder="Seleccione un proyecto"
                disabled={!tipoId}
              />
              {tipoId && (() => {
                const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                return tipoSeleccionado?.area ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Mostrando proyectos de tipo "{tipoSeleccionado.nombre}" ({tipoSeleccionado.area.nombreArea})
                  </p>
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
                    <div className="flex min-w-[80px] flex-col items-end gap-1">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{adjunto.progreso}%</span>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/40">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-200"
                          style={{ width: `${adjunto.progreso}%` }}
                        />
                      </div>
                    </div>
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

      {/* Modal Pre-Importación Requisa */}
      {showRequisaModal && pendingRequisaFile && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Importar Requisa</h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{pendingRequisaFile.name}</p>
              </div>
              <button
                onClick={() => { setShowRequisaModal(false); setPendingRequisaFile(null); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Los siguientes datos no están en la requisa. Completa antes de continuar.
              </p>

              {/* Tipo de Compra */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Compra <span className="text-rose-500">*</span>
                </label>
                <select
                  value={modalTipoCompra}
                  onChange={(e) => setModalTipoCompra(e.target.value as TipoCompra | "")}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccione tipo de compra</option>
                  <option value="NACIONAL">Nacional</option>
                  <option value="INTERNACIONAL">Internacional</option>
                </select>
              </div>

              {/* Tipo/Categoría */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo / Categoría <span className="text-rose-500">*</span>
                </label>
                <select
                  value={modalTipoId}
                  onChange={(e) => setModalTipoId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccione un tipo</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} — {t.area.nombreArea}</option>
                  ))}
                </select>
              </div>

              {/* Fecha Límite */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha Límite <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  selected={modalFechaLimite}
                  onChange={(d) => setModalFechaLimite(d)}
                  minDate={minDate}
                  placeholder="Seleccionar fecha límite"
                />
                <p className="mt-1 text-xs text-gray-500">Mínimo 5 días hábiles</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={() => { setShowRequisaModal(false); setPendingRequisaFile(null); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarImportacion}
                disabled={!modalTipoId || !modalTipoCompra || !modalFechaLimite}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Leer Requisa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adjuntar Archivos Adicionales (post-creación vía requisa) */}
      {showAdjuntarModal && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cotización creada</h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  ¿Desea adjuntar archivos adicionales al chat de la cotización?
                </p>
              </div>
              <button
                onClick={() => { setShowAdjuntarModal(false); navigate("/quotes"); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comentarios editables */}
            <div className="px-6 pt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comentarios de la cotización
              </label>
              <textarea
                value={comentariosModal}
                onChange={(e) => setComentariosModal(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Sin comentarios..."
              />
              <p className="mt-1 text-xs text-gray-400">Puedes editar o agregar información antes de continuar. Se guardará automáticamente.</p>
            </div>

            {/* Drop zone */}
            <div className="px-6 pb-2 pt-4">
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Archivos adicionales (opcional)</p>
            </div>
            <div className="px-6 pb-2">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingModal(true); }}
                onDragLeave={() => setIsDraggingModal(false)}
                onDrop={(e) => { e.preventDefault(); setIsDraggingModal(false); if (e.dataTransfer.files.length > 0) agregarArchivosAdicionales(e.dataTransfer.files); }}
                onClick={() => document.getElementById("adjuntar-modal-input")?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
                  isDraggingModal
                    ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-700/50"
                }`}
              >
                <input
                  id="adjuntar-modal-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) { agregarArchivosAdicionales(e.target.files); e.target.value = ""; } }}
                />
                <svg className={`mb-2 h-9 w-9 ${isDraggingModal ? "text-blue-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {isDraggingModal ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
                </p>
                <p className="mt-1 text-xs text-gray-400">PDF, imágenes, Excel — cualquier tipo</p>
              </div>

              {/* Lista archivos */}
              {archivosAdicionales.length > 0 && (
                <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
                  {archivosAdicionales.map((adj) => (
                    <div key={adj.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                      adj.estado === "ok" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                      : adj.estado === "error" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : adj.estado === "subiendo" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                      : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
                    }`}>
                      <span className="text-base">
                        {adj.file.type.startsWith("image/") ? "🖼️"
                          : adj.file.type === "application/pdf" ? "📄"
                          : adj.file.type.includes("spreadsheet") || adj.file.type.includes("excel") ? "📊"
                          : "📎"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{adj.file.name}</p>
                      </div>
                      {adj.estado === "subiendo" && (
                        <div className="flex min-w-[64px] flex-col items-end gap-1">
                          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">{adj.progreso}%</span>
                          <div className="h-1 w-16 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/40">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-200"
                              style={{ width: `${adj.progreso}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {adj.estado === "ok" && <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      {adj.estado === "error" && <span className="text-xs font-medium text-red-600">Error</span>}
                      {adj.estado === "pendiente" && (
                        <button type="button" onClick={() => setArchivosAdicionales(prev => prev.filter(a => a.id !== adj.id))}
                          className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={() => { setShowAdjuntarModal(false); navigate("/quotes"); }}
                disabled={subiendoAdicionales}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Omitir
              </button>
              <button
                type="button"
                onClick={handleSubirAdicionales}
                disabled={subiendoAdicionales}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {subiendoAdicionales ? (
                  <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Guardando...</>
                ) : archivosAdicionales.length > 0 ? (
                  `Subir (${archivosAdicionales.length}) y continuar`
                ) : (
                  "Guardar y continuar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}