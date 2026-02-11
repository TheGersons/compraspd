import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la solicitud");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <svg
              className="h-16 text-[#0D76B8] dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1080 406.86"
            >
              <defs>
                <style>
                  {`
                    .cls-1 { fill: #921915; }
                    .cls-2 { fill: #1177b7; }
                    .cls-3 { fill: #14559c; }
                    .cls-4 { fill: #a11e1f; }
                    .cls-5 { fill: #bd484a; }
                    .cls-6 { fill: #259dd7; }
                  `}
                </style>
              </defs>
              <g>
                <polygon
                  points="441.63 141.83 441.63 158.22 441.63 193.35 441.63 209.22 441.63 238.62 459.32 238.62 459.32 209.22 488.2 209.22 488.2 193.35 459.32 193.35 459.32 158.22 493.14 158.22 493.14 141.83 441.63 141.83"
                  fill="currentColor"
                />
                <rect x="441.63" y="243.82" width="51.51" height="17.17" fill="currentColor" />
              </g>
              <path
                d="M789.77,142.61h8.55v109.33c0,4.85-3.94,8.79-8.79,8.79h-8.13v-109.76c0-4.61,3.74-8.36,8.36-8.36Z"
                fill="currentColor"
              />
              <path
                className="cls-1"
                d="M240.43,19.55l90.89,92.1-62.44,62.96-61.69-61.34c-16.82-16.73-16.97-43.9-.34-60.82l33.58-32.91Z"
              />
              <path
                className="cls-5"
                d="M268.66,174.87l90.89,92.1-62.44,62.96-61.69-61.34c-16.82-16.73-16.97-43.9-.34-60.82l33.58-32.91Z"
              />
              <path
                className="cls-4"
                d="M359.79,266.76l-90.81-92.17,62.49-62.91,61.64,61.39c16.81,16.74,16.94,43.92.29,60.82l-33.61,32.88Z"
              />
              <g>
                <path
                  className="cls-3"
                  d="M211.55,387.3l-90.89-92.1,62.44-62.96,61.69,61.34c16.82,16.73,16.97,43.9.34,60.82l-33.58,32.91Z"
                />
                <path
                  className="cls-6"
                  d="M183.32,231.98l-90.89-92.1,62.44-62.96,61.69,61.34c16.82,16.73,16.97,43.9.34,60.82l-33.58,32.91Z"
                />
                <path
                  className="cls-2"
                  d="M92.2,140.1l90.81,92.17-62.49,62.91-61.64-61.39c-16.81-16.74-16.94-43.92-.29-60.82l33.61-32.88Z"
                />
              </g>
              <g fill="currentColor">
                <polygon points="577.24 141.7 577.24 158.09 577.24 193.22 577.24 209.09 577.24 238.49 594.93 238.49 594.93 209.09 623.81 209.09 623.81 193.22 594.93 193.22 594.93 158.09 628.76 158.09 628.76 141.7 577.24 141.7" />
                <rect x="577.24" y="243.69" width="51.51" height="17.17" />
              </g>
              <path
                d="M555.19,142.03c-5.39,0-9.76,4.37-9.76,9.76v61.47l-25.56-71.55h-17.17v119.29h7.41c5.39,0,9.76-4.37,9.76-9.76v-61.47l25.56,71.55h17.17v-119.29h-7.41Z"
                fill="currentColor"
              />
              <polygon
                points="857.05 260.73 874.23 260.73 847.69 141.7 833.83 141.7 817.44 214.16 833.25 213.97 840.47 176.5 848.86 219.1 831.88 219.1 816.27 219.1 812.63 235.23 812.72 235.23 807.1 260.73 824.08 260.73 828.86 235.23 852.03 235.23 857.05 260.73"
                fill="currentColor"
              />
              <path
                d="M787.78,138.26h8.61c1.58,0,3.08-.64,4.17-1.78l20.58-21.44h-12c-3.93,0-7.59,1.99-9.73,5.29l-11.64,17.93Z"
                fill="currentColor"
              />
              <path
                d="M1006.57,141.7h-28.21v98.86h17.17v-81.22l8.94-.09c6.47-.07,11.75,5.17,11.74,11.64l-.11,59.37c-.01,7.49-6.09,13.55-13.58,13.54l-24.17-.03v17.02h27.88c14.85,0,26.92-11.97,27.04-26.82l.53-64.8c.12-15.13-12.11-27.47-27.24-27.47Z"
                fill="currentColor"
              />
              <path
                d="M966.35,169.41c-.12-15.34-12.59-27.71-27.93-27.71h-27.51v119.09h7.32c5.33,0,9.66-4.32,9.66-9.66v-35.58h11.03c15.32-.02,27.7-12.51,27.58-27.84l-.15-18.3ZM938.14,198.61l-10.26.05v-39.74l11.59.12c5.59.06,10.1,4.59,10.12,10.18l.09,17.74c.03,6.41-5.13,11.62-11.54,11.66Z"
                fill="currentColor"
              />
              <path
                d="M511.78,291.92c-1.69-2.43-4.18-2.88-7.26-2.88-1.6,0-5.12.4-7.86,4.72v-4.22h-7.41v34.29h7.41v-23.97c.22-2.59,1.15-5.34,4.39-5.4,5.87-.11,4.88,6.34,4.88,8.39v20.98h7.43v-20.81c0-4.45.12-8.66-1.58-11.09Z"
                fill="currentColor"
              />
              <path
                d="M555.2,282.46l6.25-10.17,5.72,2.99-8.17,9.32-3.8-2.14ZM554.38,289.53h7.64v34.29h-7.64v-34.29Z"
                fill="currentColor"
              />
              <path
                d="M609.7,295.66c-.77-2.17-1.89-3.82-3.36-4.94-1.47-1.12-3.25-1.68-5.32-1.68-1.8,0-3.43.61-4.91,1.82-1.39,1.15-2.53,2.76-3.41,4.82,0,0,0,0,0-.01-.75-2.17-1.85-3.82-3.29-4.94-1.45-1.12-3.18-1.68-5.2-1.68-1.74,0-3.29.56-4.64,1.67-1.07.88-1.98,2.08-2.75,3.57v-4.74h-6.64v34.29h6.64v-21.21c0-1.92.44-3.4,1.33-4.44.89-1.05,2.15-1.57,3.78-1.57s2.99.6,3.9,1.8c.92,1.2,1.38,2.91,1.38,5.14v20.28h6.61v-20.32c0-.1,0-.19,0-.28v.05c0-2.14.45-3.78,1.33-4.94.88-1.16,2.13-1.73,3.74-1.73,1.7,0,3.02.6,3.95,1.8.93,1.2,1.39,2.91,1.39,5.14v20.28h6.64v-20.32c0-3.06-.39-5.68-1.15-7.85Z"
                fill="currentColor"
              />
              <path
                d="M659.1,313.77c-.18-.72-.23-3.14-.19-5.87l17.25-.08c0-3.86-.47-7.61-1.4-10.35-.94-2.74-2.29-4.83-4.08-6.27-1.78-1.44-5.89-1.77-8.4-1.69-6.31.21-8.22,4.42-9.21,6.78-.99,2.37-1.48,5.22-1.49,8.57,0,5.3.33,13.82,4.68,16.81,3.12,2.15,5.71,2.15,8.49,2.15,1.89,0,3.76-.44,5.62-1.32,1.86-.88,5.11-3.66,5.21-10.48h-6.83c.59,7.61-7.88,8.91-9.66,1.76ZM663.88,294.75c3.83.24,4.2,6.46,4.39,8.82l-9.24.24c.11-2.59.29-4.85.48-5.54.75-2.64,2.32-3.65,4.36-3.52Z"
                fill="currentColor"
              />
              <g fill="currentColor">
                <rect x="472.85" y="289.53" width="8.2" height="34.29" />
                <ellipse cx="476.85" cy="279.43" rx="5.17" ry="4.59" />
              </g>
              <g fill="currentColor">
                <rect x="618.1" y="289.73" width="8.2" height="34.29" />
                <ellipse cx="622.1" cy="279.63" rx="5.17" ry="4.59" />
              </g>
              <polygon
                points="647.42 289.53 643.19 289.53 643.19 279.63 635.78 279.63 635.78 289.53 631.68 289.53 631.68 294.36 635.78 294.36 635.78 323.82 643.19 323.82 643.19 294.36 647.42 294.36 647.42 289.53"
                fill="currentColor"
              />
              <path
                d="M698.22,290.94v5.76s-5.27-3.22-8.98-.88c-3.71,2.34.1,6.63,3.71,8.39s9.48,6.36,7.02,13.17c-2.54,7.02-11.02,7.51-17.85,4.88v-6.15s5.17,4.2,9.56,1.17c4.39-3.02-1.07-8.2-4.1-9.56-3.24-1.47-8.78-6-6.73-11.61,2.18-5.96,8.78-8.39,17.37-5.17Z"
                fill="currentColor"
              />
              <rect x="537.89" y="269.87" width="7.93" height="53.95" fill="currentColor" />
              <path
                d="M464.85,271.53l-.1,6.93s-9.83-5.27-13.35.98c-3.52,6.24,2.24,10.12,6.23,13.85,4.59,4.29,13.28,10.42,9.56,20.98-3.61,10.24-14.01,11.39-22.93,7.25v-7.54s7.94,6.57,13.08,1.17c5.76-6.05.2-12.59-7.51-18.34-5.75-4.29-9.7-10.46-6.87-18.46,2.83-8,12.17-10.52,21.9-6.81Z"
                fill="currentColor"
              />
              <path
                d="M765.54,176.84s1.56-12.05-1.95-18.09c-3.51-6.05-11.32-17.43-26.93-16.13-15.61,1.3-25.37,8.72-27.51,24.33v1.95h-.85v66.34h.85v.78c1.06,14.6,13.2,26.08,27.71,26.34,14.72.26,27.38-11.11,28.68-25.91v-40.5h-30.18v14.83h13.2v24.46c-.91,5.64-5.84,9.8-11.51,9.76-5.6-.05-10.42-4.19-11.32-9.76v-66.34c1.53-6.03,7.15-9.96,12.88-9.37,4.91.51,9.11,4.27,10.34,9.37-.07,2.65-.13,5.3-.2,7.95h16.78Z"
                fill="currentColor"
              />
              <path
                d="M699.98,260.86l-17.94-53.94c19.87-10.51,13.89-37.23,13.89-37.23-.13-15.34-12.85-27.71-28.51-27.71h-28.07v119.09h6.2c5.44,0,11.13-4.32,11.13-9.66v-40.63h9.7l15.47,50.08h18.15ZM655.88,195.04v-36.94l12.24.12c5.9.06,10.67,4.61,10.7,10.23l.07,13.92c.03,6.44-2.33,12.68-12.31,12.68h-10.7Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {!success ? (
            <>
              {/* Title */}
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recuperar Contraseña
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Ingresa tu correo electrónico y te enviaremos una contraseña temporal
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pl-11 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar Contraseña Temporal"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                ¡Correo Enviado!
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Hemos enviado una contraseña temporal a <strong>{email}</strong>. 
                Revisa tu bandeja de entrada y usa esa contraseña para iniciar sesión.
              </p>
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    Te recomendamos cambiar tu contraseña después de iniciar sesión desde tu perfil.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Energía PD. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}