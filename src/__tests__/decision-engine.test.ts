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
  analyzeReversibilityAndPreMortem,
  generateDecisionMarkdownReport,
  generateDecisionJournalCsv,
  evaluateCrossImpactGrid,
  buildDefaultCrossImpactModel,
} from '../lib/decision-engine'
import {
  REGIONAL_CONTEXT_PACKS,
  DECISION_TEMPLATES,
  generateMultiVisionAnalysis,
} from '../lib/context-packs'
import {
  exportFederationBundle,
  importFederationBundle,
  parseFederatedDecisionQuery,
  FEDERATION_SCHEMA_VERSION,
} from '../lib/federation'
import {
  ACTORS,
  GRAPH_NETWORKS,
  getActorPowerVector,
} from '../lib/seed-data'

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
    expect(DECISION_TEMPLATES.length).toBeGreaterThanOrEqual(4)
    const levels = new Set(DECISION_TEMPLATES.map((t) => t.level))
    expect(levels.has('L4_MACRO')).toBe(true)
    expect(levels.has('L3_EMPRESA')).toBe(true)
    expect(levels.has('L2_PERSONAL')).toBe(true)
    expect(levels.has('L1_COTIDIANO')).toBe(true)
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

describe('Federation Bridge & Multi-Network 4D Power Graph', () => {
  it('exporta e importa paquetes federados con validación de schemaVersion', () => {
    const bundle = exportFederationBundle()
    expect(bundle.schemaVersion).toBe(FEDERATION_SCHEMA_VERSION)
    expect(importFederationBundle(bundle)).toBe(true)

    const invalidPayload = { schemaVersion: 'legacy.v0' } as unknown as Parameters<
      typeof importFederationBundle
    >[0]
    expect(importFederationBundle(invalidPayload)).toBe(false)
  })

  it('calcula el Vector de 4 Poderes dentro del rango [10, 99]', () => {
    ACTORS.slice(0, 5).forEach((actor) => {
      const vec = getActorPowerVector(actor)
      ;[vec.institutional, vec.mobilization, vec.financial, vec.narrative].forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(10)
        expect(val).toBeLessThanOrEqual(99)
      })
    })
  })

  it('valida integridad referencial de redes AR, GLOBAL y EMPRESA en GRAPH_NETWORKS', () => {
    expect(Object.keys(GRAPH_NETWORKS)).toEqual(['AR', 'GLOBAL', 'EMPRESA'])
    ;(['AR', 'GLOBAL', 'EMPRESA'] as const).forEach((netId) => {
      const net = GRAPH_NETWORKS[netId]
      expect(net.actors.length).toBeGreaterThanOrEqual(10)
      const ids = new Set(net.actors.map((a) => a.id))
      expect(ids.size).toBe(net.actors.length)
      net.relations.forEach((rel) => {
        expect(ids.has(rel.source)).toBe(true)
        expect(ids.has(rel.target)).toBe(true)
      })
    })
  })

  it('hidrata borradores federados desde URLSearchParams y descarta niveles/regiones inválidos', () => {
    const valid = parseFederatedDecisionQuery(
      new URLSearchParams(
        'title=Expansi%C3%B3n%20UE&level=L3_EMPRESA&region=EU&optA=Filial%20Directa&optB=Partner%20Local&optC=Postergar'
      )
    )
    expect(valid.title).toBe('Expansión UE')
    expect(valid.level).toBe('L3_EMPRESA')
    expect(valid.region).toBe('EU')
    expect(valid.alternatives).toEqual(['Filial Directa', 'Partner Local', 'Postergar'])

    const invalid = parseFederatedDecisionQuery(new URLSearchParams('level=L99_FAKE&region=MARS'))
    expect(invalid.level).toBeUndefined()
    expect(invalid.region).toBeUndefined()
    expect(invalid.alternatives).toBeUndefined()
  })

  it('clasifica reversibilidad (Puertas Tipo 1 vs Tipo 2 de Bezos) y genera auditoría Pre-Mortem', () => {
    const type1 = analyzeReversibilityAndPreMortem({
      title: 'Fusión Empresarial Internacional',
      level: 'L3_EMPRESA',
      chosenAlternative: 'Comprar competidor en Brasil',
      reversibility: 'irreversible',
      worstCaseScenario: 'Crisis cambiaria y litigio regulatorio',
      worstCaseLoss: -75,
      exitCostPct: 80,
      timeToExitMonths: 18,
    })
    expect(type1.doorClassification).toBe('Puerta Tipo 1 (Irreversible / One-Way Door)')
    expect(type1.barbellPrescription.safeAllocationPct).toBe(85)
    expect(type1.failureVectors).toHaveLength(3)
    expect(type1.earlyCanarySignals.length).toBeGreaterThanOrEqual(3)

    const type2 = analyzeReversibilityAndPreMortem({
      title: 'Test A/B de Precios en Web',
      level: 'L1_COTIDIANO',
      chosenAlternative: 'Precio dinámico',
      reversibility: 'reversible',
      exitCostPct: 5,
    })
    expect(type2.doorClassification).toBe('Puerta Tipo 2 (Reversible / Two-Way Door)')
    expect(type2.velocityRule).toContain('velocidad')
    expect(type2.barbellPrescription.asymmetricAllocationPct).toBe(30)
  })

  it('genera reportes ejecutivos Markdown y exportación CSV de la bitácora', () => {
    const preMortem = analyzeReversibilityAndPreMortem({
      title: 'Inversión Planta',
      level: 'L3_EMPRESA',
      chosenAlternative: 'Construir nave industrial',
      reversibility: 'irreversible',
    })

    const md = generateDecisionMarkdownReport({
      title: 'Inversión Planta',
      level: 'L3_EMPRESA',
      regionName: 'Argentina',
      currency: 'ARS',
      chosenAlternative: 'Construir nave industrial',
      expectedValue: 64.5,
      maximinWald: 'Opción A',
      minimaxRegret: 'Opción B',
      evpi: 14.2,
      mcProbabilityPositive: 78.4,
      mcMedian: 62.0,
      mcVaR95: -18.5,
      kellyPct: 18.5,
      topsisRankings: [{ rank: 1, name: 'Construir nave', score: 88.2 }],
      preMortem,
      lensesSummary: [{ lens: 'Maquiavelo', advice: 'Alinear intereses de socios' }],
    })
    expect(md).toContain('# Reporte Ejecutivo de Decisión · MejoraDecisiones OS')
    expect(md).toContain('Puerta Tipo 1')
    expect(md).toContain('Valor Esperado (EV)')

    const csv = generateDecisionJournalCsv([
      {
        id: 'dec-1',
        createdAt: '2026-05-14T12:00:00.000Z',
        level: 'L3_EMPRESA',
        region: 'AR',
        title: 'Expansión Planta, Fábrica',
        chosenAlternative: 'Nave Sur',
        consensusAlternative: 'Nave Sur',
        expectedValue: 50.2,
        maxRegret: 12.0,
        confidencePct: 80,
        reversibility: 'irreversible',
        outcomeStatus: 'success',
        actualOutcomeScore: 55.4,
        notes: 'Nota con "comillas" y comas, test',
      },
    ])
    expect(csv).toContain('id,created_at,level,region,title')
    expect(csv).toContain('dec-1')
    expect(csv).toContain('"Expansión Planta, Fábrica"')
    expect(csv).toContain('"Nota con ""comillas"" y comas, test"')
  })

  it('evaluateCrossImpactGrid genera grilla 5x5 consistente y calcula el índice de robustez global', () => {
    const model = buildDefaultCrossImpactModel(
      [
        { id: 'alt-a', name: 'Cobertura Defensiva' },
        { id: 'alt-b', name: 'Expansión Agresiva' },
        { id: 'alt-c', name: 'Modelo Híbrido Ágil' },
      ],
      'AR'
    )

    const result = evaluateCrossImpactGrid(model.variableX, model.variableY, model.alternatives)
    expect(result.grid).toHaveLength(5)
    result.grid.forEach((row) => {
      expect(row).toHaveLength(5)
    })

    const totalCells = result.grid.flat().length
    expect(totalCells).toBe(25)

    const totalWinPct = result.robustnessScores.reduce((sum, s) => sum + s.winPct, 0)
    expect(Math.round(totalWinPct)).toBe(100)

    expect(result.recommendedAlternativeId).toBeTruthy()
    expect(result.stressFragilityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stressFragilityIndex).toBeLessThanOrEqual(100)
  })

  it('runMonteCarloSimulation con correlación sistémica incrementa la dispersión de cola en crisis (rho > 0)', () => {
    const factors = [
      { id: 'f1', name: 'Demanda', min: -30, mode: 0, max: 30, weight: 1.0 },
      { id: 'f2', name: 'Precios', min: -30, mode: 0, max: 30, weight: 1.2 },
      { id: 'f3', name: 'Actividad', min: -30, mode: 0, max: 30, weight: 1.0 },
    ]

    const simIndep = runMonteCarloSimulation(50, factors, 0, 3000, 42, 0)
    const simCorrelated = runMonteCarloSimulation(50, factors, 0, 3000, 42, 0.7)

    const spanIndep = simIndep.p90 - simIndep.p10
    const spanCorrelated = simCorrelated.p90 - simCorrelated.p10

    // Con alta correlación sistémica positiva, los shocks se alinean y aumentan la dispersión P10-P90
    expect(spanCorrelated).toBeGreaterThan(spanIndep)
    expect(simCorrelated.valueAtRisk95).toBeLessThan(simIndep.valueAtRisk95)
  })
})
