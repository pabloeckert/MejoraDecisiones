import { Link } from 'react-router-dom'
import { StatCard } from '@/components/stat-card'
import { ACTORS, RELATIONS } from '@/lib/seed-data'

const MODULES = [
  { code: "01", to: "/grafo", title: "Grafo de actores", desc: "Mapa de poder, alianzas y rivalidades entre partidos, líderes, sindicatos, empresas, medios e instituciones.", status: "Live" },
  { code: "02", to: "/matriz", title: "Matriz de pagos", desc: "Editor de juegos N×M con cálculo de equilibrios de Nash en estrategias puras y mixtas.", status: "Live" },
  { code: "03", to: "/escenarios", title: "Escenarios", desc: "Simulador what-if: variá parámetros macro y observá cómo se desplazan los equilibrios.", status: "Live" },
  { code: "04", to: "/indicadores", title: "Indicadores", desc: "KPIs políticos y económicos con evolución temporal y análisis sectorial.", status: "Live" },
  { code: "05", to: "/ia", title: "Pensamiento IA", desc: "Consenso de 5 modelos de IA sobre la situación política argentina.", status: "Live" },
  { code: "06", to: "/pymes", title: "PyMEs", desc: "Diagnóstico sectorial, indicadores y políticas públicas para el sector PyME.", status: "Live" },
  { code: "07", to: "/kanban", title: "Kanban escenarios", desc: "10 escenarios estratégicos organizados en tablero Kanban.", status: "Live" },
  { code: "08", to: "/predictor", title: "Predictor", desc: "Proyecciones multihorizonte y simulador Nash interactivo.", status: "Live" },
  { code: "09", to: "/congreso", title: "Congreso", desc: "Composición de bloques, legislación clave y análisis de poder legislativo.", status: "Live" },
  { code: "10", to: "/provincias", title: "Provincias", desc: "24 provincias con gobernadores, alianzas y transferencias federales.", status: "Live" },
  { code: "11", to: "/sombra", title: "Sombra", desc: "Los tapados: operadores judiciales, digitales y económicos sin cargo formal.", status: "Live" },
  { code: "12", to: "/internacional", title: "Internacional", desc: "Bloques internacionales y su relación con Argentina.", status: "Live" },
  { code: "13", to: "/alianzas", title: "Alianzas", desc: "Mapa de alianzas sólidas, débiles y rotas del oficialismo y oposición.", status: "Live" },
  { code: "14", to: "/feed", title: "Feed", desc: "Fuentes de análisis, datos y proyecciones de medios y think tanks.", status: "Live" },
] as const

export default function OverviewPage() {
  const allies = RELATIONS.filter((r) => r.type === 'ally').length
  const rivals = RELATIONS.filter((r) => r.type === 'rival').length
  const neutral = RELATIONS.filter((r) => r.type === 'neutral').length

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-[1600px] px-6 py-12 md:py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm">▲</span>
            </div>
            <div>
              <div className="text-[10px] font-display uppercase tracking-[0.25em] text-primary font-semibold">
                República Argentina
              </div>
              <div className="text-[10px] font-display text-muted-foreground tracking-wider">
                Análisis estratégico · Teoría de juegos
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.1] max-w-3xl font-bold tracking-tight">
            Poder, alianzas y escenarios{' '}
            <span className="text-primary">en equilibrio.</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            Dashboard analítico que cruza el mapa de actores políticos con
            teoría de juegos. Para entender quién juega, con quién, y
            qué pasa cuando cambian las reglas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/grafo"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Abrir grafo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              to="/matriz"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md border border-border text-foreground font-display text-xs hover:bg-accent/50 transition-colors"
            >
              Matriz de pagos
            </Link>
            <Link
              to="/escenarios"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md border border-border text-foreground font-display text-xs hover:bg-accent/50 transition-colors"
            >
              Simulador
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Actores mapeados" value={ACTORS.length} accent="primary" />
          <StatCard label="Alianzas" value={allies} accent="ally" hint="Vínculos cooperativos" />
          <StatCard label="Rivalidades" value={rivals} accent="rival" hint="Conflictos activos" />
          <StatCard label="Neutros" value={neutral} accent="neutral" hint="Dialoguistas" />
        </div>
      </section>

      {/* Modules grid */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-border/40" />
          <h2 className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            Módulos
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MODULES.map((m) => (
            <Link
              key={m.code}
              to={m.to}
              className="group relative bg-card border border-border/60 rounded-lg p-4 hover:border-primary/30 hover:bg-card/80 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">{m.code}</span>
                  <h3 className="font-display text-sm font-medium">{m.title}</h3>
                </div>
                <span className="flex items-center gap-1 text-[8px] font-display uppercase tracking-wider text-signal-ally">
                  <span className="size-1 rounded-full bg-signal-ally" />
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{m.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-primary font-display opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
