import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '^/auth/(?!callback)': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y ReactDOM en su propio chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar librerías de mapas
          'map-vendor': ['leaflet', 'react-leaflet'],
          // Separar librerías de UI
          'ui-vendor': ['react-hot-toast', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar el límite a 1000 kB
  },
}) 