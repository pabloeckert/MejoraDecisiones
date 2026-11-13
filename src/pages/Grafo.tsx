import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ActorGraph } from '@/components/actor-graph'
import {
  ACTOR_KIND_LABELS,
  GRAPH_NETWORKS,
  getActorPowerVector,
  type Actor,
  type ActorKind,
  type GraphNetworkId,
  type Relation,
} from '@/lib/seed-data'
import { cn } from '@/lib/utils'

const ALL_KINDS: ActorKind[] = ['leader', 'party', 'institution', 'union', 'business', 'media']

const CUSTOM_ACTORS_KEY = 'mejora_graph_custom_actors_v1'
const CUSTOM_RELATIONS_KEY = 'mejora_graph_custom_relations_v1'

function loadCustomMap<T>(key: string): Record<GraphNetworkId, T[]> {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        AR: Array.isArray(parsed?.AR) ? parsed.AR : [],
        GLOBAL: Array.isArray(parsed?.GLOBAL) ? parsed.GLOBAL : [],
        EMPRESA: Array.isArray(parsed?.EMPRESA) ? parsed.EMPRESA : [],
      }
    }
  } catch {
    // ignore storage errors
  }
  return { AR: [], GLOBAL: [], EMPRESA: [] }
}

const IDEOLOGY_LABEL = (v: number) => {
  if (v <= -0.6) return 'Izquierda / Disrupción'
  if (v <= -0.2) return 'Centro-izquierda / Institucional'
  if (v < 0.2)  return 'Centro / Pragmático'
  if (v < 0.6)  return 'Centro-derecha / Pro-mercado'
  return 'Derecha / Desregulación'
}

