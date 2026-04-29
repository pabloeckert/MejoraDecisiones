import { useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ACTORS, RELATIONS, ACTOR_KIND_LABELS, type Actor, type ActorKind } from '@/lib/seed-data'
import { cn } from '@/lib/utils'

const KIND_COLOR: Record<ActorKind, string> = {
  party: 'var(--chart-1)',
  leader: 'var(--primary)',
  union: 'var(--chart-3)',
  business: 'var(--chart-5)',
  media: 'var(--chart-2)',
  institution: 'var(--signal-neutral)',
}

function ActorNode({ data }: { data: { actor: Actor; selected: boolean } }) {
  const { actor, selected } = data
  const color = KIND_COLOR[actor.kind]
  return (
    <div
      className={cn(
        'rounded-md border bg-card px-3 py-2 min-w-[140px] shadow-sm transition-all',
        selected ? 'border-primary ring-2 ring-primary/40' : 'border-border',
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">
        {ACTOR_KIND_LABELS[actor.kind]}
      </div>
      <div className="text-sm font-medium leading-tight mt-0.5">{actor.name}</div>
      <div className="mt-1.5 h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${actor.power * 100}%`, background: color }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </div>
  )
}

const nodeTypes = { actor: ActorNode }

function layoutNodes(actors: Actor[]): Node[] {
  const bands: ActorKind[] = ['leader', 'party', 'institution', 'union', 'business', 'media']
  const colsByBand: Record<string, number> = {}
  return actors.map((a) => {
    const bandIdx = bands.indexOf(a.kind)
    const col = (colsByBand[a.kind] = (colsByBand[a.kind] ?? 0) + 1)
    const x = 80 + ((a.ideology + 1) / 2) * 1100 + ((col % 2) * 40 - 20)
    const y = 60 + bandIdx * 130 + (col % 3) * 18
    return {
      id: a.id,
      type: 'actor' as const,
      position: { x, y },
      data: { actor: a, selected: false },
    }
  })
}

export function ActorGraph({
  filterKinds,
  filterRelation,
}: {
  filterKinds: Set<ActorKind>
  filterRelation: 'all' | 'ally' | 'rival' | 'neutral'
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const visibleActors = useMemo(
    () => ACTORS.filter((a) => filterKinds.has(a.kind)),
    [filterKinds],
  )
  const visibleIds = useMemo(() => new Set(visibleActors.map((a) => a.id)), [visibleActors])

  const nodes: Node[] = useMemo(
    () =>
      layoutNodes(visibleActors).map((n) => ({
        ...n,
        data: { ...n.data, selected: selected === n.id },
      })),
    [visibleActors, selected],
  )

  const edges: Edge[] = useMemo(
    () =>
      RELATIONS.filter(
        (r) =>
          visibleIds.has(r.source) &&
          visibleIds.has(r.target) &&
          (filterRelation === 'all' || r.type === filterRelation) &&
          (!selected || r.source === selected || r.target === selected),
      ).map((r, i) => {
        const color =
          r.type === 'ally'
            ? 'var(--signal-ally)'
            : r.type === 'rival'
            ? 'var(--signal-rival)'
            : 'var(--signal-neutral)'
        return {
          id: `${r.source}-${r.target}-${i}`,
          source: r.source,
          target: r.target,
          animated: r.type === 'rival' && r.strength > 0.7,
          style: {
            stroke: color,
            strokeWidth: 1 + r.strength * 2.5,
            opacity: 0.7,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color },
        }
      }),
    [visibleIds, filterRelation, selected],
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, n) => setSelected((s) => (s === n.id ? null : n.id))}
        onPaneClick={() => setSelected(null)}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.6}
      >
        <Background color="var(--border)" gap={24} />
        <Controls className="!bg-card !border !border-border" showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          className="!bg-card !border !border-border"
          nodeColor={(n) => KIND_COLOR[(n.data as { actor: Actor }).actor.kind]}
        />
      </ReactFlow>
    </div>
  )
}
