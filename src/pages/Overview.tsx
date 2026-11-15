import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/stat-card'
import { ACTORS, RELATIONS } from '@/lib/seed-data'
import { SCENARIOS } from '@/lib/data/scenarios'
import { loadSnapshot, saveSnapshot, computeDiff, type WeeklyDiff } from '@/lib/weekly-diff'
import {
  loadActiveRegion,
  loadEnterpriseProfile,
  loadDecisionJournal,
  computeCalibrationMetrics,
  exportFederationBundle,
  buildDiagnostico4DFederatedUrl,
  FEDERATION_SCHEMA_VERSION,
} from '@/lib/federation'
import { REGIONAL_CONTEXT_PACKS } from '@/lib/context-packs'

const ONBOARDING_KEY = 'mejora_os_onboarded_v1'

const DECISION_SCALES = [
  {
    code: 'L4',
    title: 'Macro, Geopolítico e Internacional',
    desc: 'Simulá shocks cambiarios, tasas globales, cadenas de suministro y poder entre bloques (Global, AR, US, BR, MX, UE).',
    to: '/decisiones?level=L4_MACRO',
    badge: 'Global Live',
  },
  {
    code: 'L3',
    title: 'Estratégico Empresarial y Directorio',
    desc: 'Decisiones de precios, inversión CAPEX, capital de trabajo y posicionamiento competitivo (Océano Azul + Diagnóstico 4D).',
    to: '/decisiones?level=L3_EMPRESA',
    badge: 'Directorio / PyME',
  },
  {
    code: 'L2',
    title: 'Estructural Personal y Visión de Vida',
    desc: 'Decisiones de carrera, patrimonio, emprendimiento o relocalización minimizando el arrepentimiento máximo (Savage + Kelly).',
    to: '/decisiones?level=L2_PERSONAL',
    badge: 'Horizonte 1-10 años',
  },
  {
    code: 'L1',
    title: 'Problemas Cotidianos y Negociación Rápida',
    desc: 'Resolución táctica en 3 minutos para acuerdos con clientes, socios o proveedores y priorización multicriterio (TOPSIS).',
    to: '/decisiones?level=L1_COTIDIANO',
    badge: 'Táctico 3 min',
  },
] as const

const MODULES = [
  { code: 'OS', to: '/decisiones', title: 'Decision OS (Multi-Escala)', desc: 'Motor matemático integral: Wald, Savage, Prospect Theory (Ariely), Monte Carlo, Árboles Secuenciales, TOPSIS y Bitácora.', status: 'Core' },
  { code: '01', to: '/grafo', title: 'Grafo de actores', desc: 'Mapa de poder, alianzas y rivalidades entre partidos, líderes, sindicatos, empresas, medios e instituciones.', status: 'Live' },
  { code: '02', to: '/matriz', title: 'Matriz de pagos', desc: 'Editor de juegos N×M con cálculo de equilibrios de Nash en estrategias puras y mixtas.', status: 'Live' },
  { code: '03', to: '/escenarios', title: 'Escenarios', desc: 'Simulador what-if: variá parámetros macro y observá cómo se desplazan los equilibrios.', status: 'Live' },
  { code: '04', to: '/indicadores', title: 'Indicadores', desc: 'KPIs políticos y económicos en vivo (DolarAPI, BCRA, INDEC, Banco Mundial y Frankfurter FX).', status: 'Live' },
  { code: '05', to: '/ia', title: 'Pensamiento IA', desc: 'Consenso de modelos de IA, tendencias y analistas nacionales e internacionales.', status: 'Live' },
  { code: '06', to: '/pymes', title: 'PyMEs & Gemelo', desc: 'Gemelo interactivo de exposición empresarial, resiliencia Monte Carlo y políticas sectoriales.', status: 'Live' },
  { code: '07', to: '/kanban', title: 'Kanban escenarios', desc: '10 escenarios estratégicos organizados en tablero Kanban por estado de maduración.', status: 'Live' },
  { code: '08', to: '/predictor', title: 'Predictor', desc: 'Proyecciones multihorizonte y postura de organismos nacionales e internacionales.', status: 'Live' },
  { code: '09', to: '/congreso', title: 'Congreso & Banzhaf', desc: 'Calculadora de poder de coalición (Índice de Banzhaf), quórum, vetos y bloques legislativos.', status: 'Live' },
  { code: '10', to: '/provincias', title: 'Provincias', desc: '24 jurisdicciones con gobernadores, alineamiento y transferencias federales.', status: 'Live' },
  { code: '11', to: '/sombra', title: 'Sombra', desc: 'Operadores judiciales, digitales y económicos sin cargo formal pero con influencia real.', status: 'Live' },
  { code: '12', to: '/internacional', title: 'Internacional', desc: 'Bloques geopolíticos internacionales, alianzas y exposición estratégica.', status: 'Live' },
  { code: '13', to: '/alianzas', title: 'Alianzas', desc: 'Mapa de alianzas sólidas, débiles y rotas del tablero político y corporativo.', status: 'Live' },
  { code: '14', to: '/feed', title: 'Feed', desc: 'Fuentes de análisis, datos y proyecciones de medios y think tanks.', status: 'Live' },
] as const

function formatRelativeDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}

export default function OverviewPage() {
  const allies = RELATIONS.filter((r) => r.type === 'ally').length
  const rivals = RELATIONS.filter((r) => r.type === 'rival').length
  const neutral = RELATIONS.filter((r) => r.type === 'neutral').length
  const journal = loadDecisionJournal()
  const journalCount = journal.length
  const calibration = computeCalibrationMetrics(journal)
  const activeRegion = loadActiveRegion()
  const regionPack = REGIONAL_CONTEXT_PACKS[activeRegion]
  const enterprise = loadEnterpriseProfile()
  const bridgeUrl = buildDiagnostico4DFederatedUrl('overview_console')

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(ONBOARDING_KEY)
    } catch {
      return false
    }
  })

  const closeOnboarding = (markSeen = true) => {
    if (markSeen) {
      try {
        localStorage.setItem(ONBOARDING_KEY, '1')
      } catch {
        // ignore
      }
    }
    setShowOnboarding(false)
  }

  const handleDownloadBackup = () => {
    const payload = exportFederationBundle()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mejora-decision-os-${payload.activeRegion.toLowerCase()}-backup.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [diff] = useState<WeeklyDiff | null>(() => {
    const current = { allies, rivals, neutral, actors: ACTORS.length, scenarios: SCENARIOS.length }
    return computeDiff(loadSnapshot(), current)
  })

  useEffect(() => {
    const current = { allies, rivals, neutral, actors: ACTORS.length, scenarios: SCENARIOS.length }
    saveSnapshot({ ...current, ts: Date.now() })
  }, [allies, rivals, neutral])

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-[1600px] px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm">▲</span>
            </div>
            <div>
              <div className="text-[10px] font-display uppercase tracking-[0.25em] text-primary font-semibold">
                Sistema Operativo de Decisiones · Multi-Escala e Internacional
              </div>
              <div className="text-[10px] font-display text-muted-foreground tracking-wider">
                Teoría de Juegos · Monte Carlo · Minimización de Riesgo · Datos en Vivo
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.1] max-w-4xl font-bold tracking-tight">
            Pensá escenarios, medí el riesgo y{' '}
            <span className="text-primary">decidí en equilibrio.</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl text-sm md:text-base leading-relaxed">
            Plataforma autónoma de inteligencia estratégica y toma de decisiones bajo incertidumbre.
            Desde el tablero geopolítico global y el directorio de tu empresa hasta tu visión
            personal y negociaciones cotidianas, con algoritmos matemáticos y múltiples lentes analíticas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/decisiones"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Abrir Motor de Decisiones (L4–L1)
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/pymes"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md border border-primary/40 bg-primary/5 text-primary font-display text-xs font-semibold hover:bg-primary/15 transition-colors"
            >
              Simulador de Empresa / PyME
            </Link>
            <Link
              to="/grafo"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md border border-border text-foreground font-display text-xs hover:bg-accent/50 transition-colors"
            >
              Grafo de Poder
            </Link>
            <Link
              to="/matriz"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-md border border-border text-foreground font-display text-xs hover:bg-accent/50 transition-colors"
            >
              Matriz de Nash
            </Link>
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-border text-muted-foreground hover:text-foreground font-display text-xs hover:bg-accent/50 transition-colors cursor-pointer"
            >
              🧭 Guía Rápida (60s)
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Diff */}
      {diff && !diff.isFirstVisit && (
        <section className="border-b border-border/30 bg-card/30">
          <div className="mx-auto max-w-[1600px] px-6 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">
                Desde tu última visita ({formatRelativeDate(diff.lastVisit!)})
              </span>
              {diff.changes.length === 0 ? (
                <span className="text-[10px] font-display text-muted-foreground">
                  Tablero sincronizado · Bitácora activa ({journalCount} decisiones)
                </span>
              ) : (
                diff.changes.map((c) => (
                  <span
                    key={c.label}
                    className={`text-[10px] font-display font-semibold ${
                      c.positive ? 'text-signal-ally' : 'text-signal-rival'
                    }`}
                  >
                    {c.value} {c.label}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4 Escalas Fractales de Decisión */}
      <section className="mx-auto max-w-[1600px] px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Arquitectura de 4 Niveles de Decisión (L4 → L1)
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DECISION_SCALES.map((s) => (
            <Link
              key={s.code}
              to={s.to}
              className="group bg-card border border-primary/25 hover:border-primary rounded-lg p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-xs font-bold text-primary">
                    Nivel {s.code}
                  </span>
                  <span className="text-[9px] font-display uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {s.badge}
                  </span>
                </div>
                <h3 className="font-display text-sm font-semibold group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <div className="mt-3 text-[10px] font-display text-primary flex items-center gap-1">
                <span>Simular y decidir</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Actores mapeados" value={ACTORS.length} accent="primary" />
          <StatCard label="Alianzas" value={allies} accent="ally" hint="Vínculos cooperativos" />
          <StatCard label="Rivalidades" value={rivals} accent="rival" hint="Conflictos activos" />
          <StatCard label="Neutros / Bisagra" value={neutral} accent="neutral" hint="Pivotes de coalición" />
        </div>
      </section>

      {/* Modules grid */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-border/40" />
          <h2 className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            Todos los Módulos del Sistema ({MODULES.length})
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
                  <span className="font-display text-[9px] text-primary/60 font-bold tracking-wider">
                    {m.code}
                  </span>
                  <h3 className="font-display text-sm font-medium">{m.title}</h3>
                </div>
                <span className="flex items-center gap-1 text-[8px] font-display uppercase tracking-wider text-signal-ally">
                  <span className="size-1 rounded-full bg-signal-ally" />
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {m.desc}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-primary font-display opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Consola Ejecutiva de Estado & Puente de Federación */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16">
        <div className="bg-card border border-border/60 rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-signal-ally animate-pulse" />
                <span className="text-[10px] font-display uppercase tracking-[0.2em] text-primary font-semibold">
                  Consola Ejecutiva de Estado &amp; Puente de Federación
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estado local autónomo y protocolo activo de sincronización para futuras integraciones del ecosistema Mejora.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-md border border-border text-foreground font-display text-[11px] hover:bg-accent/60 transition-colors cursor-pointer"
              >
                ⬇ Backup Completo JSON
              </button>
              <a
                href={bridgeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-md bg-primary/10 border border-primary/40 text-primary font-display text-[11px] font-semibold hover:bg-primary/20 transition-colors"
              >
                Conectar con Diagnóstico 4D →
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md border border-border/50 bg-background/40 p-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Cartucho Regional Activo
              </div>
              <div className="mt-1.5 font-display text-base font-bold text-foreground">
                {regionPack.flag} {regionPack.name}
              </div>
              <div className="mt-1 text-[11px] font-mono text-muted-foreground">
                Moneda: {regionPack.currency} · Riesgo base {regionPack.baseParams.riesgo}
              </div>
            </div>

            <div className="rounded-md border border-border/50 bg-background/40 p-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Perfil Empresarial Vinculado
              </div>
              <div className="mt-1.5 font-display text-base font-bold text-foreground truncate" title={enterprise.companyName}>
                {enterprise.companyName}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {enterprise.sector} · Exp {enterprise.revenueExportPct}% / Costo USD {enterprise.costDollarizedPct}% · Caja {enterprise.cashRunwayMonths}m
              </div>
            </div>

            <div className="rounded-md border border-border/50 bg-background/40 p-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Bitácora &amp; Calibración Brier
              </div>
              <div className="mt-1.5 font-display text-base font-bold text-foreground">
                {journalCount} {journalCount === 1 ? 'decisión' : 'decisiones'}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {calibration.brierScore !== null
                  ? `Brier ${calibration.brierScore.toFixed(3)} · ${calibration.calibrationGrade} (${calibration.resolvedCount} auditadas)`
                  : 'Pendiente de auditar resultados reales en /decisiones'}
              </div>
            </div>

            <div className="rounded-md border border-border/50 bg-background/40 p-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Bus de Federación Activo
              </div>
              <div className="mt-1.5 font-mono text-xs font-semibold text-signal-ally break-all">
                {FEDERATION_SCHEMA_VERSION}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                window.MejoraDecisionOS · CustomEvent · postMessage bidireccional + Query URL
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Onboarding Interactivo (60s) */}
      {showOnboarding && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          onClick={() => closeOnboarding(true)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-primary/30 rounded-lg shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
              <div>
                <div className="text-[10px] font-display uppercase tracking-[0.2em] text-primary font-semibold">
                  Bienvenido a MejoraDecisiones OS · Arranque en 60 segundos
                </div>
                <h2 id="onboarding-title" className="font-display text-xl font-bold text-foreground mt-1">
                  Cómo convertir incertidumbre en decisiones ejecutables
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeOnboarding(true)}
                className="size-8 rounded-md border border-border/60 text-muted-foreground hover:text-foreground flex items-center justify-center text-xs font-display cursor-pointer"
                aria-label="Cerrar guía rápida"
              >
                ✕
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-md border border-border/60 bg-background/50 p-4">
                <div className="font-mono text-[10px] text-primary font-semibold">PASO 01 · CONTEXTO</div>
                <div className="font-display text-sm font-semibold text-foreground mt-1">
                  Elige tu Cartucho Regional &amp; Perfil PyME
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Opera en modo 🇦🇷 Argentina, 🌐 Global, 🇺🇸 EE.UU., 🇧🇷 Brasil, 🇲🇽 México o 🇪🇺 UE con tipos de cambio y macro en vivo, más la exposición real de tu empresa en <code className="font-mono text-primary">/pymes</code>.
                </p>
              </div>

              <div className="rounded-md border border-border/60 bg-background/50 p-4">
                <div className="font-mono text-[10px] text-primary font-semibold">PASO 02 · ESCALA FRACTAL L4–L1</div>
                <div className="font-display text-sm font-semibold text-foreground mt-1">
                  Usa el Wizard Express o Matriz Completa
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  En <code className="font-mono text-primary">/decisiones</code> puedes decidir desde shocks macro geopolíticos (<code className="font-mono">L4</code>) hasta negociaciones cotidianas de 3 minutos (<code className="font-mono">L1</code>).
                </p>
              </div>

              <div className="rounded-md border border-border/60 bg-background/50 p-4">
                <div className="font-mono text-[10px] text-primary font-semibold">PASO 03 · RIGOR + 4 LENTES</div>
                <div className="font-display text-sm font-semibold text-foreground mt-1">
                  Simula Monte Carlo, Nash y Sesgos
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Evalúa tu peor escenario (<span className="text-foreground">Wald</span>), arrepentimiento (<span className="text-foreground">Savage</span>), aversión a la pérdida (<span className="text-foreground">Ariely</span>), <span className="text-foreground">VaR 95%</span> y el Consejo de 4 Lentes Estratégicas.
                </p>
              </div>

              <div className="rounded-md border border-border/60 bg-background/50 p-4">
                <div className="font-mono text-[10px] text-primary font-semibold">PASO 04 · APRENDIZAJE &amp; STOP-LOSS</div>
                <div className="font-display text-sm font-semibold text-foreground mt-1">
                  Audita tu Brier Score y Alertas Centinela
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Guarda cada fallo en la Bitácora para medir tu calibración predictiva y configura disparadores tempranos en <code className="font-mono text-primary">/indicadores</code>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
              <div className="text-[11px] text-muted-foreground font-display">
                Tip: Presiona <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">Ctrl+K</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">⌘K</kbd> para saltar a cualquier módulo o región.
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => closeOnboarding(true)}
                  className="px-4 h-9 rounded-md border border-border text-xs font-display text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
                >
                  Entendido — Explorar tablero
                </button>
                <Link
                  to="/decisiones"
                  onClick={() => closeOnboarding(true)}
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-primary text-primary-foreground text-xs font-display font-semibold hover:bg-primary/90 transition-colors"
                >
                  Ir a Decision OS →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
