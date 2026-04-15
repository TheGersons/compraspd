// DashboardGerencia.tsx - CONECTADO AL API
import { useState, useEffect, useCallback } from 'react';
import { NavegacionContext, Area, Proyecto, EtapaDetalle, ProductoDetallado } from './types/gerencia.types';
import { getToken } from '../../lib/api';
import Breadcrumbs from './components/gerencia/Breadcrumbs';
import AreaCard from './components/gerencia/AreaCard';
import ProyectoCarousel from './components/gerencia/ProyectoCarousel';
import PanelProyectos from './components/gerencia/PanelProyectos';
import TablaResumen from './components/gerencia/TablaResumen';
import GraficoComparativo from './components/gerencia/GraficoComparativo';
import ModalDetalleProductos from './components/gerencia/ModalDetalleProductos';
import Button from '../../components/ui/button/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


function defaultDesde() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}
function defaultHasta() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardGerencia() {
  const [navegacion, setNavegacion] = useState<NavegacionContext>({
    nivel: 1
  });
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);

  // Filtros
  const [filtroTipoCompra, setFiltroTipoCompra] = useState<'NACIONAL' | 'INTERNACIONAL'>('INTERNACIONAL');
  const [desde, setDesde] = useState(defaultDesde());
  const [hasta, setHasta] = useState(defaultHasta());

  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [etapaModal, setEtapaModal] = useState<EtapaDetalle>('total');

  // Datos del API
  const [areas, setAreas] = useState<Area[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [productosDetallados, setProductosDetallados] = useState<ProductoDetallado[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del API
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/gerencia?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error cargando dashboard');
      const data = await response.json();

      setAreas(data.areas || []);
      setProyectos(data.proyectos || []);
      setProductosDetallados(data.productosDetallados || []);
    } catch (error) {
      console.error('Error cargando dashboard gerencia:', error);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Obtener proyectos según área
  const getProyectosPorArea = () => {
    if (!navegacion.area) return [];
    return proyectos.filter((p: any) => p.areaTipo === navegacion.area?.tipo || p.areaId === navegacion.area?.id);
  };

  // Obtener productos detallados para el área actual
  const getProductosDetalladosArea = (): ProductoDetallado[] => {
    if (!navegacion.area) return [];
    return productosDetallados.filter((p: any) => p.areaId === navegacion.area?.id);
  };

  // Obtener productos detallados para el proyecto seleccionado (filtrados por tipoCompra)
  const getProductosDetalladosProyecto = (): ProductoDetallado[] => {
    if (!proyectoSeleccionado) return [];
    return productosDetallados.filter(
      (p: any) => p.proyectoId === proyectoSeleccionado.id && p.tipoCompra === filtroTipoCompra
    );
  };

  // Calcular resumen desde los productos filtrados
  const computeResumen = (prods: ProductoDetallado[]) => {
    const keys = [
      'cotizado','conDescuento','aprobacionCompra','comprado','pagado',
      'aprobacionPlanos','primerSeguimiento','enFOB','cotizacionFleteInternacional',
      'conBL','segundoSeguimiento','enCIF','recibido',
    ];
    const resumen: any = { totalProductos: prods.length };
    for (const key of keys) {
      resumen[key] = prods.filter(p => p.estados[key] && p.estados[key] !== 'pendiente').length;
    }
    return resumen;
  };

  // Obtener todos los proyectos para el carrusel
  const getTodosProyectos = () => {
    return [...proyectos].sort((a, b) => b.criticidad - a.criticidad);
  };

  // Obtener proyectos por tipo de área
  const getProyectosPorAreaTipo = (tipo: string) => {
    return proyectos.filter((p: any) => p.areaTipo === tipo);
  };

  // Handlers de navegación
  const handleSelectArea = (area: Area) => {
    setNavegacion({ nivel: 2, area });
    const proyectosArea = proyectos.filter((p: any) => p.areaTipo === area.tipo || p.areaId === area.id);
    if (proyectosArea.length > 0) {
      setProyectoSeleccionado(proyectosArea[0]);
    }
  };

  const handleSelectProyecto = (proyecto: Proyecto) => {
    setProyectoSeleccionado(proyecto);
    setNavegacion((prev) => ({ ...prev, proyecto }));
  };

  // Handler para abrir modal desde tabla
  const handleVerDetalleEtapa = (etapaKey: string) => {
    setEtapaModal(etapaKey as EtapaDetalle);
    setModalAbierto(true);
  };

  const handleNavigate = (nivel: 1 | 2 | 3) => {
    if (nivel === 1) {
      setNavegacion({ nivel: 1 });
      setProyectoSeleccionado(null);
    } else if (nivel === 2 && navegacion.area) {
      setNavegacion({ nivel: 2, area: navegacion.area });
      const proyectosArea = getProyectosPorArea();
      if (proyectosArea.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(proyectosArea[0]);
      }
    }
  };

  const handleVolver = () => {
    if (navegacion.nivel >= 2) {
      setNavegacion({ nivel: 1 });
      setProyectoSeleccionado(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard gerencial...</p>
        </div>
      </div>
    );
  }

  const productosProyectoFiltrados = getProductosDetalladosProyecto();
  const resumenFiltrado = proyectoSeleccionado ? computeResumen(productosProyectoFiltrados) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vista Gerencial</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Panel ejecutivo de seguimiento de cotizaciones y compras
        </p>
      </div>

      {/* Barra única: breadcrumbs + filtros + volver */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Breadcrumbs o label inicial */}
        {navegacion.nivel > 1 ? (
          <Breadcrumbs navegacion={navegacion} onNavigate={handleNavigate} />
        ) : (
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Inicio</span>
        )}

        <div className="mx-1 h-4 w-px flex-shrink-0 bg-gray-200 dark:bg-gray-600" />

        {/* Toggle Nacional / Internacional */}
        <div className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700/50">
          {(['INTERNACIONAL', 'NACIONAL'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFiltroTipoCompra(opt)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filtroTipoCompra === opt
                  ? opt === 'NACIONAL'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {opt === 'NACIONAL' ? 'Nacional' : 'Internacional'}
            </button>
          ))}
        </div>

        <div className="mx-1 h-4 w-px flex-shrink-0 bg-gray-200 dark:bg-gray-600" />

        {/* Fechas */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-[11px] outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-[11px] outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => { setDesde(defaultDesde()); setHasta(defaultHasta()); setFiltroTipoCompra('INTERNACIONAL'); }}
          className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-gray-700"
        >
          ↺
        </button>

        {/* Volver */}
        {navegacion.nivel > 1 && (
          <>
            <div className="ml-auto h-4 w-px flex-shrink-0 bg-gray-200 dark:bg-gray-600" />
            <Button onClick={handleVolver} variant="secondary" size="sm">
              <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Button>
          </>
        )}
      </div>

      {/* NIVEL 1: Vista General con Áreas */}
      {navegacion.nivel === 1 && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {areas.map((area) => (
              <AreaCard key={area.id} area={area} onClick={() => handleSelectArea(area)} />
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Proyectos Activos
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Ordenados por criticidad
              </p>
            </div>
            <ProyectoCarousel proyectos={getTodosProyectos()} />
          </div>

          <GraficoComparativo
            proyectosProyectos={getProyectosPorAreaTipo('proyectos')}
            proyectosComercial={getProyectosPorAreaTipo('comercial')}
            proyectosTecnica={getProyectosPorAreaTipo('tecnica')}
            proyectosOperativa={getProyectosPorAreaTipo('operativa')}
          />
        </div>
      )}

      {/* NIVEL 2: Panel lateral + Tabla de resumen */}
      {navegacion.nivel === 2 && navegacion.area && (
        <div className="flex gap-6">
          <PanelProyectos
            tipoArea={navegacion.area.tipo}
            proyectos={getProyectosPorArea()}
            proyectoSeleccionado={proyectoSeleccionado}
            onSelectProyecto={handleSelectProyecto}
            productosDetallados={getProductosDetalladosArea()}
          />

          <div className="flex-1 space-y-6">
            {proyectoSeleccionado && resumenFiltrado ? (
              <>
                {/* Info del proyecto */}
                <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {proyectoSeleccionado.nombre}
                  </h3>
                </div>

                <TablaResumen
                  resumen={resumenFiltrado}
                  titulo="Resumen de Procesos"
                  subtitulo={`${resumenFiltrado.totalProductos} productos ${filtroTipoCompra === 'NACIONAL' ? 'nacionales' : 'internacionales'}`}
                  onVerDetalle={handleVerDetalleEtapa}
                  productosDetallados={productosProyectoFiltrados}
                  tipoCompra={filtroTipoCompra}
                />
              </>
            ) : (
              <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  Seleccione un proyecto del panel lateral para ver su resumen
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      <ModalDetalleProductos
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        etapa={etapaModal}
        productos={productosProyectoFiltrados}
        nombreProyecto={proyectoSeleccionado?.nombre || ''}
        tipoCompra={filtroTipoCompra}
      />
    </div>
  );
}