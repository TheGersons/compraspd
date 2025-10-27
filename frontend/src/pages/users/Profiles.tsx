import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "./hooks/useUsers.ts";
import { useRoles } from "./hooks/useRoles.ts";
import { useDepartments } from "./hooks/useDepartments.ts";

// ============================================================================
// TYPES
// ============================================================================

type Role = {
  id: string;
  name: string;
  description?: string;
};

type Department = {
  id: string;
  name: string;
};

type User = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  costCenter?: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  department?: Department;
};

type UserFormData = {
  email: string;
  fullName: string;
  password?: string;
  roleId: string;
  departmentId?: string;
  costCenter?: string;
  isActive: boolean;
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
            {user.fullName}
          </h4>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            user.isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {user.email}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {user.role.name}
          </span>
          {user.department && (
            <span className="rounded-md bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {user.department.name}
            </span>
          )}
          {user.costCenter && (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              CC: {user.costCenter}
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
          Eliminar
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
    fullName: user?.fullName || '',
    password: '',
    roleId: user?.role.id || '',
    departmentId: user?.department?.id || '',
    costCenter: user?.costCenter || '',
    isActive: user?.isActive ?? true,
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        fullName: user.fullName,
        password: '',
        roleId: user.role.id,
        departmentId: user.department?.id || '',
        costCenter: user.costCenter || '',
        isActive: user.isActive,
      });
    } else {
      setFormData({
        email: '',
        fullName: '',
        password: '',
        roleId: '',
        departmentId: '',
        costCenter: '',
        isActive: true,
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
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                {user ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder={user ? 'Dejar vacío para no cambiar' : ''}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rol *
              </label>
              <select
                required
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Departamento
              </label>
              <select
                required={!user}
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar un departamento</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Centro de Costo
              </label>
              <input
                type="text"
                value={formData.costCenter}
                onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Usuario activo
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
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
              {user ? 'Actualizar' : 'Crear'}
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
          Confirmar Eliminación
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userName}</strong>? Esta acción no se puede deshacer.
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
            Eliminar
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
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [],} = useRoles(); // ✅ Datos reales
  const { data: departments = [],} = useDepartments(); // ✅ Datos reales
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');


  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = async (data: UserFormData) => {
    // 1. Limpiamos los datos antes de enviar
    const cleanedData = {
        ...data,
        // Si departmentId es '', lo forzamos a undefined o lo omitimos si el backend acepta 'null' o undefined
        // (Dejaremos la lógica en el modal para el departmentId, ver sección 2)
        // CostCenter es opcional en el backend (costCenter?: string), si es '', lo ponemos a undefined para omitirlo
        costCenter: data.costCenter?.trim() === '' ? undefined : data.costCenter,
    };

    // 2. Comprobamos que departmentId tiene valor si estamos creando
    if (!selectedUser && cleanedData.departmentId === '') {
        // Podrías lanzar un toast o un error aquí para notificar al usuario.
        console.error('El departamento es obligatorio para crear un nuevo usuario.');
        alert('Por favor, selecciona un Rol y un Departamento.'); // Aviso simple
        return; 
    }
    
    // Si la data está limpia, procedemos
    try {
        if (selectedUser) {
            // El backend del update debe manejar la limpieza o el DTO debe ser más flexible
            await updateUserMutation.mutateAsync({ userId: selectedUser.id, data: cleanedData });
        } else {
            // El DTO de CreateUserDto requiere password y el backend requiere roleId/departmentId
            await createUserMutation.mutateAsync(cleanedData); 
        }
        
        setIsModalOpen(false);
        setSelectedUser(null);
        // Opcional: Invalida las queries (si usas react-query/tanstack-query) para actualizar la lista
        // queryClient.invalidateQueries('users'); 
    } catch (error: any) {
        console.error('Error saving user:', error);
        const errorMessage = error.response?.data?.message || 'Error desconocido al guardar usuario.';
        console.error('Error saving user:', errorMessage);
        // TODO: Mostrar el error de validación del backend (ej: Email ya registrado) al usuario.
    }
};

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActiveFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && user.isActive) ||
      (filterActive === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesActiveFilter;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
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
              {users.filter(u => u.isActive).length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Inactivos</p>
            <p className="mt-1 text-2xl font-semibold text-gray-700 dark:text-gray-300">
              {users.filter(u => !u.isActive).length}
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
        userName={userToDelete?.fullName || ''}
      />
    </>
  );
}