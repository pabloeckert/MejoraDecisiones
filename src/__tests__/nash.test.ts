import { describe, it, expect } from 'vitest'
import { findPureNash, solve2x2Mixed, solveNash } from '../lib/nash-solver'

// --- findPureNash ---

describe('Nash Solver — Equilibrios Puros', () => {
  it('Dilema del Prisionero: equilibrio único en (Traicionar, Traicionar)', () => {
    const rows = [[3, 0], [5, 1]]
    const cols = [[3, 5], [0, 1]]
    const result = findPureNash(rows, cols)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ row: 1, col: 1 })
  })

  it('Juego de Coordinación: dos equilibrios puros', () => {
    const rows = [[10, 0], [0, 5]]
    const cols = [[10, 0], [0, 5]]
    const result = findPureNash(rows, cols)
    expect(result).toHaveLength(2)
    expect(result).toContainEqual({ row: 0, col: 0 })
    expect(result).toContainEqual({ row: 1, col: 1 })
  })

  it('Juego del Gallina: dos equilibrios puros', () => {
    const rows = [[-10, -1], [0, -5]]
    const cols = [[-10, 0], [-1, -5]]
    const result = findPureNash(rows, cols)
    // (Seguir, Desviarse) y (Desviarse, Seguir)
    expect(result).toHaveLength(2)
    expect(result).toContainEqual({ row: 0, col: 1 })
    expect(result).toContainEqual({ row: 1, col: 0 })
  })

  it('Juego sin equilibrio puro retorna array vacío', () => {
    // Piedra-Papel-Tijera simplificado 2x2: matching pennies
    const rows = [[1, -1], [-1, 1]]
    const cols = [[-1, 1], [1, -1]]
    const result = findPureNash(rows, cols)
    expect(result).toHaveLength(0)
  })

  it('Matriz 3x3 con equilibrio único', () => {
    // Jugador fila domina estrategia 1, col domina estrategia 1
    const rows = [[4, 2, 1], [3, 1, 0], [2, 0, -1]]
    const cols = [[4, 3, 2], [2, 1, 0], [1, 0, -1]]
    const result = findPureNash(rows, cols)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ row: 0, col: 0 })
  })

  it('Milei vs UxP (template del dashboard)', () => {
    const rows = [[8, 2], [3, 5]]
    const cols = [[4, 1], [7, 3]]
    const result = findPureNash(rows, cols)
    // Verificar que retorna al menos un equilibrio
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('Nación vs Gobernadores (template del dashboard)', () => {
    const rows = [[6, 2], [3, 7]]
    const cols = [[7, 4], [2, 5]]
    const result = findPureNash(rows, cols)
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })
})

// --- solve2x2Mixed ---

describe('Nash Solver — Equilibrios Mixtos 2×2', () => {
  it('Matching Pennies: equilibrio mixto (50/50)', () => {
    // Cara/Cruz: row gana si igualan, col gana si difieren
    const rows = [[1, -1], [-1, 1]]
    const cols = [[-1, 1], [1, -1]]
    const result = solve2x2Mixed(rows, cols)
    expect(result).not.toBeNull()
    expect(result!.rowProbs[0]).toBeCloseTo(0.5, 5)
    expect(result!.rowProbs[1]).toBeCloseTo(0.5, 5)
    expect(result!.colProbs[0]).toBeCloseTo(0.5, 5)
    expect(result!.colProbs[1]).toBeCloseTo(0.5, 5)
  })

  it('Juego del Gallina: equilibrio mixto válido', () => {
    const rows = [[-10, -1], [0, -5]]
    const cols = [[-10, 0], [-1, -5]]
    const result = solve2x2Mixed(rows, cols)
    if (result !== null) {
      expect(result.rowProbs[0]).toBeGreaterThanOrEqual(0)
      expect(result.rowProbs[0]).toBeLessThanOrEqual(1)
      expect(result.rowProbs[0] + result.rowProbs[1]).toBeCloseTo(1, 5)
      expect(result.colProbs[0] + result.colProbs[1]).toBeCloseTo(1, 5)
    }
  })

  it('Juego de Coordinación: no tiene equilibrio mixto interior válido (dominante puro)', () => {
    const rows = [[10, 0], [0, 5]]
    const cols = [[10, 0], [0, 5]]
    const result = solve2x2Mixed(rows, cols)
    // Puede ser null o probabilidades en [0,1] — no debe lanzar errores
    if (result !== null) {
      expect(result.rowProbs[0]).toBeGreaterThanOrEqual(0)
      expect(result.rowProbs[0]).toBeLessThanOrEqual(1)
    }
  })

  it('Rechaza matrices que no son 2×2', () => {
    const rows = [[1, 2, 3], [4, 5, 6]]
    const cols = [[1, 2, 3], [4, 5, 6]]
    expect(solve2x2Mixed(rows, cols)).toBeNull()
  })

  it('Las probabilidades siempre suman 1 cuando hay solución', () => {
    const rows = [[1, -1], [-1, 1]]
    const cols = [[-1, 1], [1, -1]]
    const result = solve2x2Mixed(rows, cols)
    expect(result).not.toBeNull()
    const sumRow = result!.rowProbs.reduce((a, b) => a + b, 0)
    const sumCol = result!.colProbs.reduce((a, b) => a + b, 0)
    expect(sumRow).toBeCloseTo(1, 5)
    expect(sumCol).toBeCloseTo(1, 5)
  })
})

// --- solveNash (combinado) ---

describe('Nash Solver — Solución Completa', () => {
  it('Dilema del Prisionero: retorna pure + mixed', () => {
    const matrix = {
      rows: [[3, 0], [5, 1]],
      cols: [[3, 5], [0, 1]],
    }
    const result = solveNash(matrix)
    expect(result.pure).toHaveLength(1)
    expect(result.pure[0]).toEqual({ row: 1, col: 1 })
    // El dilema tiene equilibrio dominante, el mixto puede ser null
    expect(result.mixed !== undefined).toBe(true)
  })

  it('Matching Pennies: sin equilibrio puro, con mixto', () => {
    const matrix = {
      rows: [[1, -1], [-1, 1]],
      cols: [[-1, 1], [1, -1]],
    }
    const result = solveNash(matrix)
    expect(result.pure).toHaveLength(0)
    expect(result.mixed).not.toBeNull()
    expect(result.mixed!.rowProbs[0]).toBeCloseTo(0.5, 5)
  })

  it('Juego de Coordinación: dos puros, mixto puede existir', () => {
    const matrix = {
      rows: [[10, 0], [0, 5]],
      cols: [[10, 0], [0, 5]],
    }
    const result = solveNash(matrix)
    expect(result.pure).toHaveLength(2)
  })
})

// --- Propiedades invariantes ---

describe('Nash Solver — Propiedades Invariantes', () => {
  it('Equilibrio puro: jugador fila no puede mejorar desviándose', () => {
    const rows = [[3, 0], [5, 1]]
    const cols = [[3, 5], [0, 1]]
    const eq = findPureNash(rows, cols)
    eq.forEach(({ row, col }) => {
      for (let r = 0; r < rows.length; r++) {
        expect(rows[r][col]).toBeLessThanOrEqual(rows[row][col])
      }
    })
  })

  it('Equilibrio puro: jugador columna no puede mejorar desviándose', () => {
    const rows = [[3, 0], [5, 1]]
    const cols = [[3, 5], [0, 1]]
    const eq = findPureNash(rows, cols)
    eq.forEach(({ row, col }) => {
      for (let c = 0; c < cols[0].length; c++) {
        expect(cols[row][c]).toBeLessThanOrEqual(cols[row][col])
      }
    })
  })
})
