import { FEED_ITEMS } from '@/lib/data/feed'

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 14</div>
      <h1 className="font-display text-3xl mt-1">Feed de fuentes</h1>
      <p className="text-muted-foreground text-sm mt-1">Fuentes de análisis, datos y proyecciones.</p>

      <div className="mt-8 space-y-3">
        {FEED_ITEMS.map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-start gap-4">
            <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground shrink-0">{item.tag}</span>
            <div className="flex-1">
              <div className="font-display text-sm text-primary mb-1">{item.source}</div>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
