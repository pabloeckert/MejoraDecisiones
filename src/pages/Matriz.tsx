import { useState, useMemo, useCallback } from 'react'

type MatrixSize = 2 | 3 | 4

interface PayoffMatrix {
  rows: number[][]
  cols: number[][]
}

interface NashResult {
  pure: { row: number; col: number }[]
  mixed: { rowProbs: number[]; colProbs: number[] } | null
}

const TEMPLATES = {
  dilema: {
    name: "Dilema del Prisionero",
    desc: "Cooperar vs Traicionar — clásico de teoría de juegos",
    size: 2 as MatrixSize,
    rowLabels: ["Cooperar", "Traicionar"],
    colLabels: ["Cooperar", "Traicionar"],
    matrix: { rows: [[3, 0], [5, 1]], cols: [[3, 5], [0, 1]] },
  },
  coordinacion: {
    name: "Juego de Coordinación",
    desc: "Dos equilibrios: coordinar o fallar",
    size: 2 as MatrixSize,
    rowLabels: ["Estándar A", "Estándar B"],
    colLabels: ["Estándar A", "Estándar B"],
    matrix: { rows: [[10, 0], [0, 5]], cols: [[10, 0], [0, 5]] },
  },
  chicken: {
    name: "Juego del Gallina",
    desc: "Dos conductores: ¿quién se desvía primero?",
    size: 2 as MatrixSize,
    rowLabels: ["Seguir", "Desviarse"],
    colLabels: ["Seguir", "Desviarse"],
    matrix: { rows: [[-10, -1], [0, -5]], cols: [[-10, 0], [-1, -5]] },
  },
  milei_uxp: {
    name: "Milei vs UxP (Legislativo)",
    desc: "Oficialismo vs oposición en votación clave",
    size: 2 as MatrixSize,
    rowLabels: ["Aprobar", "Bloquear"],
    colLabels: ["Aprobar", "Bloquear"],
    matrix: { rows: [[8, 2], [3, 5]], cols: [[4, 1], [7, 3]] },
  },
  gobernadores: {
    name: "Nación vs Gobernadores",
    desc: "Transferencias federales vs autonomía provincial",
    size: 2 as MatrixSize,
    rowLabels: ["Transferir", "Retener"],
    colLabels: ["Alinearse", "Oponerse"],
    matrix: { rows: [[6, 2], [3, 7]], cols: [[7, 4], [2, 5]] },
  },
  triple: {
    name: "Triple Juego: Oficialismo-Oposición-Bisagra",
    desc: "Tres jugadores: LLA, UxP, Provincias Unidas",
    size: 3 as MatrixSize,
    rowLabels: ["LLA-Aprobar", "LLA-Bloquear"],
    colLabels: ["UxP-Aprobar", "UxP-Bloquear", "PU-Bisagra"],
    matrix: { rows: [[8, 3, 6], [2, 7, 4]], cols: [[5, 2, 7], [8, 4, 3]] },
  },
}

function findPureNash(rows: number[][], cols: number[][]): { row: number; col: number }[] {
  const results: { row: number; col: number }[] = []
  const nRows = rows.length
  const nCols = rows[0].length

  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      let rowBest = true
      let colBest = true

      for (let r2 = 0; r2 < nRows; r2++) {
        if (rows[r2][c] > rows[r][c]) { rowBest = false; break }
      }
      for (let c2 = 0; c2 < nCols; c2++) {
        if (cols[r][c2] > cols[r][c]) { colBest = false; break }
      }

      if (rowBest && colBest) results.push({ row: r, col: c })
    }
  }
  return results
}

function solve2x2Mixed(rows: number[][], cols: number[][]): { rowProbs: number[]; colProbs: number[] } | null {
  if (rows.length !== 2 || rows[0].length !== 2) return null

  const a = rows[0][0], b = rows[0][1], c = rows[1][0], d = rows[1][1]
  const e = cols[0][0], f = cols[0][1], g = cols[1][0], h = cols[1][1]

  const denomRow = (a - b - c + d)
  const denomCol = (e - f - g + h)

  if (denomRow === 0 || denomCol === 0) return null

  const p = (d - b) / denomRow
  const q = (h - f) / denomCol

  if (p < 0 || p > 1 || q < 0 || q > 1) return null

  return {
    rowProbs: [p, 1 - p],
    colProbs: [q, 1 - q],
  }
}

