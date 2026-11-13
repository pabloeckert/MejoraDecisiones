/**
 * Motor Matemático Universal de Toma de Decisiones, Riesgo y Teoría de Juegos
 * Basado en:
 * - Teoría de Juegos (Nash, Inducción Hacia Atrás, Banzhaf, IESDS)
 * - Teoría de la Decisión Bajo Incertidumbre (Wald Maximin, Savage Minimax Regret, Hurwicz, EVPI)
 * - Economía Conductual (Prospect Theory de Kahneman-Tversky / Dan Ariely — Aversión a la pérdida)
 * - Simulación Estocástica (Monte Carlo Triangular / PERT con VaR y CVaR)
 * - Análisis Multicriterio (TOPSIS + Puertas Tipo 1 Irreversibles vs Tipo 2 Reversibles + Kelly)
 * - Actualización Bayesiana en Tiempo Real
 */

export type DecisionLevel = 'L4_MACRO' | 'L3_EMPRESA' | 'L2_PERSONAL' | 'L1_COTIDIANO'

// ============================================================================
// 1. DECISIÓN BAJO INCERTIDUMBRE Y MINIMIZACIÓN DE RIESGO (WALD, SAVAGE, ARIELY)
// ============================================================================

export interface UncertaintyMatrixInput {
  alternatives: string[]
  scenarios: string[]
  probabilities: number[] // Se normalizan automáticamente para sumar 1
  payoffs: number[][]     // payoffs[altIndex][scenarioIndex]
  alpha?: number          // Coeficiente de optimismo de Hurwicz (0..1, default 0.5)
  lossAversionLambda?: number // Coeficiente de aversión a la pérdida de Ariely/Kahneman (default 2.25)
  referencePoint?: number // Punto de referencia para Prospect Theory (default 0)
}

export interface AlternativeEvaluation {
  index: number
  name: string
  expectedValue: number
  minPayoff: number       // Wald (peor caso)
  maxPayoff: number       // Maximax (mejor caso)
  hurwiczValue: number
  maxRegret: number       // Savage (arrepentimiento máximo)
  prospectUtility: number // Kahneman-Tversky / Ariely
  standardDeviation: number
  valueAtRisk95: number
}

export interface UncertaintyAnalysisResult {
  evaluations: AlternativeEvaluation[]
  regretMatrix: number[][]
  normalizedProbabilities: number[]
  recommendations: {
    expectedValueBest: AlternativeEvaluation
    maximinWaldBest: AlternativeEvaluation
    minimaxRegretSavageBest: AlternativeEvaluation
    hurwiczBest: AlternativeEvaluation
    prospectTheoryBest: AlternativeEvaluation
    consensusPick: AlternativeEvaluation
  }
  evpi: {
    expectedValueWithPerfectInfo: number
    bestExpectedValue: number
    evpi: number // Valor Esperado de la Información Perfecta
  }
}

export function normalizeProbabilities(probs: number[]): number[] {
  if (probs.length === 0) return []
  const clean = probs.map((p) => Math.max(0, Number.isFinite(p) ? p : 0))
  const sum = clean.reduce((a, b) => a + b, 0)
  if (sum <= 0) {
    return clean.map(() => 1 / clean.length)
  }
  return clean.map((p) => p / sum)
}

/**
 * Función de valor prospectivo (Kahneman-Tversky / Dan Ariely)
 * Las pérdidas pesan ~2.25x más que las ganancias equivalentes.
 */
export function computeProspectValue(
  payoff: number,
  referencePoint = 0,
  lambda = 2.25,
  curvature = 0.88
): number {
  const delta = payoff - referencePoint
  if (delta >= 0) {
    return Math.pow(delta, curvature)
  }
  return -lambda * Math.pow(-delta, curvature)
}

export function weightProbabilityPrelec(p: number, gamma = 0.65): number {
  const clamped = Math.max(0, Math.min(1, p))
  if (clamped === 0 || clamped === 1) return clamped
  const num = Math.pow(clamped, gamma)
  const den = Math.pow(num + Math.pow(1 - clamped, gamma), 1 / gamma)
  return den === 0 ? clamped : num / den
}

