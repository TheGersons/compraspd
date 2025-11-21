import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?:"xs" | "sm" | "md" | "lg"; // Button size
  variant?: "primary" | "outline" | "secondary" | "danger" | "success" | "warning"| "title" | "sectionTitle" | "headerContainer";  // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Additional classes
  shape?: 'rounded' | 'pill'; // NUEVO: Opción para la forma del botón
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  shape = "rounded", // NUEVO: Valor por defecto para la forma
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
    xs: "px-3 py-2 text-xs",
    lg: "px-6 py-4 text-base",
  };

  // Shape Classes (NUEVO)
  const shapeClasses = {
    rounded: "rounded-lg", // Forma estándar (esquinas redondeadas)
    pill: "rounded-full",  // Forma ovalada / completamente redondeada
  };

  // Variant Classes
  const variantClasses = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline:
    "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
  danger:
    "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-300",
  warning:
    "bg-amber-400 text-black hover:bg-amber-500 disabled:bg-amber-200",
  title:
    "bg-transparent text-2xl font-bold p-0 hover:bg-transparent shadow-none",
  sectionTitle:
    "bg-transparent text-lg font-semibold p-0 hover:bg-transparent shadow-none",
  headerContainer:
    "bg-[#008CC4] text-white shadow-theme-xs hover:bg-[#008CC4] disabled:bg-brand-300",
};


  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition ${shapeClasses[shape]} ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;