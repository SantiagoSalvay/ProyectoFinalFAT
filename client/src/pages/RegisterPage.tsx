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
  // Campos para ONG (solo nombre y CUIT, el resto se autocompleta)
  cuit?: string;
}

export default function RegisterPage() {
  const [locationInput, setLocationInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("person");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [ongData, setOngData] = useState<any>(null);
  const [loadingOngData, setLoadingOngData] = useState(false);
  const [showOngNotFoundModal, setShowOngNotFoundModal] = useState(false);
  const [ongRequestSuccess, setOngRequestSuccess] = useState(false);
  const [ongNotFoundInSisa, setOngNotFoundInSisa] = useState(false);
  // ...sin integración Google Maps...
  const { register: registerUser} = useAuth();
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
  const cuit = watch("cuit");

  // Función para verificar ONG por CUIT en SISA
  const handleVerificarCuit = async () => {
    const cuitValue = cuit;
    
    if (!cuitValue || cuitValue.length < 11) {
      toast.error("Por favor, ingresa un CUIT válido");
      return;
    }

    setLoadingOngData(true);
    try {
      const API_BASE_URL = "http://localhost:3001";
      const response = await fetch(`${API_BASE_URL}/api/ong/search-by-cuit?cuit=${cuitValue}`);
      
      if (response.ok) {
        const data = await response.json();
        setOngData(data);
        setOngNotFoundInSisa(false);
        
        // Autocompletar campos
        if (data.domicilioCompleto) {
          setValue("location", data.domicilioCompleto);
          setLocationInput(data.domicilioCompleto);
        }
        if (data.email) {
          setValue("email", data.email);
        }
        
        toast.success(`✅ ONG encontrada en SISA: ${data.nombre}`);
      } else {
        setOngData(null);
        setOngNotFoundInSisa(true);
        // Mostrar modal explicando el proceso de verificación manual
        setShowOngNotFoundModal(true);
      }
    } catch (error) {
      console.error("Error buscando ONG:", error);
      setOngData(null);
      setOngNotFoundInSisa(false);
      toast.error("Error al verificar la ONG. Por favor, intenta nuevamente.");
    } finally {
      setLoadingOngData(false);
    }
  };

  const onSubmit = withRegisterLoading(async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      throw new Error("Las contraseñas no coinciden");
    }

    // Si es una ONG no encontrada en SISA, enviar solicitud de verificación manual
    if (selectedRole === "ong" && ongNotFoundInSisa) {
      try {
        const API_BASE_URL = "http://localhost:3001";
        const response = await fetch(`${API_BASE_URL}/api/ong-requests/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            nombre_organizacion: data.firstName,
            cuit: data.cuit,
            ubicacion: data.location,
            descripcion: data.organization || "",
            telefono: "",
            sitio_web: "",
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setOngRequestSuccess(true);
          toast.success("¡Solicitud enviada exitosamente!");
        } else {
          toast.error(result.error || "Error al enviar la solicitud");
          throw new Error(result.error || "Error al enviar la solicitud");
        }
        return;
      } catch (error) {
        console.error("Error enviando solicitud:", error);
        toast.error("Error al enviar la solicitud. Por favor, intenta nuevamente.");
        throw error;
      }
    }

    // Flujo normal de registro
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
      // Datos para verificación SISA (solo ONGs)
      cuit: selectedRole === "ong" ? data.cuit : undefined,
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

  // Si se envió la solicitud de ONG exitosamente
  if (ongRequestSuccess) {
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
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                ¡Solicitud enviada con éxito!
              </h2>
              <p className="text-lg mb-4" style={{ color: "var(--color-muted)" }}>
                Tu solicitud de registro está siendo revisada
              </p>
            </div>

            <div
              className="p-6 rounded-lg mb-6"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <p className="text-left mb-4" style={{ color: "var(--color-fg)" }}>
                <strong>¿Qué sigue?</strong>
              </p>
              <ul className="text-left space-y-2" style={{ color: "var(--color-muted)" }}>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Nuestro equipo verificará que tu organización es legítima</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Te enviaremos un email cuando tu cuenta sea aprobada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Este proceso suele tardar 24-48 horas</span>
                </li>
              </ul>
            </div>

            <div
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <p className="text-sm" style={{ color: "var(--color-fg)" }}>
                <strong>💡 ¿Por qué hacemos esto?</strong>
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                Verificamos todas las organizaciones para garantizar que solo ONGs reales formen parte de nuestra plataforma, protegiendo así a toda la comunidad.
              </p>
            </div>

            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
              }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Modal para ONG no encontrada en SISA */}
      {showOngNotFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="relative max-w-lg w-full rounded-2xl p-8 shadow-2xl border"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <button
              onClick={() => setShowOngNotFoundModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--color-fg)" }}>
                ONG no encontrada en SISA
              </h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Tu organización no fue encontrada en el registro oficial SISA
              </p>
            </div>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "var(--color-bg)" }}>
              <p className="font-semibold mb-3" style={{ color: "var(--color-fg)" }}>
                ¿Qué significa esto?
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
                Para garantizar que solo organizaciones legítimas se registren en nuestra plataforma, 
                necesitamos verificar manualmente tu organización.
              </p>
              <p className="font-semibold mb-2" style={{ color: "var(--color-fg)" }}>
                Completa el formulario de registro y envía tu solicitud. Te notificaremos por email cuando sea aprobada.
              </p>
            </div>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>
                💡 ¿Por qué hacemos esto?
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Verificamos todas las organizaciones para proteger a donantes y voluntarios, 
                asegurando que solo ONGs reales formen parte de Demos+.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowOngNotFoundModal(false)}
                className="w-full py-3 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                }}
              >
                Continuar completando formulario
              </button>
              <button
                onClick={() => {
                  setShowOngNotFoundModal(false);
                  setOngNotFoundInSisa(false);
                }}
                className="w-full py-3 rounded-lg font-semibold transition-colors border-2"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-fg)",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Campos adicionales para ONG */}
            {selectedRole === "ong" && (
              <>
                {/* CUIT */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-fg)" }}
                  >
                    CUIT <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    {...register("cuit", {
                      required: "El CUIT es requerido para verificación en SISA",
                      pattern: {
                        value: /^\d{2}-?\d{8}-?\d{1}$/,
                        message: "Formato de CUIT inválido (ej: 30-71710094-4)",
                      },
                    })}
                    className="input-field"
                    placeholder="30-12345678-9"
                    maxLength={13}
                  />
                  {errors.cuit && (
                    <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                      {errors.cuit.message}
                    </p>
                  )}
                  
                  {/* Botón Verificar */}
                  <button
                    type="button"
                    onClick={handleVerificarCuit}
                    disabled={loadingOngData || !cuit || cuit.length < 11}
                    className="mt-2 w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: loadingOngData || !cuit || cuit.length < 11 
                        ? "var(--color-muted)" 
                        : "var(--accent)",
                      color: loadingOngData || !cuit || cuit.length < 11 
                        ? "var(--color-fg-muted)" 
                        : "white",
                      cursor: loadingOngData || !cuit || cuit.length < 11 
                        ? "not-allowed" 
                        : "pointer",
                      opacity: loadingOngData || !cuit || cuit.length < 11 ? 0.5 : 1
                    }}
                  >
                    {loadingOngData ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        Verificar CUIT en SISA
                      </>
                    )}
                  </button>

                  {/* Mensaje de verificación exitosa */}
                  {ongData && (
                    <div className="mt-3 p-4 rounded-lg border" style={{ 
                      backgroundColor: "color-mix(in oklab, #10b981 10%, transparent)",
                      borderColor: "color-mix(in oklab, #10b981 30%, transparent)"
                    }}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg 
                            className="w-6 h-6" 
                            style={{ color: "#10b981" }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "#10b981" }}>
                            ✅ ONG verificada en SISA
                          </p>
                          <p className="text-sm mt-1 font-medium" style={{ color: "var(--color-fg)" }}>
                            {ongData.nombre}
                          </p>
                          <div className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
                            <p>📍 {ongData.provinciaDomicilio}</p>
                            {ongData.telefono && <p>📞 {ongData.telefono}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
                    Ingresa el CUIT de tu organización y haz clic en "Verificar" para validar los datos en el registro SISA.
                  </p>
                </div>
              </>
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
                {isLoading ? message : (ongNotFoundInSisa ? "Enviar solicitud" : "Crear cuenta")}
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
