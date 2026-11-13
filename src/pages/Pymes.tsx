import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PYMES_DIAGNOSIS,
  PYMES_INDICATORS,
  PYMES_POLICIES,
  PYMES_SCENARIOS,
} from '@/lib/data/pymes'
import {
  loadEnterpriseProfile,
  saveEnterpriseProfile,
  buildDiagnostico4DFederatedUrl,
  type EnterpriseExposureProfile,
} from '@/lib/federation'
import { runMonteCarloSimulation } from '@/lib/decision-engine'

export default function PymesPage() {
  const [profile, setProfile] = useState<EnterpriseExposureProfile>(() =>
    loadEnterpriseProfile()
  )
  const [savedFlag, setSavedFlag] = useState(false)

  const handleUpdate = <K extends keyof EnterpriseExposureProfile>(
    key: K,
    val: EnterpriseExposureProfile[K]
  ) => {
    const next = { ...profile, [key]: val }
    setProfile(next)
    saveEnterpriseProfile(next)
    setSavedFlag(true)
    setTimeout(() => setSavedFlag(false), 1800)
  }

  // Cálculo matemático de resiliencia y exposición de la empresa
  const resilienceReport = useMemo(() => {
    // Calce cambiario: si exporta más de lo que tiene dolarizado en costos, una devaluación lo beneficia; si no, lo golpea
    const fxMismatch = profile.costDollarizedPct - profile.revenueExportPct
    const runwayBonus = Math.min(30, profile.cashRunwayMonths * 3.5)
    const debtPenalty = profile.debtExposurePct * 0.45
    const laborFriction = profile.laborIntensityPct * 0.2

    const baseScore = Math.max(
      5,
      Math.min(
        98,
        Math.round(60 + runwayBonus - Math.max(0, fxMismatch * 0.35) - debtPenalty - laborFriction)
      )
    )

    const mc = runMonteCarloSimulation(
      baseScore - 40,
      [
        {
          id: 'fx_shock',
          name: 'Shock Cambiario / Devaluación',
          min: -10,
          mode: 10,
          max: 45,
          weight: fxMismatch > 0 ? -0.45 : 0.3,
        },
        {
          id: 'demand',
          name: 'Variación Demanda Sectorial',
          min: -20,
          mode: 2,
          max: 18,
          weight: 1.1,
        },
        {
          id: 'rates',
          name: 'Costo Financiero / Tasas',
          min: 0,
          mode: 12,
          max: 35,
          weight: -(profile.debtExposurePct / 100) * 1.2,
        },
      ],
      0,
      2000,
      9001
    )

    let primaryRecommendation =
      'Estructura equilibrada. Priorizar diferenciación comercial y automatización de procesos.'
    if (fxMismatch > 25) {
      primaryRecommendation =
        'Alto descalce cambiario: tus costos están dolarizados pero vendés en moneda local. Priorizá cláusulas de ajuste, cobertura o desarrollo de canal exportador.'
    } else if (profile.cashRunwayMonths < 3) {
      primaryRecommendation =
        'Liquidez crítica (<3 meses de caja): evitá inversiones irreversibles (Puerta Tipo 1) y acelerá rotación de capital de trabajo.'
    } else if (profile.debtExposurePct > 45) {
      primaryRecommendation =
        'Exposición financiera elevada: ante tasas reales positivas, desapalancar balance antes de expandir capacidad.'
    }

    return {
      resilienceScore: baseScore,
      fxMismatch,
      survivalProbPct: mc.probabilityPositive,
      primaryRecommendation,
    }
  }, [profile])

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 06 · Nivel L3 Empresarial
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            PyMEs y Gemelo de Exposición Empresarial
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Simulá la vulnerabilidad de tu empresa ante shocks macroeconómicos y conectá el perfil con el Motor de Decisiones y el Diagnóstico 4D.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/decisiones?level=L3_EMPRESA"
            className="px-4 h-9 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <span>Abrir Estudio de Decisión Empresarial (L3)</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* GEMELO INTERACTIVO DE EXPOSICIÓN EMPRESARIAL */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 bg-card border border-primary/30 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm uppercase tracking-wider text-primary font-bold">
                Configurá el Perfil de tu Empresa (Sincronizado con Decision OS)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ajustá tus parámetros estructurales para medir tu índice de resiliencia y probabilidad de margen positivo.
              </p>
            </div>
            {savedFlag && (
              <span className="text-[10px] font-display text-signal-ally">
                ✓ Perfil guardado en puente federado
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                Nombre de Empresa / Unidad
              </label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => handleUpdate('companyName', e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs font-display"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display uppercase text-muted-foreground mb-1">
                Sector Principal
              </label>
              <select
                value={profile.sector}
                onChange={(e) =>
                  handleUpdate(
                    'sector',
                    e.target.value as EnterpriseExposureProfile['sector']
                  )
                }
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs font-display"
              >
                <option value="manufactura">🏭 Manufactura / Industria</option>
                <option value="comercio">🛒 Comercio Minorista / Mayorista</option>
                <option value="servicios">🔧 Servicios Profesionales / B2B</option>
                <option value="agro">🌾 Agroindustria</option>
                <option value="construccion">🏗️ Construcción / Real Estate</option>
                <option value="tecnologia">💻 Tecnología / Software</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Ingresos por Exportación / Moneda Dura</span>
                <span className="text-primary">{profile.revenueExportPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={profile.revenueExportPct}
                onChange={(e) =>
                  handleUpdate('revenueExportPct', Number(e.target.value))
                }
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Costos Dolarizados / Insumos Importados</span>
                <span className="text-primary">{profile.costDollarizedPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={profile.costDollarizedPct}
                onChange={(e) =>
                  handleUpdate('costDollarizedPct', Number(e.target.value))
                }
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Exposición a Deuda / Tasas Bancarias</span>
                <span className="text-primary">{profile.debtExposurePct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={profile.debtExposurePct}
                onChange={(e) =>
                  handleUpdate('debtExposurePct', Number(e.target.value))
                }
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Colchón de Caja Operativa (Runway)</span>
                <span className="text-primary">{profile.cashRunwayMonths} meses</span>
              </div>
              <input
                type="range"
                min={1}
                max={18}
                value={profile.cashRunwayMonths}
                onChange={(e) =>
                  handleUpdate('cashRunwayMonths', Number(e.target.value))
                }
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Diagnóstico Instantáneo del Gemelo Empresarial */}
        <div className="bg-background/70 border border-border rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Diagnóstico de Resiliencia · {profile.companyName}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card border border-border rounded-md">
                <div className="text-[10px] font-display text-muted-foreground">
                  Score de Resiliencia
                </div>
                <div className="font-display text-2xl font-bold text-primary mt-0.5">
                  {resilienceReport.resilienceScore}/100
                </div>
              </div>
              <div className="p-3 bg-card border border-border rounded-md">
                <div className="text-[10px] font-display text-muted-foreground">
                  Supervivencia Monte Carlo
                </div>
                <div className="font-display text-2xl font-bold text-signal-ally mt-0.5">
                  {resilienceReport.survivalProbPct.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="p-3 bg-card border border-border/60 rounded-md text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-display block mb-1">
                Dictamen Estratégico (Drucker / Goldratt):
              </strong>
              {resilienceReport.primaryRecommendation}
            </div>
          </div>

          <a
            href={buildDiagnostico4DFederatedUrl('pymes_simulator')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-9 rounded-md bg-primary/15 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-display text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span>Profundizar con el Diagnóstico 4D para tu Empresa</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Diagnóstico por sector
        </h2>
        {PYMES_DIAGNOSIS.map((s, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
          >
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1">
              <div className="font-display text-sm">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>
              <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.bar}%`, background: s.color }}
                />
              </div>
            </div>
            <span className="font-display text-lg text-foreground">{s.bar}%</span>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Indicadores clave
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PYMES_INDICATORS.map((ind, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                {ind.label}
              </div>
              <div className="font-display text-xl mt-1">{ind.value}</div>
              <div
                className={`text-xs mt-1 font-display ${
                  ind.trend === 'up'
                    ? 'text-signal-ally'
                    : ind.trend === 'down'
                    ? 'text-signal-rival'
                    : 'text-muted-foreground'
                }`}
              >
                {ind.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Políticas públicas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PYMES_POLICIES.map((p, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="font-display text-sm text-primary">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.detail}</div>
              <div className="mt-2 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Impacto: {p.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Escenarios PyME
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PYMES_SCENARIOS.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{s.title}</span>
                <span className="font-display text-lg" style={{ color: s.color }}>
                  {s.pct}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
