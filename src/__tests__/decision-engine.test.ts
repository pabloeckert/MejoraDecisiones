import { describe, it, expect } from 'vitest'
import {
  evaluateDecisionUnderUncertainty,
  findStrictlyDominatedStrategies,
  solveSequentialGame,
  computeBanzhafPower,
  runMonteCarloSimulation,
  evaluateTOPSIS,
  computeKellyFraction,
  updateBayesianPriors,
} from '../lib/decision-engine'
import {
  REGIONAL_CONTEXT_PACKS,
  DECISION_TEMPLATES,
  generateMultiVisionAnalysis,
} from '../lib/context-packs'

describe('Decision Engine — Decisión Bajo Incertidumbre (Wald, Savage, Ariely, EVPI)', () => {
  it('calcula correctamente Valor Esperado, Maximin (Wald), Minimax Regret (Savage) y EVPI', () => {
    const result = evaluateDecisionUnderUncertainty({
      alternatives: ['Conservadora', 'Balanceada', 'Agresiva'],
      scenarios: ['Expansión', 'Estancamiento', 'Crisis'],
      probabilities: [40, 40, 20],
      payoffs: [
        [30, 30, 25],   // Conservadora: piso más alto (25) -> Wald Maximin
        [70, 50, 10],   // Balanceada: buen EV y bajo arrepentimiento -> Savage
        [100, 20, -50], // Agresiva: alto upside pero gran pérdida en crisis
      ],
      alpha: 0.5,
      lossAversionLambda: 2.25,
    })

    expect(result.evaluations).toHaveLength(3)
    // Wald Maximin debe elegir Conservadora (piso = 25)
    expect(result.recommendations.maximinWaldBest.name).toBe('Conservadora')
    expect(result.recommendations.maximinWaldBest.minPayoff).toBe(25)

    // Savage Minimax Regret debe elegir Balanceada (arrepentimiento máx = 30 vs 70 y 75)
    expect(result.recommendations.minimaxRegretSavageBest.name).toBe('Balanceada')
    expect(result.recommendations.minimaxRegretSavageBest.maxRegret).toBe(30)

    // EVPI debe ser no negativo
    expect(result.evpi.evpi).toBeGreaterThanOrEqual(0)
    expect(result.evpi.expectedValueWithPerfectInfo).toBeGreaterThanOrEqual(
      result.evpi.bestExpectedValue
    )
  })

  it('penaliza pérdidas asimétricamente bajo Prospect Theory (Ariely / Kahneman)', () => {
    // Apuesta simétrica 50/50 (+50 vs -50) tiene EV = 0 pero utilidad prospectiva negativa
    const result = evaluateDecisionUnderUncertainty({
      alternatives: ['No apostar', 'Apuesta 50/50'],
      scenarios: ['Gana', 'Pierde'],
      probabilities: [50, 50],
      payoffs: [
        [0, 0],
        [50, -50],
      ],
      lossAversionLambda: 2.25,
    })

    expect(result.evaluations[1].expectedValue).toBeCloseTo(0, 5)
    expect(result.evaluations[1].prospectUtility).toBeLessThan(0)
    expect(result.recommendations.prospectTheoryBest.name).toBe('No apostar')
  })
})

