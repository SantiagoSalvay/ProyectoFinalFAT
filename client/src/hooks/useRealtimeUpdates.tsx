import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface UseRealtimeUpdatesOptions {
  onUpdate?: () => void;
  interval?: number;
  enabled?: boolean;
}

/**
 * Hook para manejar actualizaciones en tiempo real
 * Refresca notificaciones y ejecuta callback de actualización
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const { 
    onUpdate, 
    interval = 10000, // 10 segundos por defecto
    enabled = true 
  } = options;
  
  const { isAuthenticated } = useAuth();
  const { refreshNotifications } = useNotifications();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const performUpdate = useCallback(async () => {
    if (!isAuthenticated || !enabled) return;

    try {
      // Refrescar notificaciones
      await refreshNotifications();
      
      // Ejecutar callback personalizado si existe
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error('Error en actualización en tiempo real:', error);
    }
  }, [isAuthenticated, enabled, refreshNotifications, onUpdate]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ejecutar inmediatamente
    performUpdate();

    // Configurar intervalo
    intervalRef.current = setInterval(performUpdate, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, interval, performUpdate]);

  return { refresh: performUpdate };
}
