import { forwardRef } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

// Registrar locale español
registerLocale("es", es);

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

// Input personalizado
const CustomInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder, disabled }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        className="w-full cursor-pointer rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  )
);

CustomInput.displayName = "CustomInput";

export default function DatePicker({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholder = "Seleccionar fecha",
  disabled = false,
}: DatePickerProps) {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      locale="es"
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      disabled={disabled}
      customInput={<CustomInput />}
      showPopperArrow={false}
      popperPlacement="bottom-start"
    />
  );
}