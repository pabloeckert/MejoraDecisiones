import { useState, useMemo } from 'react'
import { CONGRESS } from '@/lib/data/congress'
import { computeBanzhafPower, type VotingBloc } from '@/lib/decision-engine'

const INITIAL_BLOCS: VotingBloc[] = [
  { id: 'lla', name: 'La Libertad Avanza', votes: 92 },
  { id: 'uxp', name: 'Unión por la Patria', votes: 99 },
  { id: 'pro', name: 'PRO', votes: 37 },
  { id: 'pu', name: 'Provincias Unidas / Federal', votes: 29 },
]

export default function CongresoPage() {
  const [blocs, setBlocs] = useState<VotingBloc[]>(INITIAL_BLOCS)
  const [quotaMode, setQuotaMode] = useState<'quorum' | 'twothirds' | 'vetoshield'>('quorum')

  const totalSeats = useMemo(
    () => blocs.reduce((s, b) => s + b.votes, 0),
    [blocs]
  )

  const quotaValue = useMemo(() => {
    if (quotaMode === 'quorum') return Math.floor(totalSeats / 2) + 1 // Mayoría absoluta (ej. 129)
    if (quotaMode === 'twothirds') return Math.ceil((totalSeats * 2) / 3) // Dos tercios (ej. 172)
    return Math.ceil(totalSeats / 3) // Tercio de bloqueo para blindar veto (ej. 86)
  }, [quotaMode, totalSeats])

  const banzhafResults = useMemo(
    () => computeBanzhafPower(blocs, quotaValue),
    [blocs, quotaValue]
  )

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 09 · Teoría de Juegos Coalicional
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-signal-ally/40 bg-signal-ally/10 text-signal-ally">
            Solver Banzhaf Activo
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold mt-1">
          Congreso y Poder de Coalición (Índice de Banzhaf)
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          En un parlamento o directorio societario, el porcentaje de bancas o acciones no equivale al poder real de decisión. El Índice de Banzhaf mide qué bloque tiene la llave crítica para formar mayoría o blindar un veto.
        </p>
      </div>

      {/* SIMULADOR DE COALICIONES E ÍNDICE DE BANZHAF */}
      <div className="bg-card border border-primary/30 rounded-lg p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-sm uppercase tracking-wider text-primary font-bold">
              Simulador de Poder de Voto y Bisagra (Parlamento o Directorio de Socios)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modificá las bancas/votos de cada bloque y elegí la regla de decisión para ver quién captura el poder de pivote.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'quorum', label: `Mayoría Simple (${Math.floor(totalSeats / 2) + 1} votos)` },
                { key: 'twothirds', label: `Dos Tercios (${Math.ceil((totalSeats * 2) / 3)} votos)` },
                { key: 'vetoshield', label: `Blindaje de Veto 1/3 (${Math.ceil(totalSeats / 3)} votos)` },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setQuotaMode(m.key)}
                className={`px-3 h-8 rounded border text-xs font-display transition-all cursor-pointer ${
                  quotaMode === m.key
                    ? 'border-primary bg-primary/15 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {banzhafResults.map((res, idx) => (
            <div
              key={res.id}
              className="bg-background/60 border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold">{res.name}</span>
                {res.isVetoPlayer && (
                  <span className="text-[9px] font-display uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Jugador Veto
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-display">
                <span className="text-muted-foreground">Bancas / Votos:</span>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={res.votes}
                  onChange={(e) => {
                    const next = [...blocs]
                    next[idx] = { ...next[idx], votes: Math.max(0, Number(e.target.value)) }
                    setBlocs(next)
                  }}
                  className="w-20 bg-card border border-border rounded px-2 py-1 text-right text-primary font-bold"
                />
              </div>

              <div className="space-y-1 text-[11px] font-display">
                <div className="flex justify-between text-muted-foreground">
                  <span>Cuota nominal de bancas:</span>
                  <span>{res.voteSharePct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-foreground font-bold">
                  <span>Poder Real Banzhaf:</span>
                  <span className="text-primary">{res.banzhafIndexPct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${res.banzhafIndexPct}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Pivote crítico en {res.criticalSwings} coaliciones ganadoras
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diputados */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Cámara de Diputados —{' '}
          <span className="text-primary">{CONGRESS.diputados.president}</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CONGRESS.diputados.blocks.map((b, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{b.name}</span>
                <span className="font-display text-lg text-primary">{b.seats}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border ${
                    b.position === 'oficialismo'
                      ? 'text-signal-ally border-signal-ally'
                      : b.position === 'oposición'
                      ? 'text-signal-rival border-signal-rival'
                      : 'text-muted-foreground border-border'
                  }`}
                >
                  {b.position}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{b.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Senado */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Cámara de Senadores —{' '}
          <span className="text-primary">{CONGRESS.senado.president}</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CONGRESS.senado.blocks.map((b, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{b.name}</span>
                <span className="font-display text-lg text-primary">{b.seats}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border ${
                    b.position === 'oficialismo'
                      ? 'text-signal-ally border-signal-ally'
                      : b.position === 'oposición'
                      ? 'text-signal-rival border-signal-rival'
                      : 'text-muted-foreground border-border'
                  }`}
                >
                  {b.position}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{b.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agenda */}
      <div className="space-y-3">
        <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Legislación clave
        </h2>
        <div className="space-y-3">
          {CONGRESS.agenda.map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm">{item.project}</span>
                <span
                  className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border ${
                    item.stateClass === 'green'
                      ? 'text-signal-ally border-signal-ally'
                      : item.stateClass === 'red'
                      ? 'text-signal-rival border-signal-rival'
                      : item.stateClass === 'amber'
                      ? 'text-signal-warn border-signal-warn'
                      : 'text-muted-foreground border-border'
                  }`}
                >
                  {item.state}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                Actores: {item.actors}
              </div>
              <p className="text-xs text-muted-foreground">{item.analysis}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
