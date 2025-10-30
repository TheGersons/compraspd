import React, { useState, useMemo, useEffect } from "react";
import { useAllRequests } from "./hooks/useHistory";
import { RequestedItemsTable } from "./components/RequestedItemsTable";

// ============================================================================
// TYPES
// ============================================================================

type RequestCategory = "LICITACIONES" | "PROYECTOS" | "SUMINISTROS" | "INVENTARIOS";
type Procurement = "NACIONAL" | "INTERNACIONAL";
type DeliveryType = "ALMACEN" | "PROYECTO";

type PRItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  itemType: string;
  sku?: string;
  barcode?: string;
};

type Assignment = {
  id: string;
  followStatus: string;
  progress: number;
  assignedTo: {
    fullName: string;
  };
};

type PurchaseRequest = {
  id: string;
  reference: string;
  title: string;
  description?: string;
  finalClient: string;
  status: string;
  requestCategory: RequestCategory;
  procurement: Procurement;
  deliveryType?: DeliveryType;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  requester: {
    fullName: string;
    email: string;
  };
  project?: {
    name: string;
    code?: string;
  };
  department?: {
    name: string;
  };
  items: PRItem[];
  assignments: Assignment[];
};

// ============================================================================
// UTILITIES
// ============================================================================

const formatDate = (date: string | null | undefined) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  
  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    SUBMITTED: { 
      label: 'Enviada', 
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
    },
    IN_PROGRESS: { 
      label: 'En Progreso', 
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
    },
    APPROVED: { 
      label: 'Aprobada', 
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
    },
    REJECTED: { 
      label: 'Rechazada', 
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
    },
    CANCELLED: { 
      label: 'Cancelada', 
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' 
    },
    COMPLETED: { 
      label: 'Completada', 
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
    },
  };
  
  return statusMap[status] || { 
    label: status, 
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' 
  };
};

