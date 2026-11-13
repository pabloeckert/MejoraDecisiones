import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS } from '@/lib/data/scenarios'
import { ORGS_NATIONAL, ORGS_INTL } from '@/lib/data/organisms'
import { updateBayesianPriors, normalizeProbabilities } from '@/lib/decision-engine'
import { useLiveIndicators } from '@/hooks/useLiveIndicators'
import { loadDecisionJournal, computeCalibrationMetrics } from '@/lib/federation'

type HorizonKey = '30d' | '90d' | '180d' | '12m'

interface EvidenceSignal {
  id: string
  label: string
  category: 'macro' | 'politico' | 'externo'
  desc: string
  // Multiplicador de verosimilitud P(E | S_k) sobre los 5 escenarios [A, B, C, D, E]
  likelihoods: [number, number, number, number, number]
}

const EVIDENCE_SIGNALS: EvidenceSignal[] = [
  {
    id: 'desinflacion',
    label: 'Desinflación sostenida (< 3,0% mensual)',
    category: 'macro',
    desc: 'Consolida ancla nominal, mejora imagen oficialista y reduce riesgo de ruptura.',
    likelihoods: [1.65, 0.75, 0.55, 1.0, 0.4],
  },
  {
    id: 'reservas_up',
    label: 'Acumulación de reservas BCRA (> USD 32B)',
    category: 'macro',
    desc: 'Reduce vulnerabilidad a corridas cambiarias y habilita desembolsos externos.',
    likelihoods: [1.5, 0.9, 0.5, 1.05, 0.35],
  },
  {
    id: 'tension_fx',
    label: 'Tensión cambiaria / Brecha > 15%',
    category: 'macro',
    desc: 'Presiona precios transables, tensa expectativas y debilita margen fiscal.',
    likelihoods: [0.55, 1.25, 1.75, 1.15, 1.85],
  },
  {
    id: 'pacto_gobernadores',
    label: 'Acuerdo legislativo con gobernadores bisagra',
    category: 'politico',
    desc: 'Destraba reformas en Congreso y estabiliza coalición parlamentaria.',
    likelihoods: [1.35, 0.65, 0.85, 1.55, 0.5],
  },
  {
    id: 'shock_externo',
    label: 'Shock externo (tasas Fed altas / conflicto global)',
    category: 'externo',
    desc: 'Encarece financiamiento emergente y amplifica volatilidad de commodities.',
    likelihoods: [0.65, 1.15, 1.9, 1.0, 1.65],
  },
  {
    id: 'credito_activo',
    label: 'Reactivación del crédito productivo y consumo',
    category: 'macro',
    desc: 'Mejora liquidez PyME y consolida gobernabilidad de mediano plazo.',
    likelihoods: [1.55, 0.75, 0.7, 1.15, 0.45],
  },
]

const HORIZONS: { key: HorizonKey; label: string; dispersion: number }[] = [
  { key: '30d', label: '30 días', dispersion: 0.0 },
  { key: '90d', label: '90 días', dispersion: 0.12 },
  { key: '180d', label: '180 días', dispersion: 0.24 },
  { key: '12m', label: '12 meses', dispersion: 0.35 },
]

