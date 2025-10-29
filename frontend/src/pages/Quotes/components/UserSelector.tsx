import { useMemo } from "react";

type User = {
  id: string;
  fullName: string;
  isActive?: boolean; // opcional por si lo necesitas
};

type Props = {
  users: User[];
  selectedUserId?: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectUser: (userId: string) => void;
  onClearUser: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function UserSelector({
  users,
  selectedUserId,
  query,
  onQueryChange,
  onSelectUser,
  onClearUser,
  disabled = false,
  placeholder = "Buscar usuario…",
}: Props) {
  // Usuario actualmente seleccionado (si existe)
  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  // Filtrado memoizado por nombre (case-insensitive)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.fullName.toLowerCase().includes(q));
  }, [users, query]);

  // Render si hay usuario seleccionado: pill + botón “x”
  if (selectedUser) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-sm">
          {selectedUser.fullName}
        </span>
        <button
          type="button"
          onClick={onClearUser}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600"
          aria-label="Quitar usuario seleccionado"
          disabled={disabled}
        >
          ×
        </button>
      </div>
    );
  }

  // Render de buscador + select cuando NO hay selección
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
          aria-label="Buscar usuario"
        />
      </div>

      <select
        value=""
        onChange={(e) => {
          const value = e.target.value;
          if (value) onSelectUser(value);
        }}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled || filtered.length === 0}
        aria-label="Seleccionar usuario"
      >
        <option value="" disabled>
          {filtered.length > 0
            ? "Selecciona un solicitante/usuario"
            : "No hay resultados"}
        </option>
        {filtered.map((u) => (
          <option key={u.id} value={u.id}>
            {u.fullName}
          </option>
        ))}
      </select>

      {/* Hint opcional de conteo */}
      <div className="text-xs text-gray-500">
        {filtered.length} usuario{filtered.length === 1 ? "" : "s"} encontrado
        {filtered.length === 1 ? "" : "s"}.
      </div>
    </div>
  );
}
