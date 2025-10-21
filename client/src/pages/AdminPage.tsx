import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Shield, Users, MessageSquare, Ban, Check, X, Loader2, Edit3, LogOut, Search, Save, FileText, HandCoins, List, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'forum' | 'usuarios' | 'donations' | 'logs';

export default function AdminPage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role: number = (user as any)?.tipo_usuario ?? (user as any)?.id_tipo_usuario ?? 0;
  const isAdmin = role >= 3;

  // Estado UI
  const [tab, setTab] = useState<Tab>('forum');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forumMessages, setForumMessages] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [userType, setUserType] = useState<'all'|'user'|'ong'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Modales de edición
  const [editingUser, setEditingUser] = useState<any|null>(null);
  const [editingDonation, setEditingDonation] = useState<any|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{type: 'post'|'reply'|'subreply', id: number, authorId: number} | null>(null);
  const [confirmBan, setConfirmBan] = useState<{id: number, name: string} | null>(null);

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
  }, [tab, userType, query]);

  // Auto-refresh cada 30 segundos para el foro
  useEffect(() => {
    if (!isAdmin || tab !== 'forum') return;
    
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isAdmin]);

  const loadData = async () => {
    setError(null);
    try {
      setLoading(true);
      if (tab === 'forum') {
        const { posts } = await api.adminListForumMessages();
        setForumMessages(posts || []);
      } else if (tab === 'usuarios') {
        const { users } = await api.adminListUsersAll({ type: userType, q: query });
        setUsuarios(users || []);
      } else if (tab === 'donations') {
        const { donations } = await api.adminListDonations(query);
        setDonations(donations || []);
      } else if (tab === 'logs') {
        const { logs } = await api.adminGetLogs(200);
        setLogs(logs || []);
      }
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Error cargando datos del admin:', e);
      setError('Ocurrió un error al cargar datos. Intentá recargar.');
    } finally { setLoading(false); }
  };

  // Acciones de moderación del foro
  const deleteMessage = async () => {
    if (!confirmDelete) return;
    try {
      await api.adminDeleteForumMessage(confirmDelete.type, confirmDelete.id, confirmDelete.authorId);
      setConfirmDelete(null);
      loadData();
    } catch (e) {
      console.error('Error borrando mensaje:', e);
      setError('No se pudo borrar el mensaje.');
    }
  };

  const banUserPermanent = async () => {
    if (!confirmBan) return;
    try {
      await api.adminBanUser(confirmBan.id, { reason: 'Ban permanente por administrador', permanent: true });
      setConfirmBan(null);
      loadData();
    } catch (e) {
      console.error('Error baneando usuario:', e);
      setError('No se pudo banear al usuario.');
    }
  };

  const banUser = async (id: number) => { 
    try { 
      await api.adminBanUser(id, { reason: 'Ban temporal por administrador', days: 7 }); 
      loadData(); 
    } catch (e) { 
      console.error('Error baneando usuario:', e); 
      setError('No se pudo banear al usuario.'); 
    } 
  };
  const unbanUser = async (id: number) => { 
    try { 
      await api.adminUnbanUser(id); 
      loadData(); 
    } catch (e) { 
      console.error('Error desbaneando usuario:', e); 
      setError('No se pudo desbanear al usuario.'); 
    } 
  };
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
            <button onClick={() => setTab('forum')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='forum'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <MessageSquare className="w-4 h-4"/> Foro
            </button>
            <button onClick={() => setTab('usuarios')} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${tab==='usuarios'?'bg-purple-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Users className="w-4 h-4"/> Usuarios
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
          {/* Buscador y Estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {tab === 'usuarios' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tipo:</span>
                  {(['all','user','ong'] as const).map(t => (
                    <button key={t} onClick={() => setUserType(t)} className={`px-3 py-1 rounded-full text-sm ${userType===t?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-800'}`}>{t === 'all' ? 'Todos' : t === 'user' ? 'Usuarios' : 'ONGs'}</button>
                  ))}
                </div>
              )}
              {/* Indicador de última actualización */}
              {tab === 'forum' && lastUpdate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Última actualización: {lastUpdate.toLocaleTimeString('es-AR')}
                  <span className="ml-2 text-gray-400">• Auto-refresh cada 30s</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Botón de recarga */}
              <button 
                onClick={() => loadData()} 
                disabled={loading}
                className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Recargar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Recargar</span>
              </button>
              
              {(tab === 'forum' || tab === 'usuarios' || tab === 'donations') && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent" />
                </div>
              )}
            </div>
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
                {tab === 'forum' && (
                  <div className="p-4 space-y-4">
                    {forumMessages.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400">No hay mensajes en el foro.</div>
                    ) : forumMessages.map(post => (
                      <div key={post.id_publicacion} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        {/* Anuncio/Post principal */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-blue-700 dark:text-blue-300">ANUNCIO</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">#{post.id_publicacion}</span>
                              </div>
                              <h3 className="font-bold text-lg mb-1">{post.titulo}</h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{post.descripcion_publicacion}</p>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Por: {post.usuario?.nombre || post.usuario?.email || `User #${post.id_usuario}`} · {new Date(post.fecha_publicacion).toLocaleString()}
                              </div>
                            </div>
                            <button 
                              onClick={() => setConfirmDelete({type: 'post', id: post.id_publicacion, authorId: post.id_usuario})} 
                              className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 flex-shrink-0"
                            >
                              <X className="w-4 h-4"/>Borrar
                            </button>
                          </div>
                        </div>

                        {/* Respuestas */}
                        {post.respuestas && post.respuestas.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {post.respuestas.map((reply: any) => (
                              <div key={reply.id_respuesta} className="space-y-2">
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-green-600 dark:text-green-400">RESPUESTA</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">#{reply.id_respuesta}</span>
                                      </div>
                                      <p className="text-sm mb-1">{reply.mensaje}</p>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Por: {reply.usuario?.nombre || reply.usuario?.email || `User #${reply.id_usuario}`} · {new Date(reply.fecha_respuesta).toLocaleString()}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => setConfirmDelete({type: 'reply', id: reply.id_respuesta, authorId: reply.id_usuario})} 
                                      className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 text-sm flex-shrink-0"
                                    >
                                      <X className="w-3 h-3"/>Borrar
                                    </button>
                                  </div>
                                </div>

                                {/* Subrespuestas (respuestasHijas) */}
                                {reply.respuestasHijas && reply.respuestasHijas.length > 0 && (
                                  <div className="ml-6 space-y-2">
                                    {reply.respuestasHijas.map((subreply: any) => (
                                      <div key={subreply.id_respuesta} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-purple-600 dark:text-purple-400">SUBRESPUESTA</span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">#{subreply.id_respuesta}</span>
                                            </div>
                                            <p className="text-sm mb-1">{subreply.mensaje}</p>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              Por: {subreply.usuario?.nombre || subreply.usuario?.email || `User #${subreply.id_usuario}`} · {new Date(subreply.fecha_respuesta).toLocaleString()}
                                            </div>
                                          </div>
                                          <button 
                                            onClick={() => setConfirmDelete({type: 'reply', id: subreply.id_respuesta, authorId: subreply.id_usuario})} 
                                            className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 text-sm flex-shrink-0"
                                          >
                                            <X className="w-3 h-3"/>Borrar
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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
                            <>
                              <button onClick={() => banUser(u.id_usuario)} className="px-3 py-2 rounded-md border border-orange-300 text-orange-600 flex items-center gap-1"><Ban className="w-4 h-4"/>Ban 7d</button>
                              <button onClick={() => setConfirmBan({id: u.id_usuario, name: `${u.nombre} ${u.apellido}`})} className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"><Ban className="w-4 h-4"/>Ban Permanente</button>
                            </>
                          )}
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
      {/* Modal de confirmación de borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar borrado</h3>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas borrar este {confirmDelete.type === 'post' ? 'anuncio' : 'respuesta'}?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se enviará una notificación al autor informándole que su mensaje fue eliminado por los administradores.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmDelete(null)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
              <button onClick={deleteMessage} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
                <X className="w-4 h-4"/>Borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de baneo permanente */}
      {confirmBan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">⚠️ Baneo Permanente</h3>
            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas banear permanentemente a <strong>{confirmBan.name}</strong>?
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Esta acción:</strong>
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside mt-2 space-y-1">
                <li>Cerrará automáticamente su sesión</li>
                <li>No podrá iniciar sesión nuevamente</li>
                <li>Es permanente y requiere intervención manual para revertir</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmBan(null)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
              <button onClick={banUserPermanent} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
                <Ban className="w-4 h-4"/>Banear Permanentemente
              </button>
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