export default function PredictorPage() {
  const live = useLiveIndicators()
  const [activeSignals, setActiveSignals] = useState<Set<string>>(
    () => new Set(['desinflacion', 'pacto_gobernadores'])
  )
  const [horizon, setHorizon] = useState<HorizonKey>('90d')
  const [liveSyncNote, setLiveSyncNote] = useState<string | null>(null)

  const journal = useMemo(() => loadDecisionJournal(), [])
  const calibration = useMemo(() => computeCalibrationMetrics(journal), [journal])

  const basePriors = useMemo(
    () => normalizeProbabilities(SCENARIOS.map((s) => s.pct)),
    []
  )

  const toggleSignal = (id: string) => {
    setActiveSignals((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setLiveSyncNote(null)
  }

  const handleAutoCalibrateLive = () => {
    const next = new Set<string>()
    const notes: string[] = []

    const lastInfl = live.inflacion?.[live.inflacion.length - 1]?.valor
    if (lastInfl !== undefined) {
      if (lastInfl < 3.0) {
        next.add('desinflacion')
        notes.push(`IPC ${lastInfl.toFixed(1)}% (<3%)`)
      } else {
        notes.push(`IPC ${lastInfl.toFixed(1)}%`)
      }
    }

    if (live.reservas?.valor !== undefined) {
      if (live.reservas.valor >= 32000) {
        next.add('reservas_up')
      }
      notes.push(`Reservas USD ${(live.reservas.valor / 1000).toFixed(1)}B`)
    }

    const oficial = live.dolar?.find((d) => d.nombre.toLowerCase().includes('oficial'))?.venta
    const blue = live.dolar?.find((d) => d.nombre.toLowerCase().includes('blue'))?.venta
    if (oficial && blue) {
      const spreadPct = ((blue - oficial) / oficial) * 100
      if (spreadPct > 15) {
        next.add('tension_fx')
      }
      notes.push(`Brecha ${spreadPct.toFixed(1)}%`)
    }

    if (next.size === 0 && notes.length === 0) {
      next.add('desinflacion')
      next.add('pacto_gobernadores')
      setLiveSyncNote('APIs sin respuesta inmediata — aplicadas señales base por defecto.')
    } else {
      setLiveSyncNote(`Calibrado con datos en vivo: ${notes.join(' · ')}`)
    }
    setActiveSignals(next)
  }

  const posteriorProbs = useMemo(() => {
    let probs = [...basePriors]
    EVIDENCE_SIGNALS.forEach((sig) => {
      if (activeSignals.has(sig.id)) {
        probs = updateBayesianPriors(probs, sig.likelihoods)
      }
    })

    // Ajuste de entropía por horizonte: a mayor plazo, mayor difusión hacia escenarios alternativos
    const hConf = HORIZONS.find((h) => h.key === horizon) ?? HORIZONS[1]
    if (hConf.dispersion > 0) {
      const uniform = 1 / probs.length
      probs = normalizeProbabilities(
        probs.map((p) => p * (1 - hConf.dispersion) + uniform * hConf.dispersion)
      )
    }
    return probs
  }, [basePriors, activeSignals, horizon])

  const dominantScenarioIdx = useMemo(() => {
    let best = 0
    posteriorProbs.forEach((p, idx) => {
      if (p > posteriorProbs[best]) best = idx
    })
    return best
  }, [posteriorProbs])

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
              Módulo 08 · Actualización Bayesiana
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-signal-ally/40 bg-signal-ally/10 text-signal-ally">
              <span className="size-1.5 rounded-full bg-signal-ally animate-pulse" />
              Motor Bayesiano Activo
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Predictor Multi-Horizonte y Calibración
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Actualizá las probabilidades de cada escenario mediante el Teorema de Bayes activando
            señales de evidencia real o calibrando con las APIs macro en vivo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAutoCalibrateLive}
            className="px-3.5 h-9 rounded-md border border-primary/40 bg-primary/10 text-primary font-display text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            ⚡ Auto-calibrar con APIs en Vivo
          </button>
          <Link
            to="/decisiones"
            className="px-3.5 h-9 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
          >
            <span>Decidir bajo este escenario</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {liveSyncNote && (
        <div className="bg-primary/10 border border-primary/30 rounded-md px-4 py-2 text-xs font-display text-primary">
          {liveSyncNote}
        </div>
      )}

      {/* Panel de Señales de Evidencia + Horizonte */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="bg-card border border-border/60 rounded-lg p-5 space-y-5">
          <div>
            <div className="text-[10px] font-display uppercase tracking-wider text-primary font-semibold mb-2">
              Horizonte de Proyección
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {HORIZONS.map((h) => (
                <button
                  key={h.key}
                  onClick={() => setHorizon(h.key)}
                  className={`py-1.5 rounded border text-xs font-display transition-all cursor-pointer ${
                    horizon === h.key
                      ? 'border-primary bg-primary/15 text-primary font-semibold'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-border/50">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">
              Señales de Evidencia (P(E | Escenario))
            </div>
            {EVIDENCE_SIGNALS.map((sig) => {
              const active = activeSignals.has(sig.id)
              return (
                <button
                  key={sig.id}
                  onClick={() => toggleSignal(sig.id)}
                  className={`w-full text-left p-3 rounded-md border transition-all cursor-pointer ${
                    active
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 bg-background/40 hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-semibold text-foreground">
                      {active ? '☑ ' : '☐ '}
                      {sig.label}
                    </span>
                    <span className="text-[9px] font-display uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {sig.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{sig.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Probabilidades Posteriores + Calibración */}
        <div className="space-y-6">
          <div className="bg-card border border-primary/30 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-display uppercase tracking-wider text-primary font-semibold">
                Escenario Dominante Posterior ({HORIZONS.find((h) => h.key === horizon)?.label})
              </div>
              <div className="font-display text-xl font-bold mt-1">
                {SCENARIOS[dominantScenarioIdx]?.title}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {SCENARIOS[dominantScenarioIdx]?.body}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display text-3xl font-bold text-primary">
                {((posteriorProbs[dominantScenarioIdx] ?? 0) * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] font-display text-muted-foreground">
                {activeSignals.size} señales activas
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SCENARIOS.map((s, i) => {
              const priorPct = (basePriors[i] ?? 0) * 100
              const postPct = (posteriorProbs[i] ?? 0) * 100
              const delta = postPct - priorPct
              return (
                <div
                  key={s.title}
                  className={`bg-card border rounded-lg p-5 ${
                    i === dominantScenarioIdx ? 'border-primary/60' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold">{s.title}</span>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold" style={{ color: s.color }}>
                        {postPct.toFixed(1)}%
                      </span>
                      <div
                        className={`text-[10px] font-display ${
                          delta > 0.2
                            ? 'text-signal-ally'
                            : delta < -0.2
                            ? 'text-signal-rival'
                            : 'text-muted-foreground'
                        }`}
                      >
                        Base {priorPct.toFixed(0)}% ({delta >= 0 ? '+' : ''}
                        {delta.toFixed(1)} pp)
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${postPct}%`, background: s.color }}
                    />
                  </div>
                  <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">
                    {s.tag}
                  </span>
                  <p className="text-xs text-muted-foreground mt-3">{s.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.indicators.map((ind, j) => (
                      <span
                        key={j}
                        className="text-[10px] font-display bg-muted rounded px-2 py-0.5 text-muted-foreground"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Calibración Brier Score desde Bitácora */}
          <div className="bg-card border border-border/60 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">
                Auditoría de Predicciones (Brier Score — Bitácora Decision OS)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registra tus decisiones y resultados reales en Decision OS para medir la precisión
                histórica de tus pronósticos (0.00 = perfecto, 0.25 = azar).
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display text-xl font-bold text-primary">
                {calibration.brierScore !== null ? calibration.brierScore : '—'}
              </div>
              <div className="text-[10px] font-display text-muted-foreground">
                {calibration.calibrationGrade} ({calibration.resolvedCount} resueltas / {journal.length} totales)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* National Orgs */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Organismos nacionales
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ORGS_NATIONAL.map((org, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-sm text-primary">{org.name}</span>
                <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">
                  {org.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{org.position}</p>
            </div>
          ))}
        </div>
      </div>

      {/* International Orgs */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Organismos internacionales
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ORGS_INTL.map((org, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-sm text-primary">{org.name}</span>
                <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">
                  {org.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{org.position}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
