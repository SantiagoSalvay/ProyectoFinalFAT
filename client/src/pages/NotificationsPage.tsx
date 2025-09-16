import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, markAsRead, removeNotification } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Notificaciones</h1>
      {notifications.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No tienes notificaciones nuevas.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map(n => (
            <li key={n.id} className={`p-4 rounded-lg shadow flex items-center justify-between ${n.read ? 'bg-gray-100' : 'bg-yellow-50 border-l-4 border-yellow-400'}`}>
              <div>
                <div className="font-semibold text-lg mb-1">{n.title}</div>
                <div className="text-gray-700 mb-2">{n.message}</div>
                {n.link && (
                  <Link to={n.link} className="text-purple-600 hover:underline font-medium text-sm">Ir a completar datos</Link>
                )}
                <div className="text-xs text-gray-400 mt-2">{n.timestamp.toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">Marcar como leída</button>
                )}
                <button onClick={() => removeNotification(n.id)} className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
