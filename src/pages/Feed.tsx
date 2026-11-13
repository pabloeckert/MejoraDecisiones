import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FEED_ITEMS } from '@/lib/data/feed'
import {
  REGIONAL_CONTEXT_PACKS,
  generateMultiVisionAnalysis,
  type RegionCode,
} from '@/lib/context-packs'
import { loadActiveRegion, saveActiveRegion } from '@/lib/federation'
import { useLiveIndicators } from '@/hooks/useLiveIndicators'

type EvidenceLevel = 'oficial' | 'mercado' | 'consenso'

interface TriangulatedItem {
  id: string
  source: string
  tag: string
  text: string
  evidence: EvidenceLevel
  region: RegionCode | 'ALL'
}

const EVIDENCE_BADGE: Record<EvidenceLevel, { label: string; className: string }> = {
  oficial: {
    label: '🟢 Dato Oficial Auditado',
    className: 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally',
  },
  mercado: {
    label: '🔵 Señal de Mercado en Vivo',
    className: 'border-primary/40 bg-primary/10 text-primary',
  },
  consenso: {
    label: '🟡 Consenso / Think Tank',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  },
}

export default function FeedPage() {
  const [region, setRegion] = useState<RegionCode>(() => loadActiveRegion())
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string>('pack-0')

  const pack = REGIONAL_CONTEXT_PACKS[region]
  const live = useLiveIndicators(pack.wbCountryIso)

  const handleSelectRegion = (code: RegionCode) => {
    setRegion(code)
    saveActiveRegion(code)
  }

  const allItems = useMemo<TriangulatedItem[]>(() => {
    const list: TriangulatedItem[] = []

    // 1. Señales en vivo desde APIs
    if (live.dolar?.length) {
      const oficial = live.dolar.find((d) => d.nombre.toLowerCase().includes('oficial'))
      const blue = live.dolar.find((d) => d.nombre.toLowerCase().includes('blue'))
      if (oficial?.venta || blue?.venta) {
        list.push({
          id: 'live-fx-ar',
          source: 'DolarAPI (Mercado Cambiario AR en Vivo)',
          tag: 'dato-vivo',
          text: `Oficial venta $${oficial?.venta ?? '—'} · Blue venta $${blue?.venta ?? '—'} — referencia de liquidez inmediata.`,
          evidence: 'mercado',
          region: 'AR',
        })
      }
    }

    if (live.globalFx?.rates) {
      list.push({
        id: 'live-fx-global',
        source: `BCE / Frankfurter FX (${live.globalFx.date})`,
        tag: 'dato-vivo',
        text: `Paridades globales USD: EUR ${live.globalFx.rates.EUR?.toFixed(3) ?? '—'} · BRL ${live.globalFx.rates.BRL?.toFixed(2) ?? '—'} · MXN ${live.globalFx.rates.MXN?.toFixed(2) ?? '—'}.`,
        evidence: 'oficial',
        region: 'ALL',
      })
    }

    if (live.worldBank?.inflationAnnualPct !== null && live.worldBank?.inflationAnnualPct !== undefined) {
      list.push({
        id: `live-wb-${pack.code}`,
        source: `World Bank Open Data (${pack.name})`,
        tag: 'dato-vivo',
        text: `Inflación anual registrada: ${live.worldBank.inflationAnnualPct}% · Crecimiento PIB: ${live.worldBank.gdpGrowthAnnualPct ?? '—'}% (${live.worldBank.year ?? 'reciente'}).`,
        evidence: 'oficial',
        region: pack.code,
      })
    }

    // 2. Riesgos y Oportunidades del ContextPack regional activo
    pack.strategicRisks.forEach((risk, idx) => {
      list.push({
        id: `pack-${idx}`,
        source: `Radar ${pack.flag} ${pack.name} · Riesgo Estructural`,
        tag: 'riesgo',
        text: risk,
        evidence: 'consenso',
        region: pack.code,
      })
    })

    pack.opportunities.forEach((opp, idx) => {
      list.push({
        id: `opp-${idx}`,
        source: `Radar ${pack.flag} ${pack.name} · Oportunidad`,
        tag: 'proyección',
        text: opp,
        evidence: 'consenso',
        region: pack.code,
      })
    })

    // 3. Fuentes curadas locales/internacionales
    FEED_ITEMS.forEach((item, idx) => {
      const ev: EvidenceLevel =
        item.tag === 'dato' ? 'oficial' : item.tag === 'sondeo' || item.tag === 'proyección' ? 'mercado' : 'consenso'
      list.push({
        id: `feed-${idx}`,
        source: item.source,
        tag: item.tag,
        text: item.text,
        evidence: ev,
        region: 'AR',
      })
    })

    return list
  }, [live, pack])

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const regionMatch = item.region === 'ALL' || item.region === region || region === 'GLOBAL'
      const tagMatch = tagFilter === 'all' || item.tag === tagFilter
      return regionMatch && tagMatch
    })
  }, [allItems, region, tagFilter])

  const selectedItem =
    filteredItems.find((i) => i.id === selectedId) ?? filteredItems[0] ?? allItems[0]

  const lenses = useMemo(() => {
    return generateMultiVisionAnalysis({
      title: selectedItem?.text ?? pack.summary,
      level: 'L3_EMPRESA',
      consensusChoice: 'Estrategia adaptativa con cobertura y foco de valor',
      maximinChoice: 'Blindar liquidez y reducir exposición reversible',
      regretChoice: 'Estrategia dual (opcionalidad sin comprometer caja crítica)',
      evpi: selectedItem?.evidence === 'consenso' ? 16 : 8,
      region,
    })
  }, [selectedItem, pack.summary, region])

  const availableTags = ['all', 'dato-vivo', 'riesgo', 'proyección', 'dato', 'análisis', 'sondeo']

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
              Módulo 14 · Triangulación Multi-Fuente
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-signal-ally/40 bg-signal-ally/10 text-signal-ally">
              <span className="size-1.5 rounded-full bg-signal-ally animate-pulse" />
              {live.loading ? 'Sincronizando APIs...' : 'Multi-Visión Activa'}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Feed Global y Lectura Multi-Visión
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Información actualizada de múltiples fuentes internacionales y locales, clasificada por nivel de evidencia y analizada a través de 4 lentes estratégicas antagónicas.
          </p>
        </div>

        {/* Selector de región internacional */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(REGIONAL_CONTEXT_PACKS) as RegionCode[]).map((code) => {
            const p = REGIONAL_CONTEXT_PACKS[code]
            return (
              <button
                key={code}
                onClick={() => handleSelectRegion(code)}
                className={`px-2.5 h-8 rounded-md border text-xs font-display flex items-center gap-1.5 cursor-pointer ${
                  region === code
                    ? 'border-primary bg-primary/15 text-primary font-semibold'
                    : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{p.flag}</span>
                <span>{p.code}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((t) => (
          <button
            key={t}
            onClick={() => setTagFilter(t)}
            className={`px-3 h-7 rounded-md border text-[10px] font-display uppercase tracking-wider cursor-pointer ${
              tagFilter === t
                ? 'border-primary bg-primary/15 text-primary font-semibold'
                : 'border-border/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'all' ? 'Todas las fuentes' : t}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_440px] gap-6 items-start">
        {/* Lista de señales y noticias */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const active = selectedItem?.id === item.id
            const badge = EVIDENCE_BADGE[item.evidence]
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left bg-card border rounded-lg p-4 flex flex-col gap-2 transition-all cursor-pointer ${
                  active
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">
                      {item.tag}
                    </span>
                    <span className="font-display text-sm text-primary font-semibold">
                      {item.source}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-display px-2 py-0.5 rounded border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </button>
            )
          })}
        </div>

        {/* Panel derecho: Triangulación en 4 Lentes Estratégicas */}
        <div className="bg-card border border-primary/30 rounded-lg p-5 space-y-4 sticky top-20">
          <div className="border-b border-border/50 pb-3">
            <div className="text-[10px] font-display uppercase tracking-wider text-primary font-semibold">
              Triangulación Epistémica (4 Lentes sobre la Señal)
            </div>
            <div className="font-display text-sm font-bold mt-1">
              {selectedItem?.source}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedItem?.text}</p>
          </div>

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {lenses.map((lens) => (
              <div
                key={lens.id}
                className="p-3 bg-background/60 border border-border/60 rounded-md space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span>{lens.icon}</span>
                  <div>
                    <div className="font-display text-xs font-bold">{lens.title}</div>
                    <div className="text-[9px] font-display text-primary">{lens.authors}</div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {lens.diagnosis}
                </p>
                <div className="text-[11px] text-signal-ally">
                  <strong className="font-display text-[9px] uppercase">Acción: </strong>
                  {lens.tacticalPrescription}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border/50 flex gap-2">
            <Link
              to={`/decisiones?region=${region}`}
              className="flex-1 h-8 rounded bg-primary text-primary-foreground font-display text-[11px] font-semibold flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              Simular en Decision OS →
            </Link>
            <Link
              to="/predictor"
              className="px-3 h-8 rounded border border-border font-display text-[11px] text-muted-foreground hover:text-foreground flex items-center justify-center"
            >
              Predictor
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
