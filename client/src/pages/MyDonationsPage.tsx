import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { Loader2, Search, Calendar as CalendarIcon, ArrowUpDown, Download, DollarSign } from 'lucide-react'

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

type SortKey = 'date' | 'amount'
type SortDir = 'asc' | 'desc'

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

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

  const filtered = useMemo(() => {
    const list = donations.filter(d => {
      const matchesQuery = query.trim().length === 0 ||
        d.recipient.name.toLowerCase().includes(query.toLowerCase()) ||
        (d.message || '').toLowerCase().includes(query.toLowerCase())
      const time = new Date(d.date).getTime()
      const fromOk = from ? time >= new Date(from).getTime() : true
      const toOk = to ? time <= new Date(to).getTime() : true
      return matchesQuery && fromOk && toOk
    })

    const sorted = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else {
        cmp = Number(a.amount) - Number(b.amount)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [donations, query, from, to, sortKey, sortDir])

  const total = useMemo(() => filtered.reduce((acc, d) => acc + (Number(d.amount) || 0), 0), [filtered])

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('desc')
    } else {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Destinatario', 'Organizacion', 'Monto', 'Mensaje']
    const rows = filtered.map(d => [
      d.id,
      new Date(d.date).toISOString(),
      d.recipient.name,
      d.recipient.organization || '',
      d.amount,
      (d.message || '').replace(/\n|\r/g, ' ')
    ])
    const csv = [headers, ...rows].map(r => r.map(String).map(v => '"' + v.replaceAll('"', '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mis_donaciones_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Administrar mis Donaciones</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => toggleSort('date')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <ArrowUpDown className="w-4 h-4" />
              Fecha
            </button>
            <button onClick={() => toggleSort('amount')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <ArrowUpDown className="w-4 h-4" />
              Monto
            </button>
            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-2 p-2 rounded-md border bg-white">
            <Search className="w-4 h-4 text-gray-500" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o mensaje" className="w-full outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md border bg-white">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md border bg-white">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full outline-none text-sm" />
          </div>
        </div>

        <div className="card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Total donado (filtrado):</span>
          </div>
          <div className="text-xl font-bold text-gray-900">${total.toLocaleString()}</div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Cargando donaciones...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No se encontraron donaciones con los criterios seleccionados.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{d.recipient.name}</div>
                    <div className="text-sm text-gray-500">{new Date(d.date).toLocaleString()}</div>
                    {d.message && <div className="text-sm text-gray-700 mt-1">{d.message}</div>}
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
