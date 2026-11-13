import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { buildDiagnostico4DFederatedUrl } from '@/lib/federation'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  code: string
  badge?: string
  highlight?: boolean
}

const NAV: readonly NavItem[] = [
  { to: '/', label: 'Overview', code: '00' },
  { to: '/decisiones', label: 'Decision OS', code: 'OS', highlight: true },
  { to: '/grafo', label: 'Grafo', code: '01' },
  { to: '/matriz', label: 'Matriz', code: '02' },
  { to: '/escenarios', label: 'Escenarios', code: '03' },
  { to: '/indicadores', label: 'Indicadores', code: '04' },
  { to: '/ia', label: 'IA', code: '05' },
  { to: '/pymes', label: 'PyMEs', code: '06' },
  { to: '/kanban', label: 'Kanban', code: '07' },
  { to: '/predictor', label: 'Predictor', code: '08' },
  { to: '/congreso', label: 'Congreso', code: '09' },
  { to: '/provincias', label: 'Provincias', code: '10' },
  { to: '/sombra', label: 'Sombra', code: '11' },
  { to: '/internacional', label: 'Intl', code: '12' },
  { to: '/alianzas', label: 'Alianzas', code: '13' },
  { to: '/feed', label: 'Feed', code: '14' },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const [theme, setTheme] = useState<'tactico' | 'directorio'>(() => {
    return (localStorage.getItem('nash_theme') as 'tactico' | 'directorio') || 'tactico'
  })
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')

  useEffect(() => {
    if (theme === 'directorio') {
      document.documentElement.setAttribute('data-theme', 'directorio')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('nash_theme', theme)
  }, [theme])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setCmdOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const quickCommands = [
    { label: '🌍 Nivel L4: Decisión Macro e Internacional', to: '/decisiones?level=L4_MACRO' },
    { label: '🏢 Nivel L3: Decisión Estratégica Empresarial / PyME', to: '/decisiones?level=L3_EMPRESA' },
    { label: '🧭 Nivel L2: Decisión Estructural Personal y Visión', to: '/decisiones?level=L2_PERSONAL' },
    { label: '⚡ Nivel L1: Problema Cotidiano y Negociación Rápida', to: '/decisiones?level=L1_COTIDIANO' },
    ...NAV.map((n) => ({ label: `[${n.code}] Módulo ${n.label}`, to: n.to })),
  ].filter((c) => c.label.toLowerCase().includes(cmdQuery.toLowerCase()))

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Conversion Banner: Hook Alta Dirección -> Diagnóstico 4D */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30 py-2 px-4 text-center text-xs font-display flex items-center justify-center gap-2 flex-wrap">
        <span className="text-muted-foreground font-medium">
          ¿Querés aplicar este análisis a tu empresa?
        </span>
        <a
          href={buildDiagnostico4DFederatedUrl('cta_header')}
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
                Mejora<span className="text-primary">·</span>Decisiones
              </div>
              <div className="text-[9px] text-muted-foreground font-display tracking-wider mt-0.5">
                Decision OS · Nash · Escenarios
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 ml-auto overflow-x-auto scrollbar-hide">
            {NAV.map((item) => {
              const active = item.to === '/' ? path === '/' : path.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'relative flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[11px] transition-all font-display whitespace-nowrap',
                    active
                      ? 'bg-primary/15 text-primary font-semibold'
                      : item.highlight
                      ? 'text-primary border border-primary/30 bg-primary/5 hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <span
                    className={cn(
                      'text-[8px] font-bold tracking-wider',
                      active ? 'text-primary/80' : 'text-muted-foreground/40'
                    )}
                  >
                    {item.code}
                  </span>
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

          {/* Command Bar & Theme Selector */}
          <div className="flex items-center gap-2 pl-3 border-l border-border/40 shrink-0">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-border/60 bg-background/60 text-[10px] font-display text-muted-foreground hover:text-foreground cursor-pointer"
              title="Salto rápido a cualquier decisión o módulo (Ctrl+K / ⌘K)"
            >
              <span>⌘K</span>
            </button>
            <button
              onClick={() => setTheme((t) => (t === 'tactico' ? 'directorio' : 'tactico'))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-display font-medium border border-border/60 hover:border-primary/40 bg-card/60 hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
              title="Alternar entre Modo Táctico y Modo Directorio (Mejora Continua)"
            >
              <span>{theme === 'directorio' ? '🏢 Modo Directorio' : '⚡ Modo Táctico'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal Command Bar (⌘K) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-display uppercase tracking-wider text-primary font-semibold">
                Navegación Rápida · Decision OS
              </span>
              <button
                onClick={() => setCmdOpen(false)}
                className="text-xs font-display text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ESC
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Buscar nivel de decisión (L4, L3, L2, L1) o módulo..."
              className="w-full bg-background border border-border rounded px-3 py-2 text-xs font-display outline-none focus:border-primary"
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd.to}
                  onClick={() => {
                    navigate(cmd.to)
                    setCmdOpen(false)
                    setCmdQuery('')
                  }}
                  className="w-full text-left px-3 py-2 rounded text-xs font-display hover:bg-primary/15 hover:text-primary transition-colors cursor-pointer"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-[1600px] px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-display text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>MejoraDecisiones OS · Autónomo & Federation-Ready</span>
            <span className="hidden sm:inline">·</span>
            <a
              href={buildDiagnostico4DFederatedUrl('cta_footer')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              ¿Querés aplicar este análisis a tu empresa? Hacé el Diagnóstico 4D →
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-50">v5.2 Decision OS</span>
            <span className="text-primary/50">▲</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
