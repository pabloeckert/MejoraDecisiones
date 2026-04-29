import { KANBAN_CARDS } from '@/lib/data/kanban'

const COLUMNS = [
  { key: 'emerging' as const, label: 'Emerging' },
  { key: 'active' as const, label: 'Active' },
  { key: 'dominant' as const, label: 'Dominant' },
  { key: 'collapsed' as const, label: 'Collapsed' },
]

export default function KanbanPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 07</div>
      <h1 className="font-display text-3xl mt-1">Kanban escenarios</h1>
      <p className="text-muted-foreground text-sm mt-1">10 escenarios estratégicos organizados por estado.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const cards = KANBAN_CARDS.filter((c) => c.col === col.key)
          return (
            <div key={col.key} className="space-y-3">
              <div className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                {col.label}
                <span className="text-[10px] bg-muted rounded px-1.5 py-0.5">{cards.length}</span>
              </div>
              {cards.map((card) => (
                <div key={card.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">{card.tag}</span>
                    <span className="font-display text-lg" style={{ color: card.color }}>{card.pct}%</span>
                  </div>
                  <h3 className="font-display text-sm">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2">{card.desc}</p>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
