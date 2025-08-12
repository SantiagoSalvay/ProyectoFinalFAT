import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validar longitud mínima y complejidad
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nuevaContrasena: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Contraseña actualizada exitosamente');
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Ocurrió un error al actualizar la contraseña');
        toast.error('Error al actualizar contraseña');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                <Check className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">Redirigiendo al login en unos segundos...</p>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir al login ahora
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al login
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nueva Contraseña
          </h2>
          <p className="text-gray-600">
            Ingresa tu nueva contraseña para completar la recuperación.
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className="mr-1">{password.length >= 8 ? '✓' : '○'}</span>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center ${/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className="mr-1">{/(?=.*[a-z])/.test(password) ? '✓' : '○'}</span>
                    Una letra minúscula
                  </div>
                  <div className={`flex items-center ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className="mr-1">{/(?=.*[A-Z])/.test(password) ? '✓' : '○'}</span>
                    Una letra mayúscula
                  </div>
                  <div className={`flex items-center ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className="mr-1">{/(?=.*\d)/.test(password) ? '✓' : '○'}</span>
                    Un número
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-purple-600 hover:text-purple-700">
                Volver al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}