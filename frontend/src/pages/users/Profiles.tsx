import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";

// ============================================================================
// TYPES
// ============================================================================

type Role = {
  id: string;
  nombre: string;
  descripcion?: string;
};

type Department = {
  id: string;
  nombre: string;
};

type User = {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  creado: string;
  actualizado: string;
  rol: Role;
  departamento?: Department;
};

type UserFormData = {
  email: string;
  nombre: string;
  password?: string;
  rolId: string;
  departamentoId?: string;
  activo: boolean;
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const token = getToken();

const api = {
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/all`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar usuarios");
    return response.json();
  },

  async createUser(data: UserFormData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear usuario");
    }
    return response.json();
  },

  async updateUser(userId: string, data: Partial<UserFormData>) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar usuario");
    }
    return response.json();
  },

  async deactivateUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/deactivate`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al desactivar usuario");
    return response.json();
  },

  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/api/v1/roles`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar roles");
    return response.json();
  },

  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/api/v1/departments`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar departamentos");
    return response.json();
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const UserCard = React.memo(({ 
  user, 
  onEdit, 
  onDelete 
}: { 
  user: User; 
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-800 dark:text-white/90 truncate">
            {user.nombre}
          </h4>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            user.activo 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {user.email}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {user.rol.nombre}
          </span>
          {user.departamento && (
            <span className="rounded-md bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {user.departamento.nombre}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user)}
          className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
        >
          Desactivar
        </button>
      </div>
    </div>
  </div>
));

const UserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onSave,
  roles,
  departments 
}: { 
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (data: UserFormData) => void;
  roles: Role[];
  departments: Department[];
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    nombre: user?.nombre || '',
    password: '',
    rolId: user?.rol.id || '',
    departamentoId: user?.departamento?.id || '',
    activo: user?.activo ?? true,
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        nombre: user.nombre,
        password: '',
        rolId: user.rol.id,
        departamentoId: user.departamento?.id || '',
        activo: user.activo,
      });
    } else {
      setFormData({
        email: '',
        nombre: '',
        password: '',
        rolId: '',
        departamentoId: '',
        activo: true,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {user ? 'Editar Usuario' : 'Crear Usuario'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña {!user && '*'}
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={user ? 'Dejar vacío para no cambiar' : 'Contraseña'}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rol *
              </label>
              <select
                required
                value={formData.rolId}
                onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Departamento *
              </label>
              <select
                required
                value={formData.departamentoId}
                onChange={(e) => setFormData({ ...formData, departamentoId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar departamento</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Usuario Activo
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              {user ? 'Actualizar' : 'Crear'} Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          Confirmar Desactivación
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas desactivar al usuario <strong>{userName}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Desactivar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Profiles() {
  const { addNotification } = useNotifications();

  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData, depsData] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
        api.getDepartments(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setDepartments(depsData);
    } catch (error) {
      console.error("Error loading data:", error);
      addNotification("danger", "Error", "Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        // Actualizar - no enviar password si está vacío
        const updateData: Partial<UserFormData> = {
          nombre: data.nombre,
          email: data.email,
          rolId: data.rolId,
          departamentoId: data.departamentoId || undefined,
          activo: data.activo,
        };
        
        await api.updateUser(selectedUser.id, updateData);
        addNotification("success", "Éxito", "Usuario actualizado correctamente");
      } else {
        // Crear - password es requerido
        if (!data.password) {
          addNotification("danger", "Error", "La contraseña es requerida");
          return;
        }
        if (!data.rolId || !data.departamentoId) {
          addNotification("danger", "Error", "Rol y Departamento son requeridos");
          return;
        }
        
        await api.createUser(data);
        addNotification("success", "Éxito", "Usuario creado correctamente");
      }
      
      setIsModalOpen(false);
      setSelectedUser(null);
      await loadInitialData(); // Recargar lista
    } catch (error: any) {
      console.error("Error saving user:", error);
      addNotification("danger", "Error", error.message || "Error al guardar usuario");
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await api.deactivateUser(userToDelete.id);
      addNotification("success", "Éxito", "Usuario desactivado correctamente");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      await loadInitialData(); // Recargar lista
    } catch (error) {
      console.error("Error deactivating user:", error);
      addNotification("danger", "Error", "Error al desactivar usuario");
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.rol.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActiveFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && user.activo) ||
      (filterActive === 'inactive' && !user.activo);
    
    return matchesSearch && matchesActiveFilter;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Gestión de Usuarios | Sistema de Compras"
        description="Administra los usuarios del sistema de compras"
      />
      <PageBreadcrumb pageTitle="Gestión de Usuarios" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Usuarios del Sistema
          </h3>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Usuario
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filterActive === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filterActive === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filterActive === 'inactive'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No se encontraron usuarios con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEdit}
                onDelete={() => handleDeleteClick(user)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">Total de Usuarios</p>
            <p className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">{users.length}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-600 dark:text-green-400">Usuarios Activos</p>
            <p className="mt-1 text-2xl font-semibold text-green-700 dark:text-green-300">
              {users.filter(u => u.activo).length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Inactivos</p>
            <p className="mt-1 text-2xl font-semibold text-gray-700 dark:text-gray-300">
              {users.filter(u => !u.activo).length}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSave}
        roles={roles}
        departments={departments}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.nombre || ''}
      />
    </>
  );
}