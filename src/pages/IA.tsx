import { AI_THINKING } from '@/lib/data/ai-thinking'
import { SOCIAL_TRENDS } from '@/lib/data/social-trends'
import { ANALYSTS_NATIONAL, ANALYSTS_INTL } from '@/lib/data/analysts'

export default function IAPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">Módulo 05</div>
      <h1 className="font-display text-3xl mt-1">Pensamiento IA</h1>
      <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
        Consenso de 5 modelos de IA sobre la situación política argentina.
      </p>

      {/* AI Thinking */}
      <div className="mt-8 space-y-4">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Modelos de IA</h2>
        {AI_THINKING.map((t, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-sm text-primary">{t.source}</span>
              <span className="text-[10px] font-display text-muted-foreground border border-border rounded px-2 py-0.5">{t.confidence}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>

      {/* Social Trends */}
      <div className="mt-10 space-y-4">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Tendencias en redes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {SOCIAL_TRENDS.map((st, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{st.icon}</span>
                <span className="font-display text-sm">{st.topic}</span>
                <span className="ml-auto text-[10px] font-display text-signal-rival">{st.change}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${st.heat}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{st.trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analysts */}
      <div className="mt-10 space-y-4">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Analistas nacionales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ANALYSTS_NATIONAL.map((a, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display text-sm text-primary">{a.name}</span>
                <span className="text-[10px] text-muted-foreground">· {a.outlet}</span>
                <span className={`ml-auto text-[10px] font-display px-2 py-0.5 rounded border ${
                  a.stance === 'bullish' ? 'text-signal-ally border-signal-ally' :
                  a.stance === 'bearish' ? 'text-signal-rival border-signal-rival' :
                  'text-muted-foreground border-border'
                }`}>{a.stance}</span>
              </div>
              <p className="text-xs text-muted-foreground italic">"{a.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">Analistas internacionales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ANALYSTS_INTL.map((a, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display text-sm text-primary">{a.name}</span>
                <span className="text-[10px] text-muted-foreground">· {a.outlet}</span>
                <span className={`ml-auto text-[10px] font-display px-2 py-0.5 rounded border ${
                  a.stance === 'bullish' ? 'text-signal-ally border-signal-ally' :
                  a.stance === 'bearish' ? 'text-signal-rival border-signal-rival' :
                  'text-muted-foreground border-border'
                }`}>{a.stance}</span>
              </div>
              <p className="text-xs text-muted-foreground italic">"{a.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
