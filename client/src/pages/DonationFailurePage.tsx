import React from 'react'
import Header from '../components/Header'

export default function DonationFailurePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="flex flex-col items-center justify-center py-16 px-4 flex-1">
        <div className="max-w-xl w-full rounded-lg shadow-lg p-8 text-center" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-fg)' }}>Pago no completado</h1>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
            Tu pago no pudo completarse. Puedes intentarlo nuevamente o contactar a soporte si el problema persiste.
          </p>
          <a href="/donaciones" className="btn-primary inline-block">Volver a Donaciones</a>
        </div>
      </main>
    </div>
  )
}
