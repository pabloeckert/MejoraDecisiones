import { describe, it, expect, beforeEach } from 'vitest'
import {
  extractJsonFromLLMResponse,
  runStructurerAgent,
  runDevilsAdvocateAgent,
  runOsintSynthesizerAgent,
  loadAICopilotConfig,
  saveAICopilotConfig,
  type AICopilotConfig,
} from '@/lib/ai-copilot'
import {
  computeBrierScoreByLevel,
  getOverdueJournalEntries,
  type DecisionJournalEntry,
} from '@/lib/federation'

// Mock localStorage for Node test environment
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

describe('Bloque 8: AI Copilot & Red Team Module', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('extractJsonFromLLMResponse', () => {
    it('parses raw JSON correctly', () => {
      const input = '{"title":"Test Decision","score":95}'
      const parsed = extractJsonFromLLMResponse<{ title: string; score: number }>(input, {
        title: '',
        score: 0,
      })
      expect(parsed.title).toBe('Test Decision')
      expect(parsed.score).toBe(95)
    })

    it('extracts JSON from markdown code block', () => {
      const input =
        'Here is the output:\n```json\n{\n  "status": "ok",\n  "count": 42\n}\n```\nHope it helps!'
      const parsed = extractJsonFromLLMResponse<{ status: string; count: number }>(input, {
        status: 'err',
        count: 0,
      })
      expect(parsed.status).toBe('ok')
      expect(parsed.count).toBe(42)
    })

    it('extracts JSON without markdown tag when enclosed in braces', () => {
      const input = 'Prefix text before JSON {"nested": {"value": true}} trailing words after'
      const parsed = extractJsonFromLLMResponse<{ nested: { value: boolean } }>(input, {
        nested: { value: false },
      })
      expect(parsed.nested.value).toBe(true)
    })

    it('returns fallback when no valid JSON is present', () => {
      const fallback = { empty: true }
      const res = extractJsonFromLLMResponse('This is plain text with no json', fallback)
      expect(res).toBe(fallback)
    })
  })

  describe('runStructurerAgent (Deterministic Fallback)', () => {
    it('structures a free-text problem into mathematical decision elements', async () => {
      const config: AICopilotConfig = { provider: 'deterministic' }
      const res = await runStructurerAgent('Dudo si contratar ingenieros o tercerizar', config)

      expect(res.title).toBeDefined()
      expect(res.alternatives.length).toBe(3)
      expect(res.scenarios.length).toBe(3)
      expect(res.probabilities.length).toBe(3)
      const probSum = res.probabilities.reduce((s, p) => s + p, 0)
      expect(probSum).toBe(100)
      expect(res.payoffs.length).toBe(3)
      expect(res.payoffs[0].length).toBe(3)
    })
  })

  describe('runDevilsAdvocateAgent (Deterministic Fallback)', () => {
    it('generates adversarial audit, cognitive biases, and pre-mortem', async () => {
      const config: AICopilotConfig = { provider: 'deterministic' }
      const res = await runDevilsAdvocateAgent(
        {
          title: 'Expansión de planta productiva en Brasil',
          chosenAlternative: 'Inversión Directa con Deuda',
          alternatives: [
            'Inversión Directa con Deuda',
            'Alianza con Fabricante Local',
            'Exportar desde Argentina',
          ],
          reversibility: 'irreversible',
        },
        config
      )

      expect(res.biasesDetected.length).toBeGreaterThanOrEqual(2)
      expect(res.blindSpots.length).toBeGreaterThanOrEqual(2)
      expect(res.steelmanCounterArguments.length).toBeGreaterThanOrEqual(1)
      expect(res.killCritique.length).toBeGreaterThan(10)
    })
  })

  describe('runOsintSynthesizerAgent (Deterministic Fallback)', () => {
    it('synthesizes news items into strategic intelligence output', async () => {
      const config: AICopilotConfig = { provider: 'deterministic' }
      const res = await runOsintSynthesizerAgent(
        [
          { title: 'Tensión cambiaria en mercados emergentes', domain: 'reuters.com' },
          { title: 'Aumento de tasas de interés de la Fed', domain: 'bloomberg.com' },
        ],
        'Argentina',
        config
      )

      expect(res.executiveSummary.length).toBeGreaterThanOrEqual(1)
      expect(res.macroOutlook.length).toBeGreaterThan(10)
      expect(res.earlySignals.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('BYOK Config Storage', () => {
    it('saves and loads AI copilot config from localStorage', () => {
      const custom: AICopilotConfig = {
        provider: 'openai',
        apiKey: 'sk-test-secret',
        endpoint: 'https://openrouter.ai/api/v1',
        model: 'gpt-4o-mini',
      }
      saveAICopilotConfig(custom)
      const loaded = loadAICopilotConfig()
      expect(loaded.provider).toBe('openai')
      expect(loaded.apiKey).toBe('sk-test-secret')
      expect(loaded.endpoint).toBe('https://openrouter.ai/api/v1')
      expect(loaded.model).toBe('gpt-4o-mini')
    })
  })

  describe('Federation Calibration by Level & Overdue Reviews', () => {
    const mockJournal: DecisionJournalEntry[] = [
      {
        id: 'entry-1',
        createdAt: '2026-01-10T10:00:00Z',
        level: 'L4_MACRO',
        region: 'AR',
        title: 'Macro Hedging',
        chosenAlternative: 'Futures USD',
        consensusAlternative: 'Futures USD',
        minimaxRegretAlternative: 'Futures USD',
        expectedValue: 12,
        maxRegret: 4,
        confidencePct: 80,
        reversibility: 'reversible',
        notes: 'test',
        outcomeStatus: 'success',
      },
      {
        id: 'entry-2',
        createdAt: '2026-01-15T10:00:00Z',
        level: 'L4_MACRO',
        region: 'AR',
        title: 'Macro Trade',
        chosenAlternative: 'Bonds',
        consensusAlternative: 'Bonds',
        minimaxRegretAlternative: 'Bonds',
        expectedValue: 8,
        maxRegret: 6,
        confidencePct: 70,
        reversibility: 'partially_reversible',
        notes: 'test',
        outcomeStatus: 'failed',
      },
      {
        id: 'entry-3',
        createdAt: '2026-02-01T10:00:00Z',
        level: 'L3_EMPRESA',
        region: 'GLOBAL',
        title: 'Pyme Pricing',
        chosenAlternative: 'Price Hike',
        consensusAlternative: 'Price Hike',
        minimaxRegretAlternative: 'Price Hike',
        expectedValue: 20,
        maxRegret: 5,
        confidencePct: 90,
        reversibility: 'reversible',
        notes: 'test',
        outcomeStatus: 'pending',
        reviewDueAt: '2025-01-01T00:00:00Z', // Overdue in the past
      },
      {
        id: 'entry-4',
        createdAt: '2026-02-10T10:00:00Z',
        level: 'L2_PERSONAL',
        region: 'GLOBAL',
        title: 'Career Move',
        chosenAlternative: 'Stay',
        consensusAlternative: 'Stay',
        minimaxRegretAlternative: 'Stay',
        expectedValue: 15,
        maxRegret: 2,
        confidencePct: 85,
        reversibility: 'reversible',
        notes: 'test',
        outcomeStatus: 'pending',
        reviewDueAt: '2099-01-01T00:00:00Z', // Future, not overdue
      },
    ]

    it('computes Brier score by scale level', () => {
      const brier = computeBrierScoreByLevel(mockJournal)
      // L4 has 1 success (conf 0.8 -> (0.8-1)^2 = 0.04) and 1 fail (conf 0.7 -> (0.7-0)^2 = 0.49). Mean = (0.04+0.49)/2 = 0.265
      expect(brier.L4_MACRO.brierScore).toBe(0.265)
      expect(brier.L4_MACRO.resolved).toBe(2)
      // L3 has only pending, so null
      expect(brier.L3_EMPRESA.brierScore).toBeNull()
      expect(brier.L2_PERSONAL.brierScore).toBeNull()
      expect(brier.L1_COTIDIANO.brierScore).toBeNull()
    })

    it('identifies overdue pending journal entries', () => {
      const overdue = getOverdueJournalEntries(mockJournal)
      expect(overdue.length).toBe(1)
      expect(overdue[0].id).toBe('entry-3')
    })
  })
})
