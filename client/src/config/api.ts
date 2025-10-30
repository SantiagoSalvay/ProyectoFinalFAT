// Configuración de API - detecta automáticamente el entorno
const getApiBaseUrl = (): string => {
  // En producción, usar la misma URL (mismo dominio)
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // En desarrollo, usar localhost:3001
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

