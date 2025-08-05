import { AuthProvider } from '../client/src/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata = {
  title: 'DEMOS+',
  description: 'Plataforma de donaciones y ayuda comunitaria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2b555f',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#73e4fd',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}