import { PROVINCES } from '@/lib/data/provinces'
import { cn } from '@/lib/utils'

export default function ProvinciasPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 10</div>
      <h1 className="font-display text-3xl mt-1">Provincias</h1>
      <p className="text-muted-foreground text-sm mt-1">24 provincias con gobernadores, alianzas y transferencias federales.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVINCES.map((p, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-sm">{p.name}</span>
              <span className={cn(
                'text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border',
                p.align === 'allied' ? 'text-signal-ally border-signal-ally' :
                p.align === 'hostile' ? 'text-signal-rival border-signal-rival' :
                'text-muted-foreground border-border',
              )}>{p.align}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><span className="text-foreground">Gobernador:</span> {p.gov}</div>
              <div><span className="text-foreground">Partido:</span> {p.party}</div>
              <div><span className="text-foreground">Fondos:</span> {p.funds}</div>
              <div className="mt-2 pt-2 border-t border-border">{p.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
