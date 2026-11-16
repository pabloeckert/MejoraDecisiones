import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useLiveIndicators } from '@/hooks/useLiveIndicators'
import { REGIONAL_CONTEXT_PACKS, type RegionCode } from '@/lib/context-packs'
import { cn } from '@/lib/utils'

const SENTINEL_STORAGE_KEY = 'mejora_sentinel_thresholds_v1'

interface SentinelThresholds {
  gapPctMax: number
  inflationPctMax: number
  riskBpsMax: number
  brlMax: number
}

const DEFAULT_THRESHOLDS: SentinelThresholds = {
  gapPctMax: 15,
  inflationPctMax: 4.0,
  riskBpsMax: 950,
  brlMax: 5.8,
}

function loadSentinelThresholds(): SentinelThresholds {
  try {
    const raw = localStorage.getItem(SENTINEL_STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_THRESHOLDS, ...(JSON.parse(raw) as Partial<SentinelThresholds>) }
    }
  } catch {
    // ignore storage errors
  }
  return { ...DEFAULT_THRESHOLDS }
}

const MACRO_DATA = [
  { mes: 'Jun-26', inflacion: 2.3, pib: 3.6, reservas: 35, riesgo: 790 },
  { mes: 'Jul-26', inflacion: 2.2, pib: 3.7, reservas: 36, riesgo: 810 },
  { mes: 'Ago-26', inflacion: 2.4, pib: 3.8, reservas: 36, riesgo: 830 },
  { mes: 'Sep-26', inflacion: 2.3, pib: 3.9, reservas: 37, riesgo: 820 },
  { mes: 'Oct-26', inflacion: 2.2, pib: 4.0, reservas: 38, riesgo: 835 },
  { mes: 'Nov-26', inflacion: 2.1, pib: 4.1, reservas: 39, riesgo: 840 },
]

const POLITICAL_KPIS = [
  { label: 'Aprobación presidencial', value: '42%', change: '-3pp', trend: 'down', source: 'Poliarquía' },
  { label: 'Imagen positiva LLA', value: '40%', change: '-2pp', trend: 'down', source: 'Poliarquía' },
  { label: 'Intención de voto LLA', value: '38%', change: '+1pp', trend: 'up', source: 'Synopsis' },
  { label: 'Confianza consumidor', value: '48.2', change: '+2.1', trend: 'up', source: 'UTDT' },
]

const ECON_KPIS = [
  { label: 'Inflación mensual', value: '3.4%', change: '+1.1pp', trend: 'down', source: 'INDEC' },
  { label: 'PIB interanual', value: '+3.5%', change: '-0.5pp', trend: 'down', source: 'INDEC' },
  { label: 'Reservas BCRA', value: 'USD 35B', change: '+1B', trend: 'up', source: 'BCRA' },
  { label: 'Riesgo país', value: '650 bps', change: '-30', trend: 'up', source: 'JPM' },
  { label: 'Pobreza', value: '31.6%', change: '-2.4pp', trend: 'up', source: 'INDEC' },
  { label: 'Desempleo', value: '6.8%', change: '-0.5pp', trend: 'up', source: 'INDEC' },
  { label: 'Tipo de cambio', value: '$1,450', change: '+$50', trend: 'down', source: 'BCRA' },
  { label: 'Superávit fiscal', value: '0.8% PIB', change: '+0.2pp', trend: 'up', source: 'MECON' },
]

const SECTOR_DATA = [
  { sector: 'Industria', variacion: -2.3, empleo: -1.5 },
  { sector: 'Construcción', variacion: -4.1, empleo: -3.2 },
  { sector: 'Comercio', variacion: -1.8, empleo: -0.9 },
  { sector: 'Servicios', variacion: 1.2, empleo: 0.8 },
  { sector: 'Agro', variacion: 3.5, empleo: 1.1 },
  { sector: 'Tecnología', variacion: 5.2, empleo: 3.8 },
  { sector: 'Minería', variacion: 8.1, empleo: 2.5 },
  { sector: 'Energía', variacion: 6.4, empleo: 1.9 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-card border border-border rounded-md p-3 text-xs font-display shadow-lg">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span>{p.dataKey}: <span className="text-foreground">{p.value}</span></span>
        </div>
      ))}
    </div>
  )
}

