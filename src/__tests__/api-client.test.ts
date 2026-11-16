import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchInflacion,
  fetchRiesgoPais,
  fetchGlobalNewsGDELT,
  fetchDolar,
  fetchGlobalFxRates,
  fetchWorldBankMacro,
  clearApiClientCache,
} from '../lib/api-client'

describe('API Client — Live Indicators & Fallbacks', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
    clearApiClientCache()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('fetchInflacion parses ArgentinaDatos format correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { fecha: '2026-06-15', valor: 2.3 },
        { fecha: '2026-07-15', valor: 2.2 },
        { fecha: '2026-08-15', valor: 2.4 },
        { fecha: '2026-09-15', valor: 2.3 },
        { fecha: '2026-10-15', valor: 2.2 },
        { fecha: '2026-11-15', valor: 2.1 },
      ],
    } as Response)

    const data = await fetchInflacion()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(6)
    expect(data[0].mes).toBe('2026-06')
    expect(data[0].valor).toBe(2.3)
    expect(data[5].mes).toBe('2026-11')
    expect(data[5].valor).toBe(2.1)
  })

  it('fetchInflacion falls back to calibrated data if network fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const data = await fetchInflacion()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(6)
    expect(data[0].mes).toBeTruthy()
    expect(typeof data[0].valor).toBe('number')
  })

  it('fetchRiesgoPais parses EMBI+ bps correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ fecha: '2026-11-16', valor: 842.4 }),
    } as Response)

    const risk = await fetchRiesgoPais()
    expect(risk).not.toBeNull()
    expect(risk?.fecha).toBe('2026-11-16')
    expect(risk?.valor).toBe(842)
  })

  it('fetchRiesgoPais returns null on API failure without throwing', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Timeout'))
    const risk = await fetchRiesgoPais()
    expect(risk).toBeNull()
  })

  it('fetchGlobalNewsGDELT parses articles structure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        articles: [
          {
            url: 'https://reuters.com/news-1',
            title: 'Global trade dynamics in 2026',
            seendate: '20261116T120000Z',
            domain: 'reuters.com',
            sourcecountry: 'US',
          },
        ],
      }),
    } as Response)

    const news = await fetchGlobalNewsGDELT('trade', 5)
    expect(Array.isArray(news)).toBe(true)
    expect(news.length).toBe(1)
    expect(news[0].title).toBe('Global trade dynamics in 2026')
    expect(news[0].domain).toBe('reuters.com')
  })

  it('fetchDolar parses exchange rates correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { nombre: 'Oficial', compra: 1420, venta: 1460, fechaActualizacion: '2026-11-16' },
        { nombre: 'Blue', compra: 1470, venta: 1490, fechaActualizacion: '2026-11-16' },
      ],
    } as Response)

    const rates = await fetchDolar()
    expect(rates.length).toBe(2)
    expect(rates[0].nombre).toBe('Oficial')
    expect(rates[0].venta).toBe(1460)
  })

  it('fetchGlobalFxRates returns base and rate map', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        base: 'USD',
        date: '2026-11-16',
        rates: { EUR: 0.95, BRL: 5.78, MXN: 20.3 },
      }),
    } as Response)

    const fx = await fetchGlobalFxRates()
    expect(fx?.base).toBe('USD')
    expect(fx?.rates.BRL).toBe(5.78)
  })

  it('fetchWorldBankMacro extracts inflation and GDP cleanly', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('FP.CPI.TOTL.ZG')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [{}, [{ date: '2025', value: 2.8, country: { id: 'US', value: 'USA' } }]],
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [{}, [{ date: '2025', value: 2.1, country: { id: 'US', value: 'USA' } }]],
      } as Response)
    })

    const wb = await fetchWorldBankMacro('USA')
    expect(wb.countryIso).toBe('USA')
    expect(wb.inflationAnnualPct).toBe(2.8)
    expect(wb.gdpGrowthAnnualPct).toBe(2.1)
  })
})
