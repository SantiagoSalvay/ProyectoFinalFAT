import { useAuth } from '../contexts/AuthContext'
import { Heart, Users, DollarSign, Calendar, TrendingUp, Award, MapPin, Building } from 'lucide-react'

import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useONGNotifications } from '../hooks/useONGNotifications';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Considera ONG si tipo_usuario === 2 (igual que ProfilePage)
  const isONG = user?.id_usuario && user?.tipo_usuario === 2

  const [tipoONG, setTipoONG] = useState<{ grupo_social?: string | null; necesidad?: string | null } | null>(null);
  const [loadingTipoONG, setLoadingTipoONG] = useState(true);
  const { addNotification, notifications, removeNotification } = useNotifications();
  const { isONG: isONGUser } = useONGNotifications();

  useEffect(() => {
    const fetchTipoONG = async () => {
      const token = api.getToken();
      if (isONG && token) {
        try {
          const data = await api.getTipoONG();
          if (data && typeof data === 'object' && (data.grupo_social !== undefined || data.necesidad !== undefined)) {
            setTipoONG(data);
          } else {
            setTipoONG({});
          }
        } catch (err) {
          setTipoONG({});
        } finally {
          setLoadingTipoONG(false);
        }
      } else {
        setTipoONG(null);
        setLoadingTipoONG(false);
      }
    };
    fetchTipoONG();
  }, [isONG]);

  // Notificación para persona sin ubicación
  useEffect(() => {
    const isPersona = user?.id_usuario && user?.tipo_usuario === 1;
    if (
      isPersona &&
      user != null &&
      (!user.ubicacion || user.ubicacion === '') &&
      !notifications.some(n => n.type === 'warning' && n.title === 'Completa tu ubicación')
    ) {
      addNotification({
        id: 'person-missing-location',
        type: 'warning',
        title: 'Completa tu ubicación',
        message: 'No tienes una ubicación registrada. Haz clic en "Acceder" para completar tu perfil.',
        link: '/profile'
      });
    }
  }, [user, notifications, addNotification]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido
          </h1>
          <p className="text-gray-600">
            {isONG ? 'Panel de control de tu organización' : 'Tu centro de actividades'}
          </p>
        </div>

        {/* Stats Cards */}
        <div
          className="grid gap-6 mb-8"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isONG ? 'Donaciones Recibidas' : 'Donaciones Realizadas'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isONG ? '10' : '30'}
                  </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isONG ? 'Total Recaudados' : 'Total Donado'}
                </p>
                <p className="text-2xl font-bold text-gray-900">$12,450</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isONG ? 'menos se me va a ocurrir' : 'puntos actuales'}
                </p>
                <p className="text-2xl font-bold text-gray-900">1354pt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Actividad Reciente
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isONG ? 'Nueva donación recibida' : 'Donación realizada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isONG ? 'María García donó $50' : 'Donaste $50 a Fundación Ayuda'}
                    </p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isONG ? 'Nuevo voluntario registrado' : 'Sesión de voluntariado completada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isONG ? 'Juan Pérez se unió como voluntario' : 'Completaste 4 horas de voluntariado'}
                    </p>
                    <p className="text-xs text-gray-500">Hace 1 día</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isONG ? 'Meta alcanzada' : 'Logro desbloqueado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isONG ? 'Alcanzaste tu meta mensual de donaciones' : 'Completaste 10 donaciones'}
                    </p>
                    <p className="text-xs text-gray-500">Hace 3 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <button
                  className="w-full btn-primary text-sm"
                  onClick={() => {
                    if (!isONG) {
                      navigate('/ongs');
                    }
                  }}
                >
                  {isONG ? 'Crear Nueva Campaña' : 'Buscar Organizaciones'}
                </button>
                <button
                  className="w-full btn-secondary text-sm"
                  onClick={() => {
                    if (!isONG) {
                      navigate('/forum?filtro=voluntariado');
                    }
                  }}
                >
                  {isONG ? 'Gestionar Voluntarios' : 'Ver Oportunidades de Voluntariado'}
                </button>
                <button
                  className="w-full btn-accent text-sm"
                  onClick={() => {
                    if (!isONG) {
                      navigate('/acciones/mi-historial');
                    }
                  }}
                >
                  {isONG ? 'Ver Reportes' : 'Ver Mi Historial'}
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Perfil
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    {isONG ? <Building className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.nombre || user?.usuario}</p>
                    <p className="text-xs text-gray-500">
                      {isONG ? 'Organización' : 'Persona'}
                    </p>
                  </div>
                </div>
                {user?.ubicacion && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.ubicacion}
                  </div>
                )}
                {isONG && (
                  <>
                    {/* Si tienes campos extra para ONG, agrégalos aquí */}
                  </>
                )}
              </div>
            </div>

            {/* Upcoming Events como notificaciones tipo noticia */}
            {/* Al montar la página, agregar notificaciones de eventos si no existen */}
            {/* Notificaciones de eventos solo una vez por usuario al iniciar sesión */}
            {(() => {
              useEffect(() => {
                if (!user?.id_usuario) return;
                const eventosKey = `eventos-enviados-${user.id_usuario}`;
                const enviados = localStorage.getItem(eventosKey);
                const yaEstaCampana = notifications.some(n => n.id === 'evento-campana');
                const yaEstaVoluntariado = notifications.some(n => n.id === 'evento-voluntariado');
                if (!enviados && !yaEstaCampana && !yaEstaVoluntariado) {
                  addNotification({
                    id: 'evento-campana',
                    type: 'info',
                    title: 'Próximo Evento: Campaña de Donación',
                    message: 'No te pierdas la campaña de donación el 15 de Diciembre.',
                  });
                  addNotification({
                    id: 'evento-voluntariado',
                    type: 'info',
                    title: 'Próximo Evento: Sesión de Voluntariado',
                    message: 'Participa en la sesión de voluntariado el 20 de Diciembre.',
                  });
                  localStorage.setItem(eventosKey, 'true');
                }
              }, [addNotification, user?.id_usuario, notifications]);
              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}