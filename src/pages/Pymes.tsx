import { PYMES_DIAGNOSIS, PYMES_INDICATORS, PYMES_POLICIES, PYMES_SCENARIOS } from '@/lib/data/pymes'

export default function PymesPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 06</div>
      <h1 className="font-display text-3xl mt-1">PyMEs</h1>
      <p className="text-muted-foreground text-sm mt-1">Diagnóstico sectorial, indicadores y políticas públicas.</p>

      {/* Diagnosis */}
      <div className="mt-8 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Diagnóstico por sector</h2>
        {PYMES_DIAGNOSIS.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1">
              <div className="font-display text-sm">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>
              <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
            </div>
            <span className="font-display text-lg text-foreground">{s.bar}%</span>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Indicadores clave</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PYMES_INDICATORS.map((ind, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{ind.label}</div>
              <div className="font-display text-xl mt-1">{ind.value}</div>
              <div className={`text-xs mt-1 font-display ${ind.trend === 'up' ? 'text-signal-ally' : ind.trend === 'down' ? 'text-signal-rival' : 'text-muted-foreground'}`}>
                {ind.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Políticas públicas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PYMES_POLICIES.map((p, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="font-display text-sm text-primary">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.detail}</div>
              <div className="mt-2 text-[10px] font-display uppercase tracking-wider text-muted-foreground">Impacto: {p.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div className="mt-10 space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Escenarios PyME</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PYMES_SCENARIOS.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{s.title}</span>
                <span className="font-display text-lg" style={{ color: s.color }}>{s.pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
