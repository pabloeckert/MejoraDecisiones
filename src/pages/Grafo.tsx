import { useState } from 'react'
import { ActorGraph } from '@/components/actor-graph'
import { ACTOR_KIND_LABELS, type ActorKind } from '@/lib/seed-data'
import { cn } from '@/lib/utils'

const ALL_KINDS: ActorKind[] = ['leader', 'party', 'institution', 'union', 'business', 'media']

export default function GrafoPage() {
  const [kinds, setKinds] = useState<Set<ActorKind>>(new Set(ALL_KINDS))
  const [rel, setRel] = useState<'all' | 'ally' | 'rival' | 'neutral'>('all')

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
            Click en un nodo para aislar sus vínculos. Filtrá por tipo de actor o relación.
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

      {/* Graph */}
      <div className="h-[72vh] bg-card border border-border/60 rounded-lg overflow-hidden">
        <ActorGraph filterKinds={kinds} filterRelation={rel} />
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
      </div>
    </div>
  )
}
