import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchInflacion,
  fetchRiesgoPais,
  fetchGlobalNewsGDELT,
  fetchGlobalFxRates,
  fetchWorldBankMacro,
  clearApiClientCache,
} from '../lib/api-client'

describe('API Client — Live Connectors 2026-2027', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
    clearApiClientCache()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('fetchRiesgoPais parses ArgentinaDatos response correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fecha: '2026-11-15', valor: 835 }),
    } as unknown as Response)

    const res = await fetchRiesgoPais()
    expect(res).toBeDefined()
    expect(typeof res.valor).toBe('number')
    expect(res.valor).toBe(835)
    expect(res.fecha).toBe('2026-11-15')
  })

  it('fetchRiesgoPais falls back gracefully when API returns error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const res = await fetchRiesgoPais()
    expect(res).toBeDefined()
    expect(res.valor).toBe(840) // Default calibrated fallback
    expect(typeof res.fecha).toBe('string')
  })

  it('fetchInflacion parses monthly array from primary API', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { fecha: '2026-08-01', valor: 2.3 },
        { fecha: '2026-09-01', valor: 2.2 },
        { fecha: '2026-10-01', valor: 2.1 },
      ],
    } as unknown as Response)

    const list = await fetchInflacion()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list[0]).toHaveProperty('mes')
    expect(list[0]).toHaveProperty('valor')
    expect(list[list.length - 1].valor).toBe(2.1)
  })

  it('fetchInflacion falls back to secondary and calibrated data when network fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Offline'))

    const list = await fetchInflacion()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThanOrEqual(4)
    expect(list[list.length - 1].valor).toBeGreaterThan(0)
  })

  it('fetchGlobalNewsGDELT returns articles from GDELT endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: [
          {
            url: 'https://reuters.com/news/1',
            title: 'Global Trade Flows Expand in LatAm',
            seendate: '20261116T120000Z',
            domain: 'reuters.com',
            sourcecountry: 'United States',
          },
        ],
      }),
    } as unknown as Response)

    const articles = await fetchGlobalNewsGDELT('test query 2026', 2)
    expect(Array.isArray(articles)).toBe(true)
    expect(articles.length).toBe(1)
    expect(articles[0].domain).toBe('reuters.com')
  })

  it('fetchGlobalFxRates fetches currency rates from BCE/Frankfurter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        base: 'USD',
        date: '2026-11-15',
        rates: { EUR: 0.945, BRL: 5.82, MXN: 18.45 },
      }),
    } as unknown as Response)

    const fx = await fetchGlobalFxRates()
    expect(fx).toBeDefined()
    expect(fx?.rates?.BRL).toBe(5.82)
  })

  it('fetchWorldBankMacro formats macro snapshot', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { page: 1 },
        [{ date: '2026', value: 2.8, country: { id: 'US', value: 'United States' } }],
      ],
    } as unknown as Response)

    const snap = await fetchWorldBankMacro('USA')
    expect(snap.countryIso).toBe('USA')
  })
})
