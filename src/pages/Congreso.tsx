import { CONGRESS } from '@/lib/data/congress'

export default function CongresoPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 09</div>
      <h1 className="font-display text-3xl mt-1">Congreso</h1>
      <p className="text-muted-foreground text-sm mt-1">Composición de bloques, legislación clave y análisis de poder legislativo.</p>

      {/* Diputados */}
      <div className="mt-8 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Cámara de Diputados — <span className="text-primary">{CONGRESS.diputados.president}</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CONGRESS.diputados.blocks.map((b, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{b.name}</span>
                <span className="font-display text-lg text-primary">{b.seats}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border ${
                  b.position === 'oficialismo' ? 'text-signal-ally border-signal-ally' :
                  b.position === 'oposición' ? 'text-signal-rival border-signal-rival' :
                  'text-muted-foreground border-border'
                }`}>{b.position}</span>
              </div>
              <p className="text-xs text-muted-foreground">{b.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Senado */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Cámara de Senados — <span className="text-primary">{CONGRESS.senado.president}</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CONGRESS.senado.blocks.map((b, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{b.name}</span>
                <span className="font-display text-lg text-primary">{b.seats}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border ${
                  b.position === 'oficialismo' ? 'text-signal-ally border-signal-ally' :
                  b.position === 'oposición' ? 'text-signal-rival border-signal-rival' :
                  'text-muted-foreground border-border'
                }`}>{b.position}</span>
              </div>
              <p className="text-xs text-muted-foreground">{b.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agenda */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Legislación clave</h2>
        <div className="space-y-3">
          {CONGRESS.agenda.map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{item.project}</span>
                <span className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border ${
                  item.stateClass === 'green' ? 'text-signal-ally border-signal-ally' :
                  item.stateClass === 'red' ? 'text-signal-rival border-signal-rival' :
                  item.stateClass === 'amber' ? 'text-signal-warn border-signal-warn' :
                  'text-muted-foreground border-border'
                }`}>{item.state}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">Actores: {item.actors}</div>
              <p className="text-xs text-muted-foreground">{item.analysis}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
