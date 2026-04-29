import { useState, useMemo } from 'react'
import { SCENARIOS } from '@/lib/data/scenarios'

type Params = {
  inflacion: number
  popularidad: number
  fragmentacion: number
  reservas: number
  pobreza: number
  riesgo: number
}

const DEFAULT_PARAMS: Params = {
  inflacion: 25,
  popularidad: 42,
  fragmentacion: 55,
  reservas: 35,
  pobreza: 32,
  riesgo: 650,
}

function computeScenario(p: Params) {
  // Nash-inspired model: each parameter shifts probabilities
  const base = { consolidacion: 35, paralisis: 30, shock: 20, provincias: 10, ruptura: 5 }

  // Inflation effect: high inflation → more crisis, less consolidation
  const inflEffect = (p.inflacion - 20) * -0.4
  base.consolidacion += inflEffect
  base.shock -= inflEffect * 0.5
  base.ruptura -= inflEffect * 0.3

  // Popularity effect: high popularity → more consolidation
  const popEffect = (p.popularidad - 40) * 0.3
  base.consolidacion += popEffect
  base.paralisis -= popEffect * 0.5

  // Fragmentation: high fragmentation → more paralysis, more provincial power
  const fragEffect = (p.fragmentacion - 50) * 0.2
  base.paralisis += fragEffect
  base.provincias += fragEffect * 0.5
  base.consolidacion -= fragEffect * 0.8

  // Reserves: high reserves → less shock risk
  const resEffect = (p.reservas - 30) * 0.15
  base.shock -= resEffect
  base.consolidacion += resEffect * 0.5

  // Poverty: high poverty → more rupture risk
  const povEffect = (p.pobreza - 30) * 0.25
  base.ruptura += povEffect
  base.consolidacion -= povEffect * 0.5

  // Risk premium: high risk → more shock, more rupture
  const riskEffect = (p.riesgo - 600) * 0.01
  base.shock += riskEffect
  base.ruptura += riskEffect * 0.5
  base.consolidacion -= riskEffect * 0.8

  // Normalize to 100%
  const total = Object.values(base).reduce((s, v) => s + Math.max(0, v), 0)
  return {
    consolidacion: Math.max(0, (base.consolidacion / total) * 100),
    paralisis: Math.max(0, (base.paralisis / total) * 100),
    shock: Math.max(0, (base.shock / total) * 100),
    provincias: Math.max(0, (base.provincias / total) * 100),
    ruptura: Math.max(0, (base.ruptura / total) * 100),
  }
}

function getVerdict(result: ReturnType<typeof computeScenario>): { text: string; color: string } {
  const max = Math.max(result.consolidacion, result.paralisis, result.shock, result.provincias, result.ruptura)
  if (max === result.consolidacion) return { text: "Nash cooperativo — El equilibrio favorece la consolidación del oficialismo.", color: "text-signal-ally" }
  if (max === result.paralisis) return { text: "Desequilibrio — La interna paraliza la capacidad de acción.", color: "text-signal-warn" }
  if (max === result.shock) return { text: "Crisis — Shock externo desestabiliza el equilibrio.", color: "text-signal-rival" }
  if (max === result.provincias) return { text: "Nuevo equilibrio — Las provincias emergen como tercer polo.", color: "text-chart-4" }
  return { text: "Ruptura sistémica — El equilibrio migra a crisis.", color: "text-destructive" }
}

const SLIDERS: { key: keyof Params; label: string; min: number; max: number; step: number; unit: string; hint: string }[] = [
  { key: 'inflacion', label: 'Inflación anual', min: 10, max: 50, step: 1, unit: '%', hint: 'Proyección dic-2026' },
  { key: 'popularidad', label: 'Imagen positiva', min: 20, max: 65, step: 1, unit: '%', hint: 'Aprobación presidencial' },
  { key: 'fragmentacion', label: 'Fragmentación legislativa', min: 20, max: 80, step: 1, unit: '%', hint: 'Dispersión de bloques' },
  { key: 'reservas', label: 'Reservas BCRA', min: 10, max: 60, step: 1, unit: 'MM USD', hint: 'Nivel de reservas netas' },
  { key: 'pobreza', label: 'Pobreza', min: 20, max: 45, step: 1, unit: '%', hint: 'INDEC último dato' },
  { key: 'riesgo', label: 'Riesgo país', min: 300, max: 1000, step: 10, unit: 'bps', hint: 'EMBIG+' },
]

export default function EscenariosPage() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS)
  const [presets, setPresets] = useState<{ name: string; params: Params }[]>([])

  const result = useMemo(() => computeScenario(params), [params])
  const verdict = useMemo(() => getVerdict(result), [result])

  const updateParam = (key: keyof Params, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const resetParams = () => setParams(DEFAULT_PARAMS)

  const savePreset = () => {
    const name = prompt('Nombre del escenario:')
    if (name) setPresets(prev => [...prev, { name, params: { ...params } }])
  }

  const loadPreset = (preset: { params: Params }) => {
    setParams({ ...preset.params })
  }

  const scenarios = [
    { label: 'Consolidación libertaria', value: result.consolidacion, color: 'bg-signal-ally' },
    { label: 'Parálisis por interna', value: result.paralisis, color: 'bg-signal-warn' },
    { label: 'Shock externo + crisis', value: result.shock, color: 'bg-signal-rival' },
    { label: 'Provincias Unidas (3er polo)', value: result.provincias, color: 'bg-chart-4' },
    { label: 'Ruptura sistémica', value: result.ruptura, color: 'bg-destructive' },
  ]

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">03</span>
        <div className="h-px w-8 bg-primary/20" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Escenarios</h1>
      <p className="text-muted-foreground text-xs mt-1 max-w-xl">
        Simulador what-if. Ajustá los parámetros y observá cómo se desplazan los equilibrios de Nash.
      </p>

      <div className="mt-8 grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main results */}
        <div className="space-y-6">
          {/* Verdict */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Veredicto Nash</div>
            <p className={`font-display text-lg ${verdict.color}`}>{verdict.text}</p>
          </div>

          {/* Scenario bars */}
          <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
            <div className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold">Probabilidades</div>
            {scenarios.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display">{s.label}</span>
                  <span className="font-display text-sm text-foreground">{s.value.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${s.color}`} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Reference scenarios */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">Referencia Nash</div>
            <div className="grid md:grid-cols-2 gap-3">
              {SCENARIOS.map((s, i) => (
                <div key={i} className="p-3 bg-accent rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs">{s.title}</span>
                    <span className="font-display text-sm" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Sliders */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-lg p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Parámetros</span>
              <button onClick={resetParams} className="text-[10px] font-display text-primary hover:underline">Reset</button>
            </div>

            {SLIDERS.map(s => (
              <div key={s.key} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-display">{s.label}</label>
                  <span className="text-xs font-display text-primary">{params[s.key]}{s.unit}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={e => updateParam(s.key, Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.hint}</div>
              </div>
            ))}

            <button onClick={savePreset} className="w-full mt-2 px-3 h-8 rounded-md border border-border text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
              Guardar escenario
            </button>

            {presets.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Guardados</div>
                {presets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => loadPreset(p)}
                    className="w-full text-left px-2 py-1.5 rounded text-xs font-display text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
