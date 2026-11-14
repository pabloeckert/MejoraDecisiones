import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { INTL_BLOCS } from '@/lib/data/international'
import { REGIONAL_CONTEXT_PACKS, type RegionCode } from '@/lib/context-packs'
import { useLiveIndicators } from '@/hooks/useLiveIndicators'
import { cn } from '@/lib/utils'

interface GeoShockScenario {
  id: string
  label: string
  category: string
  trigger: string
  fxPressure: { label: string; severity: 'alta' | 'media' | 'favorable' }
  exportDemand: { label: string; severity: 'alta' | 'media' | 'favorable' }
  supplyChainCost: { label: string; severity: 'alta' | 'media' | 'favorable' }
  capitalCost: { label: string; severity: 'alta' | 'media' | 'favorable' }
  hedgingStrategy: string
}

const GEO_SHOCKS: GeoShockScenario[] = [
  {
    id: 'fed_hike',
    label: 'Suba de tasas Fed (+100 pb) y USD fuerte',
    category: 'Monetario Global',
    trigger: 'Repunte de inflación núcleo en EE.UU. obliga a endurecimiento monetario prolongado.',
    fxPressure: { label: '+12% a +18% presión sobre monedas emergentes', severity: 'alta' },
    exportDemand: { label: 'Enfriamiento moderado en commodities cíclicos', severity: 'media' },
    supplyChainCost: { label: 'Estable en USD; encarecido en moneda local', severity: 'media' },
    capitalCost: { label: '+150–250 bps en riesgo país y tasa de crédito', severity: 'alta' },
    hedgingStrategy:
      'Reducir deuda a tasa variable en USD, priorizar caja líquida (runway ≥ 6 meses) y contratos indexados a dólar o inflación.',
  },
  {
    id: 'us_china_tariffs',
    label: 'Escalada arancelaria EE.UU.–China y fragmentación',
    category: 'Comercio / Logística',
    trigger: 'Aranceles cruzados >60% en manufactura, semiconductores y bienes verdes.',
    fxPressure: { label: 'Volatilidad en CNY y monedas de Asia/LATAM', severity: 'media' },
    exportDemand: { label: 'Oportunidad nearshoring MX / desvío de soja BR-AR', severity: 'favorable' },
    supplyChainCost: { label: '+15% a +25% en fletes marítimos e insumos tech', severity: 'alta' },
    capitalCost: { label: 'Selectividad por origen de proveedor y compliance', severity: 'media' },
    hedgingStrategy:
      'Dual-sourcing inmediato: evitar dependencia >50% de un único corredor chino o estadounidense y asegurar stock crítico de 60 días.',
  },
  {
    id: 'mideast_energy',
    label: 'Shock energético en Medio Oriente (+30% petróleo/gas)',
    category: 'Energía / Geopolítica',
    trigger: 'Interrupción parcial de rutas marítimas en Golfo Pérsico / Mar Rojo.',
    fxPressure: { label: 'Suba global de inflación retrasa recortes BCE/Fed', severity: 'alta' },
    exportDemand: { label: 'Fuerte tracción para energía y agro (Vaca Muerta / BR)', severity: 'favorable' },
    supplyChainCost: { label: '+22% en logística marítima, combustibles y petroquímicos', severity: 'alta' },
    capitalCost: { label: 'Aversión al riesgo global; prima geopolítica elevada', severity: 'alta' },
    hedgingStrategy:
      'Trasladar cláusulas de ajuste por combustible en contratos B2B y capturar oportunidades en cadenas energéticas y agroindustriales.',
  },
  {
    id: 'mercosur_eu',
    label: 'Implementación acelerada Acuerdo Mercosur–UE',
    category: 'Integración Comercial',
    trigger: 'Ratificación con reducción gradual de aranceles en 700M de consumidores.',
    fxPressure: { label: 'Ingreso estructural de divisas por inversión directa', severity: 'favorable' },
    exportDemand: { label: '+18% a +30% en agroindustria trazable, minería y servicios', severity: 'favorable' },
    supplyChainCost: { label: '-10% en maquinaria, bienes de capital y tecnología europea', severity: 'favorable' },
    capitalCost: { label: 'Menor riesgo regulatorio y acceso a financiamiento ESG', severity: 'favorable' },
    hedgingStrategy:
      'Certificar trazabilidad ambiental y estándares europeos temprano (cabeza de playa de Moore) para capturar cupos y clientes B2B en EUR.',
  },
  {
    id: 'brazil_deval',
    label: 'Devaluación competitiva en Brasil / Mercosur (+20% BRL)',
    category: 'Regional / Competitividad',
    trigger: 'Deterioro fiscal en Brasil dispara depreciación rápida del Real frente al USD.',
    fxPressure: { label: 'Fuerte presión competitiva sobre tipo de cambio real AR', severity: 'alta' },
    exportDemand: { label: 'Caída de demanda industrial bilateral desde Brasil', severity: 'alta' },
    supplyChainCost: { label: 'Abaratamiento de insumos brasileños pero pérdida de margen local', severity: 'media' },
    capitalCost: { label: 'Contagio regional moderado en bonos soberanos LATAM', severity: 'media' },
    hedgingStrategy:
      'Evitar competencia por precio en commodities industriales; diferenciar por servicio/software y diversificar mercados hacia US/EU.',
  },
]

