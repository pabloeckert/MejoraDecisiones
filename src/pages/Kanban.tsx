import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { KANBAN_CARDS, type KanbanCard } from '@/lib/data/kanban'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'mejora_kanban_cards_v1'

const COLUMNS: {
  key: KanbanCard['col']
  label: string
  hint: string
  badgeClass: string
}[] = [
  {
    key: 'emerging',
    label: 'Emerging',
    hint: 'Señales tempranas e hipótesis nuevas',
    badgeClass: 'border-chart-2/40 text-chart-2 bg-chart-2/10',
  },
  {
    key: 'active',
    label: 'Active',
    hint: 'Dinámicas en curso que presionan hoy',
    badgeClass: 'border-amber-400/40 text-amber-400 bg-amber-400/10',
  },
  {
    key: 'dominant',
    label: 'Dominant',
    hint: 'Equilibrio central con mayor tracción',
    badgeClass: 'border-signal-ally/40 text-signal-ally bg-signal-ally/10',
  },
  {
    key: 'collapsed',
    label: 'Collapsed',
    hint: 'Escenarios descartados o neutralizados',
    badgeClass: 'border-border text-muted-foreground bg-muted/40',
  },
]

const RISK_TAGS = new Set(['Crisis', 'Riesgo', 'Colapso', 'Tail risk', 'Desequilibrio'])

function loadInitialCards(): KanbanCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as KanbanCard[]
      }
    }
  } catch {
    // ignore storage errors
  }
  return KANBAN_CARDS.map((c) => ({ ...c }))
}

