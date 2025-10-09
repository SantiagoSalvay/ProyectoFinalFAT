import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Shield, Users, MessageSquare, Ban, Check, X, Loader2, Edit3, LogOut, Search, Save, FileText, HandCoins, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'comments' | 'usuarios' | 'posts' | 'donations' | 'logs';

export default function AdminPage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role: number = (user as any)?.tipo_usuario ?? (user as any)?.id_tipo_usuario ?? 0;
  const isAdmin = role >= 3;

  // Estado UI
  const [tab, setTab] = useState<Tab>('comments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [commentStatus, setCommentStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [query, setQuery] = useState('');
  const [userType, setUserType] = useState<'all'|'user'|'ong'>('all');

  // Modales de edición
  const [editingUser, setEditingUser] = useState<any|null>(null);
  const [editingComment, setEditingComment] = useState<any|null>(null);
  const [editingPost, setEditingPost] = useState<any|null>(null);
  const [editingDonation, setEditingDonation] = useState<any|null>(null);

  useEffect(() => {
    // Evitar redirecciones hasta que termine la carga de auth
    if (!isLoading && isAuthenticated && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, commentStatus, userType, query]);

  const loadData = async () => {
    setError(null);
    try {
      setLoading(true);
      if (tab === 'comments') {
        const { comentarios } = await api.adminListComments(commentStatus);
        setComments(comentarios || []);
      } else if (tab === 'usuarios') {
        const { users } = await api.adminListUsersAll({ type: userType, q: query });
        setUsuarios(users || []);
      } else if (tab === 'posts') {
        const { posts } = await api.adminListPosts(query);
        setPosts(posts || []);
      } else if (tab === 'donations') {
        const { donations } = await api.adminListDonations(query);
        setDonations(donations || []);
      } else if (tab === 'logs') {
        const { logs } = await api.adminGetLogs(200);
        setLogs(logs || []);
      }
    } catch (e) {
      console.error('Error cargando datos del admin:', e);
      setError('Ocurrió un error al cargar datos. Intentá recargar.');
    } finally { setLoading(false); }
  };

  // Acciones
  const moderate = async (id: number, status: 'approved'|'rejected') => {
    try {
      await api.adminUpdateComment(id, { moderation_status: status, rejection_reason: status === 'rejected' ? 'Contenido inapropiado' : undefined });
      loadData();
    } catch (e) {
      console.error('Error moderando comentario:', e);
      setError('No se pudo actualizar el comentario.');
    }
  };
  const saveComment = async () => {
    if (!editingComment) return;
    try {
      await api.adminUpdateComment(editingComment.id_respuesta, { mensaje: editingComment.mensaje });
      setEditingComment(null);
      loadData();
    } catch (e) {
      console.error('Error guardando comentario:', e);
      setError('No se pudo guardar el comentario.');
    }
  };

  const banUser = async (id: number) => { try { await api.adminBanUser(id, { reason: 'Ban administrativo', days: 7 }); loadData(); } catch (e) { console.error('Error baneando usuario:', e); setError('No se pudo banear al usuario.'); } };
  const unbanUser = async (id: number) => { try { await api.adminUnbanUser(id); loadData(); } catch (e) { console.error('Error desbaneando usuario:', e); setError('No se pudo desbanear al usuario.'); } };
  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const { id_usuario, nombre, apellido, ubicacion } = editingUser;
      await api.adminUpdateUser(id_usuario, { nombre, apellido, ubicacion });
      setEditingUser(null);
      loadData();
    } catch (e) {
      console.error('Error guardando usuario:', e);
      setError('No se pudo guardar el usuario.');
    }
  };

  // Posts
  const savePost = async () => {
    if (!editingPost) return;
    try {
      const { id_publicacion, titulo, descripcion_publicacion } = editingPost;
      await api.adminUpdatePost(id_publicacion, { titulo, descripcion_publicacion });
      setEditingPost(null);
      loadData();
    } catch (e) {
      console.error('Error guardando post:', e);
      setError('No se pudo guardar el post.');
    }
  };
  const moderatePost = async (id_publicacion: number) => {
    try {
      await api.adminUpdatePost(id_publicacion, { moderate: true, reason: 'Contenido moderado por admin' });
      loadData();
    } catch (e) {
      console.error('Error moderando post:', e);
      setError('No se pudo moderar el post.');
    }
  };

  // Donations
  const saveDonation = async () => {
    if (!editingDonation) return;
    try {
      const { id_pedido, cantidad, horas_donadas, puntos_otorgados } = editingDonation;
      await api.adminUpdateDonation(id_pedido, { cantidad, horas_donadas, puntos_otorgados });
      setEditingDonation(null);
      loadData();
    } catch (e) {
      console.error('Error guardando donación:', e);
      setError('No se pudo guardar la donación.');
    }
  };
  const flagDonation = async (id_pedido: number) => {
    try {
      await api.adminFlagDonation(id_pedido, 'Exceso de donación');
      loadData();
    } catch (e) {
      console.error('Error marcando exceso:', e);
      setError('No se pudo registrar el exceso.');
    }
  };

  // Filtro simple
  const filteredUsuarios = useMemo(() => usuarios, [usuarios]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100" data-admin>
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin • Demos+</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Panel exclusivo para administradores</p>
          </div>
        </div>
        <button onClick={logout} className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <LogOut className="w-4 h-4"/>Salir
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            <button onClick={() => setTab('comments')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='comments'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <MessageSquare className="w-4 h-4"/> Comentarios
            </button>
            <button onClick={() => setTab('usuarios')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='usuarios'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Users className="w-4 h-4"/> Usuarios
            </button>
            <button onClick={() => setTab('posts')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='posts'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <FileText className="w-4 h-4"/> Posts
            </button>
            <button onClick={() => setTab('donations')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='donations'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <HandCoins className="w-4 h-4"/> Donaciones
            </button>
            <button onClick={() => setTab('logs')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='logs'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <List className="w-4 h-4"/> Logs
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 space-y-4">
          {/* Buscador y Estado (solo comments, users, ongs) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {tab === 'comments' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
                  {(['pending','approved','rejected'] as const).map(s => (
                    <button key={s} onClick={() => setCommentStatus(s)} className={`px-3 py-1 rounded-full text-sm ${commentStatus===s?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800'}`}>{s}</button>
                  ))}
                </div>
              )}
              {tab === 'usuarios' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tipo:</span>
                  {(['all','user','ong'] as const).map(t => (
                    <button key={t} onClick={() => setUserType(t)} className={`px-3 py-1 rounded-full text-sm ${userType===t?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800'}`}>{t === 'all' ? 'Todos' : t === 'user' ? 'Usuarios' : 'ONGs'}</button>
                  ))}
                </div>
              )}
            </div>
            {(tab === 'usuarios' || tab === 'posts' || tab === 'donations') && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent" />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
                Cargando...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                {error}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {tab === 'comments' && (
                  <div className="p-4 space-y-3">
                    {comments.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No hay comentarios.</div>
                    ) : comments.map(c => (
                      <div key={c.id_respuesta} className="p-4 rounded-md bg-gray-50 dark:bg-gray-800 flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">#{c.id_respuesta} · Post {c.id_publicacion} · User {c.id_usuario}</div>
                          <div>{c.mensaje}</div>
                          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{new Date(c.fecha_respuesta).toLocaleString()} · Estado: {c.moderation_status}</div>
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

                {tab === 'usuarios' && (
                  <div className="p-4 space-y-3">
                    {filteredUsuarios.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No hay usuarios.</div>
                    ) : filteredUsuarios.map(u => (
                      <div key={u.id_usuario} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{u.nombre} {u.apellido} <span className="text-xs text-gray-500 dark:text-gray-400">(#{u.id_usuario})</span></div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{u.email} · {u.ubicacion || 'Sin ubicación'} · <span className="uppercase">{u.tipo}</span></div>
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

                {tab === 'posts' && (
                  <div className="p-4 space-y-3">
                    {posts.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No hay posts.</div>
                    ) : posts.map(p => (
                      <div key={p.id_publicacion} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.titulo} <span className="text-xs text-gray-500 dark:text-gray-400">(#{p.id_publicacion})</span></div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Autor: {p.usuario?.email || p.id_usuario} · {new Date(p.fecha_publicacion).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingPost(p)} className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
                          <button onClick={() => moderatePost(p.id_publicacion)} className="px-3 py-2 rounded-md border border-red-300 text-red-600 flex items-center gap-1"><X className="w-4 h-4"/>Sensurar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'donations' && (
                  <div className="p-4 space-y-3">
                    {donations.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No hay donaciones.</div>
                    ) : donations.map(d => (
                      <div key={d.id_pedido} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{d.tipoDonacion?.tipo_donacion || 'Donación'} <span className="text-xs text-gray-500 dark:text-gray-400">(#{d.id_pedido})</span></div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{d.usuario?.email} · Cant: {d.cantidad ?? '-'} · Horas: {d.horas_donadas ?? '-'} · Puntos: {d.puntos_otorgados ?? '-'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingDonation(d)} className="px-3 py-2 rounded-md border flex items-center gap-1"><Edit3 className="w-4 h-4"/>Editar</button>
                          <button onClick={() => flagDonation(d.id_pedido)} className="px-3 py-2 rounded-md border border-red-300 text-red-600 flex items-center gap-1"><Ban className="w-4 h-4"/>Marcar exceso</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'logs' && (
                  <div className="p-4 space-y-2">
                    {logs.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No hay logs.</div>
                    ) : logs.map((l, idx) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-xs text-gray-400 mr-2">{l.ts}</span>
                        <span className="font-medium">{l.action}</span>
                        <span className="ml-2">actor: {l.actor}</span>
                        {l.target && <span className="ml-2">target: {l.target.type}#{l.target.id}</span>}
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

      {/* Modal ONG eliminado (no se usa en vista combinada) */}
    </div>
  );
}
