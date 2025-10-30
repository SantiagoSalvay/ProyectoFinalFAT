/**
 * Servicio para gestionar solicitudes de registro de ONGs
 */

const API_BASE_URL = "http://localhost:3001";

export interface OngRequest {
  id_solicitud: number;
  email: string;
  nombre_organizacion: string;
  cuit: string;
  ubicacion?: string;
  descripcion?: string;
  telefono?: string;
  sitio_web?: string;
  documentacion?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  motivo_rechazo?: string;
  notas_admin?: string;
  fecha_solicitud: string;
  fecha_revision?: string;
  revisado_por?: number;
}

export interface ListOngRequestsResponse {
  success: boolean;
  solicitudes: OngRequest[];
}

export interface OngRequestDetailResponse {
  success: boolean;
  solicitud: OngRequest;
}

export interface ApproveRejectResponse {
  success: boolean;
  message: string;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}

/**
 * Obtener todas las solicitudes (con filtro opcional por estado)
 */
export const listOngRequests = async (estado?: 'pendiente' | 'aprobada' | 'rechazada'): Promise<ListOngRequestsResponse> => {
  try {
    const url = estado 
      ? `${API_BASE_URL}/api/ong-requests/list?estado=${estado}`
      : `${API_BASE_URL}/api/ong-requests/list`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener solicitudes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en listOngRequests:', error);
    throw error;
  }
};

/**
 * Obtener detalles de una solicitud específica
 */
export const getOngRequestDetail = async (id: number): Promise<OngRequestDetailResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ong-requests/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener detalles de la solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getOngRequestDetail:', error);
    throw error;
  }
};

/**
 * Aprobar una solicitud
 */
export const approveOngRequest = async (
  id: number, 
  adminId?: number, 
  notasAdmin?: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ong-requests/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        admin_id: adminId,
        notas_admin: notasAdmin,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al aprobar solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en approveOngRequest:', error);
    throw error;
  }
};

/**
 * Rechazar una solicitud
 */
export const rejectOngRequest = async (
  id: number,
  motivoRechazo: string,
  adminId?: number,
  notasAdmin?: string
): Promise<ApproveRejectResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ong-requests/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        admin_id: adminId,
        motivo_rechazo: motivoRechazo,
        notas_admin: notasAdmin,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al rechazar solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en rejectOngRequest:', error);
    throw error;
  }
};

