/// <reference types="vite/client" />
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { User, Building, Eye, EyeOff, ArrowLeft, MapPin } from "lucide-react";
import { UserRole } from "../contexts/AuthContext";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { useRegisterLoading } from "../hooks/useAuthLoading";
import { ButtonLoading } from "../components/GlobalLoading";
import LocationAutocomplete from "../components/ui/LocationAutocomplete";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  location: string;
}

export default function RegisterPage() {
  const [locationInput, setLocationInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("person");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  // ...sin integración Google Maps...
  const { register: registerUser } = useAuth();
  const { isLoading, message, withRegisterLoading } = useRegisterLoading();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = withRegisterLoading(async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      throw new Error("Las contraseñas no coinciden");
    }

    // Determinar tipo_usuario y datos según el tipo seleccionado
    let tipo_usuario = 1;
    let firstName = data.firstName;
    let lastName = data.lastName;
    let organization = data.organization;

    if (selectedRole === "ong") {
      tipo_usuario = 2;
      // Para ONG, el nombre de la organización va en firstName y el nombre legal en organization
      firstName = data.firstName;
      lastName = ""; // Las ONGs no tienen apellido
      organization = data.organization || "";
    }

    const response = await registerUser({
      email: data.email,
      password: data.password,
      firstName,
      lastName,
      role: selectedRole,
      organization,
      location: data.location,
      tipo_usuario,
    });

    // Si requiere verificación, mostrar mensaje
    if (response?.requiresVerification) {
      setUserEmail(data.email);
      setShowVerificationMessage(true);
      return;
    }

    // Si no requiere verificación (flujo anterior)
    toast.success("¡Registro exitoso! Bienvenido a Demos+");
    navigate("/dashboard");
  });

  // Si se mostró el mensaje de verificación, renderizar esa pantalla
  if (showVerificationMessage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="max-w-md w-full">
          <div
            className="rounded-2xl p-8 shadow-2xl border text-center"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                ¡Revisa tu correo!
              </h2>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Te hemos enviado un correo de verificación a{" "}
                <strong className="text-purple-400">{userEmail}</strong>
              </p>
            </div>

            <div
              className="rounded-lg p-6 mb-6"
              style={{
                background:
                  "color-mix(in oklab, var(--accent) 6%, transparent)",
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-fg)" }}
              >
                Haz clic en el enlace del correo para verificar tu cuenta y
                completar el registro. Una vez verificado, podrás iniciar sesión
                automáticamente.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowVerificationMessage(false)}
                className="w-full btn-primary"
              >
                Intentar de nuevo
              </button>
              <Link
                to="/login"
                className="block w-full text-center border-2 py-3 rounded-lg font-semibold transition-colors"
                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
              >
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center mb-4"
            style={{ color: "var(--link)" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-fg)" }}
          >
            Únete a Demos+
          </h2>
          <p style={{ color: "var(--color-muted)" }}>
            Crea tu cuenta y comienza a hacer la diferencia
          </p>
        </div>

        <div className="card p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: "var(--color-fg)" }}
            >
              ¿Cómo quieres participar?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole("person")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === "person" ? "border-purple-500" : "border"
                }`}
                style={
                  selectedRole === "person"
                    ? {
                        background:
                          "color-mix(in oklab, #7c3aed 12%, transparent)",
                        color: "var(--color-fg)",
                        borderColor: "#7c3aed",
                      }
                    : {
                        background: "var(--color-card)",
                        color: "var(--color-fg)",
                        borderColor: "var(--color-border)",
                      }
                }
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Persona</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  Donar o hacer voluntariado
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("ong")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === "ong" ? "border-emerald-500" : "border"
                }`}
                style={
                  selectedRole === "ong"
                    ? {
                        background:
                          "color-mix(in oklab, #10b981 14%, transparent)",
                        color: "var(--color-fg)",
                        borderColor: "#10b981",
                      }
                    : {
                        background: "var(--color-card)",
                        color: "var(--color-fg)",
                        borderColor: "var(--color-border)",
                      }
                }
              >
                <Building className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">ONG</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  Organización sin fines de lucro
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields - Only for Person */}
            {selectedRole === "person" ? (
              <>
                {/* First Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-fg)" }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    {...register("firstName", {
                      required: "El nombre es requerido",
                    })}
                    className="input-field"
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-fg)" }}
                  >
                    Apellido
                  </label>
                  <input
                    type="text"
                    {...register("lastName", {
                      required: "El apellido es requerido",
                    })}
                    className="input-field"
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Organization Name - Only for ONG */
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-fg)" }}
                >
                  Nombre de la organización
                </label>
                <input
                  type="text"
                  {...register("firstName", {
                    required: "El nombre de la organización es requerido",
                  })}
                  className="input-field"
                  placeholder="Nombre de la ONG"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                    {errors.firstName.message}
                  </p>
                )}
              </div>
            )}

            {/* Organization (only for ONG) */}
            {selectedRole === "ong" && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-fg)" }}
                >
                  Nombre legal de la organización
                </label>
                <input
                  type="text"
                  {...register("organization")}
                  className="input-field"
                  placeholder="Nombre legal completo"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
                className="input-field"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="relative">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Ubicación
              </label>
              <LocationAutocomplete
                value={locationInput}
                onChange={(value) => {
                  setLocationInput(value);
                  setValue("location", value);
                }}
                onSelect={(value) => {
                  setValue("location", value);
                }}
                placeholder="Calle, número, barrio, ciudad en Córdoba"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres",
                    },
                  })}
                  className="input-field pr-10"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff
                      className="h-5 w-5"
                      style={{ color: "var(--color-muted)" }}
                    />
                  ) : (
                    <Eye
                      className="h-5 w-5"
                      style={{ color: "var(--color-muted)" }}
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden",
                  })}
                  className="input-field pr-10"
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      className="h-5 w-5"
                      style={{ color: "var(--color-muted)" }}
                    />
                  ) : (
                    <Eye
                      className="h-5 w-5"
                      style={{ color: "var(--color-muted)" }}
                    />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <ButtonLoading isLoading={isLoading} variant="dots">
                {isLoading ? message : "Crear cuenta"}
              </ButtonLoading>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-medium"
                style={{ color: "var(--link)" }}
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Social Login Buttons */}
          <SocialLoginButtons
            mode="register"
            hideForONG={selectedRole === "ong"}
          />
        </div>
      </div>
    </div>
  );
}
