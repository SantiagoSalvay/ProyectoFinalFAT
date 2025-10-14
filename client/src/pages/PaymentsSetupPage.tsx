import React, { useState } from 'react'
import Header from '../components/Header'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function PaymentsSetupPage() {
  const { user, isAuthenticated } = useAuth()
  const [accessToken, setAccessToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isONG = !!user && (user.tipo_usuario === 2 || (user as any).id_tipo_usuario === 2)

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      if (!isAuthenticated || !isONG) {
        setError('Debes ser una ONG autenticada para configurar pagos.')
        return
      }
      if (!accessToken.trim()) {
        setError('El Access Token es requerido.')
        return
      }
      // Validación básica para Mercado Pago: debe ser token de producción (APP_USR-)
      if (accessToken.trim().startsWith('TEST-') || !accessToken.trim().startsWith('APP_USR-')) {
        setError('Debes ingresar el Access Token de producción de Mercado Pago (formato APP_USR-...). No se aceptan tokens de prueba (TEST-).')
        return
      }
      const res = await api.setOngMPToken(accessToken.trim(), true)
      setMessage('Token de Mercado Pago guardado y pagos habilitados.')
      setAccessToken('')
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="flex flex-col items-center justify-start py-10 px-4 flex-1">
        <div className="max-w-3xl w-full rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-fg)' }}>Configuración de donaciones con Mercado Pago</h1>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
            Aquí podrás habilitar las donaciones monetarias para tu organización utilizando la API de Mercado Pago. Cada ONG debe generar su propio Access Token de producción y mantenerlo vigente.
          </p>

          <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>Pasos para obtener tu Access Token de producción (Mercado Pago)</h2>
            <ol className="list-decimal pl-6 space-y-2" style={{ color: 'var(--color-muted)' }}>
              <li>Regístrate o inicia sesión en tu cuenta de <strong>Mercado Pago</strong> de la organización.</li>
              <li>Accede a <strong>Mercado Pago Developers</strong> y crea una <strong>Aplicación</strong> para tu ONG.</li>
              <li>En la aplicación, ve a <strong>Credenciales</strong> y selecciona el entorno <strong>Producción</strong>.</li>
              <li>Solicita la activación de producción (completa el proceso de validación/KYC si corresponde).</li>
              <li>Copia el <strong>Access Token de producción</strong> (debe comenzar con <code>APP_USR-</code>, no <code>TEST-</code>).</li>
              <li>Pega el Access Token de producción en el formulario inferior y haz clic en “Guardar y habilitar pagos”.</li>
            </ol>
            <p className="mt-4 text-sm" style={{ color: 'var(--color-muted)' }}>
              Importante: el token se almacenará cifrado y solo se usará para crear preferencias de pago para tus donaciones. Solo se aceptan tokens de <strong>Producción</strong> de Mercado Pago.
            </p>
          </div>

          <div className="mb-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
            <p className="text-sm" style={{ color: '#92400e' }}>
              Disclaimer: Al habilitar donaciones monetarias con <strong>Mercado Pago</strong> aceptas que eres responsable de: (1) la titularidad de la cuenta de cobro, (2) cumplir con las normativas fiscales aplicables y las <strong>Políticas/Términos de Mercado Pago</strong>, y (3) la veracidad y seguridad de la información ingresada.
            </p>
          </div>

          {!isONG && (
            <div className="mb-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
              <p className="text-sm" style={{ color: '#991b1b' }}>
                Esta sección es exclusiva para cuentas de tipo ONG.
              </p>
            </div>
          )}

          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-fg)' }}>
                Access Token de Mercado Pago (Producción)
              </label>
              <input
                type="password"
                className="input-field w-full"
                placeholder="APP_USR-..."
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                disabled={!isONG}
                required
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary" type="submit" disabled={loading || !isONG}>
                {loading ? 'Guardando...' : 'Guardar token de Mercado Pago'}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={async () => {
                  setLoading(true)
                  setError('')
                  setMessage('')
                  try {
                    await api.deleteOngMPToken()
                    setMessage('Pagos deshabilitados y token de Mercado Pago eliminado')
                  } catch (err: any) {
                    setError(err?.message || 'Error al deshabilitar pagos')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading || !isONG}
              >
                Deshabilitar pagos
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#f0fdf4', borderColor: '#22c55e' }}>
              <p className="text-sm" style={{ color: '#16a34a' }}>✅ {message}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444' }}>
              <p className="text-sm" style={{ color: '#dc2626' }}>❌ {error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
