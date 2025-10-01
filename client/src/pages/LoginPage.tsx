import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, ArrowLeft, Heart } from 'lucide-react'
import SocialLoginButtons from '../components/SocialLoginButtons'
import { useLoginLoading } from '../hooks/useAuthLoading'
import { ButtonLoading } from '../components/GlobalLoading'
import { LoadingText } from '../components/LoadingDots'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { isLoading, message, withLoginLoading } = useLoginLoading()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = withLoginLoading(async (data: LoginFormData) => {
    await login(data.email, data.password)
    navigate('/dashboard')
  })

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-4" style={{ color: 'var(--link)' }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-fg)' }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Inicia sesión en tu cuenta de Demos+
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
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
                <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'La contraseña es requerida' })}
                  className="input-field pr-10"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: 'var(--color-muted)' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: 'var(--color-muted)' }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium"
                style={{ color: 'var(--link)' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <ButtonLoading isLoading={isLoading} variant="dots">
                {isLoading ? message : 'Iniciar sesión'}
              </ButtonLoading>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium" style={{ color: 'var(--link)' }}>
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Social Login Buttons */}
          <SocialLoginButtons mode="login" />
        </div>
      </div>
    </div>
  )
} 