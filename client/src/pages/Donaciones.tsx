import Header from '../components/Header';
import { useState, useEffect } from 'react';

export default function Donaciones() {
  const [ongs, setOngs] = useState<{ id: string; name: string }[]>([]);
  const [selectedOng, setSelectedOng] = useState('');
  const [price, setPrice] = useState('');
  const [donationType, setDonationType] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initPoint, setInitPoint] = useState('');
  const quantity = 1;

  // Estado para error de carga de ONGs solo al intentar buscar en el mapa
  const [ongsError, setOngsError] = useState(false);
  useEffect(() => {
    fetch('http://localhost:3001/ongs')
      .then(res => res.json())
      .then(data => {
        setOngs(data);
        if (data.length > 0) setSelectedOng(data[0].id);
        else setOngsError(true);
      })
      .catch(() => {
        setOngs([]);
        setOngsError(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInitPoint('');
    if (donationType === 'dinero') {
      const cleanedPrice = price.replace(',', '.').replace(/[^\\d.]/g, '');
      const parsedPrice = Number(cleanedPrice);
      if (
        isNaN(parsedPrice) ||
        parsedPrice <= 0 ||
        !/^\\d{1,}(\\.|,)?\\d{0,2}$/.test(price)
      ) {
        setError('Ingrese un monto válido.');
        setLoading(false);
        return;
      }
      if (!selectedOng) {
        setError('Seleccione una ONG.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:3001/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: `Donación a ${ongs.find(o => o.id === selectedOng)?.name || ''}`, price: parsedPrice, quantity, ongId: selectedOng })
        });
        const data = await res.json();
        if (data.init_point) {
          setInitPoint(data.init_point);
        } else {
          setError('No se pudo generar el link de pago.');
        }
      } catch (err) {
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    } else if (donationType === 'otros') {
      if (!otherDescription.trim()) {
        setError('Por favor ingresa una descripción para tu donación.');
        setLoading(false);
        return;
      }
      alert('¡Gracias por tu donación! Descripción: ' + otherDescription);
      setLoading(false);
    }
  };

  // Mostrar pantalla de error solo si el usuario intenta buscar en el mapa y no hay ONGs
  if (ongsError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-emerald-50">
        <Header />
        <main className="flex flex-col items-center justify-center py-16 px-4 flex-1">
          <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Ha ocurrido un error</h1>
            <p className="text-gray-700 mb-6">No se pudieron cargar las ONGs. Por favor, vuelva a intentarlo más tarde.</p>
            <button className="btn-primary mt-4" onClick={() => setOngsError(false)}>Volver a donaciones</button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <Header />
      <main className="flex flex-col items-center justify-center py-16 px-4 flex-1">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-4">Donaciones</h1>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <select
              className="input-field w-full"
              value={donationType}
              onChange={e => setDonationType(e.target.value)}
              required
            >
              <option value="" disabled>Elegir qué donar</option>
              <option value="dinero">Dinero</option>
              <option value="ropa">Ropa</option>
              <option value="juguetes">Juguetes</option>
              <option value="comida">Comida</option>
              <option value="muebles">Muebles</option>
              <option value="otros">Otros</option>
            </select>
            <select
              className="input-field w-full"
              value={selectedOng}
              onChange={e => setSelectedOng(e.target.value)}
            >
              {ongs.length === 0 && <option value="">Cargando ONGs...</option>}
              {ongs.map(ong => (
                <option key={ong.id} value={ong.id}>{ong.name}</option>
              ))}
            </select>
            {donationType === 'dinero' && (
              <>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^\d{1,}(\.|,)?\d{0,2}$"
                  className="input-field w-full"
                  value={price}
                  onChange={e => {
                    // Permitir solo números y hasta dos decimales
                    let val = e.target.value.replace(/,/g, '.');
                    if (/^\d*(\.?\d{0,2})?$/.test(val)) setPrice(val);
                  }}
                  placeholder="Cantidad a donar"
                  required
                />
                <div className="text-left text-gray-500 mb-2">
                  {price === '' ? '' : `Monto: $${price.replace('.', ',')}`}
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Generando link...' : 'Donar con MercadoPago'}
                </button>
              </>
            )}
            {donationType && donationType !== 'dinero' && donationType !== 'otros' && (
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  if (ongs.length === 0) {
                    setOngsError(true);
                  } else {
                    window.location.href = '/app/mapa';
                  }
                }}
              >
                Buscar la ONG en el mapa
              </button>
            )}
            {donationType === 'otros' && (
              <>
                <textarea
                  className="input-field w-full"
                  placeholder="Describe lo que deseas donar"
                  value={otherDescription}
                  onChange={e => setOtherDescription(e.target.value)}
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar descripción'}
                </button>
              </>
            )}
          </form>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {initPoint && (
            <a
              href={initPoint}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full inline-block"
            >
              Ir a MercadoPago
            </a>
          )}
        </div>
      </main>
    </div>
  );
}