import { ALLIANCES } from '@/lib/data/alliances'

const SECTIONS = [
  { key: 'solid' as const, label: 'Alianzas sólidas', color: 'text-signal-ally' },
  { key: 'weak' as const, label: 'Alianzas débiles', color: 'text-signal-warn' },
  { key: 'broken' as const, label: 'Alianzas rotas', color: 'text-signal-rival' },
]

export default function AlianzasPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 13</div>
      <h1 className="font-display text-3xl mt-1">Alianzas</h1>
      <p className="text-muted-foreground text-sm mt-1">Mapa de alianzas sólidas, débiles y rotas.</p>

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