export function evaluateDecisionUnderUncertainty(
  input: UncertaintyMatrixInput
): UncertaintyAnalysisResult {
  const {
    alternatives,
    scenarios,
    probabilities,
    payoffs,
    alpha = 0.5,
    lossAversionLambda = 2.25,
    referencePoint = 0,
  } = input

  const nAlts = alternatives.length
  const nScen = scenarios.length
  const probs = normalizeProbabilities(probabilities)

  // Mejor pago por columna (escenario) para calcular arrepentimiento de Savage
  const bestByScenario: number[] = Array.from({ length: nScen }, (_, j) => {
    let maxCol = -Infinity
    for (let i = 0; i < nAlts; i++) {
      const val = payoffs[i]?.[j] ?? 0
      if (val > maxCol) maxCol = val
    }
    return maxCol === -Infinity ? 0 : maxCol
  })

  // Matriz de arrepentimiento R_ij = max_k(U_kj) - U_ij
  const regretMatrix: number[][] = Array.from({ length: nAlts }, (_, i) =>
    Array.from({ length: nScen }, (__, j) => {
      const val = payoffs[i]?.[j] ?? 0
      return bestByScenario[j] - val
    })
  )

  // Pesos subjetivos de probabilidad para Prospect Theory
  const rawWeights = probs.map((p) => weightProbabilityPrelec(p))
  const weightSum = rawWeights.reduce((a, b) => a + b, 0) || 1
  const decisionWeights = rawWeights.map((w) => w / weightSum)

  const evaluations: AlternativeEvaluation[] = alternatives.map((name, i) => {
    const row = payoffs[i] ?? []
    const minPayoff = row.length ? Math.min(...row) : 0
    const maxPayoff = row.length ? Math.max(...row) : 0
    const expectedValue = row.reduce((sum, val, j) => sum + val * (probs[j] ?? 0), 0)
    const hurwiczValue = alpha * maxPayoff + (1 - alpha) * minPayoff
    const maxRegret = regretMatrix[i]?.length ? Math.max(...regretMatrix[i]) : 0

    const prospectUtility = row.reduce(
      (sum, val, j) =>
        sum +
        computeProspectValue(val, referencePoint, lossAversionLambda) *
          (decisionWeights[j] ?? 0),
      0
    )

    const variance = row.reduce(
      (sum, val, j) => sum + Math.pow(val - expectedValue, 2) * (probs[j] ?? 0),
      0
    )
    const standardDeviation = Math.sqrt(Math.max(0, variance))

    return {
      index: i,
      name,
      expectedValue,
      minPayoff,
      maxPayoff,
      hurwiczValue,
      maxRegret,
      prospectUtility,
      standardDeviation,
      valueAtRisk95: minPayoff,
    }
  })

  const expectedValueBest = [...evaluations].sort((a, b) => b.expectedValue - a.expectedValue)[0]
  const maximinWaldBest = [...evaluations].sort((a, b) => b.minPayoff - a.minPayoff || b.expectedValue - a.expectedValue)[0]
  const minimaxRegretSavageBest = [...evaluations].sort((a, b) => a.maxRegret - b.maxRegret || b.expectedValue - a.expectedValue)[0]
  const hurwiczBest = [...evaluations].sort((a, b) => b.hurwiczValue - a.hurwiczValue)[0]
  const prospectTheoryBest = [...evaluations].sort((a, b) => b.prospectUtility - a.prospectUtility)[0]

  // Consenso por votación de los 5 criterios
  const votes = new Map<number, number>()
  ;[
    expectedValueBest,
    maximinWaldBest,
    minimaxRegretSavageBest,
    hurwiczBest,
    prospectTheoryBest,
  ].forEach((pick) => {
    if (pick) votes.set(pick.index, (votes.get(pick.index) ?? 0) + 1)
  })

  let consensusPick = expectedValueBest
  let maxVotes = -1
  votes.forEach((count, idx) => {
    if (count > maxVotes) {
      maxVotes = count
      consensusPick = evaluations[idx]
    }
  })

  // EVPI = Valor esperado con información perfecta - Mejor valor esperado sin ella
  const expectedValueWithPerfectInfo = bestByScenario.reduce(
    (sum, bestVal, j) => sum + bestVal * (probs[j] ?? 0),
    0
  )
  const bestExpectedValue = expectedValueBest?.expectedValue ?? 0
  const evpi = Math.max(0, expectedValueWithPerfectInfo - bestExpectedValue)

  return {
    evaluations,
    regretMatrix,
    normalizedProbabilities: probs,
    recommendations: {
      expectedValueBest,
      maximinWaldBest,
      minimaxRegretSavageBest,
      hurwiczBest,
      prospectTheoryBest,
      consensusPick,
    },
    evpi: {
      expectedValueWithPerfectInfo,
      bestExpectedValue,
      evpi,
    },
  }
}

