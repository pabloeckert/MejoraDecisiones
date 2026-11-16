import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SCENARIOS } from '@/lib/data/scenarios'
import { useLiveIndicators } from '@/hooks/useLiveIndicators'
import { REGIONAL_CONTEXT_PACKS, type RegionCode } from '@/lib/context-packs'
import { loadActiveRegion, saveActiveRegion } from '@/lib/federation'
import { cn } from '@/lib/utils'

type Params = {
  inflacion: number
  popularidad: number
  fragmentacion: number
  reservas: number
  pobreza: number
  riesgo: number
}

const PRESETS_STORAGE_KEY = 'mejora_scenario_presets_v1'

interface ScenarioPreset {
  id: string
  name: string
  region: RegionCode
  params: Params
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min
  return Math.max(min, Math.min(max, val))
}

function computeScenario(p: Params, region: RegionCode) {
  const isArg = region === 'AR'
  const base = { consolidacion: 35, paralisis: 30, shock: 20, provincias: 10, ruptura: 5 }

  // Umbral base de inflación adaptado a la región
  const baseInfl = isArg ? 25 : 3.0
  const inflScale = isArg ? -0.4 : -2.5
  const inflEffect = (p.inflacion - baseInfl) * inflScale
  base.consolidacion += inflEffect
  base.shock -= inflEffect * 0.5
  base.ruptura -= inflEffect * 0.3

  // Popularidad: alta popularidad favorece consolidación
  const popEffect = (p.popularidad - 45) * 0.3
  base.consolidacion += popEffect
  base.paralisis -= popEffect * 0.5

  // Fragmentación: alta fragmentación aumenta parálisis y poder de bloques bisagra
  const fragEffect = (p.fragmentacion - 50) * 0.2
  base.paralisis += fragEffect
  base.provincias += fragEffect * 0.5
  base.consolidacion -= fragEffect * 0.8

  // Reservas: mayores reservas amortiguan shocks externos
  const baseRes = isArg ? 35 : 100
  const resEffect = ((p.reservas - baseRes) / (baseRes || 1)) * 15
  base.shock -= resEffect
  base.consolidacion += resEffect * 0.5

  // Pobreza / tensión social: mayor pobreza aumenta riesgo de ruptura
  const basePov = isArg ? 32 : 15
  const povEffect = (p.pobreza - basePov) * 0.35
  base.ruptura += povEffect
  base.consolidacion -= povEffect * 0.5

  // Riesgo soberano: spread elevado incrementa shock y ruptura
  const baseRisk = isArg ? 840 : 150
  const riskScale = isArg ? 0.01 : 0.05
  const riskEffect = (p.riesgo - baseRisk) * riskScale
  base.shock += riskEffect
  base.ruptura += riskEffect * 0.5
  base.consolidacion -= riskEffect * 0.8

  // Normalizar a 100%
  const total = Object.values(base).reduce((s, v) => s + Math.max(0, v), 0) || 1
  return {
    consolidacion: Math.max(0, (base.consolidacion / total) * 100),
    paralisis: Math.max(0, (base.paralisis / total) * 100),
    shock: Math.max(0, (base.shock / total) * 100),
    provincias: Math.max(0, (base.provincias / total) * 100),
    ruptura: Math.max(0, (base.ruptura / total) * 100),
  }
}

function getVerdict(
  result: ReturnType<typeof computeScenario>,
  region: RegionCode
): { text: string; color: string } {
  const max = Math.max(
    result.consolidacion,
    result.paralisis,
    result.shock,
    result.provincias,
    result.ruptura
  )
  const isArg = region === 'AR'

  if (max === result.consolidacion) {
    return {
      text: isArg
        ? 'Nash cooperativo — El equilibrio favorece la consolidación de reformas y estabilidad fiscal.'
        : 'Equilibrio de Expansión — Condiciones de estabilidad para inversión y crecimiento.',
      color: 'text-signal-ally',
    }
  }
  if (max === result.paralisis) {
    return {
      text: isArg
        ? 'Desequilibrio — La interna política y fricción legislativa paralizan reformas estructurales.'
        : 'Gridlock Institucional — Parálisis regulatoria y fricción entre poderes del Estado.',
      color: 'text-signal-warn',
    }
  }
  if (max === result.shock) {
    return {
      text: 'Crisis por Shock Externo — Tasas internacionales altas o volatilidad de commodities desestabilizan el flujo.',
      color: 'text-signal-rival',
    }
  }
  if (max === result.provincias) {
    return {
      text: isArg
        ? 'Nuevo Equilibrio Federal — Los gobernadores y bloques bisagra dictan la agenda parlamentaria.'
        : 'Poder Regional Descentralizado — Coaliciones intermedias arbitran la gobernabilidad.',
      color: 'text-chart-4',
    }
  }
  return {
    text: 'Ruptura Sistémica — El régimen migra a crisis aguda de confianza o liquidez.',
    color: 'text-destructive',
  }
}

