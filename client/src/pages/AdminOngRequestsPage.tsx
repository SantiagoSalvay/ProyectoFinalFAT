import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  listOngRequests,
  approveOngRequest,
  rejectOngRequest,
  OngRequest,
} from "../services/ongRequests";

export default function AdminOngRequestsPage() {
  const [solicitudes, setSolicitudes] = useState<OngRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "pendiente" | "aprobada" | "rechazada"
  >("pendiente");
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<OngRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [notasAdmin, setNotasAdmin] = useState("");

  useEffect(() => {
    cargarSolicitudes();
  }, [filtroEstado]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await listOngRequests(
        filtroEstado === "todos" ? undefined : filtroEstado
      );
      setSolicitudes(response.solicitudes);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      toast.error("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (solicitud: OngRequest) => {
    setSelectedSolicitud(solicitud);
    setShowModal(true);
    setNotasAdmin("");
  };

  const handleAprobar = async () => {
    if (!selectedSolicitud) return;

    const loadingToast = toast.loading("Aprobando solicitud...");
    try {
      await approveOngRequest(selectedSolicitud.id_solicitud, undefined, notasAdmin);
      toast.success("✅ Solicitud aprobada y ONG creada exitosamente");
      toast.dismiss(loadingToast);
      setShowModal(false);
      setSelectedSolicitud(null);
      cargarSolicitudes();
    } catch (error: any) {
      console.error("Error aprobando solicitud:", error);
      toast.error(error.message || "Error al aprobar la solicitud");
      toast.dismiss(loadingToast);
    }
  };

  const handleRechazar = async () => {
    if (!selectedSolicitud || !motivoRechazo.trim()) {
      toast.error("Debes proporcionar un motivo de rechazo");
      return;
    }

    const loadingToast = toast.loading("Rechazando solicitud...");
    try {
      await rejectOngRequest(
        selectedSolicitud.id_solicitud,
        motivoRechazo,
        undefined,
        notasAdmin
      );
      toast.success("Solicitud rechazada");
      toast.dismiss(loadingToast);
      setShowRejectModal(false);
      setShowModal(false);
      setSelectedSolicitud(null);
      setMotivoRechazo("");
      setNotasAdmin("");
      cargarSolicitudes();
    } catch (error: any) {
      console.error("Error rechazando solicitud:", error);
      toast.error(error.message || "Error al rechazar la solicitud");
      toast.dismiss(loadingToast);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "aprobada":
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-fg)" }}>
            Solicitudes de Registro de ONGs
          </h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--color-muted)" }}>
            Gestiona las solicitudes de ONGs que no se encuentran en SISA
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <label className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
            Filtrar por estado:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm ${
                filtroEstado === "todos"
                  ? "shadow-md"
                  : ""
              }`}
              style={{
                backgroundColor: filtroEstado === "todos" ? "var(--accent)" : "var(--color-card)",
                color: filtroEstado === "todos" ? "white" : "var(--color-fg)",
                borderWidth: "1px",
                borderColor: filtroEstado === "todos" ? "var(--accent)" : "var(--color-border)"
              }}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroEstado("pendiente")}
              className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm ${
                filtroEstado === "pendiente"
                  ? "shadow-md"
                  : ""
              }`}
              style={{
                backgroundColor: filtroEstado === "pendiente" ? "var(--accent)" : "var(--color-card)",
                color: filtroEstado === "pendiente" ? "white" : "var(--color-fg)",
                borderWidth: "1px",
                borderColor: filtroEstado === "pendiente" ? "var(--accent)" : "var(--color-border)"
              }}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltroEstado("aprobada")}
              className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm ${
                filtroEstado === "aprobada"
                  ? "shadow-md"
                  : ""
              }`}
              style={{
                backgroundColor: filtroEstado === "aprobada" ? "var(--accent)" : "var(--color-card)",
                color: filtroEstado === "aprobada" ? "white" : "var(--color-fg)",
                borderWidth: "1px",
                borderColor: filtroEstado === "aprobada" ? "var(--accent)" : "var(--color-border)"
              }}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setFiltroEstado("rechazada")}
              className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm ${
                filtroEstado === "rechazada"
                  ? "shadow-md"
                  : ""
              }`}
              style={{
                backgroundColor: filtroEstado === "rechazada" ? "var(--accent)" : "var(--color-card)",
                color: filtroEstado === "rechazada" ? "white" : "var(--color-fg)",
                borderWidth: "1px",
                borderColor: filtroEstado === "rechazada" ? "var(--accent)" : "var(--color-border)"
              }}
            >
              Rechazadas
            </button>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}></div>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="rounded-lg p-8 text-center shadow" style={{ backgroundColor: "var(--color-card)" }}>
            <p style={{ color: "var(--color-muted)" }}>
              No hay solicitudes {filtroEstado !== "todos" && filtroEstado}
            </p>
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto rounded-lg shadow" style={{ backgroundColor: "var(--color-card)" }}>
              <table className="min-w-full divide-y" style={{ borderColor: "var(--color-border)" }}>
                <thead style={{ backgroundColor: "var(--color-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                      Organización
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                      CUIT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                  {solicitudes.map((solicitud) => (
                    <tr
                      key={solicitud.id_solicitud}
                      className="transition-colors"
                      style={{ ":hover": { backgroundColor: "var(--color-bg)" } }}
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
                          {solicitud.nombre_organizacion}
                        </div>
                        {solicitud.ubicacion && (
                          <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                            {solicitud.ubicacion}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm" style={{ color: "var(--color-fg)" }}>
                        {solicitud.cuit}
                      </td>
                      <td className="px-4 py-4 text-sm" style={{ color: "var(--color-muted)" }}>
                        {solicitud.email}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getEstadoBadgeColor(
                            solicitud.estado
                          )}`}
                        >
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs" style={{ color: "var(--color-muted)" }}>
                        {formatFecha(solicitud.fecha_solicitud)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleVerDetalle(solicitud)}
                          className="hover:underline font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de tarjetas para móvil */}
            <div className="lg:hidden space-y-4">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id_solicitud}
                  className="rounded-lg p-4 shadow-md border"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)"
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-fg)" }}>
                        {solicitud.nombre_organizacion}
                      </h3>
                      {solicitud.ubicacion && (
                        <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
                          📍 {solicitud.ubicacion}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ml-2 ${getEstadoBadgeColor(
                        solicitud.estado
                      )}`}
                    >
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2" style={{ color: "var(--color-fg)" }}>CUIT:</span>
                      <span style={{ color: "var(--color-muted)" }}>{solicitud.cuit}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2" style={{ color: "var(--color-fg)" }}>Email:</span>
                      <span style={{ color: "var(--color-muted)" }} className="truncate">{solicitud.email}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="font-medium mr-2" style={{ color: "var(--color-fg)" }}>Fecha:</span>
                      <span style={{ color: "var(--color-muted)" }}>{formatFecha(solicitud.fecha_solicitud)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerDetalle(solicitud)}
                    className="w-full py-2 px-4 rounded-lg font-medium text-sm transition-all"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "white"
                    }}
                  >
                    Ver detalles completos
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal de detalles */}
        {showModal && selectedSolicitud && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg p-4 sm:p-6 shadow-xl" style={{ backgroundColor: "var(--color-card)" }}>
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-fg)" }}>
                  Detalles de la Solicitud
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-4"
                  style={{ color: "var(--color-muted)" }}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Estado */}
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getEstadoBadgeColor(
                      selectedSolicitud.estado
                    )}`}
                  >
                    {selectedSolicitud.estado.toUpperCase()}
                  </span>
                </div>

                {/* Información de la ONG */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      Organización
                    </label>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.nombre_organizacion}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      CUIT
                    </label>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.cuit}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      Email
                    </label>
                    <p className="mt-1 text-sm sm:text-base break-all" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      Teléfono
                    </label>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.telefono || "No proporcionado"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      Ubicación
                    </label>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.ubicacion || "No proporcionada"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      Sitio Web
                    </label>
                    <p className="mt-1 text-sm sm:text-base break-all" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.sitio_web || "No proporcionado"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                      Descripción
                    </label>
                    <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                      {selectedSolicitud.descripcion || "No proporcionada"}
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                        Fecha de Solicitud
                      </label>
                      <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                        {formatFecha(selectedSolicitud.fecha_solicitud)}
                      </p>
                    </div>
                    {selectedSolicitud.fecha_revision && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                          Fecha de Revisión
                        </label>
                        <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--color-fg)" }}>
                          {formatFecha(selectedSolicitud.fecha_revision)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo de rechazo (si existe) */}
                {selectedSolicitud.motivo_rechazo && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <label className="text-xs sm:text-sm font-medium text-red-800">
                      Motivo de Rechazo
                    </label>
                    <p className="mt-1 text-sm text-red-900">
                      {selectedSolicitud.motivo_rechazo}
                    </p>
                  </div>
                )}

                {/* Notas admin (si existen) */}
                {selectedSolicitud.notas_admin && (
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <label className="text-xs sm:text-sm font-medium text-blue-800">
                      Notas del Administrador
                    </label>
                    <p className="mt-1 text-sm text-blue-900">
                      {selectedSolicitud.notas_admin}
                    </p>
                  </div>
                )}

                {/* Campo para agregar notas (solo si está pendiente) */}
                {selectedSolicitud.estado === "pendiente" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium" style={{ color: "var(--color-fg)" }}>
                      Notas del administrador (opcional)
                    </label>
                    <textarea
                      value={notasAdmin}
                      onChange={(e) => setNotasAdmin(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-fg)"
                      }}
                      placeholder="Agregar notas internas sobre esta solicitud..."
                    />
                  </div>
                )}
              </div>

              {/* Acciones (solo si está pendiente) */}
              {selectedSolicitud.estado === "pendiente" && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAprobar}
                    className="flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition shadow-md hover:shadow-lg text-sm sm:text-base"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    ✓ Aprobar y Crear Cuenta
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition shadow-md hover:shadow-lg text-sm sm:text-base"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    ✗ Rechazar
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-lg px-4 py-2.5 font-medium transition border text-sm sm:text-base"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                      backgroundColor: "var(--color-bg)"
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {selectedSolicitud.estado !== "pendiente" && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full rounded-lg px-4 py-2.5 font-medium transition border text-sm sm:text-base"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                      backgroundColor: "var(--color-bg)"
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de rechazo */}
        {showRejectModal && selectedSolicitud && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="w-full max-w-md rounded-lg p-5 sm:p-6 shadow-xl" style={{ backgroundColor: "var(--color-card)" }}>
              <h3 className="mb-4 text-lg sm:text-xl font-bold" style={{ color: "var(--color-fg)" }}>
                Rechazar Solicitud
              </h3>
              <p className="mb-4 text-xs sm:text-sm" style={{ color: "var(--color-muted)" }}>
                Por favor, proporciona un motivo claro para el rechazo. Este
                motivo será enviado a la organización por email.
              </p>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--color-fg)" }}>
                  Motivo del rechazo *
                </label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-fg)"
                  }}
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRechazar}
                  disabled={!motivoRechazo.trim()}
                  className="flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  Confirmar Rechazo
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setMotivoRechazo("");
                  }}
                  className="flex-1 rounded-lg px-4 py-2.5 font-medium transition border text-sm sm:text-base"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg)",
                    backgroundColor: "var(--color-bg)"
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

