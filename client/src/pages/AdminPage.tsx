import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Shield, Users, Building2, MessageSquare, Ban, Check, X, Loader2, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.tipo_usuario === 3;
  const [tab, setTab] = useState<'comments' | 'users' | 'ongs'>('comments');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [ongs, setOngs] = useState<any[]>([]);
  const [commentStatus, setCommentStatus] = useState<'pending'|'approved'|'rejected'>('pending');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, commentStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === 'comments') {
        const { comentarios } = await api.adminListComments(commentStatus);
        setComments(comentarios || []);
      } else if (tab === 'users') {
        const { users } = await api.adminListUsers();
        setUsers(users || []);
      } else if (tab === 'ongs') {
        const { ongs } = await api.adminListONGs();
        setOngs(ongs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (id: number, status: 'approved'|'rejected') => {
    await api.adminUpdateComment(id, { moderation_status: status, rejection_reason: status === 'rejected' ? 'Contenido inapropiado' : undefined });
    loadData();
  };

  const banUser = async (id: number) => {
    await api.adminBanUser(id, { reason: 'Ban administrativo', days: 7 });
    loadData();
  };
  const unbanUser = async (id: number) => {
    await api.adminUnbanUser(id);
    loadData();
  };

  const banONG = async (id: number) => {
    await api.adminBanONG(id, { reason: 'Ban administrativo', days: 7 });
    loadData();
  };
  const unbanONG = async (id: number) => {
    await api.adminUnbanONG(id);
    loadData();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-gray-600">Gestioná comentarios del foro, usuarios y ONGs</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button onClick={() => setTab('comments')} className={`px-4 py-2 rounded-md ${tab==='comments' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/>Comentarios</div>
        </button>
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-md ${tab==='users' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2"><Users className="w-4 h-4"/>Usuarios</div>
        </button>
        <button onClick={() => setTab('ongs')} className={`px-4 py-2 rounded-md ${tab==='ongs' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2"><Building2 className="w-4 h-4"/>ONGs</div>
        </button>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
            Cargando...
          </div>
        ) : (
          <div>
            {tab === 'comments' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Estado:</span>
                  {(['pending','approved','rejected'] as const).map(s => (
                    <button key={s} onClick={() => setCommentStatus(s)} className={`px-3 py-1 rounded-full text-sm ${commentStatus===s?'bg-blue-600 text-white':'bg-gray-100'}`}>{s}</button>
                  ))}
                </div>
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-gray-600">No hay comentarios.</div>
                  ) : comments.map(c => (
                    <div key={c.id_respuesta} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-gray-500">#{c.id_respuesta} · Publicación {c.id_publicacion} · Usuario {c.id_usuario}</div>
                        <div className="text-gray-900">{c.mensaje}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(c.fecha_respuesta).toLocaleString()} · Estado: {c.moderation_status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moderate(c.id_respuesta, 'approved')} className="btn-primary px-3 py-2 flex items-center gap-1"><Check className="w-4 h-4"/>Aprobar</button>
                        <button onClick={() => moderate(c.id_respuesta, 'rejected')} className="px-3 py-2 rounded-md border border-red-300 text-red-600 flex items-center gap-1"><X className="w-4 h-4"/>Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-gray-600">No hay usuarios.</div>
                ) : users.map(u => (
                  <div key={u.id_usuario} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{u.nombre} {u.apellido} <span className="text-xs text-gray-500">(#{u.id_usuario})</span></div>
                      <div className="text-sm text-gray-600">{u.email} · {u.ubicacion || 'Sin ubicación'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
                      {u.banned ? (
                        <button onClick={() => unbanUser(u.id_usuario)} className="btn-primary px-3 py-2 flex items-center gap-1"><Check className="w-4 h-4"/>Desbanear</button>
                      ) : (
                        <button onClick={() => banUser(u.id_usuario)} className="px-3 py-2 rounded-md border border-red-300 text-red-600 flex items-center gap-1"><Ban className="w-4 h-4"/>Banear</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'ongs' && (
              <div className="space-y-3">
                {ongs.length === 0 ? (
                  <div className="text-gray-600">No hay ONGs.</div>
                ) : ongs.map(o => (
                  <div key={o.id_usuario} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.nombre} <span className="text-xs text-gray-500">(#{o.id_usuario})</span></div>
                      <div className="text-sm text-gray-600">{o.email} · {o.ubicacion || 'Sin ubicación'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
                      {o.banned ? (
                        <button onClick={() => unbanONG(o.id_usuario)} className="btn-primary px-3 py-2 flex items-center gap-1"><Check className="w-4 h-4"/>Desbanear</button>
                      ) : (
                        <button onClick={() => banONG(o.id_usuario)} className="px-3 py-2 rounded-md border border-red-300 text-red-600 flex items-center gap-1"><Ban className="w-4 h-4"/>Banear</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
