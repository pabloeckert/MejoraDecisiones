const CACHE = new Map<string, { data: unknown; ts: number }>()
const TTL = 5 * 60 * 1000 // 5 minutos

async function fetchWithCache<T>(url: string, opts?: RequestInit): Promise<T> {
  const cached = CACHE.get(url)
  if (cached && Date.now() - cached.ts < TTL) return cached.data as T

  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  CACHE.set(url, { data, ts: Date.now() })
  return data as T
}

// --- DolarAPI ---

export interface DolarRate {
  nombre: string
  compra: number | null
  venta: number | null
  fechaActualizacion: string
}

export async function fetchDolar(): Promise<DolarRate[]> {
  return fetchWithCache<DolarRate[]>('https://api.dolarapi.com/v1/dolares')
}

// --- BCRA (reservas internacionales) ---

interface BcraResponse {
  status: number
  results: { idVariable: number; fecha: string; valor: number }[]
}

export interface BcraReservas {
  valor: number // en millones USD
  fecha: string
}

export async function fetchReservasBCRA(): Promise<BcraReservas | null> {
  const today = new Date()
  const from = new Date(today)
  from.setDate(from.getDate() - 30)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const url = `https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/1/${fmt(from)}/${fmt(today)}`
  const data = await fetchWithCache<BcraResponse>(url, {
    headers: { Accept: 'application/json' },
  })
  const results = data.results
  if (!results?.length) return null
  const last = results[results.length - 1]
  return { valor: last.valor, fecha: last.fecha }
}

// --- INDEC vía datos.gob.ar (inflación IPC) ---

interface IndecSeries {
  data: [string, number][]
}

export interface InflacionMensual {
  mes: string
  valor: number
}

export async function fetchInflacion(): Promise<InflacionMensual[]> {
  const url =
    'https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELGENERAL_DICI_M_26&last=6&format=json'
  const data = await fetchWithCache<{ data: IndecSeries }>(url)
  return (data.data?.data ?? []).map(([fecha, valor]) => ({
    mes: fecha.slice(0, 7),
    valor,
  }))
}
