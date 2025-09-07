import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// ...sin integración Google Maps...
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { User, Building, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Map } from 'lucide-react';
import { UserRole } from '../contexts/AuthContext'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
  organization?: string
  location: string
}

export default function RegisterPage() {
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Función para obtener dirección inversa desde coordenadas
  const fetchReverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || '';
        const houseNumber = data.address.house_number || '';
        const suburb = data.address.suburb || data.address.neighbourhood || '';
        const city = data.address.city || data.address.town || data.address.village || '';
        let result = road;
        if (houseNumber) result += ` ${houseNumber}`;
        if (suburb) result += `, ${suburb}`;
        if (city) result += `, ${city}`;
        return result;
      }
      return `${lat}, ${lon}`;
    } catch {
      return `${lat}, ${lon}`;
    }
  };

  // Componente para seleccionar punto en el mapa
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return selectedPosition ? (
      <Marker position={selectedPosition} />
    ) : null;
  }
  // Autocompletado de ubicación con LocationIQ
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationInput, setLocationInput] = useState('')

  // Usar la variable de entorno VITE_LOCATIONIQ_API_KEY
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY

  // Debounce para evitar rate limit
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (!locationInput || locationInput.length < 3) {
        setLocationSuggestions([])
        return
      }
      setLocationLoading(true)
  fetch(`https://us1.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(locationInput)}&limit=8&countrycodes=ar`)
        .then(async res => {
          if (!res.ok) {
            console.error('Error en la respuesta de LocationIQ:', res.status, await res.text())
            setLocationSuggestions([])
            return []
          }
          return res.json()
        })
        .then(data => {
          if (!Array.isArray(data)) {
            console.error('Respuesta inesperada de LocationIQ:', data)
            setLocationSuggestions([])
            return
          }
          // Mostrar sugerencias en formato 'calle número, Córdoba' o display_name
          const filtered = data.filter((item: any) => {
            // Solo resultados que mencionen Córdoba en algún campo relevante
            return (
              (item.address && (
                (item.address.city && item.address.city.toLowerCase().includes('córdoba')) ||
                (item.address.state && item.address.state.toLowerCase().includes('córdoba')) ||
                (item.display_name && item.display_name.toLowerCase().includes('córdoba'))
              ))
            );
          });
          setLocationSuggestions(filtered.map((item: any) => {
            const road = item.address?.road || item.address?.name || '';
            const houseNumber = item.address?.house_number || '';
            if (road && houseNumber) {
              return `${road} ${houseNumber}, Córdoba`;
            }
            if (road) {
              return `${road}, Córdoba`;
            }
            return item.display_name;
          }));
        })
        .catch((err) => {
          console.error('Error al consultar LocationIQ:', err)
          setLocationSuggestions([])
        })
        .finally(() => setLocationLoading(false))
    }, 600)
    return () => clearTimeout(handler)
  }, [locationInput])
  const [selectedRole, setSelectedRole] = useState<UserRole>('person')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  // ...sin integración Google Maps...
  const { register: registerUser, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    try {
      // Determinar tipo_usuario y datos según el tipo seleccionado
      let tipo_usuario = 1;
      let firstName = data.firstName;
      let lastName = data.lastName;
      let organization = data.organization;
      
      if (selectedRole === 'ong') {
        tipo_usuario = 2;
        // Para ONG, el nombre de la organización va en firstName y el nombre legal en organization
        firstName = data.firstName;
        lastName = ''; // Las ONGs no tienen apellido
        organization = data.organization || '';
      }
      
      const response = await registerUser({
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        role: selectedRole,
        organization,
        location: data.location,
        tipo_usuario,
      });
      // Si requiere verificación, mostrar mensaje
      if (response?.requiresVerification) {
        setUserEmail(data.email);
        setShowVerificationMessage(true);
        return;
      }
      // Si no requiere verificación (flujo anterior)
      toast.success('¡Registro exitoso! Bienvenido a Demos+')
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al registrarse. Inténtalo de nuevo.');
    }
  }

  // Si se mostró el mensaje de verificación, renderizar esa pantalla
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Revisa tu correo!</h2>
              <p className="text-gray-600 text-sm">
                Te hemos enviado un correo de verificación a <strong className="text-purple-600">{userEmail}</strong>
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-emerald-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Haz clic en el enlace del correo para verificar tu cuenta y completar el registro. 
                Una vez verificado, podrás iniciar sesión automáticamente.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowVerificationMessage(false)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Intentar de nuevo
              </button>
              <Link 
                to="/login"
                className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors text-center"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Únete a Demos+
          </h2>
          <p className="text-gray-600">
            Crea tu cuenta y comienza a hacer la diferencia
          </p>
        </div>

        <div className="card p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cómo quieres participar?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('person')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'person'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Persona</div>
                <div className="text-xs text-gray-500">Donar o hacer voluntariado</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedRole('ong')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'ong'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">ONG</div>
                <div className="text-xs text-gray-500">Organización sin fines de lucro</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields - Only for Person */}
            {selectedRole === 'person' ? (
              <>
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'El nombre es requerido' })}
                    className="input-field"
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'El apellido es requerido' })}
                    className="input-field"
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </>
            ) : (
              /* Organization Name - Only for ONG */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la organización
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'El nombre de la organización es requerido' })}
                  className="input-field"
                  placeholder="Nombre de la ONG"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
            )}

            {/* Organization (only for ONG) */}
            {selectedRole === 'ong' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre legal de la organización
                </label>
                <input
                  type="text"
                  {...register('organization')}
                  className="input-field"
                  placeholder="Nombre legal completo"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className="input-field"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={e => {
                    setLocationInput(e.target.value)
                    setValue('location', e.target.value)
                  }}
                  className="input-field flex-1"
                  placeholder="Calle y numeración en Córdoba"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="p-2 rounded bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center justify-center"
                  title="Ubicarte en el mapa"
                  onClick={() => setShowMapModal(true)}
                >
                  <Map className="w-5 h-5 text-purple-700" />
                </button>
              </div>
              {/* Modal del mapa para seleccionar ubicación */}
              {showMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-lg relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowMapModal(false)}
                    >
                      Cerrar
                    </button>
                    <h3 className="text-lg font-semibold mb-2">Selecciona tu ubicación en el mapa</h3>
                    <MapContainer center={[-31.4167, -64.1833]} zoom={13} style={{ height: '350px', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker />
                    </MapContainer>
                    <div className="mt-4 flex justify-end">
                      <button
                        className="btn-primary px-4 py-2 rounded"
                        disabled={!selectedPosition}
                        onClick={async () => {
                          if (selectedPosition) {
                            const address = await fetchReverseGeocode(selectedPosition[0], selectedPosition[1]);
                            setLocationInput(address);
                            setValue('location', address);
                            setShowMapModal(false);
                            toast.success('Ubicación seleccionada');
                          }
                        }}
                      >
                        Usar esta ubicación
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres'
                    }
                  })}
                  className="input-field pr-10"
                  placeholder="Mínimo 8 caracteres"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: value => value === password || 'Las contraseñas no coinciden'
                  })}
                  className="input-field pr-10"
                  placeholder="Repite tu contraseña"
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
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 