describe('Decision Engine — Dominancia, Juegos Secuenciales e Índice de Banzhaf', () => {
  it('detecta estrategias estrictamente dominadas', () => {
    const rows = [
      [10, 8],
      [4, 2],
    ]
    const cols = [
      [5, 9],
      [3, 7],
    ]
    const dom = findStrictlyDominatedStrategies(rows, cols)
    expect(dom.dominatedRows).toEqual([{ dominated: 1, dominatedBy: 0 }])
    expect(dom.dominatedCols).toEqual([{ dominated: 0, dominatedBy: 1 }])
  })

  it('resuelve árbol secuencial por Inducción Hacia Atrás (SPE)', () => {
    const sol = solveSequentialGame([
      {
        firstMoveLabel: 'Innovar',
        responses: [
          { responseLabel: 'Cooperar', firstMoverPayoff: 80, secondMoverPayoff: 70 },
          { responseLabel: 'Guerra de precios', firstMoverPayoff: 20, secondMoverPayoff: 10 },
        ],
      },
      {
        firstMoveLabel: 'Status Quo',
        responses: [
          { responseLabel: 'Mantener', firstMoverPayoff: 40, secondMoverPayoff: 40 },
        ],
      },
    ])

    expect(sol.optimalFirstMoveLabel).toBe('Innovar')
    expect(sol.optimalResponseLabel).toBe('Cooperar')
    expect(sol.equilibriumPayoffs).toEqual({ firstMover: 80, secondMover: 70 })
  })

  it('calcula el Índice de Poder de Banzhaf y suma 100%', () => {
    const blocs = [
      { id: 'a', name: 'Bloque A', votes: 45 },
      { id: 'b', name: 'Bloque B', votes: 45 },
      { id: 'c', name: 'Bisagra C', votes: 10 },
    ]
    // Con cuota 51, cualquiera de los dos grandes + la bisagra de 10 forman mayoría: los 3 tienen exactamente el mismo poder (33.3%)
    const power = computeBanzhafPower(blocs, 51)
    expect(power).toHaveLength(3)
    expect(power[0].banzhafIndexPct).toBeCloseTo(33.33, 1)
    expect(power[1].banzhafIndexPct).toBeCloseTo(33.33, 1)
    expect(power[2].banzhafIndexPct).toBeCloseTo(33.33, 1)
  })
})

describe('Decision Engine — Monte Carlo, TOPSIS, Kelly y Bayes', () => {
  it('ejecuta simulación de Monte Carlo reproducible con semilla fija', () => {
    const factors = [
      { id: 'f1', name: 'Ventas', min: -10, mode: 5, max: 25, weight: 1.5 },
      { id: 'f2', name: 'Costos', min: 0, mode: 5, max: 15, weight: -1.0 },
    ]
    const r1 = runMonteCarloSimulation(20, factors, 0, 1000, 42)
    const r2 = runMonteCarloSimulation(20, factors, 0, 1000, 42)

    expect(r1.mean).toBeCloseTo(r2.mean, 5)
    expect(r1.p90).toBeGreaterThan(r1.p10)
    expect(r1.histogram).toHaveLength(10)
    expect(r1.sensitivity).toHaveLength(2)
  })

  it('ordena alternativas multicriterio mediante TOPSIS', () => {
    const ranking = evaluateTOPSIS(
      [
        { id: 'ret', name: 'Retorno', weight: 10, direction: 'benefit' },
        { id: 'cost', name: 'Costo', weight: 8, direction: 'cost' },
      ],
      [
        { id: 'opt1', name: 'Ideal', scores: { ret: 9, cost: 2 }, reversibility: 'reversible' },
        { id: 'opt2', name: 'Pobre', scores: { ret: 3, cost: 9 }, reversibility: 'irreversible' },
      ]
    )
    expect(ranking[0].name).toBe('Ideal')
    expect(ranking[0].closenessScorePct).toBeGreaterThan(ranking[1].closenessScorePct)
  })

  it('calcula fracción óptima de Kelly y actualiza probabilidades Bayesianas', () => {
    const kelly = computeKellyFraction(0.65, 2.0, 0.5)
    expect(kelly.fullKellyPct).toBeCloseTo(47.5, 1)
    expect(kelly.safeKellyPct).toBeCloseTo(23.8, 1)

    const updated = updateBayesianPriors([0.5, 0.5], [0.8, 0.2])
    expect(updated[0]).toBeCloseTo(0.8, 4)
    expect(updated[1]).toBeCloseTo(0.2, 4)
  })
})

describe('Context Packs Internacionales y Consejo de 4 Lentes', () => {
  it('incluye paquetes internacionales y plantillas en los 4 niveles (L4 a L1)', () => {
    expect(Object.keys(REGIONAL_CONTEXT_PACKS)).toEqual(
      expect.arrayContaining(['GLOBAL', 'AR', 'US', 'BR', 'MX', 'EU'])
    )
    expect(DECISION_TEMPLATES).toHaveLength(4)
  })

  it('genera las 4 lentes estratégicas (Maquiavelo, Meadows, Ariely, Drucker)', () => {
    const lenses = generateMultiVisionAnalysis({
      title: 'Test',
      level: 'L3_EMPRESA',
      consensusChoice: 'Opción B',
      maximinChoice: 'Opción A',
      regretChoice: 'Opción B',
      evpi: 15,
      region: 'GLOBAL',
    })
    expect(lenses).toHaveLength(4)
  })
})
