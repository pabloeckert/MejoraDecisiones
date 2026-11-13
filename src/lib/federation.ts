/**
 * Puente de Autonomía y Federación (FederationBridge)
 *
 * Permite que MejoraDecisiones:
 * 1. Funcione 100% autónomo en el navegador con su propia Bitácora de Decisiones (Decision Journal),
 *    perfil de empresa/usuario y región activa.
 * 2. Esté listo para conectarse bidireccionalmente en el futuro con el ecosistema Mejora
 *    (Diagnóstico 4D, MejoraApp, ERPs o backends cloud) mediante:
 *    - API global `window.MejoraDecisionOS`
 *    - CustomEvents del DOM (`mejora:decision-committed`, `mejora:context-updated`)
 *    - `window.postMessage` para integración en iframes o micro-frontends
 *    - Exportación / Importación de paquetes JSON firmados con versión de esquema (`mejora.decision-os.v1`)
 */

import type { DecisionLevel } from './decision-engine'
import type { RegionCode } from './context-packs'

export const FEDERATION_SCHEMA_VERSION = 'mejora.decision-os.v1' as const

const JOURNAL_STORAGE_KEY = 'mejora_decision_journal_v1'
const ENTERPRISE_PROFILE_KEY = 'mejora_enterprise_profile_v1'
const ACTIVE_REGION_KEY = 'mejora_active_region_v1'

export interface EnterpriseExposureProfile {
  companyName: string
  sector: 'manufactura' | 'comercio' | 'servicios' | 'agro' | 'construccion' | 'tecnologia'
  region: RegionCode
  revenueExportPct: number   // 0..100% ingresos en moneda dura / exportación
  costDollarizedPct: number  // 0..100% costos atados al dólar / importados
  debtExposurePct: number    // 0..100% apalancamiento financiero
  laborIntensityPct: number  // 0..100% intensidad laboral / sindical
  cashRunwayMonths: number   // Meses de liquidez operativa
  diagnostico4DId?: string   // Vínculo opcional futuro con Diagnóstico 4D
}

export interface DecisionJournalEntry {
  id: string
  createdAt: string
  level: DecisionLevel
  region: RegionCode
  title: string
  chosenAlternative: string
  consensusAlternative: string
  minimaxRegretAlternative: string
  expectedValue: number
  maxRegret: number
  confidencePct: number      // 0..100% confianza subjetiva al decidir
  reversibility: 'reversible' | 'partially_reversible' | 'irreversible'
  notes: string
  // Para calibración futura (Brier Score)
  outcomeStatus: 'pending' | 'success' | 'partial' | 'failed'
  actualOutcomeScore?: number
}

export interface FederationPayload {
  schemaVersion: typeof FEDERATION_SCHEMA_VERSION
  exportedAt: string
  activeRegion: RegionCode
  enterpriseProfile: EnterpriseExposureProfile
  journal: DecisionJournalEntry[]
}

export const DEFAULT_ENTERPRISE_PROFILE: EnterpriseExposureProfile = {
  companyName: 'Mi Empresa / Proyecto',
  sector: 'servicios',
  region: 'AR',
  revenueExportPct: 25,
  costDollarizedPct: 35,
  debtExposurePct: 20,
  laborIntensityPct: 45,
  cashRunwayMonths: 6,
}

export function loadActiveRegion(): RegionCode {
  try {
    const raw = localStorage.getItem(ACTIVE_REGION_KEY) as RegionCode | null
    if (raw && ['GLOBAL', 'AR', 'US', 'BR', 'MX', 'EU'].includes(raw)) {
      return raw
    }
  } catch {
    // ignore storage errors
  }
  return 'AR'
}

export function saveActiveRegion(region: RegionCode): void {
  try {
    localStorage.setItem(ACTIVE_REGION_KEY, region)
    emitFederationEvent('mejora:region-changed', { region })
  } catch {
    // ignore
  }
}

export function loadEnterpriseProfile(): EnterpriseExposureProfile {
  try {
    const raw = localStorage.getItem(ENTERPRISE_PROFILE_KEY)
    if (raw) {
      return { ...DEFAULT_ENTERPRISE_PROFILE, ...(JSON.parse(raw) as Partial<EnterpriseExposureProfile>) }
    }
  } catch {
    // ignore
  }
  return DEFAULT_ENTERPRISE_PROFILE
}

export function saveEnterpriseProfile(profile: EnterpriseExposureProfile): void {
  try {
    localStorage.setItem(ENTERPRISE_PROFILE_KEY, JSON.stringify(profile))
    emitFederationEvent('mejora:profile-updated', { profile })
  } catch {
    // ignore
  }
}

export function loadDecisionJournal(): DecisionJournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as DecisionJournalEntry[]
    }
  } catch {
    // ignore
  }
  return []
}

