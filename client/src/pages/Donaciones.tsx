import React from 'react'
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { api, ONG } from '../services/api';

export default function Donaciones() {
  const [ongs, setOngs] = useState<{ id: string; name: string }[]>([]);
  const [selectedOng, setSelectedOng] = useState('');
  const [price, setPrice] = useState('');
  const [donationType, setDonationType] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initPoint, setInitPoint] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userToken, setUserToken] = useState('');
  const quantity = 1;

  // Estado para error de carga de ONGs solo al intentar buscar en el mapa
  const [ongsError, setOngsError] = useState(false);
  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUserToken(token);
    }

    setOngsError(false);
    api.getONGs()
      .then((response) => {
        const mapped = response.ongs.map(ong => ({
          id: String(ong.id),
          name: ong.name
        }));
        setOngs(mapped);
        if (mapped.length > 0) setSelectedOng(mapped[0].id);
      })
      .catch(() => {
        setOngs([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setInitPoint('');

    // Verificar autenticación para donaciones monetarias
    if (donationType === 'dinero' && !isAuthenticated) {
      setError('Debes iniciar sesión para realizar donaciones monetarias.');
      setLoading(false);
      return;
    }

    if (donationType === 'dinero') {
      const cleanedPrice = price.replace(',', '.').replace(/[^\d.]/g, '');
      const parsedPrice = Number(cleanedPrice);
      
      // Validaciones mejoradas
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError('Ingrese un monto válido mayor a $0.');
        setLoading(false);
        return;
      }
      
      if (parsedPrice < 1) {
        setError('El monto mínimo de donación es $1.');
        setLoading(false);
        return;
      }
      
      if (parsedPrice > 100000) {
        setError('El monto máximo de donación es $100,000.');
        setLoading(false);
        return;
      }
      
      if (!/^\d{1,}(\.?\d{0,2})?$/.test(price)) {
        setError('Formato de monto inválido. Use números con máximo 2 decimales.');
        setLoading(false);
        return;
      }
      
      if (!selectedOng) {
        setError('Seleccione una ONG.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/mercadopago/create-preference', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ 
            description: `Donación a ${ongs.find(o => o.id === selectedOng)?.name || ''}`, 
            price: parsedPrice, 
            quantity, 
            ongId: selectedOng,
            amount: parsedPrice
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.init_point) {
          setInitPoint(data.init_point);
          setSuccess('¡Link de pago generado exitosamente! Haz clic en "Ir a MercadoPago" para completar tu donación.');
        } else {
          setError(data.error || 'No se pudo generar el link de pago.');
        }
      } catch (err) {
        setError('Error al conectar con el servidor. Verifica tu conexión e intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    } else if (donationType === 'otros') {
      if (!otherDescription.trim()) {
        setError('Por favor ingresa una descripción para tu donación.');
        setLoading(false);
        return;
      }
      
      if (otherDescription.trim().length < 10) {
        setError('La descripción debe tener al menos 10 caracteres.');
        setLoading(false);
        return;
      }
      
      setSuccess('¡Gracias por tu donación! Tu descripción ha sido registrada: ' + otherDescription);
      setLoading(false);
    }
  };

  // Mostrar pantalla de error solo si el usuario intenta buscar en el mapa y no hay ONGs
  if (ongsError) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header />
        <main className="flex flex-col items-center justify-center py-16 px-4 flex-1">
          <div className="max-w-xl w-full rounded-lg shadow-lg p-8 text-center" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-fg)' }}>Ha ocurrido un error</h1>
            <p className="mb-6" style={{ color: 'var(--color-muted)' }}>No se pudieron cargar las ONGs. Por favor, vuelva a intentarlo más tarde.</p>
            <button className="btn-primary mt-4" onClick={() => {
              setOngsError(false);
            }}>Volver a donaciones</button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="flex flex-col items-center justify-center py-16 px-4 flex-1">
        <div className="max-w-2xl w-full rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>Donaciones</h1>
            <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
              Ayuda a las organizaciones sin fines de lucro a continuar su labor social
            </p>
          </div>

          {!isAuthenticated && (
            <div className="mb-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
              <p className="text-sm" style={{ color: '#92400e' }}>
                <strong>Nota:</strong> Para realizar donaciones monetarias necesitas iniciar sesión. 
                <a href="/login" className="underline ml-1">Iniciar sesión</a>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
                ¿Qué tipo de donación deseas realizar?
              </label>
              <select
                className="input-field w-full text-lg"
                value={donationType}
                onChange={e => {
                  setDonationType(e.target.value);
                  setError('');
                  setSuccess('');
                  setInitPoint('');
                }}
                required
              >
                <option value="" disabled>Selecciona el tipo de donación</option>
                <option value="dinero">Dinero (MercadoPago)</option>
                <option value="ropa">Ropa</option>
                <option value="juguetes">Juguetes</option>
                <option value="comida">Comida</option>
                <option value="muebles">Muebles</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
                Selecciona la ONG beneficiaria
              </label>
              <select
                className="input-field w-full text-lg"
                value={selectedOng}
                onChange={e => setSelectedOng(e.target.value)}
              >
                {ongs.length === 0 && <option value="">Cargando ONGs...</option>}
                {ongs.map(ong => (
                  <option key={ong.id} value={ong.id}>{ong.name}</option>
                ))}
              </select>
            </div>

            {donationType === 'dinero' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
                    Monto a donar (ARS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-semibold" style={{ color: 'var(--color-muted)' }}>
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="input-field w-full pl-8 text-lg"
                      value={price}
                      onChange={e => {
                        let val = e.target.value.replace(/,/g, '.');
                        if (/^\d*(\.?\d{0,2})?$/.test(val)) setPrice(val);
                      }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                    {price && `Monto: $${parseFloat(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 500, 1000, 2000, 5000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      className="p-2 text-sm border rounded hover:bg-gray-100"
                      style={{ borderColor: 'var(--color-border)' }}
                      onClick={() => setPrice(amount.toString())}
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full text-lg py-3"
                  disabled={loading || !isAuthenticated}
                >
                  {loading ? '⏳ Generando link de pago...' : 'Donar con MercadoPago'}
                </button>
              </div>
            )}

            {donationType && donationType !== 'dinero' && donationType !== 'otros' && (
              <div className="text-center">
                <p className="mb-4" style={{ color: 'var(--color-muted)' }}>
                  Para donaciones de {donationType}, puedes encontrar la ONG en el mapa y coordinar la entrega
                </p>
                <button
                  type="button"
                  className="btn-primary w-full text-lg py-3"
                  onClick={() => {
                    if (ongs.length === 0) {
                      setOngsError(true);
                    } else {
                      window.location.href = '/app/mapa';
                    }
                  }}
                >
                  🗺️ Buscar ONG en el mapa
                </button>
              </div>
            )}

            {donationType === 'otros' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
                    Describe lo que deseas donar
                  </label>
                  <textarea
                    className="input-field w-full"
                    placeholder="Ej: Libros usados en buen estado, ropa de invierno para niños, etc."
                    value={otherDescription}
                    onChange={e => setOtherDescription(e.target.value)}
                    rows={4}
                    required
                  />
                  <div className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                    {otherDescription.length}/500 caracteres
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full text-lg py-3"
                  disabled={loading}
                >
                  {loading ? '⏳ Enviando...' : '📤 Enviar descripción'}
                </button>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444' }}>
              <p className="text-sm" style={{ color: '#dc2626' }}>❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#f0fdf4', borderColor: '#22c55e' }}>
              <p className="text-sm" style={{ color: '#16a34a' }}>✅ {success}</p>
            </div>
          )}

          {initPoint && (
            <div className="mt-6">
              <a
                href={initPoint}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full inline-block text-center text-lg py-3"
                style={{ backgroundColor: '#00a650', borderColor: '#00a650' }}
              >
                Ir a MercadoPago para completar el pago
              </a>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-muted)' }}>
                Serás redirigido a MercadoPago para completar tu donación de forma segura
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}