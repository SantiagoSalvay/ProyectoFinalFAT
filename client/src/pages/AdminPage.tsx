import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Shield, Users, Building2, MessageSquare, Ban, Check, X, Loader2, Edit3, LogOut, Search, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'comments' | 'users' | 'ongs';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.tipo_usuario === 3;

  // Estado UI
  const [tab, setTab] = useState<Tab>('comments');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [ongs, setOngs] = useState<any[]>([]);
  const [commentStatus, setCommentStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [query, setQuery] = useState('');

  // Modales de edición
  const [editingUser, setEditingUser] = useState<any|null>(null);
  const [editingONG, setEditingONG] = useState<any|null>(null);
  const [editingComment, setEditingComment] = useState<any|null>(null);

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard');
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
    } finally { setLoading(false); }
  };

  // Acciones
  const moderate = async (id: number, status: 'approved'|'rejected') => {
    await api.adminUpdateComment(id, { moderation_status: status, rejection_reason: status === 'rejected' ? 'Contenido inapropiado' : undefined });
    loadData();
  };
  const saveComment = async () => {
    if (!editingComment) return;
    await api.adminUpdateComment(editingComment.id_respuesta, { mensaje: editingComment.mensaje });
    setEditingComment(null);
    loadData();
  };

  const banUser = async (id: number) => { await api.adminBanUser(id, { reason: 'Ban administrativo', days: 7 }); loadData(); };
  const unbanUser = async (id: number) => { await api.adminUnbanUser(id); loadData(); };
  const saveUser = async () => {
    if (!editingUser) return;
    const { id_usuario, nombre, apellido, ubicacion } = editingUser;
    await api.adminUpdateUser(id_usuario, { nombre, apellido, ubicacion });
    setEditingUser(null);
    loadData();
  };

  const banONG = async (id: number) => { await api.adminBanONG(id, { reason: 'Ban administrativo', days: 7 }); loadData(); };
  const unbanONG = async (id: number) => { await api.adminUnbanONG(id); loadData(); };
  const saveONG = async () => {
    if (!editingONG) return;
    const { id_usuario, nombre, ubicacion } = editingONG;
    await api.adminUpdateONG(id_usuario, { nombre, ubicacion });
    setEditingONG(null);
    loadData();
  };

  // Filtro simple
  const filteredUsers = useMemo(() => users.filter(u => `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(query.toLowerCase())), [users, query]);
  const filteredONGs = useMemo(() => ongs.filter(o => `${o.nombre} ${o.email}`.toLowerCase().includes(query.toLowerCase())), [ongs, query]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]" data-admin>
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-fg)' }}>Admin • Demos+</h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Panel exclusivo para administradores</p>
          </div>
        </div>
        <button onClick={logout} className="px-3 py-2 rounded-md border flex items-center gap-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}>
          <LogOut className="w-4 h-4"/>Salir
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r min-h-[calc(100vh-64px)]" style={{ borderColor: 'var(--color-border)' }}>
          <nav className="p-4 space-y-2">
            <button onClick={() => setTab('comments')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='comments'?'bg-purple-600 text-white':'hover:bg-gray-100'}`}>
              <MessageSquare className="w-4 h-4"/> Comentarios
            </button>
            <button onClick={() => setTab('users')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='users'?'bg-purple-600 text-white':'hover:bg-gray-100'}`}>
              <Users className="w-4 h-4"/> Usuarios
            </button>
            <button onClick={() => setTab('ongs')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='ongs'?'bg-purple-600 text-white':'hover:bg-gray-100'}`}>
              <Building2 className="w-4 h-4"/> ONGs
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 space-y-4">
          {/* Buscador y Estado (solo comments, users, ongs) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tab === 'comments' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Estado:</span>
                  {(['pending','approved','rejected'] as const).map(s => (
                    <button key={s} onClick={() => setCommentStatus(s)} className={`px-3 py-1 rounded-full text-sm ${commentStatus===s?'bg-blue-600 text-white':'bg-gray-100'}`}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            {tab !== 'comments' && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="pl-9 pr-3 py-2 rounded-md border bg-transparent" style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }} />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            {loading ? (
              <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>
                <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
                Cargando...
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {tab === 'comments' && (
                  <div className="p-4 space-y-3">
                    {comments.length === 0 ? (
                      <div style={{ color: 'var(--color-muted)' }}>No hay comentarios.</div>
                    ) : comments.map(c => (
                      <div key={c.id_respuesta} className="p-4 rounded-md bg-gray-50 flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>#{c.id_respuesta} · Post {c.id_publicacion} · User {c.id_usuario}</div>
                          <div className="text-gray-900">{c.mensaje}</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{new Date(c.fecha_respuesta).toLocaleString()} · Estado: {c.moderation_status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingComment(c)} className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
                          <button onClick={() => moderate(c.id_respuesta, 'approved')} className="btn-primary px-3 py-2 flex items-center gap-1"><Check className="w-4 h-4"/>Aprobar</button>
                          <button onClick={() => moderate(c.id_respuesta, 'rejected')} className="px-3 py-2 rounded-md border border-red-300 text-red-600 flex items-center gap-1"><X className="w-4 h-4"/>Rechazar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'users' && (
                  <div className="p-4 space-y-3">
                    {filteredUsers.length === 0 ? (
                      <div style={{ color: 'var(--color-muted)' }}>No hay usuarios.</div>
                    ) : filteredUsers.map(u => (
                      <div key={u.id_usuario} className="p-4 bg-gray-50 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{u.nombre} {u.apellido} <span className="text-xs" style={{ color: 'var(--color-muted)' }}>(#{u.id_usuario})</span></div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{u.email} · {u.ubicacion || 'Sin ubicación'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingUser(u)} className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
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
                  <div className="p-4 space-y-3">
                    {filteredONGs.length === 0 ? (
                      <div style={{ color: 'var(--color-muted)' }}>No hay ONGs.</div>
                    ) : filteredONGs.map(o => (
                      <div key={o.id_usuario} className="p-4 bg-gray-50 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{o.nombre} <span className="text-xs" style={{ color: 'var(--color-muted)' }}>(#{o.id_usuario})</span></div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{o.email} · {o.ubicacion || 'Sin ubicación'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingONG(o)} className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
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
        </main>
      </div>

      {/* Modales */}
      {editingComment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Editar comentario #{editingComment.id_respuesta}</h3>
            <textarea className="w-full h-40 p-3 rounded border" value={editingComment.mensaje} onChange={e=>setEditingComment({ ...editingComment, mensaje: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={()=>setEditingComment(null)} className="px-3 py-2 rounded-md border">Cancelar</button>
              <button onClick={saveComment} className="btn-primary px-3 py-2 flex items-center gap-2"><Save className="w-4 h-4"/>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Editar usuario #{editingUser.id_usuario}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Nombre" value={editingUser.nombre||''} onChange={e=>setEditingUser({ ...editingUser, nombre: e.target.value })} />
              <input className="input-field" placeholder="Apellido" value={editingUser.apellido||''} onChange={e=>setEditingUser({ ...editingUser, apellido: e.target.value })} />
              <input className="col-span-2 input-field" placeholder="Ubicación" value={editingUser.ubicacion||''} onChange={e=>setEditingUser({ ...editingUser, ubicacion: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setEditingUser(null)} className="px-3 py-2 rounded-md border">Cancelar</button>
              <button onClick={saveUser} className="btn-primary px-3 py-2 flex items-center gap-2"><Save className="w-4 h-4"/>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {editingONG && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Editar ONG #{editingONG.id_usuario}</h3>
            <div className="grid grid-cols-1 gap-3">
              <input className="input-field" placeholder="Nombre" value={editingONG.nombre||''} onChange={e=>setEditingONG({ ...editingONG, nombre: e.target.value })} />
              <input className="input-field" placeholder="Ubicación" value={editingONG.ubicacion||''} onChange={e=>setEditingONG({ ...editingONG, ubicacion: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setEditingONG(null)} className="px-3 py-2 rounded-md border">Cancelar</button>
              <button onClick={saveONG} className="btn-primary px-3 py-2 flex items-center gap-2"><Save className="w-4 h-4"/>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