function loadPresetsFromStorage(): ScenarioPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ScenarioPreset[]
  } catch {
    // ignore
  }
  return [
    {
      id: 'default-base-ar',
      name: 'Base Argentina 2026-2027',
      region: 'AR',
      params: {
        inflacion: 28,
        popularidad: 42,
        fragmentacion: 55,
        reservas: 38,
        pobreza: 31.6,
        riesgo: 840,
      },
    },
    {
      id: 'default-stress-us',
      name: 'Shock Tasas Fed 5.25% (EE.UU.)',
      region: 'US',
      params: {
        inflacion: 3.8,
        popularidad: 44,
        fragmentacion: 58,
        reservas: 60,
        pobreza: 12,
        riesgo: 180,
      },
    },
  ]
}

export default function EscenariosPage() {
  const [, setSearchParams] = useSearchParams()
  const [region, setRegion] = useState<RegionCode>(() => loadActiveRegion())

  const pack = REGIONAL_CONTEXT_PACKS[region]

  const [params, setParams] = useState<Params>(() => {
    const p = pack.baseParams
    return {
      inflacion: p.inflacion,
      popularidad: p.popularidad,
      fragmentacion: p.fragmentacion,
      reservas: p.reservas,
      pobreza: p.pobreza,
      riesgo: p.riesgo,
    }
  })

  const [presets, setPresets] = useState<ScenarioPreset[]>(() => loadPresetsFromStorage())
  const [isCreatingPreset, setIsCreatingPreset] = useState(false)
  const [presetNameInput, setPresetNameInput] = useState('')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const live = useLiveIndicators(pack.wbCountryIso)

  useEffect(() => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
    } catch {
      // ignore
    }
  }, [presets])

  const handleSelectRegion = (code: RegionCode) => {
    setRegion(code)
    saveActiveRegion(code)
    const nextPack = REGIONAL_CONTEXT_PACKS[code]
    setParams({ ...nextPack.baseParams })
    setSyncMessage(null)
  }

  const isArg = region === 'AR'

  const sliders = useMemo(() => {
    if (isArg) {
      return [
        { key: 'inflacion' as const, label: 'Inflación anual proyectada', min: 10, max: 60, step: 1, unit: '%', hint: 'Piso 2026-2027 (~28-32%)' },
        { key: 'popularidad' as const, label: 'Aprobación presidencial', min: 20, max: 70, step: 1, unit: '%', hint: 'Sondeos poliarquía / consultoras' },
        { key: 'fragmentacion' as const, label: 'Fragmentación legislativa', min: 20, max: 80, step: 1, unit: '%', hint: 'Dispersión de bloques en Congreso' },
        { key: 'reservas' as const, label: 'Reservas BCRA brutas', min: 15, max: 60, step: 1, unit: 'B USD', hint: 'Colchón de divisas internacionales' },
        { key: 'pobreza' as const, label: 'Pobreza socioeconómica', min: 15, max: 50, step: 0.5, unit: '%', hint: 'INDEC último reporte' },
        { key: 'riesgo' as const, label: 'Riesgo país (EMBI+)', min: 400, max: 1500, step: 10, unit: ' bps', hint: 'Spread soberano JP Morgan' },
      ]
    }
    return [
      { key: 'inflacion' as const, label: 'Inflación anual (IPC)', min: 0.5, max: 15, step: 0.2, unit: '%', hint: 'Meta del Banco Central' },
      { key: 'popularidad' as const, label: 'Aprobación del gobierno', min: 20, max: 70, step: 1, unit: '%', hint: 'Apoyo a la administración ejecutiva' },
      { key: 'fragmentacion' as const, label: 'Fragmentación política / Congreso', min: 20, max: 80, step: 1, unit: '%', hint: 'Polarización y capacidad de bloqueo' },
      { key: 'reservas' as const, label: 'Reservas / Capacidad Fiscal', min: 10, max: 400, step: 5, unit: 'B USD', hint: 'Posición de liquidez externa' },
      { key: 'pobreza' as const, label: 'Pobreza / Presión social', min: 5, max: 35, step: 0.5, unit: '%', hint: 'Tasa de vulnerabilidad' },
      { key: 'riesgo' as const, label: 'Spread / Prima de riesgo', min: 20, max: 500, step: 5, unit: ' bps', hint: 'Costo de financiamiento de mercado' },
    ]
  }, [isArg])

  const result = useMemo(() => computeScenario(params, region), [params, region])
  const verdict = useMemo(() => getVerdict(result, region), [result, region])

  const updateParam = (key: keyof Params, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const resetParams = () => {
    setParams({ ...pack.baseParams })
    setSearchParams({})
    setSyncMessage(null)
  }

  const handleConfirmSavePreset = () => {
    const name = presetNameInput.trim()
    if (!name) return
    const newPreset: ScenarioPreset = {
      id: `preset-${Date.now()}`,
      name,
      region,
      params: { ...params },
    }
    setPresets((prev) => [newPreset, ...prev])
    setPresetNameInput('')
    setIsCreatingPreset(false)
  }

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
  }

  const loadPreset = (preset: ScenarioPreset) => {
    if (preset.region !== region) {
      setRegion(preset.region)
      saveActiveRegion(preset.region)
    }
    setParams({ ...preset.params })
    setSyncMessage(`Cargado preset: "${preset.name}" (${preset.region})`)
  }

  const handleSyncLive = () => {
    const updates: Partial<Params> = {}
    const notes: string[] = []

    if (isArg) {
      if (live.inflacion?.length) {
        const lastInfl = live.inflacion[live.inflacion.length - 1].valor
        const annualized = Math.round((Math.pow(1 + lastInfl / 100, 12) - 1) * 100)
        updates.inflacion = clamp(annualized, 10, 60)
        notes.push(`Inflación anualizada ~${updates.inflacion}% (INDEC ${lastInfl}%/mes)`)
      }
      if (live.reservas?.valor !== undefined) {
        const resB = Number((live.reservas.valor / 1000).toFixed(1))
        updates.reservas = clamp(resB, 15, 60)
        notes.push(`Reservas BCRA USD ${updates.reservas}B`)
      }
      if (live.riesgoPais?.valor !== undefined) {
        updates.riesgo = clamp(live.riesgoPais.valor, 400, 1500)
        notes.push(`Riesgo País ${updates.riesgo} bps`)
      }
    } else {
      if (live.worldBank?.inflationAnnualPct !== null && live.worldBank?.inflationAnnualPct !== undefined) {
        updates.inflacion = clamp(live.worldBank.inflationAnnualPct, 0.5, 15)
        notes.push(`Inflación anual World Bank ${updates.inflacion}%`)
      }
    }

    if (Object.keys(updates).length > 0) {
      setParams((prev) => ({ ...prev, ...updates }))
      setSyncMessage(`Sincronizado en vivo: ${notes.join(' · ')}`)
    } else {
      setSyncMessage('APIs en vivo sin datos para actualizar — se conservan parámetros actuales.')
    }
  }

  const handleShareScenarioUrl = () => {
    const qs = new URLSearchParams({
      reg: region,
      inf: String(params.inflacion),
      pop: String(params.popularidad),
      frag: String(params.fragmentacion),
      res: String(params.reservas),
      pob: String(params.pobreza),
      rie: String(params.riesgo),
    })
    setSearchParams(qs)
    const baseHref = window.location.href.split('?')[0]
    const fullUrl = `${baseHref}?${qs.toString()}`
    navigator.clipboard?.writeText(fullUrl).catch(() => {})
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2500)
  }

  const scenarios = [
    { label: isArg ? 'Consolidación de Reformas' : 'Consolidación & Crecimiento', value: result.consolidacion, color: 'bg-signal-ally' },
    { label: isArg ? 'Parálisis por Fricción Política' : 'Parálisis Legislativa / Gridlock', value: result.paralisis, color: 'bg-signal-warn' },
    { label: 'Shock Externo & Volatilidad', value: result.shock, color: 'bg-signal-rival' },
    { label: isArg ? 'Bloques Federales (Árbitros)' : 'Poder Regional Descentralizado', value: result.provincias, color: 'bg-chart-4' },
    { label: 'Ruptura Sistémica / Crisis', value: result.ruptura, color: 'bg-destructive' },
  ]

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      {/* Header con Selector de Región */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">03</span>
            <div className="h-px w-8 bg-primary/20" />
            <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">
              Simulador Multi-País 2026-2027
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            Escenarios Estratégicos {pack.flag}
          </h1>
          <p className="text-muted-foreground text-xs mt-1 max-w-xl">
            Simulador probabilístico de equilibrio Nash. Ajustá los parámetros macro, sincronizá con datos en vivo o guardá presets locales sin perder tus análisis.
          </p>

          {/* Selector de Regiones */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <span className="text-[10px] font-display text-muted-foreground mr-1">Región:</span>
            {(Object.keys(REGIONAL_CONTEXT_PACKS) as RegionCode[]).map((code) => {
              const p = REGIONAL_CONTEXT_PACKS[code]
              const active = region === code
              return (
                <button
                  key={code}
                  onClick={() => handleSelectRegion(code)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-display flex items-center gap-1 transition-all cursor-pointer border',
                    active
                      ? 'border-primary bg-primary/15 text-primary font-semibold shadow-xs'
                      : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card'
                  )}
                >
                  <span>{p.flag}</span>
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSyncLive}
            className="px-3 h-8 rounded-md border border-primary/40 bg-primary/10 text-[11px] font-display text-primary font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            ⚡ Sincronizar en Vivo ({isArg ? 'BCRA/INDEC/EMBI+' : 'World Bank'})
          </button>
          <button
            onClick={handleShareScenarioUrl}
            className="px-3 h-8 rounded-md border border-border text-[11px] font-display text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
          >
            {copiedUrl ? '✓ URL Copiada' : '🔗 Compartir Escenario'}
          </button>
          <Link
            to={`/decisiones?level=L4_MACRO&region=${region}`}
            className="px-3 h-8 rounded-md bg-primary text-primary-foreground text-[11px] font-display font-semibold flex items-center gap-1 hover:bg-primary/90 transition-colors"
          >
            Evaluar en Decision OS →
          </Link>
        </div>
      </div>

      {syncMessage && (
        <div className="mt-4 bg-primary/10 border border-primary/30 rounded-md px-4 py-2 text-xs font-display text-primary">
          {syncMessage}
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main results */}
        <div className="space-y-6">
          {/* Verdict */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Veredicto Nash · {pack.name}
              </span>
              <span className="text-[10px] font-display px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Horizonte 2026-2027
              </span>
            </div>
            <p className={cn('font-display text-lg font-medium', verdict.color)}>{verdict.text}</p>
          </div>

          {/* Scenario bars */}
          <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
            <div className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Distribución de Probabilidad del Régimen
            </div>
            {scenarios.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-foreground">{s.label}</span>
                  <span className="font-display text-sm font-semibold text-foreground">{s.value.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', s.color)}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Reference scenarios */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">
              Escenarios Calibrados de Referencia (Horizonte 2027)
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {SCENARIOS.map((s, i) => (
                <div key={i} className="p-3 bg-accent/40 border border-border/40 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs font-semibold">{s.title}</span>
                    <span className="font-display text-sm font-bold" style={{ color: s.color }}>
                      {s.pct}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{s.body}</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {s.indicators.map((ind, idx) => (
                      <span key={idx} className="text-[9px] font-display px-1.5 py-0.5 rounded bg-card border border-border/50 text-muted-foreground">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Sliders & Presets */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-lg p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Parámetros {pack.flag}
              </span>
              <button
                onClick={resetParams}
                className="text-[10px] font-display text-primary hover:underline cursor-pointer"
              >
                Resetear Base
              </button>
            </div>

            {sliders.map((s) => (
              <div key={s.key} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-display text-foreground">{s.label}</label>
                  <span className="text-xs font-display font-semibold text-primary">
                    {params[s.key]}
                    {s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) => updateParam(s.key, Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.hint}</div>
              </div>
            ))}

            {/* Presets Locales */}
            <div className="pt-3 border-t border-border/40">
              {isCreatingPreset ? (
                <div className="space-y-2 p-2.5 bg-accent/40 rounded-md border border-primary/30">
                  <div className="text-[10px] font-display text-foreground font-semibold">Nuevo Preset de Escenario</div>
                  <input
                    type="text"
                    value={presetNameInput}
                    onChange={(e) => setPresetNameInput(e.target.value)}
                    placeholder="Ej. Tensión en Vencimientos 2027"
                    className="w-full px-2 py-1 text-xs font-display bg-background border border-border rounded text-foreground focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmSavePreset}
                      className="flex-1 py-1 rounded bg-primary text-primary-foreground text-xs font-display font-semibold hover:bg-primary/90 cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsCreatingPreset(false)}
                      className="px-2 py-1 rounded border border-border text-xs font-display text-muted-foreground hover:bg-card cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingPreset(true)}
                  className="w-full px-3 h-8 rounded-md border border-border text-xs font-display text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  + Guardar Escenario Personalizado
                </button>
              )}

              {presets.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground font-semibold">
                    Presets Guardados ({presets.length})
                  </div>
                  {presets.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center justify-between p-1.5 rounded hover:bg-accent/50 text-xs font-display transition-colors border border-transparent hover:border-border/40"
                    >
                      <button
                        onClick={() => loadPreset(p)}
                        className="flex items-center gap-1.5 text-left text-muted-foreground hover:text-foreground truncate flex-1 cursor-pointer"
                      >
                        <span className="text-[10px] px-1 py-0.2 rounded bg-card border border-border/50 text-primary">
                          {p.region}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </button>
                      <button
                        onClick={() => handleDeletePreset(p.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive px-1 cursor-pointer transition-opacity"
                        title="Eliminar preset"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
