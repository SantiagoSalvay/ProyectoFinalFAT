import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { api } from '../services/api';

interface TipoONGData {
  grupo_social?: string | null;
  necesidad?: string | null;
}

interface User {
  id_usuario: number;
  bio?: string | null;
  tipo_usuario?: number;
}

export function useONGNotifications() {
  const { user } = useAuth();
  const { addNotification, notifications, removeNotification } = useNotifications();
  const hasCheckedRef = useRef(false);

  // Verificar si el usuario es una ONG (tipo_usuario === 2)
  const isONG = user?.tipo_usuario === 2;

  // Función para verificar datos faltantes
  const checkMissingData = useCallback(async () => {
    if (!isONG || !user) return;

    try {
      // Obtener datos de TipoONG
      const tipoONGData: TipoONGData | null = await api.getTipoONG();
      
      // Verificar qué datos faltan
      const missingGroupSocial = !tipoONGData?.grupo_social || tipoONGData.grupo_social.trim() === '';
      const missingNecesidad = !tipoONGData?.necesidad || tipoONGData.necesidad.trim() === '';

      const groupSocialNotificationId = 'ong-missing-group-social';
      const necesidadNotificationId = 'ong-missing-necesidad';

      // Limpiar notificación antigua si existe
      const legacyNotification = notifications.find(n => n.id === 'ong-missing-data');
      if (legacyNotification) {
        removeNotification(legacyNotification.id);
      }

      if (missingGroupSocial) {
        const existingGroupSocialNotification = notifications.find(n => n.id === groupSocialNotificationId);
        if (!existingGroupSocialNotification) {
          addNotification({
            id: groupSocialNotificationId,
            type: 'warning',
            title: 'Completa tu grupo social',
            message: 'Agrega el grupo social al que pertenece tu organización para mejorar la visibilidad de tus campañas.',
            link: '/complete-data',
            category: 'system',
            priority: 'high'
          });
        }
      } else {
        const existingGroupSocialNotification = notifications.find(n => n.id === groupSocialNotificationId);
        if (existingGroupSocialNotification) {
          removeNotification(existingGroupSocialNotification.id);
        }
      }

      if (missingNecesidad) {
        const existingNecesidadNotification = notifications.find(n => n.id === necesidadNotificationId);
        if (!existingNecesidadNotification) {
          addNotification({
            id: necesidadNotificationId,
            type: 'warning',
            title: 'Especifica tu necesidad principal',
            message: 'Indica la necesidad principal de tu ONG para conectar con voluntarios y donantes adecuados.',
            link: '/complete-data',
            category: 'system',
            priority: 'high'
          });
        }
      } else {
        const existingNecesidadNotification = notifications.find(n => n.id === necesidadNotificationId);
        if (existingNecesidadNotification) {
          removeNotification(existingNecesidadNotification.id);
        }
      }
    } catch (error) {
      console.error('Error verificando datos faltantes de ONG:', error);
    }
  }, [isONG, user, notifications, addNotification, removeNotification]);

  // Función para limpiar notificaciones cuando se completan los datos
  const clearMissingDataNotification = useCallback(() => {
    const existingNotification = notifications.find(n => n.id === 'ong-missing-data');
    if (existingNotification) {
      removeNotification(existingNotification.id);
    }
  }, [notifications, removeNotification]);

  // Verificar datos faltantes SOLO una vez al montar o cuando cambie el usuario
  useEffect(() => {
    if (isONG && user && !hasCheckedRef.current) {
      checkMissingData();
      hasCheckedRef.current = true;
    }
  }, [isONG, user?.id_usuario]); // Solo depende del ID del usuario, no de checkMissingData

  return {
    checkMissingData,
    clearMissingDataNotification,
    isONG
  };
}
