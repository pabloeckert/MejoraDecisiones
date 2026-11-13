import { useState, useMemo, useEffect, useRef, type ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  evaluateDecisionUnderUncertainty,
  runMonteCarloSimulation,
  solveSequentialGame,
  evaluateTOPSIS,
  computeKellyFraction,
  type DecisionLevel,
  type MonteCarloFactor,
  type SequentialGameBranch,
  type TopsisCriterion,
  type TopsisAlternative,
} from '@/lib/decision-engine'
import {
  REGIONAL_CONTEXT_PACKS,
  DECISION_TEMPLATES,
  generateMultiVisionAnalysis,
  type RegionCode,
} from '@/lib/context-packs'
import {
  loadActiveRegion,
  saveActiveRegion,
  loadDecisionJournal,
  saveDecisionEntry,
  updateDecisionOutcome,
  deleteDecisionEntry,
  computeCalibrationMetrics,
  exportFederationBundle,
  importFederationBundle,
  buildDiagnostico4DFederatedUrl,
  type DecisionJournalEntry,
} from '@/lib/federation'
import { useLiveIndicators } from '@/hooks/useLiveIndicators'

const LEVEL_META: {
  level: DecisionLevel
  code: string
  short: string
  title: string
  desc: string
}[] = [
  {
    level: 'L4_MACRO',
    code: 'L4',
    short: 'Macro / Internacional',
    title: 'Geopolítica, Países y Mercados Globales',
    desc: 'Riesgo soberano, monedas, cadenas de suministro e impacto regulatorio multipolar.',
  },
  {
    level: 'L3_EMPRESA',
    code: 'L3',
    short: 'Empresa / Directorio',
    title: 'Estrategia Empresarial, Precios y CAPEX',
    desc: 'Decisiones de inversión, margen, competencia (Océano Azul) y resiliencia operativa.',
  },
  {
    level: 'L2_PERSONAL',
    code: 'L2',
    short: 'Estructural Personal',
    title: 'Visión Personal, Carrera y Patrimonio',
    desc: 'Decisiones de horizonte 1–10 años minimizando el arrepentimiento máximo (Savage).',
  },
  {
    level: 'L1_COTIDIANO',
    code: 'L1',
    short: 'Problema Cotidiano',
    title: 'Negociaciones y Decisiones del Día a Día',
    desc: 'Resolución en 3 minutos para acuerdos, conflictos puntuales y priorización diaria.',
  },
]

