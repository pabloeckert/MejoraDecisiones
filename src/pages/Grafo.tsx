import { useState } from 'react'
import { ActorGraph } from '@/components/actor-graph'
import { ACTORS, RELATIONS, ACTOR_KIND_LABELS, type ActorKind } from '@/lib/seed-data'
import { cn } from '@/lib/utils'

const ALL_KINDS: ActorKind[] = ['leader', 'party', 'institution', 'union', 'business', 'media']

const IDEOLOGY_LABEL = (v: number) => {
  if (v <= -0.6) return 'Izquierda'
  if (v <= -0.2) return 'Centro-izquierda'
  if (v < 0.2)  return 'Centro'
  if (v < 0.6)  return 'Centro-derecha'
  return 'Derecha'
}

export default function GrafoPage() {
  const [kinds, setKinds] = useState<Set<ActorKind>>(new Set(ALL_KINDS))
  const [rel, setRel] = useState<'all' | 'ally' | 'rival' | 'neutral'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedActor = selectedId ? ACTORS.find((a) => a.id === selectedId) ?? null : null
  const actorRelations = selectedId
    ? RELATIONS.filter((r) => r.source === selectedId || r.target === selectedId)
    : []

  const toggle = (k: ActorKind) => {
    setKinds((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next.size === 0 ? new Set(ALL_KINDS) : next
    })
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">01</span>
            <div className="h-px w-8 bg-primary/20" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Grafo de actores</h1>
          <p className="text-muted-foreground text-xs mt-1 max-w-xl">
            Click en un nodo para ver detalle y aislar sus vínculos. Filtrá por tipo de actor o relación.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ALL_KINDS.map((k) => {
          const active = kinds.has(k)
          return (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={cn(
                'px-2.5 h-7 rounded-md border text-[10px] font-display transition-all',
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
              'px-2.5 h-7 rounded-md border text-[10px] font-display transition-all capitalize',
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
            filterKinds={kinds}
            filterRelation={rel}
            selectedId={selectedId}
            onSelectActor={setSelectedId}
          />
        </div>

        {/* Detail panel */}
        {selectedActor && (
          <div className="w-72 shrink-0 bg-card border border-border/60 rounded-lg p-5 flex flex-col gap-4 overflow-y-auto h-[72vh]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground mb-0.5">
                  {ACTOR_KIND_LABELS[selectedActor.kind]}
                </div>
                <h2 className="font-display text-base font-bold leading-tight">{selectedActor.name}</h2>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
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
                <span>Poder relativo</span>
                <span className="text-foreground font-semibold">{Math.round(selectedActor.power * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${selectedActor.power * 100}%` }} />
              </div>
            </div>

            {/* Ideology */}
            <div>
              <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-1">
                <span>Posición ideológica</span>
                <span className="text-foreground font-semibold">{IDEOLOGY_LABEL(selectedActor.ideology)}</span>
              </div>
              <div className="relative h-1.5 w-full bg-muted rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"
                  style={{ left: `${((selectedActor.ideology + 1) / 2) * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground/50 font-display mt-0.5">
                <span>Izquierda</span><span>Derecha</span>
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
                  const other = ACTORS.find((a) => a.id === otherId)
                  if (!other) return null
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedId(otherId)}
                      className="flex items-center gap-2 text-left hover:bg-accent/50 rounded px-1.5 py-1 transition-colors"
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
