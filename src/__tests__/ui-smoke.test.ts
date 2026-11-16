import { describe, it, expect } from 'vitest'
import { APP_VERSION, APP_NAME, APP_RELEASE_STAGE } from '@/lib/version'
import { REGIONAL_CONTEXT_PACKS, DECISION_TEMPLATES } from '@/lib/context-packs'
import { FEDERATION_SCHEMA_VERSION } from '@/lib/federation'

describe('Bloque 9: UI & System Smoke Tests', () => {
  it('exposes valid production version metadata', () => {
    expect(APP_NAME).toBe('MejoraDecisiones Decision OS')
    expect(APP_RELEASE_STAGE).toBe('Production')
    expect(APP_VERSION).toMatch(/^v\d+\.\d+\.\d+$/)
    expect(FEDERATION_SCHEMA_VERSION).toBe('mejora.decision-os.v1')
  })

  it('validates all 6 regional context packs are fully defined', () => {
    const requiredRegions = ['GLOBAL', 'AR', 'US', 'BR', 'MX', 'EU']
    requiredRegions.forEach((code) => {
      const pack = REGIONAL_CONTEXT_PACKS[code as keyof typeof REGIONAL_CONTEXT_PACKS]
      expect(pack).toBeDefined()
      expect(pack.name.length).toBeGreaterThan(0)
      expect(pack.flag.length).toBeGreaterThan(0)
      expect(pack.currency.length).toBeGreaterThanOrEqual(3)
      expect(pack.vitals.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('validates decision templates cover all 4 fractal scales', () => {
    const levels = new Set(DECISION_TEMPLATES.map((t) => t.level))
    expect(levels.has('L4_MACRO')).toBe(true)
    expect(levels.has('L3_EMPRESA')).toBe(true)
    expect(levels.has('L2_PERSONAL')).toBe(true)
    expect(levels.has('L1_COTIDIANO')).toBe(true)
    expect(DECISION_TEMPLATES.length).toBeGreaterThanOrEqual(10)
  })

  it('validates that each template has valid mathematical matrices and probabilities', () => {
    DECISION_TEMPLATES.forEach((tpl) => {
      expect(tpl.alternatives.length).toBe(3)
      expect(tpl.scenarios.length).toBe(3)
      expect(tpl.probabilities.length).toBe(3)
      const sum = tpl.probabilities.reduce((a, b) => a + b, 0)
      expect(sum).toBe(100)
      expect(tpl.payoffs.length).toBe(3)
      expect(tpl.payoffs[0].length).toBe(3)
    })
  })
})
