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


export default function DashboardGerencia() {
  const [navegacion, setNavegacion] = useState<NavegacionContext>({
    nivel: 1
  });
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);

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
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/gerencia`, {
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
  }, []);

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

  // Obtener productos detallados para el proyecto seleccionado
  const getProductosDetalladosProyecto = (): ProductoDetallado[] => {
    if (!proyectoSeleccionado) return [];
    return productosDetallados.filter((p: any) => p.proyectoId === proyectoSeleccionado.id);
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

  const handleVerDetalle = () => {
    setNavegacion((prev) => ({ ...prev, nivel: 3 }));
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
    if (navegacion.nivel === 2) {
      setNavegacion({ nivel: 1 });
      setProyectoSeleccionado(null);
    } else if (navegacion.nivel === 3) {
      setNavegacion({ nivel: 2, area: navegacion.area, proyecto: proyectoSeleccionado || undefined });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Vista Gerencial
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Panel ejecutivo de seguimiento de cotizaciones y compras
          </p>
        </div>
      </div>

      {/* Breadcrumbs y botón volver */}
      {navegacion.nivel > 1 && (
        <div className="flex items-center justify-between">
          <Breadcrumbs navegacion={navegacion} onNavigate={handleNavigate} />
          <Button onClick={handleVolver} variant="secondary" size="sm">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Button>
        </div>
      )}

      {/* NIVEL 1: Vista General con Áreas - SIN TABLAS */}
      {navegacion.nivel === 1 && (
        <div className="space-y-8">
          {/* Áreas Principales - Grid 2x2 - SOLO CARDS */}
          <div className="grid gap-6 lg:grid-cols-2">
            {areas.map((area) => (
              <AreaCard key={area.id} area={area} onClick={() => handleSelectArea(area)} />
            ))}
          </div>


          {/* Carrusel de Proyectos Activos */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Proyectos Activos
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Estado general de todos los proyectos (ordenados por criticidad)
              </p>
            </div>
            <ProyectoCarousel proyectos={getTodosProyectos()} />
          </div>


          {/* Gráfico Comparativo */}
          <GraficoComparativo
            proyectosProyectos={getProyectosPorAreaTipo('proyectos')}
            proyectosComercial={getProyectosPorAreaTipo('comercial')}
            proyectosTecnica={getProyectosPorAreaTipo('tecnica')}
            proyectosOperativa={getProyectosPorAreaTipo('operativa')}
          />
        </div>
      )}

      {/* NIVEL 2: Panel lateral + Tabla de resumen CON BOTÓN VER DETALLE */}
      {navegacion.nivel === 2 && navegacion.area && (
        <div className="flex gap-6">
          {/* Panel lateral de proyectos */}
          <PanelProyectos
            tipoArea={navegacion.area.tipo}
            proyectos={getProyectosPorArea()}
            proyectoSeleccionado={proyectoSeleccionado}
            onSelectProyecto={handleSelectProyecto}
            productosDetallados={getProductosDetalladosArea()}
          />

          {/* Contenido principal */}
          <div className="flex-1 space-y-6">
            {proyectoSeleccionado ? (
              <>
                {/* Info del proyecto */}
                <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {proyectoSeleccionado.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Responsable: {proyectoSeleccionado.responsable}
                      </p>
                    </div>
                    <Button onClick={handleVerDetalle} variant="primary" size="sm">
                      Ver Detalle Completo
                    </Button>
                  </div>
                </div>

                {/* Tabla de resumen con botones Ver Detalle */}
                <TablaResumen
                  resumen={proyectoSeleccionado.resumen}
                  titulo="Resumen de Procesos"
                  subtitulo={`Distribución de ${proyectoSeleccionado.resumen.totalProductos} productos en las diferentes etapas`}
                  onVerDetalle={handleVerDetalleEtapa}
                  productosDetallados={getProductosDetalladosProyecto()}
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

      {/* NIVEL 3: Detalle completo del proyecto - Tabla de resumen + productos */}
      {navegacion.nivel === 3 && proyectoSeleccionado && (
        <div className="space-y-6">
          {/* Info del proyecto */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {proyectoSeleccionado.nombre}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detalle completo de productos • Responsable: {proyectoSeleccionado.responsable}
            </p>
          </div>

          {/* Tabla de resumen con detalle */}
          <TablaResumen
            resumen={proyectoSeleccionado.resumen}
            titulo="Resumen de Procesos"
            subtitulo={`Distribución de ${proyectoSeleccionado.resumen.totalProductos} productos en las diferentes etapas`}
            onVerDetalle={handleVerDetalleEtapa}
            productosDetallados={getProductosDetalladosProyecto()}
          />
        </div>
      )}

      {/* MODAL DE DETALLES */}
      <ModalDetalleProductos
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        etapa={etapaModal}
        productos={getProductosDetalladosProyecto()}
        nombreProyecto={proyectoSeleccionado?.nombre || ''}
      />
    </div>
  );
}