const getCategoryBadge = (category: RequestCategory) => {
  const categoryMap: Record<RequestCategory, { className: string }> = {
    LICITACIONES: { className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    PROYECTOS: { className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    SUMINISTROS: { className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    INVENTARIOS: { className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  };
  
  return categoryMap[category];
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const FilterBar = React.memo(({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
  onClearFilters
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  dateRange: { from: string; to: string };
  setDateRange: (value: { from: string; to: string }) => void;
  onClearFilters: () => void;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <input
        type="text"
        placeholder="Buscar por referencia, cliente o solicitante..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Todos los estados</option>
        <option value="SUBMITTED">Enviada</option>
        <option value="IN_PROGRESS">En Progreso</option>
        <option value="APPROVED">Aprobada</option>
        <option value="REJECTED">Rechazada</option>
        <option value="CANCELLED">Cancelada</option>
        <option value="COMPLETED">Completada</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Todas las categorías</option>
        <option value="LICITACIONES">Licitaciones</option>
        <option value="PROYECTOS">Proyectos</option>
        <option value="SUMINISTROS">Suministros</option>
        <option value="INVENTARIOS">Inventarios</option>
      </select>

      <button
        onClick={onClearFilters}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
      >
        Limpiar Filtros
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha Desde
        </label>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha Hasta
        </label>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  </div>
));

const RequestCard = React.memo(({
  request,
  onViewDetails
}: {
  request: PurchaseRequest;
  onViewDetails: (request: PurchaseRequest) => void;
}) => {
  const statusBadge = getStatusBadge(request.status);
  const categoryBadge = getCategoryBadge(request.requestCategory);
  const activeAssignment = request.assignments[0];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 truncate">
              {request.reference}
            </h4>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadge.className}`}>
              {request.requestCategory}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
            {request.title}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Cliente: {request.finalClient}</span>
            <span>•</span>
            <span>Solicitante: {request.requester.fullName}</span>
            {request.project && (
              <>
                <span>•</span>
                <span>Proyecto: {request.project.name}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => onViewDetails(request)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          Ver Detalles
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="text-gray-500 dark:text-gray-400">Items</div>
          <div className="font-medium text-gray-700 dark:text-gray-300">{request.items.length}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Creada</div>
          <div className="font-medium text-gray-700 dark:text-gray-300">{formatDate(request.createdAt)}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Límite</div>
          <div className="font-medium text-gray-700 dark:text-gray-300">{formatDate(request.deadline)}</div>
        </div>
        {activeAssignment && (
          <div>
            <div className="text-gray-500 dark:text-gray-400">Progreso</div>
            <div className="font-medium text-gray-700 dark:text-gray-300">{activeAssignment.progress}%</div>
          </div>
        )}
      </div>
    </div>
  );
});

const DetailModal = ({
  isOpen,
  onClose,
  request
}: {
  isOpen: boolean;
  onClose: () => void;
  request: PurchaseRequest | null;
}) => {
  if (!isOpen || !request) return null;

  const statusBadge = getStatusBadge(request.status);
  const categoryBadge = getCategoryBadge(request.requestCategory);
  const activeAssignment = request.assignments[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 my-8">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {request.reference}
                </h3>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${categoryBadge.className}`}>
                  {request.requestCategory}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{request.title}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente Final</div>
                <div className="text-base font-semibold text-gray-800 dark:text-white/90">{request.finalClient}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Solicitante</div>
                <div className="text-base text-gray-800 dark:text-white/90">{request.requester.fullName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{request.requester.email}</div>
              </div>
              {request.project && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Proyecto</div>
                  <div className="text-base text-gray-800 dark:text-white/90">
                    {request.project.name}
                    {request.project.code && <span className="text-sm text-gray-600 dark:text-gray-400"> ({request.project.code})</span>}
                  </div>
                </div>
              )}
              {request.department && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Departamento</div>
                  <div className="text-base text-gray-800 dark:text-white/90">{request.department.name}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Adquisición</div>
                <div className="text-base text-gray-800 dark:text-white/90">{request.procurement}</div>
              </div>
              {request.deliveryType && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Entrega</div>
                  <div className="text-base text-gray-800 dark:text-white/90">
                    {request.deliveryType === "ALMACEN" ? "Almacén" : "Proyecto"}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</div>
                <div className="text-base text-gray-800 dark:text-white/90">{formatDate(request.createdAt)}</div>
              </div>
              {request.deadline && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha Límite</div>
                  <div className="text-base text-gray-800 dark:text-white/90">{formatDate(request.deadline)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          {request.description && (
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descripción</div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>
            </div>
          )}

          {/* Asignación y Progreso */}
          {activeAssignment && (
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Estado de Asignación</div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Asignado a: {activeAssignment.assignedTo.fullName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Estado: {activeAssignment.followStatus}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {activeAssignment.progress}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Progreso</div>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${activeAssignment.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Items Solicitados */}
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Items Solicitados ({request.items.length})
            </div>
            <RequestedItemsTable items={request.items} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-6 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

const Pagination = React.memo(({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;
  
  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - maxVisiblePages));
    visiblePages = pages.slice(start, start + maxVisiblePages);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
        >
          Anterior
        </button>
        
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className="text-gray-400">...</span>}
          </>
        )}
        
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              currentPage === page
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white'
            }`}
          >
            {page}
          </button>
        ))}
        
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function History() {
  const { data: requests = [], isLoading } = useAllRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleViewDetails = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = searchQuery.trim() === "" || 
        req.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.finalClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester.fullName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "" || req.status === statusFilter;
      const matchesCategory = categoryFilter === "" || req.requestCategory === categoryFilter;

      const matchesDateRange = (() => {
        if (!dateRange.from && !dateRange.to) return true;
        const createdDate = new Date(req.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;

        if (fromDate && toDate) {
          return createdDate >= fromDate && createdDate <= toDate;
        } else if (fromDate) {
          return createdDate >= fromDate;
        } else if (toDate) {
          return createdDate <= toDate;
        }
        return true;
      })();

      return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
    });
  }, [requests, searchQuery, statusFilter, categoryFilter, dateRange]);

  // useEffect separado para resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, dateRange]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Historial de Solicitudes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Todas las solicitudes de cotización del sistema
          </p>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Resultados ({filteredRequests.length})
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} de {filteredRequests.length}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No se encontraron solicitudes con los filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {paginatedRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <DetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />
    </div>
  );
}