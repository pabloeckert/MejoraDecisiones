import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  code: string
  badge?: string
}

const NAV: readonly NavItem[] = [
  { to: "/", label: "Overview", code: "00" },
  { to: "/grafo", label: "Grafo", code: "01" },
  { to: "/matriz", label: "Matriz", code: "02" },
  { to: "/escenarios", label: "Escenarios", code: "03" },
  { to: "/indicadores", label: "Indicadores", code: "04" },
  { to: "/ia", label: "IA", code: "05" },
  { to: "/pymes", label: "PyMEs", code: "06" },
  { to: "/kanban", label: "Kanban", code: "07" },
  { to: "/predictor", label: "Predictor", code: "08", badge: "Próx" },
  { to: "/congreso", label: "Congreso", code: "09", badge: "Próx" },
  { to: "/provincias", label: "Provincias", code: "10" },
  { to: "/sombra", label: "Sombra", code: "11" },
  { to: "/internacional", label: "Intl", code: "12" },
  { to: "/alianzas", label: "Alianzas", code: "13", badge: "Próx" },
  { to: "/feed", label: "Feed", code: "14", badge: "Próx" },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const path = location.pathname

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Conversion Banner: Hook Alta Dirección -> Diagnóstico 4D */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30 py-2 px-4 text-center text-xs font-display flex items-center justify-center gap-2 flex-wrap">
        <span className="text-muted-foreground font-medium">
          ¿Querés aplicar este análisis a tu empresa?
        </span>
        <a
          href="https://diagnostico.mejoraok.com?utm_source=tablero_nash&utm_medium=cta_header"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-black hover:bg-primary px-3 py-0.5 rounded-full transition-all border border-primary/40 text-[11px] shadow-sm"
        >
          <span>Hacé el Diagnóstico 4D</span>
          <span className="text-[12px]">→</span>
        </a>
      </div>

      {/* Top bar */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="font-display text-primary text-xs font-bold">N</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xs tracking-wider uppercase text-foreground leading-none">
                Tablero<span className="text-primary">·</span>Nash
              </div>
              <div className="text-[9px] text-muted-foreground font-display tracking-wider mt-0.5">
                ARG · Poder · Alianzas · Escenarios
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 ml-auto overflow-x-auto scrollbar-hide">
            {NAV.map((item) => {
              const active = item.to === "/" ? path === "/" : path.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[11px] transition-all font-display whitespace-nowrap",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <span className={cn(
                    "text-[8px] font-bold tracking-wider",
                    active ? "text-primary/60" : "text-muted-foreground/40"
                  )}>{item.code}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[8px] font-display uppercase tracking-wider px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Status */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-border/40 shrink-0">
            <span className="size-1.5 rounded-full bg-signal-ally animate-pulse" />
            <span className="text-[9px] font-display text-muted-foreground uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-[1600px] px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-display text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>Datos ilustrativos · Citar fuentes antes de uso público</span>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://diagnostico.mejoraok.com?utm_source=tablero_nash&utm_medium=cta_footer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              ¿Querés aplicar este análisis a tu empresa? Hacé el Diagnóstico 4D →
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-50">v4.3</span>
            <span className="text-primary/50">▲</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
