import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import { useNavigateWithRole } from '../../hooks/useNavigateWithRole';

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: string;
  user?: any;
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { login } = useAuth(); // Usar login en lugar de refresh
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();
  const { navigateSafe, canAccess, getHomeRoute } = useNavigateWithRole();

  // Validación de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación en tiempo real para email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Limpiar error general si existe
    if (error) setError(null);

    // Validar en tiempo real
    if (errors.email && value && validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  // Validación en tiempo real para password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    // Limpiar error general si existe
    if (error) setError(null);

    // Validar en tiempo real
    if (errors.password && value && value.length >= 6) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!validateEmail(email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Iniciando sesión...');

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        // Mensajes de error específicos
        if (res.status === 401) {
          setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
          toast.error('Credenciales incorrectas', { id: toastId });
        } else if (res.status === 403) {
          setError("Tu cuenta está inactiva. Contacta al administrador.");
          toast.error('Cuenta inactiva', { id: toastId });
        } else {
          const msg = "Error al iniciar sesión";
          setError(msg);
          toast.error(msg, { id: toastId });
        }
        return;
      }

      console.log("Inicio de sesión exitoso");

      // Usar el método login del AuthContext con ambos tokens
      await login(
        data.access_token,
        data.refresh_token,
        data.user
      );

      // Toast de bienvenida
      toast.success(`¡Bienvenido ${data.user?.nombre || ''}!`, {
        id: toastId,
        duration: 3000,
        icon: '👋',
      });

      // Redirigir después de un breve delay para que se vea el toast
      setTimeout(() => {
        navigateSafe('/quotes/assignment');
      }, 500);

    } catch (err: any) {
      console.error("Error en login:", err);

      if (err?.message?.includes('undefined')) {
        setLoading(false);
        // Toast de bienvenida
        toast.success(`¡Bienvenido!`, {
          id: toastId,
          duration: 3000,
          icon: '👋',
        });
      }
      // ✅ No mostrar notificación si es error de autenticación ya manejado
      if (err?.message?.includes('AUTH_ERROR') ||
        err?.message?.includes('401') ||
        err?.message?.includes('403') ||
        err?.message?.includes('undefined')) {
        return;
      }

      const errorMsg = err?.message ?? "No se pudo conectar con el servidor";
      setError(errorMsg);
      toast.error('Error de conexión', { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Inicio de Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              Ingresa tu correo electrónico y contraseña para iniciar sesión.
            </p>
          </div>

          {/* Logo centrado */}
          <div className="flex justify-center mb-1">
            <img src="/images/logo/logo-pd.svg" alt="Logo PD" className="h-30 w-auto" />
          </div>

          {/* Error general */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Email */}
              <div>
                <Label>
                  Correo electrónico <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={loading}
                  className={errors.email ? 'border-red-300 dark:border-red-700' : ''}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                    className={errors.password ? 'border-red-300 dark:border-red-700' : ''}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={keepLoggedIn} onChange={setKeepLoggedIn} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Mantener sesión iniciada
                  </span>
                </div>

                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div>
                <Button className="w-full" size="sm" variant="primary" disabled={loading}>
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}