// components/HistorialAmigable.tsx
import { useState, useEffect } from 'react';
import { getToken } from '../../../lib/api';

// ============================================================================
// TYPES
// ============================================================================

type HistorialCambio = {
  id: string;
  accion: string;
  detalles: any;
  creado: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
};

type ProductoInfo = {
  sku: string;
  descripcionProducto: string;
};

type DetalleExtra = {
  label: string;
  valor: string | number;
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const token = getToken();


async function obtenerProducto(productoId: string): Promise<ProductoInfo | null> {
  try {
    // Cambiar a usar el nuevo endpoint
    const response = await fetch(`${API_BASE_URL}/api/v1/quotation-details/by-estado/${productoId}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      sku: data.sku || 'Sin SKU',
      descripcionProducto: data.descripcionProducto || 'Sin descripción'
    };
  } catch (error) {
    console.error('Error al obtener detalle de cotización:', error);
    return null;
  }
}

// Cache de productos para evitar requests duplicados
const productosCache = new Map<string, ProductoInfo | null>();

async function obtenerProductosDeHistorial(detalles: any): Promise<ProductoInfo[]> {
  const productos: ProductoInfo[] = [];
  
  // Caso 1: productoId único
  if (detalles?.productoId) {
    if (productosCache.has(detalles.productoId)) {
      const producto = productosCache.get(detalles.productoId);
      if (producto) productos.push(producto);
    } else {
      const producto = await obtenerProducto(detalles.productoId);
      productosCache.set(detalles.productoId, producto);
      if (producto) productos.push(producto);
    }
  }
  
  // Caso 2: Array de productos con IDs
  if (detalles?.productos && Array.isArray(detalles.productos)) {
    for (const prod of detalles.productos) {
      if (prod.productoId || prod.id) {
        const id = prod.productoId || prod.id;
        if (productosCache.has(id)) {
          const producto = productosCache.get(id);
          if (producto) productos.push(producto);
        } else {
          const producto = await obtenerProducto(id);
          productosCache.set(id, producto);
          if (producto) productos.push(producto);
        }
      }
    }
  }
  
  return productos;
}

// ============================================================================
// COMPONENTE PARA ITEM DE HISTORIAL CON DATOS
// ============================================================================

function ItemHistorialConDatos({ 
  cambio, 
  config, 
  isExpandido, 
  onToggle 
}: { 
  cambio: HistorialCambio;
  config: any;
  isExpandido: boolean;
  onToggle: () => void;
}) {
  const [productos, setProductos] = useState<ProductoInfo[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      const prods = await obtenerProductosDeHistorial(cambio.detalles);
      setProductos(prods);
      setCargando(false);
    };
    cargarProductos();
  }, [cambio.detalles]);

  // Enriquecer detalles con info de productos
  const detallesEnriquecidos = {
    ...cambio.detalles,
    productosInfo: productos
  };

  const detallesExtras = config.detallesExtra(detallesEnriquecidos);
  const tieneDetalles = detallesExtras.length > 0 || cambio.detalles;

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {config.titulo}
          </h4>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {config === ACCION_DESCONOCIDA 
              ? config.descripcion(cambio.accion)
              : config.descripcion(detallesEnriquecidos)
            }
          </p>
          {cargando && (
            <span className="mt-1 inline-block text-xs text-gray-500">
              Cargando información...
            </span>
          )}
        </div>
        {tieneDetalles && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg
              className={`h-5 w-5 transition-transform ${isExpandido ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Detalles expandibles */}
      {isExpandido && detallesExtras.length > 0 && (
        <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
          {detallesExtras.map((detalle: DetalleExtra, idx: number) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {detalle.label}:
              </span>
              <span className="flex-1 text-xs text-gray-900 dark:text-white">
                {detalle.valor}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {cambio.usuario.nombre.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {cambio.usuario.nombre}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatearFecha(cambio.creado)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// DICCIONARIO DE TRADUCCIONES Y DESCRIPCIONES
// ============================================================================

const ACCIONES_CONFIG = {
  'TIMELINE_CONFIGURADO': {
    icono: '⚙️',
    color: 'blue',
    titulo: 'Línea de tiempo configurada',
    descripcion: (detalles: any) => {
      const productosInfo = detalles?.productosInfo || [];
      const skus = detalles?.skus || [];
      const productosCount = detalles?.productosConfigurados || skus.length || productosInfo.length;
      
      if (productosInfo.length === 1) {
        return `Se configuró la línea de tiempo para ${productosInfo[0].sku}`;
      } else if (productosCount === 1 && skus.length > 0) {
        return `Se configuró la línea de tiempo para ${skus[0]}`;
      }
      return `Se configuró la línea de tiempo para ${productosCount} producto${productosCount > 1 ? 's' : ''}`;
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      const productosInfo = detalles?.productosInfo || [];
      
      // Mostrar SKU y descripción de productos cargados
      if (productosInfo.length > 0) {
        productosInfo.forEach((prod: ProductoInfo, idx: number) => {
          if (productosInfo.length > 1) {
            items.push({ label: `Producto ${idx + 1}`, valor: '' });
          }
          items.push({ label: 'SKU', valor: prod.sku });
          items.push({ label: 'Descripción', valor: prod.descripcionProducto });
        });
      }
      // Fallback a SKUs si no hay productos cargados
      else if (detalles?.skus && detalles.skus.length > 0) {
        items.push({ label: 'SKUs', valor: detalles.skus.join(', ') });
      }
      
      if (detalles?.paisOrigen) {
        items.push({ label: 'País de origen', valor: detalles.paisOrigen });
      }
      
      if (detalles?.medioTransporte) {
        const medios = {
          'MARITIMO': '🚢 Marítimo',
          'TERRESTRE': '🚚 Terrestre',
          'AEREO': '✈️ Aéreo'
        };
        items.push({ label: 'Medio de transporte', valor: medios[detalles.medioTransporte as keyof typeof medios] || detalles.medioTransporte });
      }
      
      if (detalles?.diasTotales) {
        items.push({ label: 'Duración estimada', valor: `${detalles.diasTotales} días` });
      }
      
      return items;
    }
  },
  
  'PRODUCTO_APROBADO': {
    icono: '✅',
    color: 'green',
    titulo: 'Producto aprobado',
    descripcion: (detalles: any) => {
      const productosInfo = detalles?.productosInfo || [];
      if (productosInfo.length > 0) {
        return `Se aprobó el producto ${productosInfo[0].sku}`;
      }
      if (detalles?.sku) {
        return `Se aprobó el producto ${detalles.sku}`;
      }
      return 'Se aprobó un producto';
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      const productosInfo = detalles?.productosInfo || [];
      
      if (productosInfo.length > 0) {
        items.push({ label: 'SKU', valor: productosInfo[0].sku });
        items.push({ label: 'Descripción', valor: productosInfo[0].descripcionProducto });
      } else if (detalles?.sku) {
        items.push({ label: 'SKU', valor: detalles.sku });
      }
      
      if (detalles?.paisOrigen) {
        items.push({ label: 'País de origen', valor: detalles.paisOrigen });
      }
      
      if (detalles?.medioTransporte) {
        const medios = {
          'MARITIMO': '🚢 Marítimo',
          'TERRESTRE': '🚚 Terrestre',
          'AEREO': '✈️ Aéreo'
        };
        items.push({ label: 'Medio de transporte', valor: medios[detalles.medioTransporte as keyof typeof medios] || detalles.medioTransporte });
      }
      
      return items;
    }
  },
  
  'COTIZACION_CREADA': {
    icono: '📝',
    color: 'purple',
    titulo: 'Cotización creada',
    descripcion: (detalles: any) => {
      const nombre = detalles?.nombreCotizacion || 'Nueva cotización';
      return `Se creó la cotización "${nombre}"`;
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      
      if (detalles?.totalProductos) {
        items.push({ label: 'Total de productos', valor: detalles.totalProductos });
      }
      
      if (detalles?.proyecto) {
        items.push({ label: 'Proyecto', valor: detalles.proyecto });
      }
      
      if (detalles?.fechaLimite) {
        items.push({ label: 'Fecha límite', valor: new Date(detalles.fechaLimite).toLocaleDateString('es-HN') });
      }
      
      return items;
    }
  },
  
  'ESTADO_CAMBIADO': {
    icono: '🔄',
    color: 'amber',
    titulo: 'Estado actualizado',
    descripcion: (detalles: any) => {
      const estadoAnterior = detalles?.estadoAnterior || 'desconocido';
      const estadoNuevo = detalles?.estadoNuevo || 'desconocido';
      
      const estados: Record<string, string> = {
        'pendiente': 'Pendiente',
        'en_revision': 'En Revisión',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
      };
      
      return `Estado cambiado de "${estados[estadoAnterior] || estadoAnterior}" a "${estados[estadoNuevo] || estadoNuevo}"`;
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      
      if (detalles?.motivo) {
        items.push({ label: 'Motivo', valor: detalles.motivo });
      }
      
      return items;
    }
  },
  
  'PRECIO_ACTUALIZADO': {
    icono: '💰',
    color: 'emerald',
    titulo: 'Precio actualizado',
    descripcion: (detalles: any) => {
      const productosInfo = detalles?.productosInfo || [];
      if (productosInfo.length > 0) {
        return `Se actualizó el precio de ${productosInfo[0].sku}`;
      }
      if (detalles?.sku) {
        return `Se actualizó el precio de ${detalles.sku}`;
      }
      return 'Se actualizó un precio';
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      const productosInfo = detalles?.productosInfo || [];
      
      if (productosInfo.length > 0) {
        items.push({ label: 'SKU', valor: productosInfo[0].sku });
        items.push({ label: 'Descripción', valor: productosInfo[0].descripcionProducto });
      } else if (detalles?.sku) {
        items.push({ label: 'SKU', valor: detalles.sku });
      }
      
      if (detalles?.precioAnterior && detalles?.precioNuevo) {
        items.push({ 
          label: 'Cambio de precio', 
          valor: `L ${detalles.precioAnterior.toFixed(2)} → L ${detalles.precioNuevo.toFixed(2)}` 
        });
      }
      
      if (detalles?.proveedor) {
        items.push({ label: 'Proveedor', valor: detalles.proveedor });
      }
      
      return items;
    }
  },
  
  'PROVEEDOR_SELECCIONADO': {
    icono: '🏢',
    color: 'indigo',
    titulo: 'Proveedor seleccionado',
    descripcion: (detalles: any) => {
      if (detalles?.proveedor) {
        return `Se seleccionó a ${detalles.proveedor} como proveedor`;
      }
      return 'Se seleccionó un proveedor';
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      const productosInfo = detalles?.productosInfo || [];
      
      if (productosInfo.length > 0) {
        items.push({ label: 'SKU', valor: productosInfo[0].sku });
        items.push({ label: 'Descripción', valor: productosInfo[0].descripcionProducto });
      } else if (detalles?.sku) {
        items.push({ label: 'SKU', valor: detalles.sku });
      }
      
      if (detalles?.precio) {
        items.push({ label: 'Precio', valor: `L ${detalles.precio.toFixed(2)}` });
      }
      
      return items;
    }
  },
  
  'COMENTARIO_AGREGADO': {
    icono: '💬',
    color: 'sky',
    titulo: 'Comentario agregado',
    descripcion: (detalles: any) => {
      const preview = detalles?.contenido?.substring(0, 50) || '';
      return preview ? `"${preview}${detalles.contenido.length > 50 ? '...' : ''}"` : 'Se agregó un comentario';
    },
    detallesExtra: () => []
  },
  
  'DOCUMENTO_ADJUNTADO': {
    icono: '📎',
    color: 'violet',
    titulo: 'Documento adjuntado',
    descripcion: (detalles: any) => {
      if (detalles?.nombreArchivo) {
        return `Se adjuntó el archivo "${detalles.nombreArchivo}"`;
      }
      return 'Se adjuntó un documento';
    },
    detallesExtra: (detalles: any) => {
      const items = [];
      
      if (detalles?.tipoArchivo) {
        items.push({ label: 'Tipo', valor: detalles.tipoArchivo });
      }
      
      if (detalles?.tamano) {
        const tamanoMB = (detalles.tamano / (1024 * 1024)).toFixed(2);
        items.push({ label: 'Tamaño', valor: `${tamanoMB} MB` });
      }
      
      return items;
    }
  }
};

// Configuración por defecto para acciones desconocidas
const ACCION_DESCONOCIDA = {
  icono: '📋',
  color: 'gray',
  titulo: 'Acción registrada',
  descripcion: (accion: string) => {
    const titulo = accion
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return titulo;
  },
  detallesExtra: () => []
};

// ============================================================================
// HELPERS
// ============================================================================

function formatearFecha(fecha: string): string {
  const ahora = new Date();
  const fechaEvento = new Date(fecha);
  const diffMs = ahora.getTime() - fechaEvento.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
  if (diffDias < 7) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;

  return fechaEvento.toLocaleDateString('es-HN', {
    day: 'numeric',
    month: 'short',
    year: fechaEvento.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  });
}

function agruparPorFecha(cambios: HistorialCambio[]): Record<string, HistorialCambio[]> {
  const ahora = new Date();
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);

  const grupos: Record<string, HistorialCambio[]> = {
    'Hoy': [],
    'Ayer': [],
    'Esta semana': [],
    'Anteriores': []
  };

  cambios.forEach(cambio => {
    const fechaCambio = new Date(cambio.creado);
    const diffDias = Math.floor((ahora.getTime() - fechaCambio.getTime()) / 86400000);

    if (fechaCambio.toDateString() === ahora.toDateString()) {
      grupos['Hoy'].push(cambio);
    } else if (fechaCambio.toDateString() === ayer.toDateString()) {
      grupos['Ayer'].push(cambio);
    } else if (diffDias < 7) {
      grupos['Esta semana'].push(cambio);
    } else {
      grupos['Anteriores'].push(cambio);
    }
  });

  Object.keys(grupos).forEach(key => {
    if (grupos[key].length === 0) delete grupos[key];
  });

  return grupos;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface HistorialAmigableProps {
  cambios: HistorialCambio[];
}

export default function Historial({ cambios }: HistorialAmigableProps) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const toggleExpandir = (id: string) => {
    const nuevos = new Set(expandidos);
    if (nuevos.has(id)) {
      nuevos.delete(id);
    } else {
      nuevos.add(id);
    }
    setExpandidos(nuevos);
  };

  const gruposPorFecha = agruparPorFecha(cambios);

  if (cambios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No hay historial disponible
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Los cambios y eventos aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(gruposPorFecha).map(([grupo, cambiosGrupo]) => (
        <div key={grupo}>
          {/* Header del grupo */}
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {grupo}
            </h3>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Timeline de eventos */}
          <div className="space-y-4">
            {cambiosGrupo.map((cambio, index) => {
              const config = ACCIONES_CONFIG[cambio.accion as keyof typeof ACCIONES_CONFIG] || ACCION_DESCONOCIDA;
              const isExpandido = expandidos.has(cambio.id);

              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
                amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
                violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
                gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600'
              };

              const colorClass = colorClasses[config.color as keyof typeof colorClasses];

              return (
                <div key={cambio.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  {index < cambiosGrupo.length - 1 && (
                    <div className="absolute left-6 top-12 h-full w-px bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Icono */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-xl ${colorClass}`}>
                    {config.icono}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <ItemHistorialConDatos
                      cambio={cambio}
                      config={config}
                      isExpandido={isExpandido}
                      onToggle={() => toggleExpandir(cambio.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}