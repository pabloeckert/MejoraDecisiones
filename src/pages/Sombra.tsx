import { SHADOW_ACTORS } from '@/lib/data/shadow'

const SECTIONS = [
  { key: 'judicial' as const, label: 'Judicial', icon: '⚖️' },
  { key: 'digital' as const, label: 'Digital', icon: '🌐' },
  { key: 'economic' as const, label: 'Económico', icon: '💰' },
]

export default function SombraPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 11</div>
      <h1 className="font-display text-3xl mt-1">Actores en la sombra</h1>
      <p className="text-muted-foreground text-sm mt-1">Los tapados: operadores sin cargo formal pero con influencia real.</p>

      {SECTIONS.map((section) => (
        <div key={section.key} className="mt-8 space-y-3">
          <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {section.icon} {section.label}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SHADOW_ACTORS[section.key].map((a, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-sm text-primary">{a.name}</span>
                  <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">{a.role}</span>
                </div>
                <p className="text-xs text-muted-foreground">{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
