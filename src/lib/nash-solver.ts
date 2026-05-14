export interface PayoffMatrix {
  rows: number[][]
  cols: number[][]
}

export interface NashResult {
  pure: { row: number; col: number }[]
  mixed: { rowProbs: number[]; colProbs: number[] } | null
}

export function findPureNash(rows: number[][], cols: number[][]): { row: number; col: number }[] {
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

export function solve2x2Mixed(rows: number[][], cols: number[][]): { rowProbs: number[]; colProbs: number[] } | null {
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

export function solveNash(matrix: PayoffMatrix): NashResult {
  const pure = findPureNash(matrix.rows, matrix.cols)
  const mixed = solve2x2Mixed(matrix.rows, matrix.cols)
  return { pure, mixed }
}