export default function MatrizPage() {
  const [size, setSize] = useState<MatrixSize>(2)
  const [rowLabels, setRowLabels] = useState<string[]>(["Estrategia A", "Estrategia B"])
  const [colLabels, setColLabels] = useState<string[]>(["Estrategia X", "Estrategia Y"])
  const [matrix, setMatrix] = useState<PayoffMatrix>({
    rows: [[3, 0], [5, 1]],
    cols: [[3, 5], [0, 1]],
  })
  const [activeTemplate, setActiveTemplate] = useState<string>("dilema")

  const nash = useMemo((): NashResult => {
    const pure = findPureNash(matrix.rows, matrix.cols)
    const mixed = solve2x2Mixed(matrix.rows, matrix.cols)
    return { pure, mixed }
  }, [matrix])

  const loadTemplate = useCallback((key: string) => {
    const t = TEMPLATES[key as keyof typeof TEMPLATES]
    if (!t) return
    setActiveTemplate(key)
    setSize(t.size)
    setRowLabels([...t.rowLabels])
    setColLabels([...t.colLabels])
    setMatrix({ rows: t.matrix.rows.map(r => [...r]), cols: t.matrix.cols.map(r => [...r]) })
  }, [])

  const updateCell = useCallback((side: 'rows' | 'cols', r: number, c: number, val: number) => {
    setMatrix(prev => {
      const newMatrix = { ...prev, [side]: prev[side].map((row, i) => i === r ? row.map((cell, j) => j === c ? val : cell) : [...row]) }
      return newMatrix
    })
    setActiveTemplate("")
  }, [])

  const resize = useCallback((newSize: MatrixSize) => {
    setSize(newSize)
    const newRowLabels = Array.from({ length: newSize }, (_, i) => rowLabels[i] || `Estr ${String.fromCharCode(65 + i)}`)
    const newColLabels = Array.from({ length: newSize }, (_, i) => colLabels[i] || `Estr ${i + 1}`)
    const newRows = Array.from({ length: newSize }, (_, r) =>
      Array.from({ length: newSize }, (_, c) => matrix.rows[r]?.[c] ?? 0)
    )
    const newCols = Array.from({ length: newSize }, (_, r) =>
      Array.from({ length: newSize }, (_, c) => matrix.cols[r]?.[c] ?? 0)
    )
    setRowLabels(newRowLabels)
    setColLabels(newColLabels)
    setMatrix({ rows: newRows, cols: newCols })
    setActiveTemplate("")
  }, [rowLabels, colLabels, matrix])

  const isNashCell = useCallback((r: number, c: number) => {
    return nash.pure.some(n => n.row === r && n.col === c)
  }, [nash])

  const bestResponseRow = useCallback((col: number) => {
    let max = -Infinity, best = 0
    matrix.rows.forEach((row, r) => { if (row[col] > max) { max = row[col]; best = r } })
    return best
  }, [matrix])

  const bestResponseCol = useCallback((row: number) => {
    let max = -Infinity, best = 0
    matrix.cols[row].forEach((val, c) => { if (val > max) { max = val; best = c } })
    return best
  }, [matrix])

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-display text-[9px] text-primary/50 font-bold tracking-wider">02</span>
        <div className="h-px w-8 bg-primary/20" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Matriz de pagos</h1>
      <p className="text-muted-foreground text-xs mt-1 max-w-xl">
        Editor de juegos N×M con cálculo de equilibrios de Nash. Elegí una plantilla o creá tu propia matriz.
      </p>

      {/* Templates */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(TEMPLATES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => loadTemplate(key)}
            className={`px-2.5 h-7 rounded-md border text-[10px] font-display transition-all ${
              activeTemplate === key
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Size selector */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs font-display text-muted-foreground">Tamaño:</span>
        {[2, 3, 4].map(s => (
          <button
            key={s}
            onClick={() => resize(s as MatrixSize)}
            className={`px-2.5 h-6 rounded-md border text-[10px] font-display ${
              size === s ? 'border-primary/40 text-primary bg-primary/10' : 'border-border/40 text-muted-foreground'
            }`}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      {/* Matrix Editor */}
      <div className="mt-8 overflow-x-auto">
        <div className="inline-block min-w-[400px]">
          {/* Column headers */}
          <div className="flex">
            <div className="w-32 h-10 flex items-center justify-center text-[10px] font-display text-muted-foreground border border-border rounded-tl-lg bg-card">
              ↓ Fila \ Columna →
            </div>
            {colLabels.map((label, c) => (
              <div key={c} className="flex-1 min-w-[120px] h-10 flex items-center justify-center text-xs font-display border border-border border-l-0 bg-card">
                <input
                  type="text"
                  value={label}
                  onChange={e => { const nl = [...colLabels]; nl[c] = e.target.value; setColLabels(nl); setActiveTemplate("") }}
                  className="bg-transparent text-center w-full outline-none text-xs font-display"
                />
              </div>
            ))}
          </div>

          {/* Rows */}
          {matrix.rows.map((row, r) => (
            <div key={r} className="flex">
              <div className="w-32 h-16 flex items-center justify-center text-xs font-display border border-border border-t-0 bg-card">
                <input
                  type="text"
                  value={rowLabels[r]}
                  onChange={e => { const nl = [...rowLabels]; nl[r] = e.target.value; setRowLabels(nl); setActiveTemplate("") }}
                  className="bg-transparent text-center w-full outline-none text-xs font-display px-2"
                />
              </div>
              {row.map((_, c) => {
                const nash = isNashCell(r, c)
                const bestR = bestResponseRow(c) === r
                const bestC = bestResponseCol(r) === c
                return (
                  <div
                    key={c}
                    className={`flex-1 min-w-[120px] h-16 flex items-center justify-center border border-border border-t-0 border-l-0 transition-colors ${
                      nash ? 'bg-primary/15 border-primary/40' : bestR || bestC ? 'bg-accent' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="number"
                        value={matrix.rows[r][c]}
                        onChange={e => updateCell('rows', r, c, Number(e.target.value))}
                        className={`w-10 bg-transparent text-center outline-none font-display ${bestR ? 'text-primary' : 'text-foreground'}`}
                      />
                      <span className="text-muted-foreground">,</span>
                      <input
                        type="number"
                        value={matrix.cols[r][c]}
                        onChange={e => updateCell('cols', r, c, Number(e.target.value))}
                        className={`w-10 bg-transparent text-center outline-none font-display ${bestC ? 'text-signal-ally' : 'text-foreground'}`}
                      />
                    </div>
                    {nash && (
                      <div className="absolute mt-16 text-[9px] font-display text-primary uppercase tracking-wider">Nash</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground font-display">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-primary/20 border border-primary/40" /> Equilibrio de Nash
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-accent" /> Mejor respuesta
        </span>
        <span>Cada celda: (Pago Fila, Pago Columna)</span>
      </div>

      {/* Results */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Pure Nash */}
        <div className="bg-card border border-border/60 rounded-lg p-5">
          <h2 className="font-display text-xs uppercase tracking-wider text-primary font-semibold mb-3">Equilibrios de Nash (estrategias puras)</h2>
          {nash.pure.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay equilibrios en estrategias puras.</p>
          ) : (
            <div className="space-y-2">
              {nash.pure.map((eq, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <span className="font-display text-lg text-primary">#{i + 1}</span>
                  <div>
                    <div className="text-sm font-display">{rowLabels[eq.row]} × {colLabels[eq.col]}</div>
                    <div className="text-xs text-muted-foreground">
                      Pagos: ({matrix.rows[eq.row][eq.col]}, {matrix.cols[eq.row][eq.col]})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mixed Nash */}
        <div className="bg-card border border-border/60 rounded-lg p-5">
          <h2 className="font-display text-xs uppercase tracking-wider text-primary font-semibold mb-3">Equilibrio de Nash (estrategias mixtas)</h2>
          {nash.mixed ? (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">Jugador Fila</div>
                <div className="flex gap-2">
                  {nash.mixed.rowProbs.map((p, i) => (
                    <div key={i} className="flex-1 p-2 bg-primary/5 border border-primary/20 rounded text-center">
                      <div className="text-xs text-muted-foreground">{rowLabels[i]}</div>
                      <div className="font-display text-lg text-primary">{(p * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">Jugador Columna</div>
                <div className="flex gap-2">
                  {nash.mixed.colProbs.map((p, i) => (
                    <div key={i} className="flex-1 p-2 bg-signal-ally/5 border border-signal-ally/20 rounded text-center">
                      <div className="text-xs text-muted-foreground">{colLabels[i]}</div>
                      <div className="font-display text-lg text-signal-ally">{(p * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-display">Pago esperado:</span>{' '}
                Fila: {nash.mixed.rowProbs.reduce((s, p, i) => s + p * nash.mixed!.colProbs.reduce((ss, q, j) => ss + q * matrix.rows[i][j], 0), 0).toFixed(2)} ·{' '}
                Columna: {nash.mixed.colProbs.reduce((s, q, j) => s + q * nash.mixed!.rowProbs.reduce((ss, p, i) => ss + p * matrix.cols[i][j], 0), 0).toFixed(2)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {size === 2 ? 'No hay equilibrio en estrategias mixtas válido (probabilidades fuera de [0,1]).' : 'Solver mixto disponible solo para juegos 2×2.'}
            </p>
          )}
        </div>
      </div>

      {/* Template description */}
      {activeTemplate && TEMPLATES[activeTemplate as keyof typeof TEMPLATES] && (
        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="font-display text-sm text-primary">{TEMPLATES[activeTemplate as keyof typeof TEMPLATES].name}</div>
          <p className="text-xs text-muted-foreground mt-1">{TEMPLATES[activeTemplate as keyof typeof TEMPLATES].desc}</p>
        </div>
      )}
    </div>
  )
}
