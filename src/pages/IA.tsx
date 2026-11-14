import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AI_THINKING } from '@/lib/data/ai-thinking'
import { SOCIAL_TRENDS } from '@/lib/data/social-trends'
import { ANALYSTS_NATIONAL, ANALYSTS_INTL } from '@/lib/data/analysts'
import { generateMultiVisionAnalysis, type RegionCode } from '@/lib/context-packs'
import type { DecisionLevel } from '@/lib/decision-engine'
import { cn } from '@/lib/utils'

function extractConfidencePct(text: string): number {
  const match = text.match(/(\d{1,3})\s*%/)
  if (!match) return 70
  return Math.max(1, Math.min(99, Number(match[1])))
}

export default function IAPage() {
  // Pesos de credibilidad por modelo IA (0..100%)
  const [weights, setWeights] = useState<number[]>(() => AI_THINKING.map(() => 100))

  // Auditor de hipótesis propia con 4 Lentes Estratégicas
  const [hypothesis, setHypothesis] = useState<string>(
    'Expandir operación / ajustar precios ante desaceleración de inflación y tensión competitiva',
  )
  const [auditLevel, setAuditLevel] = useState<DecisionLevel>('L3_EMPRESA')
  const [auditRegion, setAuditRegion] = useState<RegionCode>('AR')

  // Filtro de analistas
  const [stanceFilter, setStanceFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all')

  const modelMetrics = useMemo(() => {
    const items = AI_THINKING.map((m, idx) => ({
      ...m,
      index: idx,
      baseConf: extractConfidencePct(m.confidence),
      weight: weights[idx] ?? 100,
    }))
    const active = items.filter((i) => i.weight > 0)
    const totalWeight = active.reduce((s, i) => s + i.weight, 0)

    const weightedConsensus =
      totalWeight > 0
        ? active.reduce((s, i) => s + i.baseConf * i.weight, 0) / totalWeight
        : 0

    const variance =
      totalWeight > 0
        ? active.reduce(
            (s, i) => s + i.weight * Math.pow(i.baseConf - weightedConsensus, 2),
            0,
          ) / totalWeight
        : 0
    const stdDev = Math.sqrt(Math.max(0, variance))

    const verdict =
      active.length === 0
        ? 'Asigná al menos un modelo con peso > 0% para calcular consenso.'
        : stdDev <= 5 && weightedConsensus >= 72
        ? 'Consenso sólido multi-modelo con baja dispersión epistémica.'
        : stdDev > 7
        ? 'Alta divergencia entre modelos: contrastar supuestos antes de ejecutar apuestas irreversibles.'
        : 'Consenso moderado: requiere monitoreo de indicadores líderes (inflación / brecha / márgenes).'

    return {
      items,
      activeCount: active.length,
      weightedConsensus: Number(weightedConsensus.toFixed(1)),
      stdDev: Number(stdDev.toFixed(1)),
      verdict,
    }
  }, [weights])

  const auditLenses = useMemo(
    () =>
      generateMultiVisionAnalysis({
        title: hypothesis.trim() || 'Hipótesis estratégica bajo análisis',
        level: auditLevel,
        consensusChoice: hypothesis.trim() || 'Alternativa Equilibrada (Piloto Validado)',
        maximinChoice: 'Cobertura Conservadora / Preservación de Caja',
        regretChoice: 'Estrategia Modular Reversible (Tipo 2)',
        evpi: modelMetrics.stdDev > 6 ? 16 : 8,
        region: auditRegion,
      }),
    [hypothesis, auditLevel, auditRegion, modelMetrics.stdDev],
  )

  const allAnalysts = useMemo(() => [...ANALYSTS_NATIONAL, ...ANALYSTS_INTL], [])
  const stanceStats = useMemo(() => {
    const bullish = allAnalysts.filter((a) => a.stance === 'bullish').length
    const bearish = allAnalysts.filter((a) => a.stance === 'bearish').length
    const neutral = allAnalysts.filter((a) => a.stance === 'neutral').length
    const total = allAnalysts.length || 1
    return {
      bullish,
      bearish,
      neutral,
      bullishPct: Math.round((bullish / total) * 100),
      bearishPct: Math.round((bearish / total) * 100),
      neutralPct: Math.round((neutral / total) * 100),
    }
  }, [allAnalysts])

  const filteredNational = useMemo(
    () =>
      stanceFilter === 'all'
        ? ANALYSTS_NATIONAL
        : ANALYSTS_NATIONAL.filter((a) => a.stance === stanceFilter),
    [stanceFilter],
  )

  const filteredIntl = useMemo(
    () =>
      stanceFilter === 'all'
        ? ANALYSTS_INTL
        : ANALYSTS_INTL.filter((a) => a.stance === stanceFilter),
    [stanceFilter],
  )

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 05 · Triangulación Cognitiva Multi-Modelo
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Sintetizador de Consenso IA &amp; Radar de Analistas
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Ponderá la credibilidad de los modelos de IA, medí la dispersión epistémica y auditá tu propia tesis estratégica bajo las 4 Lentes.
          </p>
        </div>

        <Link
          to="/decisiones"
          className="px-3.5 h-8 rounded-md bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 font-display text-xs font-semibold inline-flex items-center shrink-0"
        >
          ⚡ Llevar Hipótesis al Motor de Decisiones →
        </Link>
      </div>

      {/* Consenso Ponderado + Dispersión */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/10 border border-primary/40 rounded-lg p-5">
          <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
            Índice de Consenso Ponderado
          </div>
          <div className="font-display text-3xl font-bold mt-1">
            {modelMetrics.weightedConsensus}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Calculado sobre {modelMetrics.activeCount} de {AI_THINKING.length} modelos activos
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-[10px] font-display uppercase tracking-wider text-amber-400 font-bold">
            Dispersión Epistémica (Desvío σ)
          </div>
          <div className="font-display text-3xl font-bold mt-1">
            ±{modelMetrics.stdDev} pts
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {modelMetrics.stdDev > 6
              ? 'Disenso elevado: alto valor de información adicional'
              : 'Desacuerdo acotado entre enfoques analíticos'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between">
          <div className="text-[10px] font-display uppercase tracking-wider text-signal-ally font-bold">
            Veredicto Combinado del Ensamble
          </div>
          <p className="text-xs text-foreground leading-relaxed mt-1">
            {modelMetrics.verdict}
          </p>
          <button
            onClick={() => setWeights(AI_THINKING.map(() => 100))}
            className="mt-2 self-start text-[10px] font-display text-primary hover:underline cursor-pointer"
          >
            ↺ Restablecer pesos iguales (100%)
          </button>
        </div>
      </div>

      {/* Modelos de IA Ponderables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Ponderador de Credibilidad por Modelo de IA
          </h2>
          <span className="text-[10px] font-display text-muted-foreground">
            Ajustá los sliders de peso (0%–100%)
          </span>
        </div>

        <div className="space-y-3">
          {modelMetrics.items.map((t) => (
            <div
              key={t.index}
              className={cn(
                'bg-card border border-border rounded-lg p-5 transition-opacity',
                t.weight === 0 && 'opacity-50',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-display text-sm font-semibold text-primary">
                  {t.source}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">
                    {t.confidence}
                  </span>
                  <span className="text-[10px] font-display bg-primary/15 text-primary border border-primary/30 rounded px-2 py-0.5 font-bold">
                    Peso asignado: {t.weight}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{t.text}</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <span className="text-[10px] font-display text-muted-foreground shrink-0">
                  Credibilidad del modelo:
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={t.weight}
                  onChange={(e) =>
                    setWeights((prev) =>
                      prev.map((w, i) => (i === t.index ? Number(e.target.value) : w)),
                    )
                  }
                  className="w-full max-w-sm accent-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auditor de Hipótesis Propia con 4 Lentes Estratégicas */}
      <div className="bg-card border border-primary/40 rounded-lg p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-display uppercase tracking-[0.2em] text-primary font-bold mb-1">
              Auditor de Hipótesis Propia · 4 Lentes Estratégicas
            </div>
            <label className="block text-xs text-muted-foreground mb-2">
              Escribí tu tesis, estrategia comercial o hipótesis y recibí triangulación desde Maquiavelo, Meadows, Ariely y Drucker:
            </label>
            <input
              type="text"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Ej: Lanzar suscripción B2B dolarizada en LATAM o acumular inventario ante volatilidad..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-xs md:text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <select
              value={auditLevel}
              onChange={(e) => setAuditLevel(e.target.value as DecisionLevel)}
              className="bg-background border border-border rounded px-2.5 h-9 text-xs font-display outline-none"
            >
              <option value="L4_MACRO">L4 · Macro / Global</option>
              <option value="L3_EMPRESA">L3 · Empresa</option>
              <option value="L2_PERSONAL">L2 · Personal</option>
              <option value="L1_COTIDIANO">L1 · Cotidiano</option>
            </select>
            <select
              value={auditRegion}
              onChange={(e) => setAuditRegion(e.target.value as RegionCode)}
              className="bg-background border border-border rounded px-2.5 h-9 text-xs font-display outline-none"
            >
              <option value="AR">🇦🇷 Argentina</option>
              <option value="GLOBAL">🌐 Global</option>
              <option value="US">🇺🇸 EE.UU.</option>
              <option value="BR">🇧🇷 Brasil</option>
              <option value="MX">🇲🇽 México</option>
              <option value="EU">🇪🇺 UE / España</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {auditLenses.map((lens) => (
            <div
              key={lens.id}
              className="bg-background/60 border border-border/60 rounded-lg p-4 flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lens.icon}</span>
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
              <div className="pt-2 border-t border-border/40 text-[11px] space-y-1">
                <div className="text-amber-400/90">
                  <strong>Punto Ciego:</strong> {lens.blindSpotWarning}
                </div>
                <div className="text-signal-ally">
                  <strong>Acción:</strong> {lens.tacticalPrescription}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Termómetro Bullish vs Bearish + Filtros de Analistas */}
      <div className="space-y-5">
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Termómetro de Analistas (Nacional + Internacional)
              </h2>
              <div className="text-xs text-foreground mt-1 font-display">
                Bullish: <span className="text-signal-ally font-bold">{stanceStats.bullish} ({stanceStats.bullishPct}%)</span> ·
                Neutral: <span className="text-muted-foreground font-bold"> {stanceStats.neutral} ({stanceStats.neutralPct}%)</span> ·
                Bearish: <span className="text-signal-rival font-bold"> {stanceStats.bearish} ({stanceStats.bearishPct}%)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: 'all', label: 'Todos' },
                  { key: 'bullish', label: 'Bullish (Alcista)' },
                  { key: 'neutral', label: 'Neutral' },
                  { key: 'bearish', label: 'Bearish (Riesgo)' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setStanceFilter(btn.key)}
                  className={cn(
                    'px-2.5 h-7 rounded border text-[10px] font-display cursor-pointer transition-colors',
                    stanceFilter === btn.key
                      ? 'border-primary bg-primary/15 text-primary font-semibold'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-muted">
            <div
              className="h-full bg-signal-ally"
              style={{ width: `${stanceStats.bullishPct}%` }}
              title={`Bullish ${stanceStats.bullishPct}%`}
            />
            <div
              className="h-full bg-signal-neutral"
              style={{ width: `${stanceStats.neutralPct}%` }}
              title={`Neutral ${stanceStats.neutralPct}%`}
            />
            <div
              className="h-full bg-signal-rival"
              style={{ width: `${stanceStats.bearishPct}%` }}
              title={`Bearish ${stanceStats.bearishPct}%`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Analistas nacionales ({filteredNational.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredNational.map((a, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-sm text-primary">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {a.outlet}</span>
                  <span
                    className={cn(
                      'ml-auto text-[10px] font-display px-2 py-0.5 rounded border',
                      a.stance === 'bullish'
                        ? 'text-signal-ally border-signal-ally'
                        : a.stance === 'bearish'
                        ? 'text-signal-rival border-signal-rival'
                        : 'text-muted-foreground border-border',
                    )}
                  >
                    {a.stance}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">"{a.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Analistas internacionales ({filteredIntl.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredIntl.map((a, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-sm text-primary">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {a.outlet}</span>
                  <span
                    className={cn(
                      'ml-auto text-[10px] font-display px-2 py-0.5 rounded border',
                      a.stance === 'bullish'
                        ? 'text-signal-ally border-signal-ally'
                        : a.stance === 'bearish'
                        ? 'text-signal-rival border-signal-rival'
                        : 'text-muted-foreground border-border',
                    )}
                  >
                    {a.stance}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">"{a.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Trends */}
      <div className="space-y-4">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Tendencias en redes
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {SOCIAL_TRENDS.map((st, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{st.icon}</span>
                <span className="font-display text-sm">{st.topic}</span>
                <span className="ml-auto text-[10px] font-display text-signal-rival">
                  {st.change}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${st.heat}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{st.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
