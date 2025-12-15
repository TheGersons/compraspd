// src/components/common/LoadingScreen.tsx

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  message = "Cargando...", 
  fullScreen = false 
}: LoadingScreenProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50"
    : "flex items-center justify-center min-h-[400px]";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Mensaje */}
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}

// Versión pequeña para componentes
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 border-t-brand-500 rounded-full animate-spin`}></div>
  );
}

// Skeleton para tablas
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}