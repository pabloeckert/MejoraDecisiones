import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const NAV = [
  { to: "/", label: "Overview", code: "00" },
  { to: "/grafo", label: "Grafo", code: "01" },
  { to: "/matriz", label: "Matriz", code: "02" },
  { to: "/escenarios", label: "Escenarios", code: "03" },
  { to: "/indicadores", label: "Indicadores", code: "04" },
  { to: "/ia", label: "IA", code: "05" },
  { to: "/pymes", label: "PyMEs", code: "06" },
  { to: "/kanban", label: "Kanban", code: "07" },
  { to: "/predictor", label: "Predictor", code: "08" },
  { to: "/congreso", label: "Congreso", code: "09" },
  { to: "/provincias", label: "Provincias", code: "10" },
  { to: "/sombra", label: "Sombra", code: "11" },
  { to: "/internacional", label: "Intl", code: "12" },
  { to: "/alianzas", label: "Alianzas", code: "13" },
  { to: "/feed", label: "Feed", code: "14" },
] as const

export function DashboardShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const path = location.pathname

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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
                    "relative flex items-center gap-1 px-2.5 h-8 rounded-md text-[11px] transition-all font-display whitespace-nowrap",
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
        <div className="mx-auto max-w-[1600px] px-6 h-10 flex items-center justify-between text-[10px] font-display text-muted-foreground">
          <span>Datos ilustrativos · Citar fuentes antes de uso público</span>
          <div className="flex items-center gap-3">
            <span className="opacity-50">v4.3</span>
            <span className="text-primary/50">▲</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