function severityBadgeClass(sev: 'alta' | 'media' | 'favorable'): string {
  if (sev === 'alta') return 'border-signal-rival/40 bg-signal-rival/10 text-signal-rival'
  if (sev === 'favorable') return 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally'
  return 'border-amber-400/40 bg-amber-400/10 text-amber-400'
}

export default function InternacionalPage() {
  const [activeRegion, setActiveRegion] = useState<RegionCode>('GLOBAL')
  const [selectedShockId, setSelectedShockId] = useState<string>('fed_hike')
  const [blocFilter, setBlocFilter] = useState<'all' | 'ally' | 'tension'>('all')
  const [search, setSearch] = useState<string>('')

  const regionPack = REGIONAL_CONTEXT_PACKS[activeRegion]
  const live = useLiveIndicators(regionPack.wbCountryIso)

  const activeShock = useMemo(
    () => GEO_SHOCKS.find((s) => s.id === selectedShockId) ?? GEO_SHOCKS[0],
    [selectedShockId],
  )

  const filteredBlocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return INTL_BLOCS.filter((bloc) => {
      const isAlly = bloc.statusColor.includes('green')
      if (blocFilter === 'ally' && !isAlly) return false
      if (blocFilter === 'tension' && isAlly) return false
      if (!q) return true
      return (
        bloc.name.toLowerCase().includes(q) ||
        bloc.body.toLowerCase().includes(q) ||
        bloc.risk.toLowerCase().includes(q) ||
        bloc.actors.some((a) => a.toLowerCase().includes(q))
      )
    })
  }, [blocFilter, search])

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 12 · Inteligencia Geoeconómica
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Radar Internacional &amp; Simulador de Shocks Globales
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Monitoreo en vivo de divisas (BCE Frankfurter) y macroeconomía internacional (Banco Mundial), transmisión de shocks y alineamientos de bloques.
          </p>
        </div>

        {/* Selector de región */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(REGIONAL_CONTEXT_PACKS) as RegionCode[]).map((code) => {
            const p = REGIONAL_CONTEXT_PACKS[code]
            return (
              <button
                key={code}
                onClick={() => setActiveRegion(code)}
                className={cn(
                  'px-2.5 h-8 rounded-md border text-xs font-display flex items-center gap-1.5 transition-all cursor-pointer',
                  activeRegion === code
                    ? 'border-primary bg-primary/15 text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                <span>{p.flag}</span>
                <span>{p.code}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pulso Financiero Internacional en Vivo */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{regionPack.flag}</span>
            <div>
              <div className="font-display text-sm font-bold flex items-center gap-2">
                <span>Pulso Macro: {regionPack.name} ({regionPack.currency})</span>
                <span className="text-[10px] font-display px-2 py-0.5 rounded bg-signal-ally/15 text-signal-ally border border-signal-ally/30">
                  {live.loading ? 'Sincronizando APIs...' : 'LIVE BCE / Banco Mundial'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{regionPack.summary}</p>
            </div>
          </div>

          <Link
            to={`/decisiones?level=L4_MACRO&region=${activeRegion}`}
            className="px-3 h-8 rounded bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 font-display text-xs font-semibold inline-flex items-center"
          >
            ⚡ Simular Decisión L4 ({activeRegion}) →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regionPack.vitals.map((v, idx) => {
            const resolvedVal = (() => {
              if (
                idx === 0 &&
                activeRegion !== 'AR' &&
                live.worldBank?.inflationAnnualPct !== null &&
                live.worldBank?.inflationAnnualPct !== undefined
              ) {
                return `${live.worldBank.inflationAnnualPct}% (${live.worldBank.year})`
              }
              if (
                idx === 1 &&
                activeRegion === 'AR' &&
                live.reservas
              ) {
                return `USD ${(live.reservas.valor / 1000).toFixed(1)}B`
              }
              return v.value
            })()
            const isLive =
              (idx === 0 &&
                activeRegion !== 'AR' &&
                live.worldBank?.inflationAnnualPct !== null &&
                live.worldBank?.inflationAnnualPct !== undefined) ||
              (idx === 1 && activeRegion === 'AR' && Boolean(live.reservas))

            return (
              <div
                key={v.label}
                className="bg-background/60 border border-border/60 rounded-md p-3"
              >
                <div className="flex items-center justify-between text-[10px] font-display text-muted-foreground">
                  <span>{v.label}</span>
                  <span
                    className={cn(
                      'text-[9px] px-1.5 rounded uppercase',
                      isLive
                        ? 'bg-signal-ally/15 text-signal-ally'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isLive ? 'LIVE' : v.source}
                  </span>
                </div>
                <div className="font-display text-lg font-bold mt-1">{resolvedVal}</div>
              </div>
            )
          })}
        </div>

        {/* Divisas Frankfurter BCE en vivo */}
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-display text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
            Canasta Divisas BCE / DolarAPI:
          </span>
          {live.globalFx?.rates ? (
            <>
              {live.globalFx.rates.EUR && <span>USD/EUR: {live.globalFx.rates.EUR.toFixed(3)}</span>}
              {live.globalFx.rates.BRL && <span>USD/BRL: R$ {live.globalFx.rates.BRL.toFixed(2)}</span>}
              {live.globalFx.rates.MXN && <span>USD/MXN: $ {live.globalFx.rates.MXN.toFixed(2)}</span>}
              {live.globalFx.rates.GBP && <span>USD/GBP: £ {live.globalFx.rates.GBP.toFixed(3)}</span>}
              {live.globalFx.rates.JPY && <span>USD/JPY: ¥ {live.globalFx.rates.JPY.toFixed(1)}</span>}
            </>
          ) : (
            <span>Cargando pares internacionales Frankfurter API...</span>
          )}
          {live.dolar?.[0]?.venta && (
            <span>USD/ARS Oficial: ${Math.round(live.dolar[0].venta).toLocaleString('es-AR')}</span>
          )}
        </div>
      </div>

      {/* Simulador de Transmisión de Shock Geopolítico */}
      <div className="bg-card border border-primary/40 rounded-lg p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-display uppercase tracking-[0.2em] text-primary font-bold">
              Simulador de Transmisión de Shock Geopolítico
            </div>
            <h2 className="font-display text-lg font-bold mt-0.5">
              ¿Cómo impacta un evento externo en divisas, exportaciones y capital?
            </h2>
          </div>
          <Link
            to="/decisiones?level=L4_MACRO"
            className="px-3 h-8 rounded bg-primary text-primary-foreground text-xs font-display font-semibold inline-flex items-center hover:bg-primary/90"
          >
            ⚡ Probar Cobertura en /decisiones?level=L4_MACRO →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {GEO_SHOCKS.map((shock) => (
            <button
              key={shock.id}
              onClick={() => setSelectedShockId(shock.id)}
              className={cn(
                'px-3 py-2 rounded-md border text-left transition-all cursor-pointer',
                selectedShockId === shock.id
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-background/50 text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="text-[9px] font-display uppercase opacity-75">{shock.category}</div>
              <div className="text-xs font-display font-semibold">{shock.label}</div>
            </button>
          ))}
        </div>

        <div className="bg-background/60 border border-border/60 rounded-lg p-5 space-y-4">
          <div>
            <div className="text-[10px] font-display uppercase text-primary font-bold">
              Disparador del Escenario
            </div>
            <p className="text-sm text-foreground mt-0.5">{activeShock.trigger}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                { title: 'Presión Cambiaria', data: activeShock.fxPressure },
                { title: 'Demanda Exportadora', data: activeShock.exportDemand },
                { title: 'Costo Cadena de Suministro', data: activeShock.supplyChainCost },
                { title: 'Costo de Capital / Riesgo', data: activeShock.capitalCost },
              ] as const
            ).map((cell) => (
              <div
                key={cell.title}
                className={cn('p-3 rounded-md border', severityBadgeClass(cell.data.severity))}
              >
                <div className="text-[10px] font-display uppercase font-bold mb-1">
                  {cell.title}
                </div>
                <div className="text-xs leading-snug font-medium">{cell.data.label}</div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/50 text-xs">
            <span className="font-display uppercase text-[10px] text-signal-ally font-bold">
              Estrategia de Cobertura Recomendada:{' '}
            </span>
            <span className="text-foreground">{activeShock.hedgingStrategy}</span>
          </div>
        </div>
      </div>

      {/* Bloques Internacionales con Filtro y Búsqueda */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { key: 'all', label: `Todos los Bloques (${INTL_BLOCS.length})` },
                { key: 'ally', label: 'Aliados / Oportunidad' },
                { key: 'tension', label: 'Tensión / Riesgo' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.key}
                onClick={() => setBlocFilter(btn.key)}
                className={cn(
                  'px-3 h-7 rounded border text-[11px] font-display cursor-pointer transition-colors',
                  blocFilter === btn.key
                    ? 'border-primary bg-primary/15 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por país, bloque o actor..."
            className="w-full sm:w-64 bg-card border border-border rounded-md px-3 h-8 text-xs outline-none focus:border-primary"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredBlocs.map((bloc, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{bloc.flag}</span>
                <span className="font-display text-lg font-semibold">{bloc.name}</span>
                <span
                  className="ml-auto text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border"
                  style={{ color: bloc.statusColor }}
                >
                  {bloc.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {bloc.body.replace(/<[^>]+>/g, '')}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {bloc.actors.map((actor, j) => (
                  <span
                    key={j}
                    className="text-[10px] font-display bg-muted rounded px-2 py-0.5 text-muted-foreground"
                  >
                    {actor}
                  </span>
                ))}
              </div>
              <div className="text-xs text-signal-warn font-display">Riesgo: {bloc.risk}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