// ============================================================================
// 2. TEORÍA DE JUEGOS AVANZADA: DOMINANCIA, ÁRBOLES SECUENCIALES Y PODER BANZHAF
// ============================================================================

export interface DominanceAnalysis {
  dominatedRows: { dominated: number; dominatedBy: number }[]
  dominatedCols: { dominated: number; dominatedBy: number }[]
}

/**
 * Detecta estrategias estrictamente dominadas para Jugador Fila y Jugador Columna.
 */
export function findStrictlyDominatedStrategies(
  rows: number[][],
  cols: number[][]
): DominanceAnalysis {
  const nRows = rows.length
  const nCols = rows[0]?.length ?? 0
  const dominatedRows: { dominated: number; dominatedBy: number }[] = []
  const dominatedCols: { dominated: number; dominatedBy: number }[] = []

  for (let r1 = 0; r1 < nRows; r1++) {
    for (let r2 = 0; r2 < nRows; r2++) {
      if (r1 === r2) continue
      let strictlyBetterAll = true
      for (let c = 0; c < nCols; c++) {
        if ((rows[r2]?.[c] ?? 0) <= (rows[r1]?.[c] ?? 0)) {
          strictlyBetterAll = false
          break
        }
      }
      if (strictlyBetterAll) {
        dominatedRows.push({ dominated: r1, dominatedBy: r2 })
        break
      }
    }
  }

  for (let c1 = 0; c1 < nCols; c1++) {
    for (let c2 = 0; c2 < nCols; c2++) {
      if (c1 === c2) continue
      let strictlyBetterAll = true
      for (let r = 0; r < nRows; r++) {
        if ((cols[r]?.[c2] ?? 0) <= (cols[r]?.[c1] ?? 0)) {
          strictlyBetterAll = false
          break
        }
      }
      if (strictlyBetterAll) {
        dominatedCols.push({ dominated: c1, dominatedBy: c2 })
        break
      }
    }
  }

  return { dominatedRows, dominatedCols }
}

export interface SequentialGameBranch {
  firstMoveLabel: string
  responses: {
    responseLabel: string
    firstMoverPayoff: number
    secondMoverPayoff: number
  }[]
}

export interface SequentialGameSolution {
  optimalFirstMoveIndex: number
  optimalFirstMoveLabel: string
  optimalResponseLabel: string
  equilibriumPayoffs: { firstMover: number; secondMover: number }
  branchEvaluations: {
    firstMoveLabel: string
    predictedResponseLabel: string
    predictedPayoffs: { firstMover: number; secondMover: number }
  }[]
}

/**
 * Inducción Hacia Atrás (Equilibrio Perfecto en Subjuegos — SPE)
 * El Jugador 1 anticipa la respuesta racional del Jugador 2 en cada subjuego.
 */
export function solveSequentialGame(
  branches: SequentialGameBranch[]
): SequentialGameSolution {
  const branchEvaluations = branches.map((b) => {
    const bestResponse = [...b.responses].sort(
      (a, c) => c.secondMoverPayoff - a.secondMoverPayoff || c.firstMoverPayoff - a.firstMoverPayoff
    )[0]
    return {
      firstMoveLabel: b.firstMoveLabel,
      predictedResponseLabel: bestResponse?.responseLabel ?? '',
      predictedPayoffs: {
        firstMover: bestResponse?.firstMoverPayoff ?? 0,
        secondMover: bestResponse?.secondMoverPayoff ?? 0,
      },
    }
  })

  let bestIdx = 0
  let maxPayoff = -Infinity
  branchEvaluations.forEach((ev, idx) => {
    if (ev.predictedPayoffs.firstMover > maxPayoff) {
      maxPayoff = ev.predictedPayoffs.firstMover
      bestIdx = idx
    }
  })

  const chosen = branchEvaluations[bestIdx] ?? {
    firstMoveLabel: '',
    predictedResponseLabel: '',
    predictedPayoffs: { firstMover: 0, secondMover: 0 },
  }

  return {
    optimalFirstMoveIndex: bestIdx,
    optimalFirstMoveLabel: chosen.firstMoveLabel,
    optimalResponseLabel: chosen.predictedResponseLabel,
    equilibriumPayoffs: chosen.predictedPayoffs,
    branchEvaluations,
  }
}

