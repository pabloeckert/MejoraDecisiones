import { SCENARIOS } from '@/lib/data/scenarios'
import { ORGS_NATIONAL, ORGS_INTL } from '@/lib/data/organisms'

export default function PredictorPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 08</div>
      <h1 className="font-display text-3xl mt-1">Predictor</h1>
      <p className="text-muted-foreground text-sm mt-1">Proyecciones multihorizonte y simulador Nash.</p>

      {/* Scenarios */}
      <div className="mt-8 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Escenarios Nash</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {SCENARIOS.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-sm">{s.title}</span>
                <span className="font-display text-2xl" style={{ color: s.color }}>{s.pct}%</span>
              </div>
              <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">{s.tag}</span>
              <p className="text-sm text-muted-foreground mt-3">{s.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.indicators.map((ind, j) => (
                  <span key={j} className="text-[10px] font-display bg-muted rounded px-2 py-0.5 text-muted-foreground">{ind}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* National Orgs */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Organismos nacionales</h2>
        <div className="space-y-3">
          {ORGS_NATIONAL.map((org, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-sm text-primary">{org.name}</span>
                <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">{org.type}</span>
              </div>
              <p className="text-xs text-muted-foreground">{org.position}</p>
            </div>
          ))}
        </div>
      </div>

      {/* International Orgs */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Organismos internacionales</h2>
        <div className="space-y-3">
          {ORGS_INTL.map((org, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-sm text-primary">{org.name}</span>
                <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">{org.type}</span>
              </div>
              <p className="text-xs text-muted-foreground">{org.position}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
