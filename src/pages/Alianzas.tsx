import { ALLIANCES } from '@/lib/data/alliances'

const SECTIONS = [
  { key: 'solid' as const, label: 'Alianzas sólidas', color: 'text-signal-ally' },
  { key: 'weak' as const, label: 'Alianzas débiles', color: 'text-signal-warn' },
  { key: 'broken' as const, label: 'Alianzas rotas', color: 'text-signal-rival' },
]

export default function AlianzasPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex items-center gap-2 mb-1">
        <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 13</div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400">
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          Próximamente
        </span>
      </div>
      <h1 className="font-display text-3xl mt-1">Alianzas</h1>
      <p className="text-muted-foreground text-sm mt-1">Mapa de alianzas sólidas, débiles y rotas. <span className="text-amber-400/80 font-display text-xs">· Cascarón estático preliminar</span></p>

      {SECTIONS.map((section) => (
        <div key={section.key} className="mt-8 space-y-3">
          <h2 className={`font-display text-xs uppercase tracking-[0.25em] ${section.color}`}>{section.label}</h2>
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