export default function IndicadoresPage() {
  const [activeTab, setActiveTab] = useState<'macro' | 'politico' | 'sectores' | 'internacional'>('macro')
  const [thresholds, setThresholds] = useState<SentinelThresholds>(() => loadSentinelThresholds())
  const live = useLiveIndicators()

  const updateThreshold = (key: keyof SentinelThresholds, val: number) => {
    const safeVal = Number.isFinite(val) ? val : 0
    const next = { ...thresholds, [key]: safeVal }
    setThresholds(next)
    try {
      localStorage.setItem(SENTINEL_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const resetThresholds = () => {
    setThresholds({ ...DEFAULT_THRESHOLDS })
    try {
      localStorage.removeItem(SENTINEL_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  // Cotizaciones dólar en vivo
  const dolarOficial = live.dolar?.find((d) => d.nombre.toLowerCase().includes('oficial'))
  const dolarBlue    = live.dolar?.find((d) => d.nombre.toLowerCase().includes('blue'))
  const dolarMep     = live.dolar?.find((d) => d.nombre.toLowerCase().includes('mep') || d.nombre.toLowerCase().includes('bolsa'))
  const dolarCcl     = live.dolar?.find((d) => d.nombre.toLowerCase().includes('ccl') || d.nombre.toLowerCase().includes('contado'))

  // Evaluación de Alertas Centinela (Meadows)
  const sentinels = useMemo(() => {
    const officialSell = dolarOficial?.venta ?? 1450
    const blueSell = dolarBlue?.venta ?? 1485
    const currentGapPct =
      officialSell > 0 ? Number((((blueSell - officialSell) / officialSell) * 100).toFixed(1)) : 2.4
    const currentInflationPct = live.inflacion?.length
      ? Number(live.inflacion[live.inflacion.length - 1].valor.toFixed(1))
      : 2.1
    const currentRiskBps = live.riesgoPais?.valor ?? 840
    const currentBrl = live.globalFx?.rates?.BRL
      ? Number(live.globalFx.rates.BRL.toFixed(2))
      : 5.75

    return [
      {
        id: 'gapPctMax' as const,
        label: 'Brecha Cambiaria Blue vs. Oficial',
        currentValue: currentGapPct,
        unit: '%',
        threshold: thresholds.gapPctMax,
        triggered: currentGapPct > thresholds.gapPctMax,
        protocolTitle: `Protocolo de Cobertura por Brecha Cambiaria (${currentGapPct}% > ${thresholds.gapPctMax}%)`,
      },
      {
        id: 'inflationPctMax' as const,
        label: 'Inflación Mensual (INDEC)',
        currentValue: currentInflationPct,
        unit: '%',
        threshold: thresholds.inflationPctMax,
        triggered: currentInflationPct > thresholds.inflationPctMax,
        protocolTitle: `Protocolo de Remarcación y Márgenes por Inflación (${currentInflationPct}% > ${thresholds.inflationPctMax}%)`,
      },
      {
        id: 'riskBpsMax' as const,
        label: 'Riesgo País (EMBI+)',
        currentValue: currentRiskBps,
        unit: ' bps',
        threshold: thresholds.riskBpsMax,
        triggered: currentRiskBps > thresholds.riskBpsMax,
        protocolTitle: `Protocolo de Costo de Capital y Liquidez (Riesgo País > ${thresholds.riskBpsMax} bps)`,
      },
      {
        id: 'brlMax' as const,
        label: 'Cotización Regional USD/BRL',
        currentValue: currentBrl,
        unit: ' R$',
        threshold: thresholds.brlMax,
        triggered: currentBrl > thresholds.brlMax,
        protocolTitle: `Protocolo Competitividad Regional por Real Brasileño (${currentBrl} > ${thresholds.brlMax})`,
      },
    ]
  }, [dolarOficial, dolarBlue, live.inflacion, live.riesgoPais, live.globalFx, thresholds])

  const triggeredCount = sentinels.filter((s) => s.triggered).length

  const globalComparisonData = useMemo(() => {
    return (Object.keys(REGIONAL_CONTEXT_PACKS) as RegionCode[]).map((code) => {
      const pack = REGIONAL_CONTEXT_PACKS[code]
      const fxRate =
        code === 'EU' && live.globalFx?.rates?.EUR
          ? `1 USD = ${live.globalFx.rates.EUR.toFixed(3)} EUR`
          : code === 'BR' && live.globalFx?.rates?.BRL
          ? `1 USD = R$ ${live.globalFx.rates.BRL.toFixed(2)}`
          : code === 'MX' && live.globalFx?.rates?.MXN
          ? `1 USD = MX$ ${live.globalFx.rates.MXN.toFixed(2)}`
          : code === 'AR' && dolarOficial?.venta
          ? `1 USD = $${Math.round(dolarOficial.venta).toLocaleString('es-AR')} ARS`
          : `Moneda base: ${pack.currency}`

      return {
        code,
        name: `${pack.flag} ${pack.name}`,
        currency: pack.currency,
        fxRate,
        inflacion: pack.baseParams.inflacion,
        riesgo: pack.baseParams.riesgo,
        fragmentacion: pack.baseParams.fragmentacion,
        reservas: pack.baseParams.reservas,
        riskSummary: pack.strategicRisks[0] ?? 'Sin riesgos cargados',
        oppSummary: pack.opportunities[0] ?? 'Sin oportunidades cargadas',
      }
    })
  }, [live.globalFx, dolarOficial])

  // KPIs macro con overlay en vivo
  const liveEconKpis = ECON_KPIS.map((kpi) => {
    if (kpi.label === 'Reservas BCRA' && live.reservas) {
      const val = live.reservas.valor
      return { ...kpi, value: `USD ${(val / 1000).toFixed(1)}B`, live: true }
    }
    if (kpi.label === 'Inflación mensual' && live.inflacion?.length) {
      const last = live.inflacion[live.inflacion.length - 1]
      return { ...kpi, value: `${last.valor.toFixed(1)}%`, live: true }
    }
    if (kpi.label === 'Riesgo país' && live.riesgoPais) {
      return { ...kpi, value: `${live.riesgoPais.valor} bps`, live: true }
    }
    if (kpi.label === 'Tipo de cambio' && dolarOficial?.venta) {
      return { ...kpi, value: `$${Math.round(dolarOficial.venta).toLocaleString('es-AR')}`, live: true }
    }
    return { ...kpi, live: false }
  })

  // Gráfico de inflación con datos en vivo si disponibles
  const inflacionChartData = live.inflacion?.length
    ? live.inflacion.map((d) => ({ mes: d.mes, inflacion: d.valor, reservas: 0, riesgo: 0 }))
    : MACRO_DATA

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">04</span>
        <div className="h-px w-8 bg-primary/20" />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-display text-2xl font-bold tracking-tight">Indicadores</h1>
        {live.loading && (
          <span className="text-[9px] font-display text-muted-foreground animate-pulse">cargando datos en vivo…</span>
        )}
        {!live.loading && live.lastUpdated && (
          <span className="flex items-center gap-1.5 text-[9px] font-display text-signal-ally">
            <span className="size-1.5 rounded-full bg-signal-ally animate-pulse" />
            EN VIVO · {fmtTime(live.lastUpdated)}
          </span>
        )}
        {live.error && (
          <span className="text-[9px] font-display text-muted-foreground">{live.error} — usando datos estáticos</span>
        )}
      </div>
      <p className="text-muted-foreground text-xs mt-1">KPIs políticos y económicos con evolución temporal.</p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'macro', label: 'Macro' },
            { key: 'politico', label: 'Político' },
            { key: 'sectores', label: 'Sectores' },
            { key: 'internacional', label: '🌐 Comparador Global' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 h-7 rounded-md border text-[10px] font-display transition-all',
                activeTab === tab.key
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/40 text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-display">
          <span
            className={cn(
              'px-2.5 py-1 rounded border font-semibold',
              triggeredCount > 0
                ? 'border-signal-enemy/40 bg-signal-enemy/10 text-signal-enemy'
                : 'border-signal-ally/30 bg-signal-ally/10 text-signal-ally',
            )}
          >
            {triggeredCount > 0
              ? `🔴 ${triggeredCount} ${triggeredCount === 1 ? 'Alerta Centinela Activa' : 'Alertas Centinela Activas'}`
              : '🟢 Todo bajo umbral Stop-Loss'}
          </span>
          <button
            type="button"
            onClick={resetThresholds}
            className="px-2.5 py-1 rounded border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Restaurar umbrales predeterminados"
          >
            Restablecer Umbrales
          </button>
        </div>
      </div>

      {/* Monitor de Alertas Centinela (Stop-Loss de Meadows) */}
      <div className="mt-5 bg-card border border-border/60 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="text-[10px] font-display uppercase tracking-wider text-primary font-semibold">
              Centinela Stop-Loss · Disparadores Tempranos (Donella Meadows)
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Define tus umbrales críticos. Si una variable en vivo los supera, dispara un protocolo pre-armado en el Motor de Decisiones.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sentinels.map((s) => (
            <div
              key={s.id}
              className={cn(
                'rounded-md border p-3 transition-colors flex flex-col justify-between gap-2.5',
                s.triggered
                  ? 'border-signal-enemy/40 bg-signal-enemy/5'
                  : 'border-border/50 bg-background/40',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-display font-medium text-foreground leading-tight">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-[9px] font-display px-1.5 py-0.5 rounded border',
                      s.triggered
                        ? 'border-signal-enemy/40 bg-signal-enemy/15 text-signal-enemy font-semibold'
                        : 'border-signal-ally/30 bg-signal-ally/10 text-signal-ally',
                    )}
                  >
                    {s.triggered ? 'DISPARADA' : 'EN RANGO'}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-display text-muted-foreground uppercase">Actual</div>
                    <div className={cn('text-lg font-display font-bold tabular-nums', s.triggered ? 'text-signal-enemy' : 'text-foreground')}>
                      {s.currentValue}
                      <span className="text-[10px] font-normal text-muted-foreground">{s.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <label
                      htmlFor={`sentinel-${s.id}`}
                      className="block text-[9px] font-display text-muted-foreground uppercase"
                    >
                      Umbral Max
                    </label>
                    <div className="mt-0.5 flex items-center justify-end gap-1">
                      <input
                        id={`sentinel-${s.id}`}
                        type="number"
                        step={s.id === 'riskBpsMax' ? 25 : 0.1}
                        value={s.threshold}
                        onChange={(e) => updateThreshold(s.id, Number(e.target.value))}
                        className="w-20 h-7 px-2 rounded border border-border/60 bg-card text-right font-display text-xs tabular-nums focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] font-display text-muted-foreground">{s.unit.trim()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/decisiones?level=L3_EMPRESA&title=${encodeURIComponent(s.protocolTitle)}`}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 h-7 px-2.5 rounded text-[10px] font-display font-semibold transition-colors border',
                  s.triggered
                    ? 'bg-signal-enemy text-white border-signal-enemy hover:bg-signal-enemy/90'
                    : 'bg-background/60 text-muted-foreground border-border/50 hover:text-primary hover:border-primary/40',
                )}
              >
                {s.triggered ? '⚡ Activar Protocolo en /decisiones' : 'Pre-simular contingencia →'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'macro' && (
        <div className="mt-8 space-y-8">
          {/* Panel dólar en vivo */}
          {live.dolar && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Dólar Oficial', data: dolarOficial },
                { label: 'Dólar Blue', data: dolarBlue },
                { label: 'Dólar MEP', data: dolarMep },
                { label: 'Dólar CCL', data: dolarCcl },
              ].map(({ label, data }) => (
                data ? (
                  <div key={label} className="bg-card border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{label}</div>
                      <span className="text-[8px] font-display text-signal-ally font-semibold">LIVE</span>
                    </div>
                    <div className="font-display text-xl">
                      ${data.venta ? Math.round(data.venta).toLocaleString('es-AR') : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Compra: ${data.compra ? Math.round(data.compra).toLocaleString('es-AR') : '—'}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveEconKpis.map((kpi, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{kpi.label}</div>
                  {kpi.live && <span className="text-[8px] font-display text-signal-ally font-semibold">LIVE</span>}
                </div>
                <div className="font-display text-2xl mt-1">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-display ${kpi.trend === 'up' ? 'text-signal-ally' : 'text-signal-rival'}`}>
                    {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{kpi.source}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Inflation chart */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Inflación mensual (%)</div>
              {live.inflacion?.length ? <span className="text-[8px] font-display text-signal-ally font-semibold">LIVE · INDEC</span> : null}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inflacionChartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="inflacion" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reserves chart */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Reservas BCRA (MM USD)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MACRO_DATA}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="reservas" stroke="var(--signal-ally)" fill="var(--signal-ally)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk chart */}
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Riesgo país (bps)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MACRO_DATA}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="riesgo" stroke="var(--signal-rival)" fill="var(--signal-rival)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'politico' && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POLITICAL_KPIS.map((kpi, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{kpi.label}</div>
                <div className="font-display text-2xl mt-1">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-display ${kpi.trend === 'up' ? 'text-signal-ally' : 'text-signal-rival'}`}>
                    {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{kpi.source}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-3">Contexto político</div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">Oficialismo:</strong> LLA mantiene 40%+ de imagen positiva pero núcleo duro más estrecho. La interna Karina-Caputo es el factor de mayor incertidumbre.</p>
              <p>• <strong className="text-foreground">Oposición:</strong> UxP fragmentada entre dialoguistas y duros. CFK mantiene influencia pero sin cargo formal.</p>
              <p>• <strong className="text-foreground">Bisagra:</strong> Provincias Unidas (Llaryora-Pullaro-Torres) emerge como tercer polo legislativo.</p>
              <p>• <strong className="text-foreground">Congreso:</strong> LLA es primera minoría en Diputados (~130 bancas). Necesita aliados para quórum y votaciones clave.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sectores' && (
        <div className="mt-8 space-y-6">
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-4">Variación sectorial (%)</div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SECTOR_DATA} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="sector" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="variacion" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="empleo" fill="var(--signal-ally)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4 text-xs font-display text-muted-foreground">
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Variación PIB</span>
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-signal-ally" /> Variación empleo</span>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-3">Lectura sectorial</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">Mining & Energy:</strong> Vaca Muerta y litio lideran el crecimiento. Inversión extranjera récord.</p>
              <p>• <strong className="text-foreground">Tecnología:</strong> Exportaciones de software siguen creciendo. Demanda de talento estable.</p>
              <p>• <strong className="text-foreground">Construcción:</strong> El sector más golpeado por el ajuste. Caída de obra pública.</p>
              <p>• <strong className="text-foreground">Industria:</strong> Ajuste + apertura importadora = presión sobre manufactura local.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'internacional' && (
        <div className="mt-8 space-y-6">
          <div className="bg-card border border-border/60 rounded-lg p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                  Comparador de Cartuchos Regionales (Inflación vs. Fragmentación Política)
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Benchmark comparativo entre los 6 cartuchos internacionales integrados en Decision OS.
                </p>
              </div>
              <Link
                to="/decisiones?level=L4_MACRO"
                className="px-3 h-7 inline-flex items-center rounded border border-primary/40 bg-primary/10 text-primary font-display text-[10px] font-semibold hover:bg-primary/20 transition-colors"
              >
                Abrir Simulador Macro L4 →
              </Link>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalComparisonData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="code" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="inflacion" name="Inflación base" fill="var(--signal-enemy)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fragmentacion" name="Fragmentación" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Tabla Comparativa Multi-País · Divisas en Vivo &amp; Riesgo Estructural
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-background/40 font-display text-[10px] uppercase text-muted-foreground">
                    <th className="py-2.5 px-4">Región</th>
                    <th className="py-2.5 px-4">Moneda / Tipo de Cambio</th>
                    <th className="py-2.5 px-4 text-right">Inflación</th>
                    <th className="py-2.5 px-4 text-right">Riesgo</th>
                    <th className="py-2.5 px-4 text-right">Reservas / Liquidez</th>
                    <th className="py-2.5 px-4">Riesgo Crítico Principal</th>
                    <th className="py-2.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {globalComparisonData.map((row) => (
                    <tr key={row.code} className="hover:bg-background/30 transition-colors">
                      <td className="py-3 px-4 font-display font-semibold text-foreground whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-signal-ally whitespace-nowrap">
                        {row.fxRate}
                      </td>
                      <td className="py-3 px-4 font-display tabular-nums text-right text-foreground">
                        {row.inflacion}
                      </td>
                      <td className="py-3 px-4 font-display tabular-nums text-right text-signal-neutral">
                        {row.riesgo}
                      </td>
                      <td className="py-3 px-4 font-display tabular-nums text-right text-muted-foreground">
                        {row.reservas}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs">
                        <div className="line-clamp-2" title={row.riskSummary}>{row.riskSummary}</div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/decisiones?level=L4_MACRO&region=${row.code}&title=${encodeURIComponent(`Estrategia de Exposición y Riesgo en ${row.name}`)}`}
                          className="inline-flex items-center px-2.5 h-7 rounded border border-primary/40 bg-primary/10 text-primary font-display text-[10px] font-semibold hover:bg-primary/20 transition-colors"
                        >
                          Simular →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