export function saveDecisionEntry(
  entry: Omit<DecisionJournalEntry, 'id' | 'createdAt' | 'outcomeStatus'>
): DecisionJournalEntry {
  const fullEntry: DecisionJournalEntry = {
    ...entry,
    id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    outcomeStatus: 'pending',
  }

  const current = loadDecisionJournal()
  const updated = [fullEntry, ...current]
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated))
    emitFederationEvent('mejora:decision-committed', { decision: fullEntry })
  } catch {
    // ignore
  }
  return fullEntry
}

export function updateDecisionOutcome(
  id: string,
  outcomeStatus: DecisionJournalEntry['outcomeStatus']
): DecisionJournalEntry[] {
  const current = loadDecisionJournal()
  const updated = current.map((item) =>
    item.id === id ? { ...item, outcomeStatus } : item
  )
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
  return updated
}

export function deleteDecisionEntry(id: string): DecisionJournalEntry[] {
  const current = loadDecisionJournal()
  const updated = current.filter((item) => item.id !== id)
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
  return updated
}

/**
 * Calcula el Brier Score de calibración predictiva del usuario/directorio
 * Brier Score = (1/N) * sum((prob_predicha - resultado_real)^2)
 * Más cercano a 0 = mejor calibrado (0.00 es perfecto, 0.25 es azar puro).
 */
export function computeCalibrationMetrics(journal: DecisionJournalEntry[]): {
  resolvedCount: number
  brierScore: number | null
  calibrationGrade: string
} {
  const resolved = journal.filter((d) => d.outcomeStatus !== 'pending')
  if (resolved.length === 0) {
    return {
      resolvedCount: 0,
      brierScore: null,
      calibrationGrade: 'Sin decisiones evaluadas aún',
    }
  }

  const sumSqError = resolved.reduce((sum, d) => {
    const p = Math.max(0, Math.min(1, d.confidencePct / 100))
    const outcome =
      d.outcomeStatus === 'success' ? 1 : d.outcomeStatus === 'partial' ? 0.5 : 0
    return sum + Math.pow(p - outcome, 2)
  }, 0)

  const brierScore = Number((sumSqError / resolved.length).toFixed(3))
  const calibrationGrade =
    brierScore <= 0.1
      ? 'Excelente (Nivel Superforecaster)'
      : brierScore <= 0.2
      ? 'Buena calibración ejecutiva'
      : 'Sobreconfianza detectada — ajustar márgenes de seguridad'

  return {
    resolvedCount: resolved.length,
    brierScore,
    calibrationGrade,
  }
}

export function exportFederationBundle(): FederationPayload {
  return {
    schemaVersion: FEDERATION_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    activeRegion: loadActiveRegion(),
    enterpriseProfile: loadEnterpriseProfile(),
    journal: loadDecisionJournal(),
  }
}

export function importFederationBundle(payload: Partial<FederationPayload>): boolean {
  if (!payload || payload.schemaVersion !== FEDERATION_SCHEMA_VERSION) {
    return false
  }
  if (payload.activeRegion) saveActiveRegion(payload.activeRegion)
  if (payload.enterpriseProfile) saveEnterpriseProfile(payload.enterpriseProfile)
  if (Array.isArray(payload.journal)) {
    try {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(payload.journal))
    } catch {
      // ignore
    }
  }
  emitFederationEvent('mejora:bundle-imported', { payload })
  return true
}

/**
 * Construye una URL hacia el Diagnóstico 4D enriquecida con el contexto actual
 * para que en el futuro el ecosistema Mejora reciba los parámetros directamente.
 */
export function buildDiagnostico4DFederatedUrl(sourceTag: string): string {
  const profile = loadEnterpriseProfile()
  const region = loadActiveRegion()
  const params = new URLSearchParams({
    utm_source: 'mejora_decisiones_os',
    utm_medium: sourceTag,
    region,
    sector: profile.sector,
    export_pct: String(profile.revenueExportPct),
    usd_cost_pct: String(profile.costDollarizedPct),
  })
  return `https://diagnostico.mejoraok.com?${params.toString()}`
}

function emitFederationEvent(type: string, detail: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(type, { detail }))
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: 'MejoraDecisionesOS',
          schemaVersion: FEDERATION_SCHEMA_VERSION,
          type,
          detail,
        },
        '*'
      )
    }
  } catch {
    // ignore cross-origin frame restrictions
  }
}

declare global {
  interface Window {
    MejoraDecisionOS?: {
      version: string
      exportBundle: () => FederationPayload
      importBundle: (payload: Partial<FederationPayload>) => boolean
      getEnterpriseProfile: () => EnterpriseExposureProfile
      setEnterpriseProfile: (profile: EnterpriseExposureProfile) => void
      getJournal: () => DecisionJournalEntry[]
    }
  }
}

export function registerFederationBridge(): void {
  if (typeof window === 'undefined') return
  window.MejoraDecisionOS = {
    version: FEDERATION_SCHEMA_VERSION,
    exportBundle: exportFederationBundle,
    importBundle: importFederationBundle,
    getEnterpriseProfile: loadEnterpriseProfile,
    setEnterpriseProfile: saveEnterpriseProfile,
    getJournal: loadDecisionJournal,
  }
}
