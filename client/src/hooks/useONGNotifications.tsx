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
      const missingData: string[] = [];
      
      // Verificar biografía
      const userBio = (user as any).bio;
      if (!userBio || userBio.trim() === '') {
        missingData.push('biografía');
      }
      
      // Verificar grupo social
      if (!tipoONGData?.grupo_social || tipoONGData.grupo_social.trim() === '') {
        missingData.push('grupo social');
      }
      
      // Verificar necesidad
      if (!tipoONGData?.necesidad || tipoONGData.necesidad.trim() === '') {
        missingData.push('necesidad');
      }

      const notificationId = 'ong-missing-data';
      const existingNotification = notifications.find(n => n.id === notificationId);

      // Si hay datos faltantes, crear notificación SOLO si no existe
      if (missingData.length > 0) {
        
        if (!existingNotification) {
          const missingDataText = missingData.length === 1 
            ? missingData[0] 
            : missingData.length === 2 
              ? `${missingData[0]} y ${missingData[1]}`
              : `${missingData.slice(0, -1).join(', ')} y ${missingData[missingData.length - 1]}`;

          // Determinar el enlace apropiado
          const hasBioMissing = missingData.includes('biografía');
          const hasOtherMissing = missingData.some(item => item !== 'biografía');
          
          let link = '/complete-data';
          let message = `Te faltan completar los siguientes datos: ${missingDataText}. `;
          
          if (hasBioMissing && hasOtherMissing) {
            message += 'Completa tu biografía en el perfil y los demás datos en la página de completar información.';
            link = '/profile'; // Priorizar perfil si falta biografía
          } else if (hasBioMissing) {
            message += 'Completa tu biografía en el perfil.';
            link = '/profile';
          } else {
            message += 'Completa los datos en la página de completar información.';
            link = '/complete-data';
          }

          addNotification({
            id: notificationId,
            type: 'warning',
            title: 'Datos de ONG incompletos',
            message,
            link
          });
        }
      } else {
        // Si no hay datos faltantes, eliminar notificación existente
        const existingNotification = notifications.find(n => n.id === 'ong-missing-data');
        if (existingNotification) {
          removeNotification(existingNotification.id);
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
