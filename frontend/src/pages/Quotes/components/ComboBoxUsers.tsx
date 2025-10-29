import React, { useEffect, useMemo, useRef, useState } from "react";

type User = {
    id: string;
    fullName: string;
    isActive?: boolean;
};

type Props = {
    users: User[];
    value?: string;                    // selectedUserId
    onChange: (userId?: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export default function UserComboBox({
    users,
    value,
    onChange,
    placeholder = "Buscar y seleccionar usuario…",
    disabled = false,
    className = "",
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Texto mostrado en el input. Si hay valor, mostramos el fullName del seleccionado.
    const selectedUser = useMemo(
        () => users.find(u => u.id === value),
        [users, value]
    );

    const [open, setOpen] = useState(false);
    const [text, setText] = useState(selectedUser?.fullName ?? "");
    const [activeIndex, setActiveIndex] = useState(0);

    // Si cambia el valor externo, sincroniza el texto
    useEffect(() => {
        setText(selectedUser?.fullName ?? "");
    }, [selectedUser?.fullName]);

    // Filtrado memoizado
    const filtered = useMemo(() => {
        const q = text.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u => u.fullName.toLowerCase().includes(q));
    }, [users, text]);

    // Mantener el índice activo dentro de rango
    useEffect(() => {
        if (activeIndex >= filtered.length) setActiveIndex(0);
    }, [filtered.length, activeIndex]);

    const handleSelect = (user: User | undefined) => {
        onChange(user?.id);
        setText(user?.fullName ?? "");
        setOpen(false);
        // vuelve a enfocar el input
        inputRef.current?.focus();
    };

    const clearSelection = () => {
        onChange(undefined);
        setText("");
        setOpen(true);
        setActiveIndex(0);
        inputRef.current?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setOpen(true);
                setActiveIndex(i => (i + 1) % Math.max(filtered.length, 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setOpen(true);
                setActiveIndex(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
                break;
            case "Enter":
                if (open) {
                    e.preventDefault();
                    handleSelect(filtered[activeIndex]);
                }
                break;
            case "Escape":
                setOpen(false);
                break;
        }
    };

    // Cerrar al hacer click fuera
    useEffect(() => {
        const onDocClick = (ev: MouseEvent) => {
            if (!inputRef.current || !listRef.current) return;
            const t = ev.target as Node;
            if (!inputRef.current.contains(t) && !listRef.current.contains(t)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => {
                        if (value) return; // 🔒 bloquea edición si hay usuario seleccionado
                        setText(e.target.value);
                        setOpen(true);
                        setActiveIndex(0);
                    }}
                    onFocus={() => !value && setOpen(true)} // 🔒 evita abrir si ya hay seleccionado
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={!!value}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-[#101828] dark:text-gray-100"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls="user-combobox-list"
                    role="combobox"
                />

                {value && (
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-white/10"
                        aria-label="Limpiar selección"
                        disabled={disabled}
                    >
                        ×
                    </button>
                )}
            </div>

            {open && (
                <div
                    ref={listRef}
                    id="user-combobox-list"
                    role="listbox"
                    className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-[#0b1220]"
                >
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                            Sin resultados
                        </div>
                    ) : (
                        filtered.map((u, idx) => (
                            <button
                                key={u.id}
                                role="option"
                                aria-selected={value === u.id}
                                onMouseDown={(e) => e.preventDefault()} // evita blur antes del click
                                onClick={() => handleSelect(u)}
                                className={`block w-full text-left px-3 py-2 text-sm 
                  ${idx === activeIndex ? "bg-blue-50 dark:bg-white/10" : ""} 
                  ${value === u.id ? "font-semibold" : "font-normal"}
                  text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-white/10`}
                            >
                                {u.fullName}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
