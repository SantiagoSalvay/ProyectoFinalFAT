import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { User, Building, Eye, EyeOff, ArrowLeft } from 'lucide-react'
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
  const [selectedRole, setSelectedRole] = useState<UserRole>('person')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const { register: registerUser, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                {...register('location')}
                className="input-field"
                placeholder="Ciudad, País"
              />
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