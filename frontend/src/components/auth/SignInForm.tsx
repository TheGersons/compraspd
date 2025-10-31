import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { setToken } from "../../lib/api";


type LoginResponse = { access_token: string; token_type?: string; expires_in?: string };

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let debug = true;
  const navigate = useNavigate();



  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if(!res.ok)debug = false;
      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg || "Credenciales inválidas");
      }
      console.log("Inicio de sesión exitoso");

      const data: LoginResponse = await res.json();
      setToken(data.access_token, keepLoggedIn)
      await refresh();

      if(!debug)return;
      navigate("/quotes");
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
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

          {/* Error */}
          {error && (
            <p className="mb-4 text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <Label>
                  Correo electrónico <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={keepLoggedIn} onChange={setKeepLoggedIn} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Mantener sesión iniciada
                  </span>
                </div>

                {/* Deja el enlace si implementarás recuperación. Si no, elimínalo. */}
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

/** Intenta leer un mensaje de error del backend de forma segura */
async function safeError(res: Response) {
  try {
    const t = await res.text();
    try {
      const j = JSON.parse(t);
      return j?.message || j?.error || t;
    } catch {
      return t;
    }
  } catch {
    return "";
  }
}
