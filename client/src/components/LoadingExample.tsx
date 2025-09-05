import { useState } from 'react'
import { useLoading } from '../hooks/useLoading'
import { useLoadingContext } from '../contexts/LoadingContext'
import { ButtonLoading, SectionLoading } from './GlobalLoading'

export function LoadingExample() {
  const [data, setData] = useState<string[]>([])
  const { isLoading, setIsLoading, withLoading, LoadingSpinner, LoadingOverlay } = useLoading()
  const { startGlobalLoading, stopGlobalLoading, withGlobalLoading } = useLoadingContext()

  // Ejemplo de función asíncrona simulada
  const fetchData = async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simular delay
    return ['Dato 1', 'Dato 2', 'Dato 3']
  }

  // Usando el hook useLoading
  const handleFetchWithHook = withLoading(async () => {
    const result = await fetchData()
    setData(result)
  })

  // Usando el contexto global
  const handleFetchWithGlobal = withGlobalLoading(async () => {
    const result = await fetchData()
    setData(result)
  }, 'Cargando datos...')

  // Usando controles manuales
  const handleFetchManual = async () => {
    setIsLoading(true)
    try {
      const result = await fetchData()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Ejemplos de Loading</h2>
      
      {/* Ejemplo 1: Loading con hook local */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">1. Loading con Hook Local</h3>
        <button
          onClick={handleFetchWithHook}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <ButtonLoading isLoading={isLoading}>
            Cargar datos (Hook local)
          </ButtonLoading>
        </button>
        
        <LoadingSpinner size={20} className="mt-4">
          Cargando con spinner...
        </LoadingSpinner>
        
        <div className="mt-4">
          <h4>Datos cargados:</h4>
          <ul className="list-disc list-inside">
            {data.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ejemplo 2: Loading global */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">2. Loading Global</h3>
        <button
          onClick={handleFetchWithGlobal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Cargar datos (Global)
        </button>
      </div>

      {/* Ejemplo 3: Loading manual */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">3. Loading Manual</h3>
        <button
          onClick={handleFetchManual}
          disabled={isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Cargar datos (Manual)
        </button>
      </div>

      {/* Ejemplo 4: Loading overlay */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">4. Loading Overlay</h3>
        <LoadingOverlay message="Procesando...">
          <div className="bg-gray-100 p-4 rounded">
            <p>Este contenido estará cubierto por el overlay cuando isLoading sea true</p>
            <p>Puedes hacer clic en el botón de arriba para ver el efecto</p>
          </div>
        </LoadingOverlay>
      </div>

      {/* Ejemplo 5: Section Loading */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">5. Section Loading</h3>
        <SectionLoading isLoading={isLoading} message="Cargando sección..." />
        {!isLoading && (
          <div>
            <p>Contenido de la sección que aparece cuando no está cargando</p>
          </div>
        )}
      </div>
    </div>
  )
}

