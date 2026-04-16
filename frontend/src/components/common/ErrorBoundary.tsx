import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary global — captura errores de React (incluyendo el
 * "removeChild" por extensiones del navegador o inconsistencias de DOM)
 * y muestra una pantalla de recuperación en lugar de pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || "Error desconocido" };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Loguear para debugging — visible en la consola del servidor si hay SSR
    // o en herramientas de monitoreo
    console.error("[ErrorBoundary] Error capturado:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleBack = () => {
    this.setState({ hasError: false, errorMessage: "" });
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Ícono */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <svg
                  className="h-8 w-8 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h2 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
              Algo salió mal
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Ocurrió un error inesperado. Esto puede ser causado por una extensión
              del navegador (como Google Translate). Recarga la página para continuar.
            </p>

            {/* Botones */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Recargar página
              </button>
              <button
                onClick={this.handleBack}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Volver atrás
              </button>
            </div>

            {/* Detalle técnico (solo en dev) */}
            {import.meta.env.DEV && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                  Detalle técnico
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-red-600 dark:bg-gray-900 dark:text-red-400">
                  {this.state.errorMessage}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
