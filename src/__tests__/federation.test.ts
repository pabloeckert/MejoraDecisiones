import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateFederationBundle,
  importFederationBundle,
  parseFederatedDecisionQuery,
  buildDiagnostico4DFederatedUrl,
  FEDERATION_SCHEMA_VERSION,
  type FederationPayload,
} from '@/lib/federation'

if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {}
  ;(globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

describe('Bloque 9: Federation Protocol & Runtime Boundary Validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('validateFederationBundle', () => {
    it('approves a valid federation bundle', () => {
      const validPayload: FederationPayload = {
        schemaVersion: FEDERATION_SCHEMA_VERSION,
        exportedAt: '2026-11-16T12:00:00Z',
        activeRegion: 'AR',
        enterpriseProfile: {
          companyName: 'Acme Software',
          sector: 'tecnologia',
          region: 'AR',
          revenueExportPct: 40,
          costDollarizedPct: 30,
          debtExposurePct: 10,
          laborIntensityPct: 40,
          cashRunwayMonths: 8,
        },
        journal: [
          {
            id: 'j-1',
            createdAt: '2026-11-16T12:00:00Z',
            level: 'L3_EMPRESA',
            region: 'AR',
            title: 'Expansión de Capacidad',
            chosenAlternative: 'Contratar Senior',
            consensusAlternative: 'Contratar Senior',
            minimaxRegretAlternative: 'Contratar Senior',
            expectedValue: 50,
            maxRegret: 10,
            confidencePct: 80,
            reversibility: 'reversible',
            notes: 'Nota segura sin inyecciones',
            outcomeStatus: 'pending',
          },
        ],
      }

      const res = validateFederationBundle(validPayload)
      expect(res.valid).toBe(true)
      expect(res.errors).toHaveLength(0)
      expect(res.sanitizedPayload).toBeDefined()
      expect(res.sanitizedPayload?.activeRegion).toBe('AR')
    })

    it('rejects payload with invalid schema version', () => {
      const badPayload = {
        schemaVersion: 'mejora.decision-os.v999',
        activeRegion: 'AR',
      }
      const res = validateFederationBundle(badPayload)
      expect(res.valid).toBe(false)
      expect(res.errors.some((e) => e.includes('Versión de esquema inválida'))).toBe(true)
    })

    it('rejects invalid numeric ranges in enterprise profile', () => {
      const invalidProfilePayload = {
        schemaVersion: FEDERATION_SCHEMA_VERSION,
        enterpriseProfile: {
          sector: 'Retail',
          revenueExportPct: 150, // Out of range [0, 100]
          costDollarizedPct: -20, // Out of range [0, 100]
          debtUsdPct: 0,
          cashRunwayMonths: 6,
        },
      }
      const res = validateFederationBundle(invalidProfilePayload)
      expect(res.valid).toBe(false)
      expect(res.errors.length).toBeGreaterThanOrEqual(2)
    })

    it('sanitizes strings and strips script tags from journal entries', () => {
      const dirtyPayload = {
        schemaVersion: FEDERATION_SCHEMA_VERSION,
        activeRegion: 'GLOBAL',
        journal: [
          {
            id: 'j-xss',
            level: 'L1_COTIDIANO',
            region: 'GLOBAL',
            title: 'Dilema con <script>alert("xss")</script> ataque',
            chosenAlternative: 'Opción <img src=x onerror=alert(1)>',
            confidencePct: 75,
            notes: '<b>Texto negrita</b> pero sin tags peligrosos <script>',
          },
        ],
      }

      const res = validateFederationBundle(dirtyPayload)
      expect(res.valid).toBe(true)
      const sanitized = res.sanitizedPayload?.journal[0]
      expect(sanitized?.title).not.toContain('<')
      expect(sanitized?.title).not.toContain('>')
      expect(sanitized?.chosenAlternative).not.toContain('<')
      expect(sanitized?.chosenAlternative).not.toContain('>')
    })
  })

  describe('importFederationBundle', () => {
    it('successfully imports valid bundle into localStorage', () => {
      const bundle: FederationPayload = {
        schemaVersion: FEDERATION_SCHEMA_VERSION,
        exportedAt: '2026-11-16T12:00:00Z',
        activeRegion: 'US',
        enterpriseProfile: {
          companyName: 'US Tech LLC',
          sector: 'tecnologia',
          region: 'US',
          revenueExportPct: 80,
          costDollarizedPct: 80,
          debtExposurePct: 0,
          laborIntensityPct: 50,
          cashRunwayMonths: 12,
        },
        journal: [],
      }

      const ok = importFederationBundle(bundle)
      expect(ok).toBe(true)
    })

    it('rejects corrupt or non-object payloads', () => {
      expect(importFederationBundle(null)).toBe(false)
      expect(importFederationBundle('corrupt-string')).toBe(false)
      expect(importFederationBundle({ schemaVersion: 'unknown' })).toBe(false)
    })
  })

  describe('parseFederatedDecisionQuery', () => {
    it('parses valid query parameters into a decision draft', () => {
      const params = new URLSearchParams({
        title: 'Lanzamiento SaaS B2B',
        level: 'L3_EMPRESA',
        region: 'US',
        optA: 'Bootstrapped',
        optB: 'Venture Capital',
        optC: 'Joint Venture',
      })

      const draft = parseFederatedDecisionQuery(params)
      expect(draft.title).toBe('Lanzamiento SaaS B2B')
      expect(draft.level).toBe('L3_EMPRESA')
      expect(draft.region).toBe('US')
      expect(draft.alternatives).toEqual(['Bootstrapped', 'Venture Capital', 'Joint Venture'])
    })

    it('ignores invalid levels or regions', () => {
      const params = new URLSearchParams({
        level: 'L99_UNKNOWN' as never,
        region: 'MARTE' as never,
      })
      const draft = parseFederatedDecisionQuery(params)
      expect(draft.level).toBeUndefined()
      expect(draft.region).toBeUndefined()
    })
  })

  describe('buildDiagnostico4DFederatedUrl', () => {
    it('constructs enriched federation link to Diagnostico 4D', () => {
      const url = buildDiagnostico4DFederatedUrl('unit_test')
      expect(url).toContain('https://diagnostico.mejoraok.com?')
      expect(url).toContain('utm_source=mejora_decisiones_os')
      expect(url).toContain('utm_medium=unit_test')
      expect(url).toContain('sector=')
    })
  })
})
