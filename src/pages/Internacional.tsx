import { INTL_BLOCS } from '@/lib/data/international'

export default function InternacionalPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 12</div>
      <h1 className="font-display text-3xl mt-1">Internacional</h1>
      <p className="text-muted-foreground text-sm mt-1">Bloques internacionales y su relación con Argentina.</p>

      <div className="mt-8 space-y-4">
        {INTL_BLOCS.map((bloc, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{bloc.flag}</span>
              <span className="font-display text-lg">{bloc.name}</span>
              <span className="ml-auto text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border" style={{ color: bloc.statusColor }}>{bloc.status}</span>
            </div>
            <div className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: bloc.body }} />
            <div className="flex flex-wrap gap-2 mb-2">
              {bloc.actors.map((actor, j) => (
                <span key={j} className="text-[10px] font-display bg-muted rounded px-2 py-0.5 text-muted-foreground">{actor}</span>
              ))}
            </div>
            <div className="text-xs text-signal-warn font-display">Riesgo: {bloc.risk}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