export default function KanbanPage() {
  const [cards, setCards] = useState<KanbanCard[]>(() => loadInitialCards())
  const [colFilter, setColFilter] = useState<'all' | KanbanCard['col']>('all')
  const [search, setSearch] = useState<string>('')

  const [showNewForm, setShowNewForm] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>('')
  const [newTag, setNewTag] = useState<string>('Hipótesis')
  const [newPct, setNewPct] = useState<number>(25)
  const [newCol, setNewCol] = useState<KanbanCard['col']>('emerging')
  const [newDesc, setNewDesc] = useState<string>('')

  const updateCards = (next: KanbanCard[]) => {
    setCards(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }

  const moveCard = (id: string, delta: -1 | 1) => {
    const order: KanbanCard['col'][] = ['emerging', 'active', 'dominant', 'collapsed']
    updateCards(
      cards.map((c) => {
        if (c.id !== id) return c
        const idx = order.indexOf(c.col)
        const nextIdx = Math.max(0, Math.min(order.length - 1, idx + delta))
        return { ...c, col: order[nextIdx] }
      }),
    )
  }

  const updateCardPct = (id: string, nextPct: number) => {
    const clamped = Math.max(1, Math.min(95, Math.round(nextPct)))
    updateCards(cards.map((c) => (c.id === id ? { ...c, pct: clamped } : c)))
  }

  const deleteCard = (id: string) => {
    updateCards(cards.filter((c) => c.id !== id))
  }

  const handleAddCard = () => {
    const cleanTitle = newTitle.trim()
    if (!cleanTitle) return
    const card: KanbanCard = {
      id: `k_custom_${Date.now().toString(36)}`,
      title: cleanTitle,
      pct: Math.max(1, Math.min(95, newPct)),
      color: RISK_TAGS.has(newTag) ? 'var(--red)' : 'var(--blue)',
      tag: newTag.trim() || 'Hipótesis',
      col: newCol,
      desc:
        newDesc.trim() ||
        'Escenario estratégico personalizado para seguimiento de señales y respuesta.',
    }
    updateCards([card, ...cards])
    setNewTitle('')
    setNewDesc('')
    setShowNewForm(false)
  }

  const handleReset = () => {
    const base = KANBAN_CARDS.map((c) => ({ ...c }))
    setCards(base)
    setColFilter('all')
    setSearch('')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cards.filter((c) => {
      if (colFilter !== 'all' && c.col !== colFilter) return false
      if (!q) return true
      return (
        c.title.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
      )
    })
  }, [cards, colFilter, search])

  const metrics = useMemo(() => {
    const dominantAndActive = cards.filter(
      (c) => c.col === 'dominant' || c.col === 'active',
    )
    const crisisCards = cards.filter(
      (c) =>
        c.col !== 'collapsed' &&
        (RISK_TAGS.has(c.tag) || c.color === 'var(--red)' || c.color === 'var(--amber)'),
    )
    const cumulativeRiskPct = Math.min(
      100,
      crisisCards.reduce((sum, c) => sum + c.pct, 0),
    )
    const dominantProbSum = cards
      .filter((c) => c.col === 'dominant')
      .reduce((sum, c) => sum + c.pct, 0)
    return {
      total: cards.length,
      activeCount: dominantAndActive.length,
      cumulativeRiskPct,
      dominantProbSum,
    }
  }, [cards])

  const visibleColumns =
    colFilter === 'all' ? COLUMNS : COLUMNS.filter((col) => col.key === colFilter)

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
            Módulo 07 · Seguimiento Dinámico
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Kanban Interactivo de Escenarios e Hipótesis
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Promové, degradá y recalibrá probabilidades de escenarios en tiempo real. Guardado automáticamente en tu navegador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNewForm((prev) => !prev)}
            className="px-3 h-8 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {showNewForm ? '✕ Cerrar Formulario' : '➕ Nuevo Escenario / Hipótesis'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 h-8 rounded-md border border-border text-xs font-display text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
          >
            ↺ Restaurar Tablero Original
          </button>
        </div>
      </div>

      {/* KPIs de Exposición */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            Escenarios Activos + Dominantes
          </div>
          <div className="font-display text-2xl font-bold text-primary mt-1">
            {metrics.activeCount}{' '}
            <span className="text-xs font-normal text-muted-foreground">
              / {metrics.total}
            </span>
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            Exposición Acumulada Riesgo/Crisis
          </div>
          <div
            className={cn(
              'font-display text-2xl font-bold mt-1',
              metrics.cumulativeRiskPct >= 60 ? 'text-signal-rival' : 'text-amber-400',
            )}
          >
            {metrics.cumulativeRiskPct}%
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            Tracción en Columna Dominante
          </div>
          <div className="font-display text-2xl font-bold text-signal-ally mt-1">
            {metrics.dominantProbSum}%
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-lg p-4 flex flex-col justify-between">
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            Acción Decision OS
          </div>
          <Link
            to="/decisiones?level=L3_EMPRESA"
            className="mt-1 inline-flex items-center text-xs font-display font-semibold text-primary hover:underline"
          >
            Cargar Escenario en Matriz L3/L4 →
          </Link>
        </div>
      </div>

      {/* Formulario Nuevo Escenario */}
      {showNewForm && (
        <div className="bg-card border border-primary/40 rounded-lg p-5 space-y-3">
          <div className="text-[10px] font-display uppercase tracking-wider text-primary font-bold">
            Agregar Nueva Hipótesis o Escenario de Riesgo
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Título del escenario
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Suba abrupta de fletes / Nuevo competidor agresivo..."
                className="w-full bg-background border border-border rounded px-3 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Etiqueta (Tag)
              </label>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 h-8 text-xs font-display outline-none"
              >
                <option value="Hipótesis">Hipótesis</option>
                <option value="Oportunidad">Oportunidad</option>
                <option value="Riesgo">Riesgo</option>
                <option value="Crisis">Crisis</option>
                <option value="Tail risk">Tail risk</option>
                <option value="Cooperativo">Cooperativo</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Columna Inicial
              </label>
              <select
                value={newCol}
                onChange={(e) => setNewCol(e.target.value as KanbanCard['col'])}
                className="w-full bg-background border border-border rounded px-2 h-8 text-xs font-display outline-none"
              >
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Descripción y disparadores (Triggers)
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Señales observables que activarían este escenario..."
                className="w-full bg-background border border-border rounded px-3 h-8 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-muted-foreground mb-1">
                Probabilidad inicial: {newPct}%
              </label>
              <input
                type="range"
                min={1}
                max={95}
                value={newPct}
                onChange={(e) => setNewPct(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <button
              onClick={handleAddCard}
              disabled={!newTitle.trim()}
              className="px-4 h-8 rounded bg-primary text-primary-foreground text-xs font-display font-semibold hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
            >
              + Agregar Tarjeta
            </button>
          </div>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setColFilter('all')}
            className={cn(
              'px-3 h-7 rounded-md border text-[11px] font-display transition-colors cursor-pointer',
              colFilter === 'all'
                ? 'border-primary bg-primary/15 text-primary font-semibold'
                : 'border-border/60 text-muted-foreground hover:text-foreground',
            )}
          >
            Todas ({cards.length})
          </button>
          {COLUMNS.map((col) => {
            const count = cards.filter((c) => c.col === col.key).length
            return (
              <button
                key={col.key}
                onClick={() => setColFilter(col.key)}
                className={cn(
                  'px-3 h-7 rounded-md border text-[11px] font-display transition-colors cursor-pointer',
                  colFilter === col.key
                    ? 'border-primary bg-primary/15 text-primary font-semibold'
                    : 'border-border/60 text-muted-foreground hover:text-foreground',
                )}
              >
                {col.label} ({count})
              </button>
            )
          })}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar escenario, tag o señal..."
          className="w-full sm:w-64 bg-card border border-border rounded-md px-3 h-8 text-xs outline-none focus:border-primary"
        />
      </div>

      {/* Columnas del Kanban */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          visibleColumns.length === 1
            ? 'md:grid-cols-1'
            : visibleColumns.length === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {visibleColumns.map((col) => {
          const colCards = filteredCards.filter((c) => c.col === col.key)
          return (
            <div
              key={col.key}
              className="bg-card/40 border border-border/50 rounded-lg p-3 space-y-3"
            >
              <div className="border-b border-border/40 pb-2">
                <div className="font-display text-xs uppercase tracking-[0.2em] flex items-center justify-between">
                  <span className={cn('px-2 py-0.5 rounded border text-[10px]', col.badgeClass)}>
                    {col.label}
                  </span>
                  <span className="text-[11px] font-display text-muted-foreground">
                    {colCards.length} escenario{colCards.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{col.hint}</div>
              </div>

              {colCards.length === 0 ? (
                <div className="text-xs text-muted-foreground/70 text-center py-8 border border-dashed border-border/50 rounded">
                  Sin tarjetas en {col.label}
                </div>
              ) : (
                colCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-card border border-border rounded-lg p-4 space-y-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground">
                        {card.tag}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-display text-lg font-bold"
                          style={{ color: card.color }}
                        >
                          {card.pct}%
                        </span>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="text-[11px] text-muted-foreground/60 hover:text-destructive cursor-pointer"
                          title="Eliminar escenario"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display text-sm font-bold leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Control de probabilidad */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-display text-muted-foreground">
                        <span>Probabilidad asignada</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateCardPct(card.id, card.pct - 5)}
                            className="px-1.5 rounded border border-border hover:text-foreground cursor-pointer"
                          >
                            -5%
                          </button>
                          <button
                            onClick={() => updateCardPct(card.id, card.pct + 5)}
                            className="px-1.5 rounded border border-border hover:text-foreground cursor-pointer"
                          >
                            +5%
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={95}
                        value={card.pct}
                        onChange={(e) => updateCardPct(card.id, Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    {/* Acciones mover + Decision OS */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveCard(card.id, -1)}
                          disabled={card.col === 'emerging'}
                          className="px-2 h-6 rounded border border-border text-[10px] font-display text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                          title="Mover a columna anterior"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => moveCard(card.id, 1)}
                          disabled={card.col === 'collapsed'}
                          className="px-2 h-6 rounded border border-border text-[10px] font-display text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                          title="Mover a columna siguiente"
                        >
                          →
                        </button>
                      </div>
                      <Link
                        to="/decisiones?level=L3_EMPRESA"
                        className="text-[10px] font-display font-semibold text-primary hover:underline"
                      >
                        ⚡ Simular Respuesta en /decisiones →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