export default function GrafoPage() {
  const [networkId, setNetworkId] = useState<GraphNetworkId>('AR')
  const [kinds, setKinds] = useState<Set<ActorKind>>(new Set(ALL_KINDS))
  const [rel, setRel] = useState<'all' | 'ally' | 'rival' | 'neutral'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [customActorsByNet, setCustomActorsByNet] = useState<Record<GraphNetworkId, Actor[]>>(() =>
    loadCustomMap<Actor>(CUSTOM_ACTORS_KEY),
  )
  const [customRelsByNet, setCustomRelsByNet] = useState<Record<GraphNetworkId, Relation[]>>(() =>
    loadCustomMap<Relation>(CUSTOM_RELATIONS_KEY),
  )

  // Formulario para agregar stakeholder / actor personalizado
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [newName, setNewName] = useState<string>('')
  const [newKind, setNewKind] = useState<ActorKind>('business')
  const [newPowerPct, setNewPowerPct] = useState<number>(70)
  const [newIdeology, setNewIdeology] = useState<number>(0.15)
  const [newBlurb, setNewBlurb] = useState<string>('')
  const [newTargetId, setNewTargetId] = useState<string>('')
  const [newRelType, setNewRelType] = useState<'ally' | 'rival' | 'neutral'>('ally')

  const baseNetwork = GRAPH_NETWORKS[networkId]

  const activeActors = useMemo(
    () => [...baseNetwork.actors, ...(customActorsByNet[networkId] ?? [])],
    [baseNetwork.actors, customActorsByNet, networkId],
  )
  const activeRelations = useMemo(
    () => [...baseNetwork.relations, ...(customRelsByNet[networkId] ?? [])],
    [baseNetwork.relations, customRelsByNet, networkId],
  )

  const selectedActor = selectedId
    ? activeActors.find((a) => a.id === selectedId) ?? null
    : null
  const actorRelations = selectedId
    ? activeRelations.filter((r) => r.source === selectedId || r.target === selectedId)
    : []
  const selectedPowerVector = selectedActor ? getActorPowerVector(selectedActor) : null

  const toggle = (k: ActorKind) => {
    setKinds((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next.size === 0 ? new Set(ALL_KINDS) : next
    })
  }

  const handleSelectNetwork = (nextNet: GraphNetworkId) => {
    setNetworkId(nextNet)
    setSelectedId(null)
    setNewTargetId(GRAPH_NETWORKS[nextNet].actors[0]?.id ?? '')
  }

  const handleAddCustomActor = () => {
    const cleanName = newName.trim()
    if (!cleanName) return

    const id = `custom_${Date.now().toString(36)}`
    const actor: Actor = {
      id,
      name: cleanName,
      kind: newKind,
      ideology: Math.max(-1, Math.min(1, newIdeology)),
      power: Math.max(0.1, Math.min(1, newPowerPct / 100)),
      blurb:
        newBlurb.trim() ||
        `Stakeholder personalizado en red ${baseNetwork.label}.`,
    }

    const target = newTargetId || activeActors[0]?.id
    const nextActorsMap: Record<GraphNetworkId, Actor[]> = {
      ...customActorsByNet,
      [networkId]: [...(customActorsByNet[networkId] ?? []), actor],
    }
    const nextRelsMap: Record<GraphNetworkId, Relation[]> = {
      ...customRelsByNet,
      [networkId]: target
        ? [
            ...(customRelsByNet[networkId] ?? []),
            {
              source: id,
              target,
              type: newRelType,
              strength: 0.75,
              note: 'Vínculo definido por el usuario.',
            },
          ]
        : customRelsByNet[networkId] ?? [],
    }

    setCustomActorsByNet(nextActorsMap)
    setCustomRelsByNet(nextRelsMap)
    try {
      localStorage.setItem(CUSTOM_ACTORS_KEY, JSON.stringify(nextActorsMap))
      localStorage.setItem(CUSTOM_RELATIONS_KEY, JSON.stringify(nextRelsMap))
    } catch {
      // ignore storage errors
    }

    setNewName('')
    setNewBlurb('')
    setShowAddForm(false)
    setSelectedId(id)
  }

  const handleResetCustomNetwork = () => {
    const nextActorsMap: Record<GraphNetworkId, Actor[]> = {
      ...customActorsByNet,
      [networkId]: [],
    }
    const nextRelsMap: Record<GraphNetworkId, Relation[]> = {
      ...customRelsByNet,
      [networkId]: [],
    }
    setCustomActorsByNet(nextActorsMap)
    setCustomRelsByNet(nextRelsMap)
    setSelectedId(null)
    try {
      localStorage.setItem(CUSTOM_ACTORS_KEY, JSON.stringify(nextActorsMap))
      localStorage.setItem(CUSTOM_RELATIONS_KEY, JSON.stringify(nextRelsMap))
    } catch {
      // ignore storage errors
    }
  }

  const customCount = (customActorsByNet[networkId] ?? []).length

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">01</span>
            <div className="h-px w-8 bg-primary/20" />
            <span className="font-display text-[10px] uppercase tracking-wider text-primary">
              Mapa de Poder 4D · Multi-Escala
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Grafo de Actores y Poder Estratégico
          </h1>
          <p className="text-muted-foreground text-xs mt-1 max-w-2xl">
            {baseNetwork.description} Click en un nodo para ver su Vector de 4 Poderes (Maquiavelo / Sun Bin) y aislar sus vínculos.
          </p>
        </div>

        {/* Selector de Red de Poder */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(GRAPH_NETWORKS) as GraphNetworkId[]).map((netKey) => {
            const net = GRAPH_NETWORKS[netKey]
            const active = networkId === netKey
            return (
              <button
                key={netKey}
                onClick={() => handleSelectNetwork(netKey)}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-left transition-all cursor-pointer',
                  active
                    ? 'border-primary bg-primary/15 text-primary shadow-sm'
                    : 'border-border/60 bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                <div className="font-display text-xs font-semibold">{net.label}</div>
                <div className="text-[9px] opacity-75 font-display">{net.badge}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Acciones de Edición / Stakeholder Personalizado */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (!newTargetId) setNewTargetId(activeActors[0]?.id ?? '')
              setShowAddForm((prev) => !prev)
            }}
            className="px-3 h-7 rounded-md border border-primary/50 bg-primary/10 text-primary text-[11px] font-display font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {showAddForm ? '✕ Cerrar Formulario' : '➕ Agregar Stakeholder / Actor'}
          </button>
          {customCount > 0 && (
            <button
              onClick={handleResetCustomNetwork}
              className="px-3 h-7 rounded-md border border-border text-[11px] font-display text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
            >
              ↺ Restaurar Red Base ({customCount} propio{customCount > 1 ? 's' : ''})
            </button>
          )}
        </div>
        <div className="text-[11px] font-display text-muted-foreground">
          Mostrando {activeActors.length} nodos · {activeRelations.length} vínculos
        </div>
      </div>

      {/* Panel para agregar actor personalizado */}
      {showAddForm && (
        <div className="bg-card border border-primary/40 rounded-lg p-4 mb-4 space-y-3">
          <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
            Nuevo Nodo de Poder en {baseNetwork.label}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Nombre del Actor / Stakeholder
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Mayorista Norte, AFIP, Socio Capitalista..."
                className="w-full bg-background border border-border rounded px-2.5 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Categoría
              </label>
              <select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as ActorKind)}
                className="w-full bg-background border border-border rounded px-2 h-8 text-xs font-display outline-none"
              >
                {ALL_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {ACTOR_KIND_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Poder ({newPowerPct}%)
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={newPowerPct}
                onChange={(e) => setNewPowerPct(Number(e.target.value))}
                className="w-full accent-primary mt-1.5"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Vínculo inicial con
              </label>
              <select
                value={newTargetId}
                onChange={(e) => setNewTargetId(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 h-8 text-xs font-display outline-none"
              >
                {activeActors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Tipo de relación
              </label>
              <select
                value={newRelType}
                onChange={(e) => setNewRelType(e.target.value as 'ally' | 'rival' | 'neutral')}
                className="w-full bg-background border border-border rounded px-2 h-8 text-xs font-display outline-none"
              >
                <option value="ally">Alianza</option>
                <option value="neutral">Neutra / Negociación</option>
                <option value="rival">Rivalidad / Tensión</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Rol o Palanca Estratégica (opcional)
              </label>
              <input
                type="text"
                value={newBlurb}
                onChange={(e) => setNewBlurb(e.target.value)}
                placeholder="Ej: Concentra 35% de la distribución regional..."
                className="w-full bg-background border border-border rounded px-2.5 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Postura / Eje (-1 a +1): {newIdeology.toFixed(1)}
              </label>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.1}
                value={newIdeology}
                onChange={(e) => setNewIdeology(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <button
              onClick={handleAddCustomActor}
              disabled={!newName.trim()}
              className="px-4 h-8 rounded bg-primary text-primary-foreground text-xs font-display font-semibold hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
            >
              + Incorporar al Mapa
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ALL_KINDS.map((k) => {
          const active = kinds.has(k)
          return (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={cn(
                'px-2.5 h-7 rounded-md border text-[10px] font-display transition-all cursor-pointer',
                active
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {ACTOR_KIND_LABELS[k]}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {(['all', 'ally', 'rival', 'neutral'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRel(r)}
            className={cn(
              'px-2.5 h-7 rounded-md border text-[10px] font-display transition-all capitalize cursor-pointer',
              rel === r
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/40 text-muted-foreground hover:text-foreground',
              r === 'ally' && rel === r && 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally',
              r === 'rival' && rel === r && 'border-signal-rival/40 bg-signal-rival/10 text-signal-rival',
            )}
          >
            {r === 'all' ? 'Todas' : r === 'ally' ? 'Alianzas' : r === 'rival' ? 'Rivalidades' : 'Neutras'}
          </button>
        ))}
      </div>

      {/* Graph + Detail panel */}
      <div className="flex gap-4">
        <div className={cn('h-[72vh] bg-card border border-border/60 rounded-lg overflow-hidden transition-all', selectedActor ? 'flex-1' : 'w-full')}>
          <ActorGraph
            key={networkId}
            actors={activeActors}
            relations={activeRelations}
            filterKinds={kinds}
            filterRelation={rel}
            selectedId={selectedId}
            onSelectActor={setSelectedId}
          />
        </div>

        {/* Detail panel */}
        {selectedActor && (
          <div className="w-80 shrink-0 bg-card border border-border/60 rounded-lg p-5 flex flex-col gap-4 overflow-y-auto h-[72vh]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground mb-0.5">
                  {ACTOR_KIND_LABELS[selectedActor.kind]}
                </div>
                <h2 className="font-display text-base font-bold leading-tight">{selectedActor.name}</h2>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0 cursor-pointer"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{selectedActor.blurb}</p>

            {/* Power bar */}
            <div>
              <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-1">
                <span>Poder relativo global</span>
                <span className="text-foreground font-semibold">{Math.round(selectedActor.power * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${selectedActor.power * 100}%` }} />
              </div>
            </div>

            {/* Vector de 4 Poderes (Maquiavelo / Sun Bin) */}
            {selectedPowerVector && (
              <div className="bg-background/60 border border-border/50 rounded-md p-3 space-y-2">
                <div className="text-[9px] font-display uppercase tracking-wider text-primary font-bold">
                  Vector de 4 Poderes (Maquiavelo / Sun Bin)
                </div>
                {(
                  [
                    {
                      label: '🏛️ Institucional / Veto',
                      val: selectedPowerVector.institutional,
                      barClass: 'bg-chart-1',
                    },
                    {
                      label: '⚙️ Operativo / Movilización',
                      val: selectedPowerVector.mobilization,
                      barClass: 'bg-chart-3',
                    },
                    {
                      label: '💰 Financiero / Caja',
                      val: selectedPowerVector.financial,
                      barClass: 'bg-signal-ally',
                    },
                    {
                      label: '📡 Narrativo / Agenda',
                      val: selectedPowerVector.narrative,
                      barClass: 'bg-amber-400',
                    },
                  ] as const
                ).map((dim) => (
                  <div key={dim.label}>
                    <div className="flex justify-between text-[10px] font-display mb-0.5">
                      <span className="text-muted-foreground">{dim.label}</span>
                      <span className="font-semibold">{dim.val}%</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', dim.barClass)}
                        style={{ width: `${dim.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ideology */}
            <div>
              <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-1">
                <span>Posición / Eje</span>
                <span className="text-foreground font-semibold">{IDEOLOGY_LABEL(selectedActor.ideology)}</span>
              </div>
              <div className="relative h-1.5 w-full bg-muted rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"
                  style={{ left: `${((selectedActor.ideology + 1) / 2) * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground/50 font-display mt-0.5">
                <span>Disruptivo / Izq.</span><span>Mercado / Der.</span>
              </div>
            </div>

            {/* Relations */}
            <div>
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">
                Vínculos ({actorRelations.length})
              </div>
              <div className="flex flex-col gap-1.5">
                {actorRelations.map((r, i) => {
                  const otherId = r.source === selectedId ? r.target : r.source
                  const other = activeActors.find((a) => a.id === otherId)
                  if (!other) return null
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedId(otherId)}
                      className="flex items-center gap-2 text-left hover:bg-accent/50 rounded px-1.5 py-1 transition-colors cursor-pointer"
                    >
                      <span className={cn(
                        'size-1.5 rounded-full shrink-0',
                        r.type === 'ally' ? 'bg-signal-ally' : r.type === 'rival' ? 'bg-signal-rival' : 'bg-signal-neutral'
                      )} />
                      <span className="text-xs font-medium truncate flex-1">{other.name}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">
                        {Math.round(r.strength * 100)}%
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Link directo al Motor de Decisiones */}
            <Link
              to="/decisiones?level=L3_EMPRESA"
              className="mt-auto w-full h-8 rounded-md bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-colors font-display text-[11px] font-semibold flex items-center justify-center"
            >
              ⚡ Simular Decisión con este Actor →
            </Link>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-5 text-[10px] text-muted-foreground font-display">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-signal-ally" /> Alianza
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-signal-rival" /> Rivalidad
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-signal-neutral" /> Neutro
        </span>
        {selectedActor && (
          <span className="ml-auto text-muted-foreground/60">
            Click en otro actor para navegar · Click en fondo para cerrar
          </span>
        )}
      </div>
    </div>
  )
}
