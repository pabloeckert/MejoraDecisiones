const STORAGE_KEY = 'nash_last_visit'
const SNAPSHOT_KEY = 'nash_snapshot'

export interface VisitSnapshot {
  ts: number
  allies: number
  rivals: number
  neutral: number
  actors: number
  scenarios: number
}

export interface WeeklyDiff {
  lastVisit: Date | null
  isFirstVisit: boolean
  daysSince: number
  changes: { label: string; value: string; positive: boolean }[]
}

export function loadSnapshot(): VisitSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    return raw ? (JSON.parse(raw) as VisitSnapshot) : null
  } catch {
    return null
  }
}

export function saveSnapshot(snap: VisitSnapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap))
    localStorage.setItem(STORAGE_KEY, String(snap.ts))
  } catch {
    // localStorage no disponible (modo privado, etc.)
  }
}

export function computeDiff(
  prev: VisitSnapshot | null,
  current: Omit<VisitSnapshot, 'ts'>
): WeeklyDiff {
  if (!prev) {
    return { lastVisit: null, isFirstVisit: true, daysSince: 0, changes: [] }
  }

  const daysSince = Math.floor((Date.now() - prev.ts) / (1000 * 60 * 60 * 24))
  const changes: WeeklyDiff['changes'] = []

  const diffs: { key: keyof typeof current; label: string }[] = [
    { key: 'allies', label: 'alianzas activas' },
    { key: 'rivals', label: 'rivalidades' },
    { key: 'neutral', label: 'relaciones neutras' },
    { key: 'actors', label: 'actores' },
    { key: 'scenarios', label: 'escenarios' },
  ]

  for (const { key, label } of diffs) {
    const delta = current[key] - prev[key]
    if (delta !== 0) {
      changes.push({
        label,
        value: `${delta > 0 ? '+' : ''}${delta}`,
        positive: delta > 0,
      })
    }
  }

  return {
    lastVisit: new Date(prev.ts),
    isFirstVisit: false,
    daysSince,
    changes,
  }
}
