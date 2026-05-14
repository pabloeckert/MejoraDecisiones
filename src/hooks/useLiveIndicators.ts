import { useEffect, useState } from 'react'
import { fetchDolar, fetchReservasBCRA, fetchInflacion, type DolarRate, type BcraReservas, type InflacionMensual } from '@/lib/api-client'

export interface LiveIndicators {
  dolar: DolarRate[] | null
  reservas: BcraReservas | null
  inflacion: InflacionMensual[] | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutos

export function useLiveIndicators(): LiveIndicators {
  const [state, setState] = useState<LiveIndicators>({
    dolar: null,
    reservas: null,
    inflacion: null,
    loading: true,
    error: null,
    lastUpdated: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))

      const results = await Promise.allSettled([
        fetchDolar(),
        fetchReservasBCRA(),
        fetchInflacion(),
      ])

      if (cancelled) return

      const [dolarRes, reservasRes, inflacionRes] = results
      const errors: string[] = []

      if (dolarRes.status === 'rejected') errors.push('dólar')
      if (reservasRes.status === 'rejected') errors.push('reservas')
      if (inflacionRes.status === 'rejected') errors.push('inflación')

      setState({
        dolar: dolarRes.status === 'fulfilled' ? dolarRes.value : null,
        reservas: reservasRes.status === 'fulfilled' ? reservasRes.value : null,
        inflacion: inflacionRes.status === 'fulfilled' ? inflacionRes.value : null,
        loading: false,
        error: errors.length > 0 ? `Sin datos en vivo: ${errors.join(', ')}` : null,
        lastUpdated: new Date(),
      })
    }

    load()
    const interval = setInterval(load, POLL_INTERVAL)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return state
}
