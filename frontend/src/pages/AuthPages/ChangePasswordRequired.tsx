import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ChangePasswordRequired() {
  console.log('estoy aca')
  window.location.href = '/change-password-required';
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!email || !tempPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos son requeridos");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (tempPassword === newPassword) {
      setError("La nueva contraseña debe ser diferente a la temporal");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-temp-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          tempPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => (
    show ? (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <svg
              className="h-14 text-[#0D76B8] dark:text-white"
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
                <polygon points="441.63 141.83 441.63 158.22 441.63 193.35 441.63 209.22 441.63 238.62 459.32 238.62 459.32 209.22 488.2 209.22 488.2 193.35 459.32 193.35 459.32 158.22 493.14 158.22 493.14 141.83 441.63 141.83" fill="currentColor"/>
                <rect x="441.63" y="243.82" width="51.51" height="17.17" fill="currentColor"/>
              </g>
              <path d="M789.77,142.61h8.55v109.33c0,4.85-3.94,8.79-8.79,8.79h-8.13v-109.76c0-4.61,3.74-8.36,8.36-8.36Z" fill="currentColor"/>
              <path className="cls-1" d="M240.43,19.55l90.89,92.1-62.44,62.96-61.69-61.34c-16.82-16.73-16.97-43.9-.34-60.82l33.58-32.91Z"/>
              <path className="cls-5" d="M268.66,174.87l90.89,92.1-62.44,62.96-61.69-61.34c-16.82-16.73-16.97-43.9-.34-60.82l33.58-32.91Z"/>
              <path className="cls-4" d="M359.79,266.76l-90.81-92.17,62.49-62.91,61.64,61.39c16.81,16.74,16.94,43.92.29,60.82l-33.61,32.88Z"/>
              <g>
                <path className="cls-3" d="M211.55,387.3l-90.89-92.1,62.44-62.96,61.69,61.34c16.82,16.73,16.97,43.9.34,60.82l-33.58,32.91Z"/>
                <path className="cls-6" d="M183.32,231.98l-90.89-92.1,62.44-62.96,61.69,61.34c16.82,16.73,16.97,43.9.34,60.82l-33.58,32.91Z"/>
                <path className="cls-2" d="M92.2,140.1l90.81,92.17-62.49,62.91-61.64-61.39c-16.81-16.74-16.94-43.92-.29-60.82l33.61-32.88Z"/>
              </g>
              <g fill="currentColor">
                <polygon points="577.24 141.7 577.24 158.09 577.24 193.22 577.24 209.09 577.24 238.49 594.93 238.49 594.93 209.09 623.81 209.09 623.81 193.22 594.93 193.22 594.93 158.09 628.76 158.09 628.76 141.7 577.24 141.7"/>
                <rect x="577.24" y="243.69" width="51.51" height="17.17"/>
              </g>
              <path d="M555.19,142.03c-5.39,0-9.76,4.37-9.76,9.76v61.47l-25.56-71.55h-17.17v119.29h7.41c5.39,0,9.76-4.37,9.76-9.76v-61.47l25.56,71.55h17.17v-119.29h-7.41Z" fill="currentColor"/>
              <polygon points="857.05 260.73 874.23 260.73 847.69 141.7 833.83 141.7 817.44 214.16 833.25 213.97 840.47 176.5 848.86 219.1 831.88 219.1 816.27 219.1 812.63 235.23 812.72 235.23 807.1 260.73 824.08 260.73 828.86 235.23 852.03 235.23 857.05 260.73" fill="currentColor"/>
              <path d="M787.78,138.26h8.61c1.58,0,3.08-.64,4.17-1.78l20.58-21.44h-12c-3.93,0-7.59,1.99-9.73,5.29l-11.64,17.93Z" fill="currentColor"/>
              <path d="M1006.57,141.7h-28.21v98.86h17.17v-81.22l8.94-.09c6.47-.07,11.75,5.17,11.74,11.64l-.11,59.37c-.01,7.49-6.09,13.55-13.58,13.54l-24.17-.03v17.02h27.88c14.85,0,26.92-11.97,27.04-26.82l.53-64.8c.12-15.13-12.11-27.47-27.24-27.47Z" fill="currentColor"/>
              <path d="M966.35,169.41c-.12-15.34-12.59-27.71-27.93-27.71h-27.51v119.09h7.32c5.33,0,9.66-4.32,9.66-9.66v-35.58h11.03c15.32-.02,27.7-12.51,27.58-27.84l-.15-18.3ZM938.14,198.61l-10.26.05v-39.74l11.59.12c5.59.06,10.1,4.59,10.12,10.18l.09,17.74c.03,6.41-5.13,11.62-11.54,11.66Z" fill="currentColor"/>
              <path d="M699.98,260.86l-17.94-53.94c19.87-10.51,13.89-37.23,13.89-37.23-.13-15.34-12.85-27.71-28.51-27.71h-28.07v119.09h6.2c5.44,0,11.13-4.32,11.13-9.66v-40.63h9.7l15.47,50.08h18.15ZM655.88,195.04v-36.94l12.24.12c5.9.06,10.67,4.61,10.7,10.23l.07,13.92c.03,6.44-2.33,12.68-12.31,12.68h-10.7Z" fill="currentColor"/>
              <path d="M765.54,176.84s1.56-12.05-1.95-18.09c-3.51-6.05-11.32-17.43-26.93-16.13-15.61,1.3-25.37,8.72-27.51,24.33v1.95h-.85v66.34h.85v.78c1.06,14.6,13.2,26.08,27.71,26.34,14.72.26,27.38-11.11,28.68-25.91v-40.5h-30.18v14.83h13.2v24.46c-.91,5.64-5.84,9.8-11.51,9.76-5.6-.05-10.42-4.19-11.32-9.76v-66.34c1.53-6.03,7.15-9.96,12.88-9.37,4.91.51,9.11,4.27,10.34,9.37-.07,2.65-.13,5.3-.2,7.95h16.78Z" fill="currentColor"/>
            </svg>
          </div>

          {!success ? (
            <>
              {/* Title */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cambio de Contraseña Requerido
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Por seguridad, debes crear una nueva contraseña para continuar
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Contraseña Temporal */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contraseña Temporal
                    <span className="ml-1 text-xs text-gray-500">(la que recibiste por correo)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showTempPassword ? "text" : "password"}
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTempPassword(!showTempPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon show={showTempPassword} />
                    </button>
                  </div>
                </div>

                {/* Separador */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      Nueva contraseña
                    </span>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon show={showNewPassword} />
                    </button>
                  </div>
                  {newPassword && newPassword.length < 6 && (
                    <p className="mt-1 text-xs text-red-500">Mínimo 6 caracteres</p>
                  )}
                  {newPassword && newPassword.length >= 6 && (
                    <p className="mt-1 text-xs text-green-500">✓ Longitud válida</p>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      minLength={6}
                      required
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                    <p className="mt-1 text-xs text-green-500">✓ Las contraseñas coinciden</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Cambiando contraseña...
                    </span>
                  ) : (
                    "Cambiar Contraseña"
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
                ¡Contraseña Actualizada!
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <div className="flex justify-center">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full animate-pulse rounded-full bg-green-500" style={{ animation: 'progress 3s linear forwards' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Energía PD. Todos los derechos reservados.
        </p>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}