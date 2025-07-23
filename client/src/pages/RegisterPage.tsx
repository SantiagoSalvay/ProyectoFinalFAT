import { useState } from 'react'
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
  name: string
  role: UserRole
  organization?: string
  location?: string
}

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('person')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: selectedRole,
        organization: data.organization,
        location: data.location,
      })
      
      toast.success('¡Registro exitoso! Bienvenido a Demos+')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Error al registrarse. Inténtalo de nuevo.')
    }
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedRole === 'person' ? 'Nombre completo' : 'Nombre de la organización'}
              </label>
              <input
                type="text"
                {...register('name', { required: 'Este campo es requerido' })}
                className="input-field"
                placeholder={selectedRole === 'person' ? 'Tu nombre completo' : 'Nombre de la ONG'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

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