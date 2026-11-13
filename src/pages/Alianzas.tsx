import { useState, useMemo } from 'react'
import { ALLIANCES } from '@/lib/data/alliances'
import { ACTORS, RELATIONS } from '@/lib/seed-data'

const SECTIONS = [
  { key: 'solid' as const, label: 'Alianzas sólidas', color: 'text-signal-ally' },
  { key: 'weak' as const, label: 'Alianzas débiles', color: 'text-signal-warn' },
  { key: 'broken' as const, label: 'Alianzas rotas', color: 'text-signal-rival' },
]

export default function AlianzasPage() {
  // Calculadora de Juegos Repetidos (Teorema del Folklore / Axelrod)
  const [rewardR, setRewardR] = useState<number>(70)
  const [temptationT, setTemptationT] = useState<number>(95)
  const [punishmentP, setPunishmentP] = useState<number>(30)
  const [discountDelta, setDiscountDelta] = useState<number>(0.65)

  // Simulador de desplazamiento de relaciones en el grafo de actores
  const [filterKind, setFilterKind] = useState<'all' | 'solid' | 'weak' | 'broken'>('all')
  const [simulatedOverrides, setSimulatedOverrides] = useState<
    Record<number, 'ally' | 'rival' | 'neutral'>
  >({})

  const thresholdDelta = useMemo(() => {
    if (temptationT <= rewardR) return 0
    const denom = temptationT - punishmentP
    if (denom <= 0) return 1
    return Math.max(0, Math.min(1, (temptationT - rewardR) / denom))
  }, [rewardR, temptationT, punishmentP])

  const isSelfEnforcing = discountDelta >= thresholdDelta

  const actorMap = useMemo(() => {
    const m = new Map<string, (typeof ACTORS)[number]>()
    ACTORS.forEach((a) => m.set(a.id, a))
    return m
  }, [])

  const powerBalance = useMemo(() => {
    let allyPower = 0
    let rivalPower = 0
    let neutralPower = 0

    RELATIONS.forEach((rel, idx) => {
      const effectiveType = simulatedOverrides[idx] ?? rel.type
      const src = actorMap.get(rel.source)
      const tgt = actorMap.get(rel.target)
      const weight = ((src?.power ?? 0.5) + (tgt?.power ?? 0.5)) * 0.5 * rel.strength

      if (effectiveType === 'ally') allyPower += weight
      else if (effectiveType === 'rival') rivalPower += weight
      else neutralPower += weight
    })

    const total = allyPower + rivalPower + neutralPower || 1
    return {
      allyPct: (allyPower / total) * 100,
      rivalPct: (rivalPower / total) * 100,
      neutralPct: (neutralPower / total) * 100,
      netScore: allyPower - rivalPower,
    }
  }, [actorMap, simulatedOverrides])

  const visibleSections =
    filterKind === 'all' ? SECTIONS : SECTIONS.filter((s) => s.key === filterKind)

  const toggleOverride = (idx: number, currentType: 'ally' | 'rival' | 'neutral') => {
    setSimulatedOverrides((prev) => {
      const cur = prev[idx] ?? currentType
      const next: 'ally' | 'rival' | 'neutral' =
        cur === 'ally' ? 'neutral' : cur === 'neutral' ? 'rival' : 'ally'
      return { ...prev, [idx]: next }
    })
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
              Módulo 13 · Estabilidad de Coaliciones
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-signal-ally/40 bg-signal-ally/10 text-signal-ally">
              <span className="size-1.5 rounded-full bg-signal-ally animate-pulse" />
              Juegos Repetidos Activo
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Alianzas y Umbral de Cooperación
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Evaluá matemáticamente cuándo una alianza política o societaria es autocumplida y simulá el impacto en la balanza de poder si un vínculo bisagra se consolida o se rompe.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: 'all', label: 'Todas' },
              { key: 'solid', label: 'Sólidas' },
              { key: 'weak', label: 'Débiles' },
              { key: 'broken', label: 'Rotas' },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterKind(f.key)}
              className={`px-3 h-7 rounded-md border text-[11px] font-display transition-all cursor-pointer ${
                filterKind === f.key
                  ? 'border-primary bg-primary/15 text-primary font-semibold'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* CALCULADORA DE JUEGOS REPETIDOS (TEOREMA DEL FOLKLORE) */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 bg-card border border-primary/30 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm uppercase tracking-wider text-primary font-bold">
                Calculadora de Estabilidad en Juegos Repetidos (Teorema del Folklore)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ¿Cuánto debe valorar el futuro (δ) un socio o aliado para no traicionar el acuerdo hoy?
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setRewardR(75)
                  setTemptationT(90)
                  setPunishmentP(30)
                  setDiscountDelta(0.75)
                }}
                className="px-2 py-1 rounded border border-border text-[10px] font-display text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Sociedad Largo Plazo
              </button>
              <button
                onClick={() => {
                  setRewardR(55)
                  setTemptationT(95)
                  setPunishmentP(35)
                  setDiscountDelta(0.45)
                }}
                className="px-2 py-1 rounded border border-border text-[10px] font-display text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Alianza Electoral Corta
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Pago por Cooperar (R)</span>
                <span className="text-signal-ally font-bold">{rewardR}</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={rewardR}
                onChange={(e) => setRewardR(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Tentación de Traicionar hoy (T)</span>
                <span className="text-signal-warn font-bold">{temptationT}</span>
              </div>
              <input
                type="range"
                min={10}
                max={120}
                value={temptationT}
                onChange={(e) => setTemptationT(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Castigo mutuo tras ruptura (P)</span>
                <span className="text-signal-rival font-bold">{punishmentP}</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={punishmentP}
                onChange={(e) => setPunishmentP(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Horizonte de Paciencia (δ)</span>
                <span className="text-primary font-bold">{(discountDelta * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.99}
                step={0.01}
                value={discountDelta}
                onChange={(e) => setDiscountDelta(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-background/70 border border-border rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Veredicto Matemático (δ* = (T - R) / (T - P))
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-display text-muted-foreground">Umbral mínimo δ*:</span>
              <span className="font-display text-2xl font-bold text-primary">
                {(thresholdDelta * 100).toFixed(1)}%
              </span>
            </div>
            <div
              className={`p-3 rounded-md border text-xs font-display ${
                isSelfEnforcing
                  ? 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally'
                  : 'border-signal-rival/40 bg-signal-rival/10 text-signal-rival'
              }`}
            >
              {isSelfEnforcing
                ? '✓ ALIANZA AUTOCUMPLIDA (Equilibrio Estable): El valor de cooperar a futuro supera la tentación de traicionar hoy.'
                : '⚠ INCENTIVO DE RUPTURA / TRAICIÓN: El horizonte del socio (δ) es menor que δ*. Requiere garantías o costos de salida más altos.'}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Aplicable tanto a coaliciones parlamentarias como a acuerdos entre socios comerciales, proveedores clave o pactos familiares.
          </div>
        </div>
      </div>

      {/* SIMULADOR DE BALANCE DE PODER SOBRE EL GRAFO REAL */}
      <div className="bg-card border border-border/60 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Simulador de Balance de Poder ({RELATIONS.length} vínculos ponderados por peso del actor)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hacé click en cualquier relación neutra o débil para simular qué pasa si pasa a alianza o rivalidad.
            </p>
          </div>
          {Object.keys(simulatedOverrides).length > 0 && (
            <button
              onClick={() => setSimulatedOverrides({})}
              className="text-xs font-display text-primary hover:underline cursor-pointer"
            >
              Resetear simulación ({Object.keys(simulatedOverrides).length} cambios)
            </button>
          )}
        </div>

        {/* Barra de equilibrio ponderado */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-display">
            <span className="text-signal-ally">Alianzas: {powerBalance.allyPct.toFixed(1)}%</span>
            <span className="text-muted-foreground">Neutras / Bisagra: {powerBalance.neutralPct.toFixed(1)}%</span>
            <span className="text-signal-rival">Rivalidades: {powerBalance.rivalPct.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted">
            <div className="bg-signal-ally transition-all" style={{ width: `${powerBalance.allyPct}%` }} />
            <div className="bg-signal-neutral transition-all" style={{ width: `${powerBalance.neutralPct}%` }} />
            <div className="bg-signal-rival transition-all" style={{ width: `${powerBalance.rivalPct}%` }} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {RELATIONS.map((rel, idx) => {
            const effectiveType = simulatedOverrides[idx] ?? rel.type
            const src = actorMap.get(rel.source)?.name ?? rel.source
            const tgt = actorMap.get(rel.target)?.name ?? rel.target
            const changed = simulatedOverrides[idx] !== undefined
            return (
              <button
                key={`${rel.source}-${rel.target}-${idx}`}
                onClick={() => toggleOverride(idx, rel.type)}
                className={`text-left px-3 py-2 rounded border text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  changed
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 bg-background/40 hover:border-border'
                }`}
              >
                <span className="truncate font-display text-[11px]">
                  {src} ↔ {tgt}
                </span>
                <span
                  className={`text-[10px] font-display uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    effectiveType === 'ally'
                      ? 'bg-signal-ally/15 text-signal-ally'
                      : effectiveType === 'rival'
                      ? 'bg-signal-rival/15 text-signal-rival'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {effectiveType === 'ally' ? 'Aliado' : effectiveType === 'rival' ? 'Rival' : 'Neutro'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mapa cualitativo de alianzas */}
      {visibleSections.map((section) => (
        <div key={section.key} className="space-y-3">
          <h2 className={`font-display text-xs uppercase tracking-[0.25em] ${section.color}`}>
            {section.label}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ALLIANCES[section.key].map((a, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="font-display text-sm text-primary mb-1">{a.title}</div>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
