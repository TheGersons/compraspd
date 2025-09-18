import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  minDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  minDate,
  placeholder,
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: false,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/y",
      defaultDate,
      closeOnSelect: false,   // no se cierra al primer click
      clickOpens: true,
      allowInput: false,
      disableMobile: true,
      minDate,
      onChange: [
        (selectedDates, _str, instance) => {
          if (mode === "range") {
            if (selectedDates.length < 2) return; // sigue abierto
            instance.close();                     // cierra al elegir la 2ª fecha
          }
          if (instance.config.mode === "range") {
            if (selectedDates.length < 2) {
              // workaround: en algunas versiones se cierra igual; reabrir
              setTimeout(() => instance.open(), 0);
              return;
            }
            instance.close(); // cerrar cuando ya hay 2 fechas
          }
        },
        ...(Array.isArray(onChange) ? onChange : onChange ? [onChange] : []),
      ],
      onClose: [
        (selectedDates, _str, instance) => {
          // si se cerró con solo 1 fecha, reabrir
          if (instance.config.mode === "range" && selectedDates.length < 2) {
            instance.open();
          }
        },
      ],
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, minDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
