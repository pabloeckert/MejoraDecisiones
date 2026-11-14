import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROVINCES, type Province } from '@/lib/data/provinces'
import { computeBanzhafPower } from '@/lib/decision-engine'
import { cn } from '@/lib/utils'

type Align = Province['align']

export default function ProvinciasPage() {
  const [provinces, setProvinces] = useState<Province[]>(() =>
    PROVINCES.map((p) => ({ ...p })),
  )
  const [alignFilter, setAlignFilter] = useState<'all' | Align>('all')
  const [search, setSearch] = useState<string>('')

  const setProvinceAlign = (name: string, align: Align) => {
    setProvinces((prev) =>
      prev.map((p) => (p.name === name ? { ...p, align } : p)),
    )
  }

  const simulateProvinciasUnidas = (targetAlign: Align) => {
    setProvinces((prev) =>
      prev.map((p) =>
        p.party.includes('Prov.Unidas') ? { ...p, align: targetAlign } : p,
      ),
    )
  }

  const handleReset = () => {
    setProvinces(PROVINCES.map((p) => ({ ...p })))
    setAlignFilter('all')
    setSearch('')
  }

  const counts = useMemo(() => {
    const allied = provinces.filter((p) => p.align === 'allied').length
    const neutral = provinces.filter((p) => p.align === 'neutral').length
    const hostile = provinces.filter((p) => p.align === 'hostile').length
    return { allied, neutral, hostile, total: provinces.length }
  }, [provinces])

  const banzhafBlocks = useMemo(() => {
    const blocs = [
      { id: 'allied', name: 'Oficialismo + Aliados', votes: counts.allied },
      { id: 'neutral', name: 'Gobernadores Bisagra (Neutrales)', votes: counts.neutral },
      { id: 'hostile', name: 'Oposición Hostil', votes: counts.hostile },
    ]
    return computeBanzhafPower(blocs, 13)
  }, [counts])

  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLowerCase()
    return provinces.filter((p) => {
      if (alignFilter !== 'all' && p.align !== alignFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.gov.toLowerCase().includes(q) ||
        p.party.toLowerCase().includes(q) ||
        p.note.toLowerCase().includes(q)
      )
    })
  }, [provinces, alignFilter, search])

  const hasFiscalMajority = counts.allied >= 13
  const hasSenateShield = counts.allied >= 8
  const oppositionCanBlockAll = counts.hostile >= 13

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 10 · Gobernabilidad Federal &amp; Juego de Coaliciones
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Simulador de Pacto Federal y Poder Territorial (24 Jurisdicciones)
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Simulá cambios de postura de gobernadores en tiempo real y medí su poder real de veto mediante el Índice de Banzhaf (cuota mayoría: 13/24).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => simulateProvinciasUnidas('allied')}
            className="px-3 h-8 rounded border border-signal-ally/40 bg-signal-ally/10 text-signal-ally text-[11px] font-display font-semibold hover:bg-signal-ally/20 cursor-pointer"
          >
            ⚡ Giro Prov. Unidas → Aliadas
          </button>
          <button
            onClick={() => simulateProvinciasUnidas('hostile')}
            className="px-3 h-8 rounded border border-signal-rival/40 bg-signal-rival/10 text-signal-rival text-[11px] font-display font-semibold hover:bg-signal-rival/20 cursor-pointer"
          >
            ⚡ Giro Prov. Unidas → Opositoras
          </button>
          <button
            onClick={handleReset}
            className="px-3 h-8 rounded border border-border text-[11px] font-display text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer"
          >
            ↺ Restaurar Mapa Base
          </button>
        </div>
      </div>

      {/* Termómetro de Gobernabilidad Federal + Banzhaf */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
              Termómetro de Mayorías Federales ({counts.total} Jurisdicciones)
            </div>
            <Link
              to="/decisiones?level=L4_MACRO"
              className="text-[11px] font-display text-primary hover:underline font-semibold"
            >
              Simular Pacto en /decisiones →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded bg-signal-ally/10 border border-signal-ally/30">
              <div className="text-[10px] font-display text-signal-ally uppercase">Aliadas</div>
              <div className="font-display text-2xl font-bold text-signal-ally mt-0.5">
                {counts.allied}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {Math.round((counts.allied / counts.total) * 100)}% del país
              </div>
            </div>
            <div className="p-3 rounded bg-muted/40 border border-border">
              <div className="text-[10px] font-display text-amber-400 uppercase">
                Bisagra / Neutrales
              </div>
              <div className="font-display text-2xl font-bold text-amber-400 mt-0.5">
                {counts.neutral}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Definen mayoría de Pacto
              </div>
            </div>
            <div className="p-3 rounded bg-signal-rival/10 border border-signal-rival/30">
              <div className="text-[10px] font-display text-signal-rival uppercase">Hostiles</div>
              <div className="font-display text-2xl font-bold text-signal-rival mt-0.5">
                {counts.hostile}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {Math.round((counts.hostile / counts.total) * 100)}% del país
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-display pt-1">
            <span
              className={cn(
                'px-2.5 py-1 rounded border',
                hasFiscalMajority
                  ? 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally'
                  : 'border-amber-400/40 bg-amber-400/10 text-amber-400',
              )}
            >
              {hasFiscalMajority
                ? '✓ Mayoría Pacto Fiscal Alcanzada (≥13/24)'
                : `⚠ Faltan ${13 - counts.allied} provincias para Mayoría Pacto Fiscal (13/24)`}
            </span>
            <span
              className={cn(
                'px-2.5 py-1 rounded border',
                hasSenateShield
                  ? 'border-signal-ally/40 bg-signal-ally/10 text-signal-ally'
                  : 'border-signal-rival/40 bg-signal-rival/10 text-signal-rival',
              )}
            >
              {hasSenateShield
                ? '✓ Tercio de Blindaje en Senado Sostenido (≥8/24)'
                : '✕ Sin Tercio de Blindaje Territorial (<8/24)'}
            </span>
            {oppositionCanBlockAll && (
              <span className="px-2.5 py-1 rounded border border-signal-rival/40 bg-signal-rival/10 text-signal-rival">
                🚨 Oposición con mayoría propia de bloqueo (≥13)
              </span>
            )}
          </div>
        </div>

        {/* Poder Real de Banzhaf */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
            Índice de Poder de Coalición de Banzhaf (Cuota = 13 Provincias)
          </div>
          <p className="text-xs text-muted-foreground">
            Mide la capacidad real de cada bloque para ser decisivo (pivote) en una coalición federal mayoritaria:
          </p>
          <div className="space-y-2.5">
            {banzhafBlocks.map((b) => (
              <div key={b.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-display">
                  <span className="font-semibold">
                    {b.name} ({b.votes} prov.)
                    {b.isVetoPlayer && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/30">
                        JUGADOR VETO
                      </span>
                    )}
                  </span>
                  <span className="text-primary font-bold">
                    {b.banzhafIndexPct.toFixed(1)}% poder real
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      b.id === 'allied'
                        ? 'bg-signal-ally'
                        : b.id === 'neutral'
                        ? 'bg-amber-400'
                        : 'bg-signal-rival',
                    )}
                    style={{ width: `${b.banzhafIndexPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: 'all', label: `Todas (${counts.total})` },
              { key: 'allied', label: `Aliadas (${counts.allied})` },
              { key: 'neutral', label: `Bisagra / Neutrales (${counts.neutral})` },
              { key: 'hostile', label: `Hostiles (${counts.hostile})` },
            ] as const
          ).map((btn) => (
            <button
              key={btn.key}
              onClick={() => setAlignFilter(btn.key)}
              className={cn(
                'px-3 h-7 rounded border text-[11px] font-display cursor-pointer transition-colors',
                alignFilter === btn.key
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
          placeholder="Buscar provincia, gobernador o partido..."
          className="w-full sm:w-64 bg-card border border-border rounded-md px-3 h-8 text-xs outline-none focus:border-primary"
        />
      </div>

      {/* Tarjetas de las 24 Provincias con Controles de Postura */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProvinces.map((p) => (
          <div
            key={p.name}
            className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm font-bold">{p.name}</span>
                <span
                  className={cn(
                    'text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border',
                    p.align === 'allied'
                      ? 'text-signal-ally border-signal-ally bg-signal-ally/10'
                      : p.align === 'hostile'
                      ? 'text-signal-rival border-signal-rival bg-signal-rival/10'
                      : 'text-amber-400 border-amber-400/50 bg-amber-400/10',
                  )}
                >
                  {p.align === 'allied'
                    ? 'Aliada'
                    : p.align === 'hostile'
                    ? 'Hostil'
                    : 'Bisagra'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="text-foreground">Gobernador:</span> {p.gov}
                </div>
                <div>
                  <span className="text-foreground">Partido:</span> {p.party}
                </div>
                <div>
                  <span className="text-foreground">Fondos:</span> {p.funds}
                </div>
                <div className="mt-2 pt-2 border-t border-border">{p.note}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center gap-1.5">
              <span className="text-[9px] font-display uppercase text-muted-foreground mr-auto">
                Simular postura:
              </span>
              {(
                [
                  { key: 'allied', label: 'Aliada' },
                  { key: 'neutral', label: 'Bisagra' },
                  { key: 'hostile', label: 'Hostil' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setProvinceAlign(p.name, opt.key)}
                  className={cn(
                    'px-2 h-6 rounded text-[10px] font-display border cursor-pointer transition-colors',
                    p.align === opt.key
                      ? 'border-primary bg-primary/20 text-primary font-bold'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
