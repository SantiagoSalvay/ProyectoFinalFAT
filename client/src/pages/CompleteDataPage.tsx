import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const GROUP_OPTIONS = [
  'Niños',
  'Gente mayor',
  'Mujeres',
  'Animales',
  'Personas con discapacidad',
  'Familias',
  'Otros',
];

const NEED_OPTIONS = [
  'Dinero',
  'Ropa',
  'Juguetes',
  'Comida',
  'Muebles',
  'Otros',
];

export default function CompleteDataPage() {
  const [group, setGroup] = useState('');
  const [need, setNeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!group || !need) {
      setError('Debes seleccionar un grupo social y una necesidad.');
      return;
    }
    setLoading(true);
    try {
      await api.saveTipoONG({ grupo_social: group, necesidad: need });
      navigate('/dashboard');
    } catch (err) {
      setError('Error al guardar los datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-purple-50">
      <form className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Completa tus datos de ONG</h2>
        <p className="mb-6 text-gray-600">Selecciona el grupo social y la necesidad principal de tu organización.</p>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Grupo social</label>
          <select value={group} onChange={e => setGroup(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Selecciona...</option>
            {GROUP_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Necesidad</label>
          <select value={need} onChange={e => setNeed(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Selecciona...</option>
            {NEED_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 transition-colors" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar datos'}
        </button>
      </form>
    </div>
  );
}
