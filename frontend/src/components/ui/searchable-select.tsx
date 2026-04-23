import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { matchesSearch } from "../../utils/utils";

type Option = { id: string; nombre: string };
type ExtraOption = { value: string; label: string };

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  allLabel?: string;
  allValue?: string;
  extraOptions?: ExtraOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  allLabel = "Todos",
  allValue = "TODOS",
  extraOptions = [],
  placeholder,
  className = "",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const getLabel = () => {
    if (value === allValue) return allLabel;
    const extra = extraOptions.find((o) => o.value === value);
    if (extra) return extra.label;
    const found = options.find((o) => o.id === value);
    return found?.nombre || placeholder || allLabel;
  };

  const filteredOptions = options.filter((o) => matchesSearch(query, o.nombre));
  const filteredExtras = extraOptions.filter((o) => matchesSearch(query, o.label));

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
      >
        <span className="truncate text-left">{getLabel()}</span>
        <ChevronDown
          size={16}
          className={`ml-2 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="relative border-b border-gray-200 p-2 dark:border-gray-700">
            <Search
              size={14}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-7 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {matchesSearch(query, allLabel) && (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect(allValue)}
                  className={`w-full px-3 py-2 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 ${value === allValue ? "bg-blue-100 font-medium text-blue-700 dark:bg-gray-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {allLabel}
                </button>
              </li>
            )}
            {filteredExtras.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.value)}
                  className={`w-full px-3 py-2 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 ${value === o.value ? "bg-blue-100 font-medium text-blue-700 dark:bg-gray-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {filteredOptions.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.id)}
                  className={`w-full px-3 py-2 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 ${value === o.id ? "bg-blue-100 font-medium text-blue-700 dark:bg-gray-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {o.nombre}
                </button>
              </li>
            ))}
            {filteredOptions.length === 0 &&
              filteredExtras.length === 0 &&
              !matchesSearch(query, allLabel) && (
                <li className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                  Sin resultados
                </li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
}
