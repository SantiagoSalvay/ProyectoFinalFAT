import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { Loader2, Search, Calendar as CalendarIcon, DollarSign, RefreshCw } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  date: string
  recipient: {
    name: string
    organization?: string
  }
  message?: string
}

export default function MyHistoryPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await api.getDonacionesRealizadas()
        setDonations(data as Donation[])
      } catch (e) {
        setDonations([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const refresh = async () => {
    setRefreshing(true)
    try {
      const data = await api.getDonacionesRealizadas()
      setDonations(data as Donation[])
    } finally {
      setRefreshing(false)
    }
  }

  const filtered = useMemo(() => {
    return donations.filter(d => {
      const matchesQuery = query.trim().length === 0 ||
        d.recipient.name.toLowerCase().includes(query.toLowerCase()) ||
        (d.message || '').toLowerCase().includes(query.toLowerCase())
      const time = new Date(d.date).getTime()
      const fromOk = from ? time >= new Date(from).getTime() : true
      const toOk = to ? time <= new Date(to).getTime() : true
      return matchesQuery && fromOk && toOk
    })
  }, [donations, query, from, to])

  const total = useMemo(() => filtered.reduce((acc, d) => acc + (Number(d.amount) || 0), 0), [filtered])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mi Historial</h1>
          <button onClick={refresh} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o mensaje" className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-100" />
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100">
            <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full outline-none text-sm bg-transparent dark:text-gray-100" />
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100">
            <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full outline-none text-sm bg-transparent dark:text-gray-100" />
          </div>
        </div>

        <div className="card p-4 mb-6 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Total donado (filtrado):</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">${total.toLocaleString()}</div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No se encontraron donaciones con los criterios seleccionados.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((d) => (
              <div key={d.id} className="card p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{d.recipient.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(d.date).toLocaleString()}</div>
                    {d.message && <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{d.message}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-700">${d.amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