export default function DecisionesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialLevel = (searchParams.get('level') as DecisionLevel) || 'L3_EMPRESA'
  const initialRegion = (searchParams.get('region') as RegionCode) || loadActiveRegion()

  const [region, setRegion] = useState<RegionCode>(
    ['GLOBAL', 'AR', 'US', 'BR', 'MX', 'EU'].includes(initialRegion) ? initialRegion : 'AR'
  )
  const [activeLevel, setActiveLevel] = useState<DecisionLevel>(
    ['L4_MACRO', 'L3_EMPRESA', 'L2_PERSONAL', 'L1_COTIDIANO'].includes(initialLevel)
      ? initialLevel
      : 'L3_EMPRESA'
  )
  const [activeEngineTab, setActiveEngineTab] = useState<
    'uncertainty' | 'montecarlo' | 'sequential' | 'topsis'
  >('uncertainty')

  const regionPack = REGIONAL_CONTEXT_PACKS[region]
  const live = useLiveIndicators(regionPack.wbCountryIso)

  // Cargar plantilla correspondiente al nivel activo
  const currentTemplate = useMemo(
    () =>
      DECISION_TEMPLATES.find((t) => t.level === activeLevel) ?? DECISION_TEMPLATES[1],
    [activeLevel]
  )

  const [decisionTitle, setDecisionTitle] = useState<string>(currentTemplate.title)
  const [alternatives, setAlternatives] = useState<string[]>(currentTemplate.alternatives)
  const [scenarios, setScenarios] = useState<string[]>(currentTemplate.scenarios)
  const [probabilities, setProbabilities] = useState<number[]>(
    currentTemplate.probabilities
  )
  const [payoffs, setPayoffs] = useState<number[][]>(
    currentTemplate.payoffs.map((r) => [...r])
  )
  const [alphaHurwicz, setAlphaHurwicz] = useState<number>(0.5)
  const [lambdaAriely, setLambdaAriely] = useState<number>(2.25)
  const [reversibility, setReversibility] = useState<
    'reversible' | 'partially_reversible' | 'irreversible'
  >(currentTemplate.reversibilityDefault)

  // Monte Carlo state
  const [mcBaseOutcome, setMcBaseOutcome] = useState<number>(25)
  const [mcFactors, setMcFactors] = useState<MonteCarloFactor[]>(
    currentTemplate.monteCarloFactors
  )
  const [kellyPayoffRatio, setKellyPayoffRatio] = useState<number>(1.8)

  // Sequential Tree state
  const [seqBranches, setSeqBranches] = useState<SequentialGameBranch[]>(
    currentTemplate.sequentialBranches
  )

  // TOPSIS state
  const [topsisCriteria, setTopsisCriteria] = useState<TopsisCriterion[]>(
    currentTemplate.topsisCriteria
  )
  const [topsisAlts, setTopsisAlts] = useState<TopsisAlternative[]>(
    currentTemplate.topsisAlternatives
  )

  // Bitácora (Decision Journal)
  const [journal, setJournal] = useState<DecisionJournalEntry[]>(() =>
    loadDecisionJournal()
  )
  const [confidenceInput, setConfidenceInput] = useState<number>(75)
  const [journalNote, setJournalNote] = useState<string>('')
  const [copiedShareUrl, setCopiedShareUrl] = useState<boolean>(false)

  // Bloque 1: Importador Federado, Wizard Guiado 60s y Reporte Ejecutivo PDF
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importStatus, setImportStatus] = useState<{
    type: 'ok' | 'err'
    text: string
  } | null>(null)
  const [showExecutiveReport, setShowExecutiveReport] = useState<boolean>(false)
  const [reportTimestamp, setReportTimestamp] = useState<string>('')
  const [showWizard, setShowWizard] = useState<boolean>(false)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1)
  const [wizardTitle, setWizardTitle] = useState<string>('')
  const [wizardLevel, setWizardLevel] = useState<DecisionLevel>(activeLevel)
  const [wizardReversibility, setWizardReversibility] = useState<
    'reversible' | 'partially_reversible' | 'irreversible'
  >('partially_reversible')
  const [wizardOptA, setWizardOptA] = useState<string>(
    'A: Mantener estatus actual / Cobertura conservadora'
  )
  const [wizardOptB, setWizardOptB] = useState<string>(
    'B: Piloto gradual con validación por etapas'
  )
  const [wizardOptC, setWizardOptC] = useState<string>(
    'C: Expansión / Cambio estructural completo'
  )
  const [wizardRiskProfile, setWizardRiskProfile] = useState<
    'optimista' | 'equilibrado' | 'adverso_volatil'
  >('equilibrado')
  const [wizardImpactScale, setWizardImpactScale] = useState<
    'bajo' | 'medio' | 'alto' | 'critico'
  >('alto')
  const [wizardCounterpart, setWizardCounterpart] = useState<string>(
    'Cliente / Competidor / Socio Clave'
  )
  const [wizardPosture, setWizardPosture] = useState<
    'cooperativa' | 'competitiva' | 'defensiva'
  >('competitiva')
  const [wizardAppliedNotice, setWizardAppliedNotice] = useState<boolean>(false)

  // Sincronizar cambio de nivel con su plantilla
  const handleSelectLevel = (lvl: DecisionLevel) => {
    setActiveLevel(lvl)
    const tpl = DECISION_TEMPLATES.find((t) => t.level === lvl) ?? DECISION_TEMPLATES[0]
    setDecisionTitle(tpl.title)
    setAlternatives([...tpl.alternatives])
    setScenarios([...tpl.scenarios])
    setProbabilities([...tpl.probabilities])
    setPayoffs(tpl.payoffs.map((r) => [...r]))
    setReversibility(tpl.reversibilityDefault)
    setMcFactors(tpl.monteCarloFactors.map((f) => ({ ...f })))
    setSeqBranches(
      tpl.sequentialBranches.map((b) => ({
        ...b,
        responses: b.responses.map((r) => ({ ...r })),
      }))
    )
    setTopsisCriteria(tpl.topsisCriteria.map((c) => ({ ...c })))
    setTopsisAlts(
      tpl.topsisAlternatives.map((a) => ({ ...a, scores: { ...a.scores } }))
    )
    setSearchParams({ level: lvl, region })
  }

  const handleSelectRegion = (reg: RegionCode) => {
    setRegion(reg)
    saveActiveRegion(reg)
    setSearchParams({ level: activeLevel, region: reg })
  }

  useEffect(() => {
    saveActiveRegion(region)
  }, [region])

  // Cálculos matemáticos en tiempo real
  const uncertaintyResult = useMemo(
    () =>
      evaluateDecisionUnderUncertainty({
        alternatives,
        scenarios,
        probabilities,
        payoffs,
        alpha: alphaHurwicz,
        lossAversionLambda: lambdaAriely,
      }),
    [alternatives, scenarios, probabilities, payoffs, alphaHurwicz, lambdaAriely]
  )

  const mcResult = useMemo(
    () => runMonteCarloSimulation(mcBaseOutcome, mcFactors, 0, 3000, 1337),
    [mcBaseOutcome, mcFactors]
  )

  const kellyResult = useMemo(
    () => computeKellyFraction(mcResult.probabilityPositive / 100, kellyPayoffRatio, 0.5),
    [mcResult.probabilityPositive, kellyPayoffRatio]
  )

  const seqResult = useMemo(() => solveSequentialGame(seqBranches), [seqBranches])

  const topsisResult = useMemo(
    () => evaluateTOPSIS(topsisCriteria, topsisAlts),
    [topsisCriteria, topsisAlts]
  )

  const multiVisionLenses = useMemo(
    () =>
      generateMultiVisionAnalysis({
        title: decisionTitle,
        level: activeLevel,
        consensusChoice: uncertaintyResult.recommendations.consensusPick?.name ?? '',
        maximinChoice: uncertaintyResult.recommendations.maximinWaldBest?.name ?? '',
        regretChoice:
          uncertaintyResult.recommendations.minimaxRegretSavageBest?.name ?? '',
        evpi: uncertaintyResult.evpi.evpi,
        region,
      }),
    [decisionTitle, activeLevel, uncertaintyResult, region]
  )

  const calibration = useMemo(() => computeCalibrationMetrics(journal), [journal])

  const updatePayoffCell = (altIdx: number, scenIdx: number, val: number) => {
    setPayoffs((prev) =>
      prev.map((row, r) =>
        r === altIdx ? row.map((cell, c) => (c === scenIdx ? val : cell)) : [...row]
      )
    )
  }

  const updateProbability = (scenIdx: number, val: number) => {
    setProbabilities((prev) => prev.map((p, idx) => (idx === scenIdx ? val : p)))
  }

  const handleCommitDecision = () => {
    const pick = uncertaintyResult.recommendations.consensusPick
    const regretPick = uncertaintyResult.recommendations.minimaxRegretSavageBest
    if (!pick) return

    saveDecisionEntry({
      level: activeLevel,
      region,
      title: decisionTitle,
      chosenAlternative: pick.name,
      consensusAlternative: pick.name,
      minimaxRegretAlternative: regretPick?.name ?? pick.name,
      expectedValue: Number(pick.expectedValue.toFixed(1)),
      maxRegret: Number(pick.maxRegret.toFixed(1)),
      confidencePct: confidenceInput,
      reversibility,
      notes:
        journalNote.trim() ||
        `Simulado en contexto ${regionPack.name}. EVPI: ${uncertaintyResult.evpi.evpi.toFixed(1)}. Éxito Monte Carlo: ${mcResult.probabilityPositive.toFixed(1)}%.`,
    })
    setJournal(loadDecisionJournal())
    setJournalNote('')
  }

  const handleExportFederationJson = () => {
    const bundle = exportFederationBundle()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mejora-decision-os-${region.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyShareLink = () => {
    const url = window.location.href
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopiedShareUrl(true)
    setTimeout(() => setCopiedShareUrl(false), 2500)
  }

  const resultsSectionRef = useRef<HTMLDivElement | null>(null)

  const handleImportFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const ok = importFederationBundle(parsed)
      if (ok) {
        const nextReg = loadActiveRegion()
        setRegion(nextReg)
        setJournal(loadDecisionJournal())
        setSearchParams({ level: activeLevel, region: nextReg })
        setImportStatus({
          type: 'ok',
          text: '✓ Paquete federado importado con éxito',
        })
      } else {
        setImportStatus({
          type: 'err',
          text: '⚠ Archivo JSON inválido o esquema incompatible',
        })
      }
    } catch {
      setImportStatus({
        type: 'err',
        text: '⚠ Archivo JSON inválido o esquema incompatible',
      })
    }
    setTimeout(() => setImportStatus(null), 4500)
  }

  const handleApplyWizard = () => {
    const cleanTitle =
      wizardTitle.trim() ||
      `Decisión ${wizardLevel.replace('_', ' ')} (${regionPack.name})`
    const optA = wizardOptA.trim() || 'Opción A: Conservadora / Cobertura'
    const optB = wizardOptB.trim() || 'Opción B: Piloto Gradual / Híbrida'
    const optC = wizardOptC.trim() || 'Opción C: Expansión / Cambio Total'
    const counterpart = wizardCounterpart.trim() || 'Contraparte Clave'

    const impactMultiplier =
      wizardImpactScale === 'bajo'
        ? 15
        : wizardImpactScale === 'medio'
        ? 35
        : wizardImpactScale === 'alto'
        ? 65
        : 100

    const nextProbs =
      wizardRiskProfile === 'optimista'
        ? [0.5, 0.35, 0.15]
        : wizardRiskProfile === 'equilibrado'
        ? [0.3, 0.45, 0.25]
        : [0.2, 0.4, 0.4]

    const postureShift =
      wizardPosture === 'cooperativa'
        ? 10
        : wizardPosture === 'defensiva'
        ? -8
        : -4

    const nextPayoffs: number[][] = [
      [
        Math.round(0.35 * impactMultiplier),
        Math.round(0.2 * impactMultiplier),
        Math.round(-0.05 * impactMultiplier),
      ],
      [
        Math.round(0.68 * impactMultiplier + postureShift * 0.4),
        Math.round(0.34 * impactMultiplier),
        Math.round(-0.22 * impactMultiplier),
      ],
      [
        Math.round(1.15 * impactMultiplier + postureShift * 0.6),
        Math.round(0.18 * impactMultiplier),
        Math.round(-0.72 * impactMultiplier),
      ],
    ]

    const mcBase = Math.round(0.28 * impactMultiplier)
    const nextMcFactors: MonteCarloFactor[] = [
      {
        id: 'demand',
        name: 'Adopción / Tracción de la Decisión (%)',
        min: -20,
        mode: 12,
        max: 45,
        weight: Number((impactMultiplier / 50).toFixed(2)),
      },
      {
        id: 'execution_cost',
        name: 'Fricción / Desvío de Costos (%)',
        min: -10,
        mode: 10,
        max: 35,
        weight: Number((-impactMultiplier / 65).toFixed(2)),
      },
      {
        id: 'macro_shock',
        name: `Volatilidad Externa (${regionPack.code}) (%)`,
        min: -30,
        mode: 0,
        max: 25,
        weight: Number((impactMultiplier / 75).toFixed(2)),
      },
    ]

    const postureDelta =
      wizardPosture === 'cooperativa'
        ? 15
        : wizardPosture === 'competitiva'
        ? -12
        : -6

    const nextBranches: SequentialGameBranch[] = [
      {
        firstMoveLabel: optA,
        responses: [
          {
            responseLabel: `${counterpart}: Acepta acuerdos graduales`,
            firstMoverPayoff: Math.round(0.28 * impactMultiplier),
            secondMoverPayoff: 20 + postureDelta,
          },
          {
            responseLabel: `${counterpart}: Presiona por mejores condiciones`,
            firstMoverPayoff: Math.round(0.12 * impactMultiplier),
            secondMoverPayoff: 16,
          },
        ],
      },
      {
        firstMoveLabel: optB,
        responses: [
          {
            responseLabel: `${counterpart}: Coopera en piloto acotado`,
            firstMoverPayoff: Math.round(0.55 * impactMultiplier + postureDelta * 0.5),
            secondMoverPayoff: wizardPosture === 'cooperativa' ? 35 : 28,
          },
          {
            responseLabel: `${counterpart}: Bloquea expansión inicial`,
            firstMoverPayoff: Math.round(-0.08 * impactMultiplier),
            secondMoverPayoff: wizardPosture === 'defensiva' ? 24 : 18,
          },
        ],
      },
      {
        firstMoveLabel: optC,
        responses: [
          {
            responseLabel: `${counterpart}: Cede ante hechos consumados`,
            firstMoverPayoff: Math.round(0.95 * impactMultiplier),
            secondMoverPayoff: 8,
          },
          {
            responseLabel: `${counterpart}: Guerra de desgaste / Contraofensiva`,
            firstMoverPayoff: Math.round(-0.45 * impactMultiplier),
            secondMoverPayoff: wizardPosture === 'competitiva' ? 32 : 26,
          },
        ],
      },
    ]

    const nextTopsisAlts: TopsisAlternative[] = [
      {
        id: 'wiz-a',
        name: optA,
        scores: {
          c1: 5,
          c2: 9,
          c3: 2,
          c4: 8,
        },
        reversibility: 'reversible',
      },
      {
        id: 'wiz-b',
        name: optB,
        scores: {
          c1: 8,
          c2: 7,
          c3: 5,
          c4: 8,
        },
        reversibility: 'partially_reversible',
      },
      {
        id: 'wiz-c',
        name: optC,
        scores: {
          c1: 10,
          c2: 4,
          c3: 9,
          c4: 5,
        },
        reversibility: wizardReversibility,
      },
    ]

    setActiveLevel(wizardLevel)
    setDecisionTitle(cleanTitle)
    setReversibility(wizardReversibility)
    setAlternatives([optA, optB, optC])
    setScenarios([
      'Escenario Favorable',
      'Escenario Base / Inercial',
      'Escenario Adverso / Estrés',
    ])
    setProbabilities(nextProbs)
    setPayoffs(nextPayoffs)
    setMcBaseOutcome(mcBase)
    setMcFactors(nextMcFactors)
    setKellyPayoffRatio(wizardRiskProfile === 'optimista' ? 2.1 : wizardRiskProfile === 'equilibrado' ? 1.7 : 1.35)
    setSeqBranches(nextBranches)
    setTopsisCriteria([
      { id: 'c1', name: 'Impacto / Retorno Estratégico', weight: 9, direction: 'benefit' },
      { id: 'c2', name: 'Velocidad y Reversibilidad', weight: 8, direction: 'benefit' },
      { id: 'c3', name: 'Capital / Fricción en Riesgo', weight: 7, direction: 'cost' },
      { id: 'c4', name: 'Alineación con Datos y Lentes', weight: 7, direction: 'benefit' },
    ])
    setTopsisAlts(nextTopsisAlts)
    setSearchParams({ level: wizardLevel, region })
    setShowWizard(false)
    setWizardAppliedNotice(true)
    setTimeout(() => setWizardAppliedNotice(false), 5000)
    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <>
      <div
        className={`mx-auto max-w-[1600px] px-6 py-8 space-y-8 ${
          showExecutiveReport ? 'print-hidden' : ''
        }`}
      >
        {/* Header + Selector Internacional */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display text-[10px] uppercase tracking-[0.25em] px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-semibold">
                Decision OS · Multi-Escala
              </span>
              <span className="text-[10px] font-display text-muted-foreground">
                Autónomo · Federation-Ready (v1)
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
              Motor Universal de Decisiones y Escenarios
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1.5 max-w-2xl">
              Proyectá escenarios, medí el riesgo y tomá decisiones fundamentadas en datos en vivo,
              Teoría de Juegos, Simulación de Monte Carlo y Economía Conductual — desde geopolítica
              global y directorio empresarial hasta tu visión personal y dilemas cotidianos.
            </p>
          </div>

          {/* Selector de Contexto Internacional */}
          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Contexto Geográfico / Mercado en Vivo
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REGIONAL_CONTEXT_PACKS) as RegionCode[]).map((code) => {
                const pack = REGIONAL_CONTEXT_PACKS[code]
                const active = region === code
                return (
                  <button
                    key={code}
                    onClick={() => handleSelectRegion(code)}
                    className={`px-2.5 h-8 rounded-md border text-xs font-display flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'border-primary bg-primary/15 text-primary font-semibold shadow-sm'
                        : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{pack.flag}</span>
                    <span>{pack.code}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Pulso Internacional en Tiempo Real (ContextPack + Live APIs) */}
        <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{regionPack.flag}</span>
              <div>
                <div className="font-display text-sm font-bold flex items-center gap-2">
                  <span>Radar de Contexto: {regionPack.name}</span>
                  <span className="text-[10px] font-display px-2 py-0.5 rounded bg-signal-ally/15 text-signal-ally border border-signal-ally/30">
                    {live.loading ? 'Sincronizando APIs...' : 'Fuentes Activas'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{regionPack.summary}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setWizardLevel(activeLevel)
                  setShowWizard((prev) => !prev)
                }}
                className={`px-3 h-7 rounded border text-[10px] font-display font-semibold transition-colors cursor-pointer ${
                  showWizard
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : 'border-amber-400/50 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                }`}
              >
                {showWizard ? '✕ Cerrar Wizard 60s' : '⚡ Wizard Guiado (60s)'}
              </button>
              <button
                onClick={() => {
                  setReportTimestamp(new Date().toLocaleString('es-AR'))
                  setShowExecutiveReport(true)
                }}
                className="px-3 h-7 rounded border border-signal-ally/50 bg-signal-ally/10 text-[10px] font-display font-semibold text-signal-ally hover:bg-signal-ally/20 transition-colors cursor-pointer"
              >
                📄 Informe Ejecutivo / PDF
              </button>
              <button
                onClick={handleCopyShareLink}
                className="px-3 h-7 rounded border border-border text-[10px] font-display text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
              >
                {copiedShareUrl ? '✓ Enlace copiado' : '🔗 Compartir Escenario'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 h-7 rounded border border-border bg-background/60 text-[10px] font-display text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
                title="Importar paquete JSON exportado previamente (mejora.decision-os.v1)"
              >
                📂 Importar Paquete JSON
              </button>
              <button
                onClick={handleExportFederationJson}
                className="px-3 h-7 rounded border border-primary/40 bg-primary/10 text-[10px] font-display text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                title="Exportar paquete JSON compatible con MejoraApp y Diagnóstico 4D"
              >
                ⬇ Exportar Paquete Federado
              </button>
            </div>
          </div>

          {importStatus && (
            <div
              className={`px-3 py-2 rounded border text-xs font-display ${
                importStatus.type === 'ok'
                  ? 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              }`}
            >
              {importStatus.text}
            </div>
          )}

          {wizardAppliedNotice && (
            <div className="px-3 py-2 rounded border border-primary/40 bg-primary/10 text-primary text-xs font-display">
              ✨ Modelo matemático completo generado desde el Wizard 60s — todos los motores abajo reflejan tu problema.
            </div>
          )}

          {/* WIZARD GUIADO DE 60 SEGUNDOS */}
          {showWizard && (
            <div className="bg-background/80 border border-amber-400/40 rounded-lg p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <div className="text-[10px] font-display uppercase tracking-wider text-amber-300 font-bold">
                    ⚡ Asistente Rápido de Decisión (60 Segundos)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Respondé 4 preguntas simples y el motor sintetiza Matriz de Riesgo, Monte Carlo, Árbol Secuencial y TOPSIS automáticamente.
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {([1, 2, 3, 4] as const).map((step) => (
                    <button
                      key={step}
                      onClick={() => setWizardStep(step)}
                      className={`px-2.5 h-7 rounded text-[10px] font-display border cursor-pointer transition-colors ${
                        wizardStep === step
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300 font-bold'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Paso {step}/4
                    </button>
                  ))}
                </div>
              </div>

              {wizardStep === 1 && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      1A. ¿Qué decisión puntual o problema querés resolver hoy?
                    </label>
                    <input
                      type="text"
                      value={wizardTitle}
                      onChange={(e) => setWizardTitle(e.target.value)}
                      placeholder="Ej: Abrir nueva sucursal, renegociar con proveedor clave, cambiar de rol o invertir liquidez..."
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      1B. Escala Fractal del Problema
                    </label>
                    <select
                      value={wizardLevel}
                      onChange={(e) => setWizardLevel(e.target.value as DecisionLevel)}
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs font-display outline-none"
                    >
                      {LEVEL_META.map((m) => (
                        <option key={m.level} value={m.level}>
                          {m.code} · {m.short} — {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      1C. Reversibilidad si sale mal
                    </label>
                    <select
                      value={wizardReversibility}
                      onChange={(e) =>
                        setWizardReversibility(
                          e.target.value as
                            | 'reversible'
                            | 'partially_reversible'
                            | 'irreversible'
                        )
                      }
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs font-display outline-none"
                    >
                      <option value="reversible">Tipo 2 · Reversible rápido</option>
                      <option value="partially_reversible">Híbrida · Costo moderado</option>
                      <option value="irreversible">Tipo 1 · Irreversible / Alta asimetría</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      2A. Camino Conservador / Piso Seguro
                    </label>
                    <input
                      type="text"
                      value={wizardOptA}
                      onChange={(e) => setWizardOptA(e.target.value)}
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      2B. Camino Gradual / Piloto Híbrido
                    </label>
                    <input
                      type="text"
                      value={wizardOptB}
                      onChange={(e) => setWizardOptB(e.target.value)}
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      2C. Camino Ofensivo / Apuesta Total
                    </label>
                    <input
                      type="text"
                      value={wizardOptC}
                      onChange={(e) => setWizardOptC(e.target.value)}
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      3A. Clima del Entorno / Probabilidades de Escenario
                    </label>
                    <select
                      value={wizardRiskProfile}
                      onChange={(e) =>
                        setWizardRiskProfile(
                          e.target.value as 'optimista' | 'equilibrado' | 'adverso_volatil'
                        )
                      }
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs font-display outline-none"
                    >
                      <option value="optimista">
                        Optimista en expansión (50% Favorable / 35% Base / 15% Estrés)
                      </option>
                      <option value="equilibrado">
                        Equilibrado / Incertidumbre media (30% Favorable / 45% Base / 25% Estrés)
                      </option>
                      <option value="adverso_volatil">
                        Adverso / Alta volatilidad macro (20% Favorable / 40% Base / 40% Estrés)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      3B. Magnitud del Capital o Impacto en Juego
                    </label>
                    <select
                      value={wizardImpactScale}
                      onChange={(e) =>
                        setWizardImpactScale(
                          e.target.value as 'bajo' | 'medio' | 'alto' | 'critico'
                        )
                      }
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs font-display outline-none"
                    >
                      <option value="bajo">Bajo (cotidiano / reversible sin pérdida crítica)</option>
                      <option value="medio">Medio (presupuesto operativo trimestral)</option>
                      <option value="alto">Alto (proyecto estratégico anual / CAPEX)</option>
                      <option value="critico">Crítico / Existencial (patrimonio o continuidad)</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      4A. ¿Quién reacciona a tu movimiento? (Contraparte)
                    </label>
                    <input
                      type="text"
                      value={wizardCounterpart}
                      onChange={(e) => setWizardCounterpart(e.target.value)}
                      placeholder="Ej: Competidor principal, Cliente corporativo, Socio, Gremio, Regulador..."
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                      4B. Postura esperada de esa contraparte
                    </label>
                    <select
                      value={wizardPosture}
                      onChange={(e) =>
                        setWizardPosture(
                          e.target.value as 'cooperativa' | 'competitiva' | 'defensiva'
                        )
                      }
                      className="w-full bg-card border border-border rounded px-3 py-2 text-xs font-display outline-none"
                    >
                      <option value="cooperativa">Cooperativa (busca acuerdo ganar-ganar)</option>
                      <option value="competitiva">Competitiva / Suma cero (responde con presión)</option>
                      <option value="defensiva">Defensiva / Aversa al cambio (bloquea saltos bruscos)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setWizardStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1))
                    }
                    disabled={wizardStep === 1}
                    className="px-3 h-8 rounded border border-border text-xs font-display text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    ← Anterior
                  </button>
                  {wizardStep < 4 && (
                    <button
                      onClick={() =>
                        setWizardStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : 4))
                      }
                      className="px-3 h-8 rounded border border-primary/50 bg-primary/15 text-primary text-xs font-display font-semibold hover:bg-primary/25 cursor-pointer"
                    >
                      Siguiente Paso →
                    </button>
                  )}
                </div>

                <button
                  onClick={handleApplyWizard}
                  className="px-4 h-8 rounded bg-primary text-primary-foreground font-display text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  ✨ Calcular y Poblar Todos los Motores
                </button>
              </div>
            </div>
          )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regionPack.vitals.map((v, i) => {
            // Si estamos en AR o si llegaron datos del Banco Mundial / Frankfurter, enriquecemos en vivo
            let liveValue = v.value
            let isLive = false
            if (region === 'AR' && i === 0 && live.inflacion?.length) {
              liveValue = `${live.inflacion[live.inflacion.length - 1].valor.toFixed(1)}%`
              isLive = true
            } else if (region === 'AR' && i === 1 && live.reservas) {
              liveValue = `USD ${(live.reservas.valor / 1000).toFixed(1)}B`
              isLive = true
            } else if (
              region !== 'AR' &&
              i === 0 &&
              live.worldBank?.inflationAnnualPct !== null &&
              live.worldBank?.inflationAnnualPct !== undefined
            ) {
              liveValue = `${live.worldBank.inflationAnnualPct}% (${live.worldBank.year})`
              isLive = true
            }

            return (
              <div
                key={v.label}
                className="bg-background/60 border border-border/50 rounded-md p-3"
              >
                <div className="flex items-center justify-between text-[10px] font-display text-muted-foreground">
                  <span>{v.label}</span>
                  <span
                    className={`uppercase text-[8px] px-1.5 py-0.2 rounded ${
                      isLive
                        ? 'bg-signal-ally/15 text-signal-ally'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isLive ? 'LIVE API' : v.source}
                  </span>
                </div>
                <div className="font-display text-lg font-bold mt-1">{liveValue}</div>
              </div>
            )
          })}
        </div>

        {/* Divisas Internacionales en Vivo (Frankfurter + DolarAPI) */}
        {(live.globalFx || live.dolar) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 border-t border-border/40 text-[11px] font-display text-muted-foreground">
            <span className="text-primary font-semibold uppercase tracking-wider text-[10px]">
              Cotizaciones Globales en Vivo:
            </span>
            {live.globalFx?.rates?.EUR && (
              <span>USD/EUR: {live.globalFx.rates.EUR.toFixed(3)}</span>
            )}
            {live.globalFx?.rates?.BRL && (
              <span>USD/BRL: R$ {live.globalFx.rates.BRL.toFixed(2)}</span>
            )}
            {live.globalFx?.rates?.MXN && (
              <span>USD/MXN: $ {live.globalFx.rates.MXN.toFixed(2)}</span>
            )}
            {live.globalFx?.rates?.GBP && (
              <span>USD/GBP: £ {live.globalFx.rates.GBP.toFixed(3)}</span>
            )}
            {live.dolar?.[0]?.venta && (
              <span>
                USD/ARS Oficial: ${Math.round(live.dolar[0].venta).toLocaleString('es-AR')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selector de los 4 Niveles Fractales de Decisión (L4 -> L1) */}
      <div>
        <div className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-3">
          1. Elegí la Escala de tu Problema o Decisión
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LEVEL_META.map((item) => {
            const active = activeLevel === item.level
            return (
              <button
                key={item.level}
                onClick={() => handleSelectLevel(item.level)}
                className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                  active
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border/60 bg-card hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display text-xs font-bold text-primary">
                    {item.code} · {item.short}
                  </span>
                  {active && (
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <div className="font-display text-sm font-semibold text-foreground">
                  {item.title}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Barra de Definición del Problema Activo */}
      <div className="bg-card border border-border/60 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-[10px] font-display uppercase tracking-wider text-primary mb-1">
            2. Problema o Decisión bajo análisis (Editable)
          </label>
          <input
            type="text"
            value={decisionTitle}
            onChange={(e) => setDecisionTitle(e.target.value)}
            className="w-full bg-background/60 border border-border rounded px-3 py-2 font-display text-sm md:text-base font-semibold outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div>
            <label className="block text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-1">
              Tipo de Puerta (Reversibilidad)
            </label>
            <select
              value={reversibility}
              onChange={(e) =>
                setReversibility(
                  e.target.value as
                    | 'reversible'
                    | 'partially_reversible'
                    | 'irreversible'
                )
              }
              className="bg-background border border-border rounded px-3 py-2 text-xs font-display text-foreground outline-none"
            >
              <option value="reversible">
                Puerta Tipo 2: Reversible (bajo costo de corrección)
              </option>
              <option value="partially_reversible">
                Híbrida: Parcialmente reversible (con costo moderado)
              </option>
              <option value="irreversible">
                Puerta Tipo 1: Irreversible (alta asimetría)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Veredicto Matemático Inmediato (5 Criterios de Decisión) */}
      <div
        ref={resultsSectionRef}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <div className="bg-primary/10 border border-primary/40 rounded-lg p-4">
          <div className="text-[9px] font-display uppercase tracking-wider text-primary font-bold">
            🏆 Decisión Consenso (Óptima)
          </div>
          <div className="font-display text-sm font-bold mt-1.5">
            {uncertaintyResult.recommendations.consensusPick?.name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Valor Esperado:{' '}
            <span className="text-foreground font-display font-semibold">
              {uncertaintyResult.recommendations.consensusPick?.expectedValue.toFixed(1)} pts
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[9px] font-display uppercase tracking-wider text-signal-ally font-semibold">
            🛡️ Criterio Savage (Mín. Arrepentimiento)
          </div>
          <div className="font-display text-sm font-semibold mt-1.5">
            {uncertaintyResult.recommendations.minimaxRegretSavageBest?.name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Arrepentimiento máx:{' '}
            <span className="text-foreground font-display">
              {uncertaintyResult.recommendations.minimaxRegretSavageBest?.maxRegret.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[9px] font-display uppercase tracking-wider text-amber-400 font-semibold">
            🧱 Criterio Wald (Maximin Supervivencia)
          </div>
          <div className="font-display text-sm font-semibold mt-1.5">
            {uncertaintyResult.recommendations.maximinWaldBest?.name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Peor escenario piso:{' '}
            <span className="text-foreground font-display">
              {uncertaintyResult.recommendations.maximinWaldBest?.minPayoff.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[9px] font-display uppercase tracking-wider text-chart-2 font-semibold">
            🧠 Utilidad Prospectiva (Ariely λ={lambdaAriely})
          </div>
          <div className="font-display text-sm font-semibold mt-1.5">
            {uncertaintyResult.recommendations.prospectTheoryBest?.name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Ajustada por aversión a pérdida
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground font-semibold">
            🔎 Valor Info Perfecta (EVPI)
          </div>
          <div className="font-display text-xl font-bold text-primary mt-1">
            {uncertaintyResult.evpi.evpi.toFixed(1)} pts
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {uncertaintyResult.evpi.evpi > 12
              ? 'Vale pagar/investigar antes de decidir'
              : 'No demorar: información suficiente'}
          </div>
        </div>
      </div>

      {/* Selector de Motores Matemáticos */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {(
          [
            {
              id: 'uncertainty',
              label: '01 · Matriz de Escenarios y Arrepentimiento (Wald / Savage / Ariely)',
            },
            {
              id: 'montecarlo',
              label: '02 · Simulación Monte Carlo (3.000 corridas + VaR + Kelly)',
            },
            {
              id: 'sequential',
              label: '03 · Árbol de Juego Secuencial (Inducción Hacia Atrás)',
            },
            {
              id: 'topsis',
              label: '04 · Multicriterio TOPSIS (Priorización Rápida)',
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveEngineTab(tab.id)}
            className={`px-3.5 py-2 rounded-md border text-xs font-display transition-all cursor-pointer ${
              activeEngineTab === tab.id
                ? 'border-primary bg-primary/15 text-primary font-semibold'
                : 'border-border/50 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MOTOR 1: MATRIZ DE DECISIÓN BAJO INCERTIDUMBRE */}
      {activeEngineTab === 'uncertainty' && (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="bg-card border border-border/60 rounded-lg p-5 overflow-x-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                  Matriz Interactiva: Tus Opciones vs. Escenarios Probables
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Editá las probabilidades de cada escenario y el resultado esperado (-100 a +100) de cada alternativa.
                </p>
              </div>
            </div>

            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2.5 text-[10px] font-display uppercase text-muted-foreground w-56">
                    Alternativa \ Escenario
                  </th>
                  {scenarios.map((scen, j) => (
                    <th key={j} className="p-2.5 border-l border-border/60">
                      <input
                        type="text"
                        value={scen}
                        onChange={(e) => {
                          const next = [...scenarios]
                          next[j] = e.target.value
                          setScenarios(next)
                        }}
                        className="w-full bg-transparent font-display text-xs text-foreground outline-none focus:text-primary"
                      />
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-display text-muted-foreground">
                          Prob:
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={probabilities[j]}
                          onChange={(e) =>
                            updateProbability(j, Number(e.target.value))
                          }
                          className="w-14 bg-background border border-border rounded px-1.5 py-0.5 text-xs font-display text-primary"
                        />
                        <span className="text-[10px] font-display text-muted-foreground">
                          % (norm:{' '}
                          {(
                            (uncertaintyResult.normalizedProbabilities[j] ?? 0) * 100
                          ).toFixed(0)}
                          %)
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="p-2.5 border-l border-border text-[10px] font-display uppercase text-primary">
                    Valor Esp.
                  </th>
                  <th className="p-2.5 border-l border-border text-[10px] font-display uppercase text-signal-ally">
                    Arrepent. Máx
                  </th>
                </tr>
              </thead>
              <tbody>
                {alternatives.map((alt, i) => {
                  const ev = uncertaintyResult.evaluations[i]
                  const isConsensus =
                    uncertaintyResult.recommendations.consensusPick?.index === i
                  return (
                    <tr
                      key={i}
                      className={`border-b border-border/60 ${
                        isConsensus ? 'bg-primary/10' : ''
                      }`}
                    >
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={alt}
                          onChange={(e) => {
                            const next = [...alternatives]
                            next[i] = e.target.value
                            setAlternatives(next)
                          }}
                          className="w-full bg-transparent font-display text-xs font-medium outline-none focus:text-primary"
                        />
                      </td>
                      {scenarios.map((_, j) => (
                        <td key={j} className="p-2.5 border-l border-border/60">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="number"
                              value={payoffs[i]?.[j] ?? 0}
                              onChange={(e) =>
                                updatePayoffCell(i, j, Number(e.target.value))
                              }
                              className="w-20 bg-background border border-border rounded px-2 py-1 font-display text-xs text-foreground outline-none focus:border-primary"
                            />
                            <span className="text-[10px] font-display text-muted-foreground">
                              Regret: {uncertaintyResult.regretMatrix[i]?.[j]?.toFixed(0)}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="p-2.5 border-l border-border font-display text-sm font-bold text-primary">
                        {ev?.expectedValue.toFixed(1)}
                      </td>
                      <td className="p-2.5 border-l border-border font-display text-sm text-signal-ally">
                        {ev?.maxRegret.toFixed(1)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Parámetros Conductuales (Hurwicz & Ariely) */}
          <div className="bg-card border border-border/60 rounded-lg p-5 space-y-5">
            <div className="font-display text-xs uppercase tracking-wider text-primary font-semibold">
              Calibración de Riesgo y Psicología
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Índice de Optimismo (Hurwicz α)</span>
                <span className="text-primary">{(alphaHurwicz * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={alphaHurwicz}
                onChange={(e) => setAlphaHurwicz(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>0% (Pesimista Wald)</span>
                <span>100% (Maximax)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Aversión a la Pérdida (Ariely λ)</span>
                <span className="text-primary">{lambdaAriely.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3.5}
                step={0.25}
                value={lambdaAriely}
                onChange={(e) => setLambdaAriely(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                En Economía Conductual (Kahneman / Ariely), una pérdida duele 2.25 veces
                más que una ganancia equivalente. Subilo a 3.0x si el capital en juego compromete
                tu estabilidad familiar o de caja.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MOTOR 2: SIMULACIÓN DE MONTE CARLO + SENSIBILIDAD TORNADO + KELLY */}
      {activeEngineTab === 'montecarlo' && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase text-muted-foreground">
                  Probabilidad de Éxito
                </div>
                <div className="font-display text-2xl font-bold text-signal-ally mt-1">
                  {mcResult.probabilityPositive.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  en {mcResult.iterations} escenarios simulados
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase text-muted-foreground">
                  Resultado Medio / P50
                </div>
                <div className="font-display text-2xl font-bold text-primary mt-1">
                  {mcResult.mean >= 0 ? '+' : ''}
                  {mcResult.mean.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Rango P10–P90: [{mcResult.p10.toFixed(0)} a {mcResult.p90.toFixed(0)}]
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase text-muted-foreground">
                  VaR 95% / CVaR (Cola de Riesgo)
                </div>
                <div className="font-display text-2xl font-bold text-signal-rival mt-1">
                  {mcResult.valueAtRisk95.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Expected Shortfall: {mcResult.conditionalVaR95.toFixed(1)}
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase text-muted-foreground">
                  Criterio de Kelly (Asignación)
                </div>
                <div className="font-display text-2xl font-bold text-amber-400 mt-1">
                  {kellyResult.safeKellyPct}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Half-Kelly anti-ruina (Full: {kellyResult.fullKellyPct}%)
                </div>
              </div>
            </div>

            {/* Distribución de Probabilidad Monte Carlo */}
            <div className="bg-card border border-border/60 rounded-lg p-5">
              <div className="text-xs font-display uppercase tracking-wider text-primary font-semibold mb-1">
                Distribución de 3.000 Escenarios Estocásticos (Muestreo Triangular / PERT)
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                 {kellyResult.recommendation}
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mcResult.histogram}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="bucket"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip />
                    <Bar
                      dataKey="pct"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tornado Sensitivity */}
            <div className="bg-card border border-border/60 rounded-lg p-5 space-y-3">
              <div className="text-xs font-display uppercase tracking-wider text-muted-foreground font-semibold">
                Gráfico de Tornado — ¿Qué variable explica la mayor parte de tu riesgo?
              </div>
              {mcResult.sensitivity.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-display">
                    <span>{s.name}</span>
                    <span className="text-primary font-semibold">{s.sharePct}% de la varianza</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${s.sharePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de Variables Estocásticas */}
          <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
            <div className="font-display text-xs uppercase tracking-wider text-primary font-semibold">
              Variables de Incertidumbre (Mín / Probable / Máx)
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Resultado Base Esperado</span>
                <span className="text-primary">{mcBaseOutcome} pts</span>
              </div>
              <input
                type="range"
                min={-20}
                max={60}
                value={mcBaseOutcome}
                onChange={(e) => setMcBaseOutcome(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Ratio Ganancia/Pérdida (Kelly b)</span>
                <span className="text-primary">{kellyPayoffRatio.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={kellyPayoffRatio}
                onChange={(e) => setKellyPayoffRatio(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-border/50">
              {mcFactors.map((f, idx) => (
                <div
                  key={f.id}
                  className="p-3 bg-background/60 border border-border/50 rounded-md space-y-2"
                >
                  <div className="font-display text-xs font-semibold">{f.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-display">
                    <div>
                      <span className="text-muted-foreground block">Pesimista</span>
                      <input
                        type="number"
                        value={f.min}
                        onChange={(e) => {
                          const next = [...mcFactors]
                          next[idx] = { ...f, min: Number(e.target.value) }
                          setMcFactors(next)
                        }}
                        className="w-full bg-card border border-border rounded px-1.5 py-1 mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Probable</span>
                      <input
                        type="number"
                        value={f.mode}
                        onChange={(e) => {
                          const next = [...mcFactors]
                          next[idx] = { ...f, mode: Number(e.target.value) }
                          setMcFactors(next)
                        }}
                        className="w-full bg-card border border-border rounded px-1.5 py-1 mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Optimista</span>
                      <input
                        type="number"
                        value={f.max}
                        onChange={(e) => {
                          const next = [...mcFactors]
                          next[idx] = { ...f, max: Number(e.target.value) }
                          setMcFactors(next)
                        }}
                        className="w-full bg-card border border-border rounded px-1.5 py-1 mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOTOR 3: ÁRBOL DE JUEGO SECUENCIAL (INDUCCIÓN HACIA ATRÁS) */}
      {activeEngineTab === 'sequential' && (
        <div className="bg-card border border-border/60 rounded-lg p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                Árbol de Decisión Secuencial (Inducción Hacia Atrás — Equilibrio Perfecto en Subjuegos)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cuando vos movés primero y la otra parte (cliente, socio, competidor o gobierno) responde mirando su propio interés.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-md px-4 py-2.5">
              <div className="text-[10px] font-display uppercase text-primary font-semibold">
                Camino de Equilibrio Secuencial (SPE)
              </div>
              <div className="font-display text-xs font-bold mt-0.5">
                1º Elegís: "{seqResult.optimalFirstMoveLabel}" → 2º Responden: "
                {seqResult.optimalResponseLabel}"
              </div>
              <div className="text-[10px] text-muted-foreground">
                Pago resultante: Vos {seqResult.equilibriumPayoffs.firstMover} pts · Contraparte{' '}
                {seqResult.equilibriumPayoffs.secondMover} pts
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {seqBranches.map((branch, bIdx) => {
              const isOptimalBranch = seqResult.optimalFirstMoveIndex === bIdx
              return (
                <div
                  key={bIdx}
                  className={`p-4 rounded-lg border ${
                    isOptimalBranch
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 bg-background/40'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-display uppercase text-primary font-bold">
                      Tu Jugada Inicial #{bIdx + 1}
                    </span>
                    {isOptimalBranch && (
                      <span className="text-[10px] font-display px-2 py-0.5 rounded bg-primary/20 text-primary">
                        Jugada Óptima Anticipada
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={branch.firstMoveLabel}
                    onChange={(e) => {
                      const next = [...seqBranches]
                      next[bIdx] = { ...branch, firstMoveLabel: e.target.value }
                      setSeqBranches(next)
                    }}
                    className="w-full bg-card border border-border rounded px-3 py-1.5 font-display text-xs font-semibold"
                  />

                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-display uppercase text-muted-foreground">
                      Posibles Respuestas de la Contraparte:
                    </div>
                    {branch.responses.map((resp, rIdx) => {
                      const isPredictedResponse =
                        seqResult.branchEvaluations[bIdx]?.predictedResponseLabel ===
                        resp.responseLabel
                      return (
                        <div
                          key={rIdx}
                          className={`p-3 rounded border ${
                            isPredictedResponse
                              ? 'border-signal-ally/50 bg-signal-ally/10'
                              : 'border-border/50 bg-card'
                          } space-y-2`}
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={resp.responseLabel}
                              onChange={(e) => {
                                const next = [...seqBranches]
                                const nextResps = [...branch.responses]
                                nextResps[rIdx] = {
                                  ...resp,
                                  responseLabel: e.target.value,
                                }
                                next[bIdx] = { ...branch, responses: nextResps }
                                setSeqBranches(next)
                              }}
                              className="bg-transparent font-display text-xs font-medium w-full outline-none"
                            />
                            {isPredictedResponse && (
                              <span className="text-[9px] font-display text-signal-ally shrink-0 ml-2">
                                ← Mejor respuesta de ellos
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-display">
                            <label className="flex items-center gap-1.5">
                              <span className="text-muted-foreground text-[10px]">
                                Tu Pago:
                              </span>
                              <input
                                type="number"
                                value={resp.firstMoverPayoff}
                                onChange={(e) => {
                                  const next = [...seqBranches]
                                  const nextResps = [...branch.responses]
                                  nextResps[rIdx] = {
                                    ...resp,
                                    firstMoverPayoff: Number(e.target.value),
                                  }
                                  next[bIdx] = { ...branch, responses: nextResps }
                                  setSeqBranches(next)
                                }}
                                className="w-16 bg-background border border-border rounded px-1.5 py-0.5 text-primary"
                              />
                            </label>
                            <label className="flex items-center gap-1.5">
                              <span className="text-muted-foreground text-[10px]">
                                Pago Contraparte:
                              </span>
                              <input
                                type="number"
                                value={resp.secondMoverPayoff}
                                onChange={(e) => {
                                  const next = [...seqBranches]
                                  const nextResps = [...branch.responses]
                                  nextResps[rIdx] = {
                                    ...resp,
                                    secondMoverPayoff: Number(e.target.value),
                                  }
                                  next[bIdx] = { ...branch, responses: nextResps }
                                  setSeqBranches(next)
                                }}
                                className="w-16 bg-background border border-border rounded px-1.5 py-0.5 text-signal-ally"
                              />
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MOTOR 4: MULTICRITERIO TOPSIS + REVERSIBILIDAD */}
      {activeEngineTab === 'topsis' && (
        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Matriz Multicriterio TOPSIS (Distancia al Ideal Positivo vs. Negativo)
            </h2>
            <p className="text-xs text-muted-foreground">
              Ponderá de 1 a 10 cada criterio para ordenar racionalmente opciones cotidianas, contrataciones o inversiones.
            </p>
            <div className="space-y-3">
              {topsisAlts.map((alt, aIdx) => (
                <div
                  key={alt.id}
                  className="p-3 bg-background/60 border border-border/60 rounded-md space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-bold">{alt.name}</span>
                    <span className="text-[10px] font-display text-muted-foreground">
                      {alt.reversibility === 'reversible'
                        ? 'Puerta Tipo 2 (Reversible)'
                        : alt.reversibility === 'partially_reversible'
                        ? 'Parcialmente reversible'
                        : 'Puerta Tipo 1 (Irreversible)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {topsisCriteria.map((c) => (
                      <div key={c.id} className="text-[10px] font-display">
                        <span className="text-muted-foreground block truncate">
                          {c.name} ({c.direction === 'benefit' ? '↑ benef' : '↓ costo'})
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={alt.scores[c.id] ?? 5}
                          onChange={(e) => {
                            const next = [...topsisAlts]
                            next[aIdx] = {
                              ...alt,
                              scores: {
                                ...alt.scores,
                                [c.id]: Number(e.target.value),
                              },
                            }
                            setTopsisAlts(next)
                          }}
                          className="w-full bg-card border border-border rounded px-2 py-1 mt-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
            <div className="font-display text-xs uppercase tracking-wider text-primary font-semibold">
              Ranking Ideal TOPSIS y Velocidad de Ejecución
            </div>
            <div className="space-y-3">
              {topsisResult.map((item, rank) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border ${
                    rank === 0
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 bg-background/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold">
                      #{rank + 1} · {item.name}
                    </span>
                    <span className="font-display text-base font-bold text-primary">
                      {item.closenessScorePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden my-2">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${item.closenessScorePct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.actionVelocity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONSEJO DE LAS 4 LENTES ESTRATÉGICAS (MÚLTIPLES VISIONES BASADAS EN LIBROS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-display uppercase tracking-[0.2em] text-primary font-semibold">
              3. Triangulación Epistémica · Múltiples Visiones
            </div>
            <h2 className="font-display text-lg font-bold">
              El Consejo de las 4 Lentes Estratégicas sobre tu Decisión
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {multiVisionLenses.map((lens) => (
            <div
              key={lens.id}
              className="bg-card border border-border/60 rounded-lg p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lens.icon}</span>
                  <div>
                    <div className="font-display text-xs font-bold leading-tight">
                      {lens.title}
                    </div>
                    <div className="text-[10px] font-display text-primary">
                      {lens.authors}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lens.diagnosis}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40 text-[11px]">
                <div className="text-amber-400/90">
                  <strong className="font-display uppercase text-[9px]">
                    Punto Ciego:{' '}
                  </strong>
                  {lens.blindSpotWarning}
                </div>
                <div className="text-signal-ally">
                  <strong className="font-display uppercase text-[9px]">
                    Acción:{' '}
                  </strong>
                  {lens.tacticalPrescription}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BITÁCORA DE DECISIONES (DECISION JOURNAL) + CALIBRACIÓN BRIER SCORE */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 pt-4 border-t border-border/60">
        <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
          <div className="font-display text-xs uppercase tracking-wider text-primary font-semibold">
            4. Registrar en Bitácora de Decisiones
          </div>
          <p className="text-xs text-muted-foreground">
            Guardá la decisión tomada hoy junto con tu nivel de confianza para auditar tus predicciones y medir tu Brier Score.
          </p>

          <div>
            <div className="flex justify-between text-xs font-display mb-1">
              <span>Tu Confianza en el Resultado</span>
              <span className="text-primary font-bold">{confidenceInput}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={99}
              value={confidenceInput}
              onChange={(e) => setConfidenceInput(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
              Supuesto crítico o condición de salida (Stop-Loss)
            </label>
            <textarea
              rows={2}
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              placeholder="Ej: Revisar en 30 días si las ventas o el tipo de cambio se desvían >15%..."
              className="w-full bg-background border border-border rounded p-2 text-xs outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={handleCommitDecision}
            className="w-full h-9 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            + Guardar Decisión en Bitácora
          </button>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-display">
              Brier Score de Calibración:
            </span>
            <span className="font-display font-bold text-primary">
              {calibration.brierScore !== null
                ? `${calibration.brierScore} (${calibration.calibrationGrade})`
                : calibration.calibrationGrade}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Historial Auditable ({journal.length} decisiones registradas)
            </div>
            <a
              href={buildDiagnostico4DFederatedUrl('decision_journal')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-display text-primary hover:underline font-semibold"
            >
              Conectar con Diagnóstico 4D Empresarial →
            </a>
          </div>

          {journal.length === 0 ? (
            <div className="text-xs text-muted-foreground py-8 text-center border border-dashed border-border rounded-md">
              Aún no registraste decisiones en la bitácora. Simulá un escenario arriba y hacé clic en
              "Guardar Decisión en Bitácora".
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {journal.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-background/60 border border-border/60 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-display uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                        {entry.level.replace('_', ' ')} · {entry.region}
                      </span>
                      <span className="font-display text-xs font-bold">
                        {entry.title}
                      </span>
                    </div>
                    <div className="text-xs text-foreground">
                      Decisión: <strong>{entry.chosenAlternative}</strong> · Confianza:{' '}
                      <span className="font-display text-primary">
                        {entry.confidencePct}%
                      </span>{' '}
                      · EV: {entry.expectedValue}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{entry.notes}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(
                      [
                        { status: 'success', label: '✓ Éxito' },
                        { status: 'partial', label: '≈ Parcial' },
                        { status: 'failed', label: '✕ Falló' },
                      ] as const
                    ).map((btn) => (
                      <button
                        key={btn.status}
                        onClick={() =>
                          setJournal(updateDecisionOutcome(entry.id, btn.status))
                        }
                        className={`px-2 py-1 rounded text-[10px] font-display border cursor-pointer ${
                          entry.outcomeStatus === btn.status
                            ? 'border-primary bg-primary/20 text-primary font-bold'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setJournal(deleteDecisionEntry(entry.id))}
                      className="px-2 py-1 rounded text-[10px] font-display text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Eliminar registro"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* MODAL INFORME EJECUTIVO ONE-PAGER (IMPRIMIBLE / PDF) */}
      {showExecutiveReport && (
        <div className="print-sheet-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-4 md:p-8 flex justify-center items-start">
          <div className="print-sheet bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl p-6 md:p-10 space-y-6">
            {/* Barra de acciones (oculta al imprimir) */}
            <div className="print-hidden flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div className="text-xs font-display text-slate-500 uppercase tracking-wider">
                Vista Previa de Informe Ejecutivo · Listo para PDF
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 h-8 rounded bg-slate-900 text-white text-xs font-display font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  🖨️ Imprimir / Guardar como PDF
                </button>
                <button
                  onClick={() => setShowExecutiveReport(false)}
                  className="px-3 h-8 rounded border border-slate-300 text-slate-700 text-xs font-display hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Cabecera del Documento */}
            <div className="border-b-2 border-slate-900 pb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-display text-slate-500 uppercase tracking-wider">
                <span>MejoraDecisiones OS · Informe Estratégico de Decisión</span>
                <span>{reportTimestamp}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                {decisionTitle}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs font-display">
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                  {regionPack.flag} Región: {regionPack.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                  Escala: {LEVEL_META.find((m) => m.level === activeLevel)?.code} ·{' '}
                  {LEVEL_META.find((m) => m.level === activeLevel)?.short}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                  {reversibility === 'reversible'
                    ? 'Puerta Tipo 2: Reversible'
                    : reversibility === 'partially_reversible'
                    ? 'Híbrida: Parcialmente Reversible'
                    : 'Puerta Tipo 1: Irreversible'}
                </span>
              </div>

              {/* Vitales Macro del País */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                {regionPack.vitals.map((v, i) => {
                  const resolvedVal = (() => {
                    if (region === 'AR' && i === 0 && live.inflacion?.length) {
                      return `${live.inflacion[live.inflacion.length - 1].valor.toFixed(1)}%`
                    }
                    if (region === 'AR' && i === 1 && live.reservas) {
                      return `USD ${(live.reservas.valor / 1000).toFixed(1)}B`
                    }
                    if (
                      region !== 'AR' &&
                      i === 0 &&
                      live.worldBank?.inflationAnnualPct !== null &&
                      live.worldBank?.inflationAnnualPct !== undefined
                    ) {
                      return `${live.worldBank.inflationAnnualPct}% (${live.worldBank.year})`
                    }
                    return v.value
                  })()
                  return (
                    <div
                      key={v.label}
                      className="p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <div className="text-[10px] text-slate-500 font-display">{v.label}</div>
                      <div className="text-sm font-bold text-slate-900 font-display">
                        {resolvedVal}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sección 1: Veredicto de los 5 Criterios + EVPI */}
            <div className="space-y-2">
              <h3 className="text-xs font-display uppercase tracking-wider font-bold text-slate-800 border-b border-slate-200 pb-1">
                1. Veredicto de los 5 Criterios Matemáticos bajo Incertidumbre
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-left text-slate-700 font-display">
                      <th className="p-2 border border-slate-200">Criterio</th>
                      <th className="p-2 border border-slate-200">Alternativa Recomendada</th>
                      <th className="p-2 border border-slate-200">Métrica Clave</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-200 font-semibold">
                        Consenso Multi-Criterio (Recomendación Principal)
                      </td>
                      <td className="p-2 border border-slate-200 font-bold text-blue-800">
                        {uncertaintyResult.recommendations.consensusPick?.name}
                      </td>
                      <td className="p-2 border border-slate-200 font-display">
                        EV: {uncertaintyResult.recommendations.consensusPick?.expectedValue.toFixed(1)} pts
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200">
                        Valor Esperado (Bayes-Laplace)
                      </td>
                      <td className="p-2 border border-slate-200">
                        {uncertaintyResult.recommendations.expectedValueBest?.name}
                      </td>
                      <td className="p-2 border border-slate-200 font-display">
                        {uncertaintyResult.recommendations.expectedValueBest?.expectedValue.toFixed(1)} pts
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200">
                        Maximin de Wald (Piso de Supervivencia)
                      </td>
                      <td className="p-2 border border-slate-200">
                        {uncertaintyResult.recommendations.maximinWaldBest?.name}
                      </td>
                      <td className="p-2 border border-slate-200 font-display">
                        Peor caso: {uncertaintyResult.recommendations.maximinWaldBest?.minPayoff.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200">
                        Minimax Regret de Savage (Mínimo Arrepentimiento)
                      </td>
                      <td className="p-2 border border-slate-200">
                        {uncertaintyResult.recommendations.minimaxRegretSavageBest?.name}
                      </td>
                      <td className="p-2 border border-slate-200 font-display">
                        Regret máx: {uncertaintyResult.recommendations.minimaxRegretSavageBest?.maxRegret.toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200">
                        Hurwicz (α={alphaHurwicz.toFixed(2)}) &amp; Prospect Theory (Ariely λ={lambdaAriely})
                      </td>
                      <td className="p-2 border border-slate-200">
                        {uncertaintyResult.recommendations.hurwiczBest?.name} /{' '}
                        {uncertaintyResult.recommendations.prospectTheoryBest?.name}
                      </td>
                      <td className="p-2 border border-slate-200 font-display">
                        EVPI: {uncertaintyResult.evpi.evpi.toFixed(1)} pts (
                        {uncertaintyResult.evpi.evpi > 12 ? 'Investigar antes' : 'Info suficiente'})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección 2: Riesgo Estocástico (Monte Carlo) y Kelly */}
            <div className="space-y-2">
              <h3 className="text-xs font-display uppercase tracking-wider font-bold text-slate-800 border-b border-slate-200 pb-1">
                2. Riesgo Estocástico (Monte Carlo {mcResult.iterations.toLocaleString('es-AR')} iteraciones) y Capital Óptimo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Probabilidad de Éxito (&gt;0)</div>
                  <div className="text-base font-bold font-display text-emerald-700">
                    {mcResult.probabilityPositive.toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Mediana P50 / Rango P10–P90</div>
                  <div className="text-sm font-bold font-display text-slate-900">
                    {mcResult.median.toFixed(1)} ({mcResult.p10.toFixed(1)} a {mcResult.p90.toFixed(1)})
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">VaR 95% / CVaR 95% (Cola)</div>
                  <div className="text-sm font-bold font-display text-rose-700">
                    {mcResult.valueAtRisk95.toFixed(1)} / {mcResult.conditionalVaR95.toFixed(1)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Asignación Half-Kelly</div>
                  <div className="text-base font-bold font-display text-blue-800">
                    {kellyResult.safeKellyPct}% recursos
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-2.5 flex flex-wrap justify-between gap-2">
                <span>
                  <strong>Principal driver de riesgo (Tornado #1):</strong>{' '}
                  {mcResult.sensitivity[0]?.name ?? 'N/A'} (
                  {mcResult.sensitivity[0]?.sharePct ?? 0}% de la varianza)
                </span>
                <span>
                  <strong>Prescripción Kelly:</strong> {kellyResult.recommendation}
                </span>
              </div>
            </div>

            {/* Sección 3: Equilibrio Secuencial (SPE) y Ranking TOPSIS */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xs font-display uppercase tracking-wider font-bold text-slate-800 border-b border-slate-200 pb-1">
                  3A. Equilibrio Secuencial (Inducción Hacia Atrás / SPE)
                </h3>
                <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div>
                    <strong>Jugada óptima de apertura:</strong>{' '}
                    <span className="text-blue-800 font-semibold">
                      {seqResult.optimalFirstMoveLabel}
                    </span>
                  </div>
                  <div>
                    <strong>Respuesta racional esperada:</strong>{' '}
                    {seqResult.optimalResponseLabel}
                  </div>
                  <div className="font-display text-[11px] text-slate-600">
                    Pagos en equilibrio: Vos {seqResult.equilibriumPayoffs.firstMover} pts · Contraparte{' '}
                    {seqResult.equilibriumPayoffs.secondMover} pts
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-display uppercase tracking-wider font-bold text-slate-800 border-b border-slate-200 pb-1">
                  3B. Ranking Multicriterio TOPSIS &amp; Velocidad
                </h3>
                <div className="space-y-1.5">
                  {topsisResult.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold">#{idx + 1} {item.name}</span>
                        <div className="text-[10px] text-slate-500">{item.actionVelocity}</div>
                      </div>
                      <span className="font-display font-bold text-blue-800 shrink-0">
                        {item.closenessScorePct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sección 4: Síntesis de las 4 Lentes Estratégicas */}
            <div className="space-y-2">
              <h3 className="text-xs font-display uppercase tracking-wider font-bold text-slate-800 border-b border-slate-200 pb-1">
                4. Triangulación Epistémica — Consejo de las 4 Lentes Estratégicas
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {multiVisionLenses.map((lens) => (
                  <div
                    key={lens.id}
                    className="p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-900">
                      {lens.icon} {lens.title}{' '}
                      <span className="font-normal text-slate-500">({lens.authors})</span>
                    </div>
                    <p className="text-slate-700 leading-snug">{lens.diagnosis}</p>
                    <div className="text-[11px] text-amber-800">
                      <strong>Punto ciego:</strong> {lens.blindSpotWarning}
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      <strong>Acción:</strong> {lens.tacticalPrescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
