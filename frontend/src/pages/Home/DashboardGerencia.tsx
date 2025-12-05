// DashboardGerencia.tsx - MODIFICADO
import { useState } from 'react';
import { NavegacionContext, Area, Proyecto, EtapaDetalle } from './types/gerencia.types';
import Breadcrumbs from './components/gerencia/Breadcrumbs';
import AreaCard from './components/gerencia/AreaCard';
import ProyectoCarousel from './components/gerencia/ProyectoCarousel';
import PanelProyectos from './components/gerencia/PanelProyectos';
import TablaResumen from './components/gerencia/TablaResumen';
import DetalleTabla from './components/gerencia/DetalleTabla';
import GraficoComparativo from './components/gerencia/GraficoComparativo';
import ModalDetalleProductos from './components/gerencia/ModalDetalleProductos';

// Mocks
import { AREAS_PRINCIPALES } from './mocks/mocks_areas';
import {
  PROYECTOS_ORDENADOS as PROYECTOS_PROYECTOS,
  DETALLE_PRODUCTOS_PROYECTOS
} from './mocks/mocks_proyectos';
import {
  PROYECTOS_COMERCIAL_ORDENADOS,
  DETALLE_PRODUCTOS_COMERCIAL
} from './mocks/mocks_comercial';
import {
  PROYECTOS_TECNICA_ORDENADOS,
  DETALLE_PRODUCTOS_TECNICA
} from './mocks/mocks_tecnica';
import {
  PROYECTOS_OPERATIVA_ORDENADOS,
  DETALLE_PRODUCTOS_OPERATIVA
} from './mocks/mocks_operativa';
import { getProductosDetalladosPorArea } from './mocks/mocks_productos_detallados';
import Button from '../../components/ui/button/Button';

export default function DashboardGerencia() {
  const [navegacion, setNavegacion] = useState<NavegacionContext>({
    nivel: 1
  });
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  
  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [etapaModal, setEtapaModal] = useState<EtapaDetalle>('total');

  // Obtener proyectos según área
  const getProyectosPorArea = () => {
    if (!navegacion.area) return [];
    switch (navegacion.area.tipo) {
      case 'proyectos':
        return PROYECTOS_PROYECTOS;
      case 'comercial':
        return PROYECTOS_COMERCIAL_ORDENADOS;
      case 'tecnica':
        return PROYECTOS_TECNICA_ORDENADOS;
      case 'operativa':
        return PROYECTOS_OPERATIVA_ORDENADOS;
      default:
        return [];
    }
  };

  // Obtener productos detallados según área
  const getProductosPorArea = () => {
    if (!navegacion.area) return [];
    switch (navegacion.area.tipo) {
      case 'proyectos':
        return DETALLE_PRODUCTOS_PROYECTOS;
      case 'comercial':
        return DETALLE_PRODUCTOS_COMERCIAL;
      case 'tecnica':
        return DETALLE_PRODUCTOS_TECNICA;
      case 'operativa':
        return DETALLE_PRODUCTOS_OPERATIVA;
      default:
        return [];
    }
  };

  // Obtener productos detallados para modal
  const getProductosDetalladosModal = () => {
    if (!navegacion.area) return [];
    return getProductosDetalladosPorArea(navegacion.area.tipo);
  };

  // Obtener todos los proyectos para el carrusel
  const getTodosProyectos = () => {
    const todos = [
      ...PROYECTOS_PROYECTOS,
      ...PROYECTOS_COMERCIAL_ORDENADOS,
      ...PROYECTOS_TECNICA_ORDENADOS,
      ...PROYECTOS_OPERATIVA_ORDENADOS
    ];
    return todos.sort((a, b) => b.criticidad - a.criticidad);
  };

  // Handlers de navegación
  const handleSelectArea = (area: Area) => {
    setNavegacion({ nivel: 2, area });
    const proyectosArea = getProyectosPorAreaDirecto(area.tipo);
    if (proyectosArea.length > 0) {
      setProyectoSeleccionado(proyectosArea[0]);
    }
  };

  const getProyectosPorAreaDirecto = (tipo: string) => {
    switch (tipo) {
      case 'proyectos':
        return PROYECTOS_PROYECTOS;
      case 'comercial':
        return PROYECTOS_COMERCIAL_ORDENADOS;
      case 'tecnica':
        return PROYECTOS_TECNICA_ORDENADOS;
      case 'operativa':
        return PROYECTOS_OPERATIVA_ORDENADOS;
      default:
        return [];
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
            {AREAS_PRINCIPALES.map((area) => (
              <AreaCard key={area.id} area={area} onClick={() => handleSelectArea(area)} />
            ))}
          </div>

          {/* Gráfico Comparativo */}
          <GraficoComparativo
            proyectosProyectos={PROYECTOS_PROYECTOS}
            proyectosComercial={PROYECTOS_COMERCIAL_ORDENADOS}
            proyectosTecnica={PROYECTOS_TECNICA_ORDENADOS}
            proyectosOperativa={PROYECTOS_OPERATIVA_ORDENADOS}
          />

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
                  productosDetallados={getProductosDetalladosModal()}
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

      {/* NIVEL 3: Tabla de detalle completa */}
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

          {/* Tabla detallada */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <DetalleTabla
              productos={getProductosPorArea()}
              titulo="Detalle de Productos"
            />
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      <ModalDetalleProductos
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        etapa={etapaModal}
        productos={getProductosDetalladosModal()}
        nombreProyecto={proyectoSeleccionado?.nombre || ''}
      />
    </div>
  );
}