export interface VotingBloc {
  id: string
  name: string
  votes: number
}

export interface BanzhafPowerResult {
  id: string
  name: string
  votes: number
  voteSharePct: number
  criticalSwings: number
  banzhafIndexPct: number // 0..100%
  isVetoPlayer: boolean
}

/**
 * Calcula el Índice de Poder de Banzhaf exacto para bloques parlamentarios o directorios.
 * Un actor es "pivote/crítico" en una coalición ganadora S si al retirarse de S la coalición pierde.
 */
export function computeBanzhafPower(
  blocs: VotingBloc[],
  quota: number
): BanzhafPowerResult[] {
  const n = blocs.length
  const totalVotes = blocs.reduce((s, b) => s + b.votes, 0) || 1
  const swings = new Array<number>(n).fill(0)
  const totalCoalitions = 1 << n

  for (let mask = 1; mask < totalCoalitions; mask++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        sum += blocs[i].votes
      }
    }
    if (sum >= quota) {
      for (let i = 0; i < n; i++) {
        if ((mask & (1 << i)) !== 0 && sum - blocs[i].votes < quota) {
          swings[i]++
        }
      }
    }
  }

  const totalSwings = swings.reduce((a, b) => a + b, 0)
  let winningCoalitionsCount = 0
  for (let mask = 1; mask < totalCoalitions; mask++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) sum += blocs[i].votes
    }
    if (sum >= quota) winningCoalitionsCount++
  }

  return blocs.map((b, i) => ({
    id: b.id,
    name: b.name,
    votes: b.votes,
    voteSharePct: (b.votes / totalVotes) * 100,
    criticalSwings: swings[i],
    banzhafIndexPct: totalSwings > 0 ? (swings[i] / totalSwings) * 100 : 0,
    isVetoPlayer: winningCoalitionsCount > 0 && swings[i] === winningCoalitionsCount,
  }))
}

// ============================================================================
// 3. SIMULADOR DE MONTE CARLO ESTOCÁSTICO (TRIANGULAR / PERT) + SENSIBILIDAD
// ============================================================================

export interface MonteCarloFactor {
  id: string
  name: string
  min: number
  mode: number
  max: number
  weight: number // Impacto por unidad sobre el resultado (positivo o negativo)
}

export interface MonteCarloResult {
  iterations: number
  mean: number
  median: number
  p10: number
  p90: number
  valueAtRisk95: number
  conditionalVaR95: number
  probabilityPositive: number // % de corridas > targetThreshold
  histogram: { bucket: string; count: number; pct: number }[]
  sensitivity: { id: string; name: string; impactScore: number; sharePct: number }[]
}

function createSeededRandom(seed = 42): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sampleTriangular(min: number, mode: number, max: number, rng: () => number): number {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const m = Math.max(lo, Math.min(hi, mode))
  if (hi === lo) return lo
  const u = rng()
  const fc = (m - lo) / (hi - lo)
  if (u < fc) {
    return lo + Math.sqrt(u * (hi - lo) * (m - lo))
  }
  return hi - Math.sqrt((1 - u) * (hi - lo) * (hi - m))
}

export function runMonteCarloSimulation(
  baseOutcome: number,
  factors: MonteCarloFactor[],
  targetThreshold = 0,
  iterations = 3000,
  seed = 1337
): MonteCarloResult {
  const rng = createSeededRandom(seed)
  const outcomes: number[] = new Array(iterations)

  for (let iter = 0; iter < iterations; iter++) {
    let val = baseOutcome
    for (let f = 0; f < factors.length; f++) {
      const factor = factors[f]
      const sample = sampleTriangular(factor.min, factor.mode, factor.max, rng)
      const deltaFromMode = sample - factor.mode
      val += deltaFromMode * factor.weight
    }
    outcomes[iter] = val
  }

  outcomes.sort((a, b) => a - b)

  const sum = outcomes.reduce((a, b) => a + b, 0)
  const mean = sum / iterations
  const median = outcomes[Math.floor(iterations * 0.5)] ?? mean
  const p10 = outcomes[Math.floor(iterations * 0.1)] ?? mean
  const p90 = outcomes[Math.floor(iterations * 0.9)] ?? mean
  const cutoff95 = Math.max(1, Math.floor(iterations * 0.05))
  const valueAtRisk95 = outcomes[cutoff95 - 1] ?? outcomes[0] ?? 0
  const tailSum = outcomes.slice(0, cutoff95).reduce((a, b) => a + b, 0)
  const conditionalVaR95 = tailSum / cutoff95

  const positiveCount = outcomes.filter((v) => v >= targetThreshold).length
  const probabilityPositive = (positiveCount / iterations) * 100

  // Histograma de 10 intervalos
  const minVal = outcomes[0] ?? 0
  const maxVal = outcomes[outcomes.length - 1] ?? 1
  const span = maxVal - minVal || 1
  const bins = 10
  const counts = new Array<number>(bins).fill(0)

  outcomes.forEach((v) => {
    const idx = Math.min(bins - 1, Math.floor(((v - minVal) / span) * bins))
    counts[idx]++
  })

  const histogram = counts.map((count, i) => {
    const start = minVal + (i / bins) * span
    return {
      bucket: `${start >= 0 ? '+' : ''}${start.toFixed(0)}`,
      count,
      pct: Number(((count / iterations) * 100).toFixed(1)),
    }
  })

  // Tornado Sensitivity: rango de variación inducido por cada factor
  const rawSensitivity = factors.map((f) => {
    const swing = Math.abs((f.max - f.min) * f.weight)
    return { id: f.id, name: f.name, impactScore: swing }
  })
  const totalSwing = rawSensitivity.reduce((s, r) => s + r.impactScore, 0) || 1
  const sensitivity = rawSensitivity
    .map((r) => ({
      ...r,
      sharePct: Number(((r.impactScore / totalSwing) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.sharePct - a.sharePct)

  return {
    iterations,
    mean,
    median,
    p10,
    p90,
    valueAtRisk95,
    conditionalVaR95,
    probabilityPositive,
    histogram,
    sensitivity,
  }
}

// ============================================================================
// 4. ANÁLISIS MULTICRITERIO (TOPSIS) + REVERSIBILIDAD Y CRITERIO DE KELLY
// ============================================================================

export interface TopsisCriterion {
  id: string
  name: string
  weight: number           // Importancia (1..10)
  direction: 'benefit' | 'cost' // 'benefit' = más es mejor, 'cost' = menos es mejor
}

export interface TopsisAlternative {
  id: string
  name: string
  scores: Record<string, number> // criterionId -> valor
  reversibility: 'reversible' | 'partially_reversible' | 'irreversible'
}

export interface TopsisRankingItem {
  id: string
  name: string
  closenessScorePct: number // 0..100% cercanía al ideal positivo
  distanceToBest: number
  distanceToWorst: number
  reversibility: TopsisAlternative['reversibility']
  actionVelocity: string
}

export function evaluateTOPSIS(
  criteria: TopsisCriterion[],
  alternatives: TopsisAlternative[]
): TopsisRankingItem[] {
  if (alternatives.length === 0 || criteria.length === 0) return []

  const totalWeight = criteria.reduce((s, c) => s + Math.max(0.01, c.weight), 0)
  const normWeights = criteria.map((c) => Math.max(0.01, c.weight) / totalWeight)

  // Normalización vectorial por columna
  const colNorms = criteria.map((c) => {
    const sumSq = alternatives.reduce((s, alt) => {
      const val = alt.scores[c.id] ?? 0
      return s + val * val
    }, 0)
    return Math.sqrt(sumSq) || 1
  })

  const weightedMatrix = alternatives.map((alt) =>
    criteria.map((c, j) => {
      const raw = alt.scores[c.id] ?? 0
      return (raw / colNorms[j]) * normWeights[j]
    })
  )

  const idealPositive = criteria.map((c, j) => {
    const colVals = weightedMatrix.map((row) => row[j])
    return c.direction === 'benefit' ? Math.max(...colVals) : Math.min(...colVals)
  })

  const idealNegative = criteria.map((c, j) => {
    const colVals = weightedMatrix.map((row) => row[j])
    return c.direction === 'benefit' ? Math.min(...colVals) : Math.max(...colVals)
  })

  return alternatives
    .map((alt, i) => {
      const row = weightedMatrix[i]
      const dPlus = Math.sqrt(
        row.reduce((s, val, j) => s + Math.pow(val - idealPositive[j], 2), 0)
      )
      const dMinus = Math.sqrt(
        row.reduce((s, val, j) => s + Math.pow(val - idealNegative[j], 2), 0)
      )
      const denom = dPlus + dMinus
      const closeness = denom === 0 ? 0.5 : dMinus / denom

      const actionVelocity =
        alt.reversibility === 'reversible'
          ? 'Puerta Tipo 2 (Reversible) — Ejecutar rápido e iterar'
          : alt.reversibility === 'partially_reversible'
          ? 'Híbrida — Validar supuesto clave con piloto acotado'
          : 'Puerta Tipo 1 (Irreversible) — Exigir margen de seguridad y cobertura'

      return {
        id: alt.id,
        name: alt.name,
        closenessScorePct: Number((closeness * 100).toFixed(1)),
        distanceToBest: dPlus,
        distanceToWorst: dMinus,
        reversibility: alt.reversibility,
        actionVelocity,
      }
    })
    .sort((a, b) => b.closenessScorePct - a.closenessScorePct)
}

/**
 * Criterio de Kelly Acotado (Fracción óptima de recursos/capital para evitar ruina)
 * @param winProb Probabilidad de éxito (0..1)
 * @param payoffRatio Ratio ganancia/pérdida (b = ganancia neta / pérdida máxima)
 * @param safetyFraction Factor de prudencia (Half-Kelly = 0.5 por defecto)
 */
export function computeKellyFraction(
  winProb: number,
  payoffRatio: number,
  safetyFraction = 0.5
): { fullKellyPct: number; safeKellyPct: number; recommendation: string } {
  const p = Math.max(0, Math.min(1, winProb))
  const q = 1 - p
  const b = Math.max(0.01, payoffRatio)
  const rawKelly = (p * b - q) / b
  const fullKellyPct = Math.max(0, Math.min(100, rawKelly * 100))
  const safeKellyPct = Number((fullKellyPct * safetyFraction).toFixed(1))

  let recommendation = 'No asignar capital (expectativa matemática negativa o nula).'
  if (safeKellyPct > 0 && safeKellyPct <= 10) {
    recommendation = `Exposición exploratoria acotada (${safeKellyPct}% de tus recursos disponibles).`
  } else if (safeKellyPct > 10 && safeKellyPct <= 25) {
    recommendation = `Apuesta táctica moderada (${safeKellyPct}% de recursos) con stop-loss definido.`
  } else if (safeKellyPct > 25) {
    recommendation = `Alta convicción asimétrica (${safeKellyPct}% de recursos en Half-Kelly; nunca superar 35% en un solo activo).`
  }

  return {
    fullKellyPct: Number(fullKellyPct.toFixed(1)),
    safeKellyPct,
    recommendation,
  }
}

// ============================================================================
// 5. ACTUALIZACIÓN BAYESIANA EN TIEMPO REAL
// ============================================================================

/**
 * Actualiza probabilidades previas P(S_k) ante nueva evidencia E con verosimilitudes P(E | S_k)
 */
export function updateBayesianPriors(
  priors: number[],
  likelihoods: number[]
): number[] {
  const cleanPriors = normalizeProbabilities(priors)
  const unnormalized = cleanPriors.map((prior, i) => {
    const lk = Math.max(0.001, likelihoods[i] ?? 1)
    return prior * lk
  })
  return normalizeProbabilities(unnormalized)
}
