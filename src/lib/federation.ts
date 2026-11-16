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
  reviewDueAt?: string // ISO date string para auditoría diferida obligatoria
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

/**
 * Desglosa la calibración Brier Score por cada una de las 4 escalas fractales (L4 a L1).
 * Detecta si el decisor es certero en operaciones pero sobreestima en macro, o viceversa.
 */
export function computeBrierScoreByLevel(journal: DecisionJournalEntry[]): Record<
  DecisionLevel,
  { total: number; resolved: number; brierScore: number | null }
> {
  const levels: DecisionLevel[] = ['L4_MACRO', 'L3_EMPRESA', 'L2_PERSONAL', 'L1_COTIDIANO']
  const result = {} as Record<
    DecisionLevel,
    { total: number; resolved: number; brierScore: number | null }
  >

  levels.forEach((lvl) => {
    const subset = journal.filter((d) => d.level === lvl)
    const resolved = subset.filter((d) => d.outcomeStatus !== 'pending')
    if (resolved.length === 0) {
      result[lvl] = { total: subset.length, resolved: 0, brierScore: null }
      return
    }
    const sumSqError = resolved.reduce((sum, d) => {
      const p = Math.max(0, Math.min(1, d.confidencePct / 100))
      const outcome = d.outcomeStatus === 'success' ? 1 : d.outcomeStatus === 'partial' ? 0.5 : 0
      return sum + Math.pow(p - outcome, 2)
    }, 0)
    result[lvl] = {
      total: subset.length,
      resolved: resolved.length,
      brierScore: Number((sumSqError / resolved.length).toFixed(3)),
    }
  })

  return result
}

/**
 * Retorna las decisiones pendientes de auditoría cuya fecha reviewDueAt ya venció.
 */
export function getOverdueJournalEntries(
  journal: DecisionJournalEntry[],
  now = new Date()
): DecisionJournalEntry[] {
  const nowTs = now.getTime()
  return journal.filter((d) => {
    if (d.outcomeStatus !== 'pending') return false
    if (!d.reviewDueAt) return false
    const dueTs = new Date(d.reviewDueAt).getTime()
    return Number.isFinite(dueTs) && dueTs <= nowTs
  })
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

function sanitizeString(str: unknown, maxLen = 200): string {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>]/g, '').trim().slice(0, maxLen)
}

export interface FederationValidationResult {
  valid: boolean
  errors: string[]
  sanitizedPayload?: FederationPayload
}

export function validateFederationBundle(raw: unknown): FederationValidationResult {
  const errors: string[] = []
  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['El paquete federado debe ser un objeto válido'] }
  }

  const p = raw as Record<string, unknown>
  if (p.schemaVersion !== FEDERATION_SCHEMA_VERSION) {
    errors.push(`Versión de esquema inválida: se esperaba ${FEDERATION_SCHEMA_VERSION}`)
  }

  let sanitizedRegion: RegionCode = 'GLOBAL'
  if (p.activeRegion !== undefined) {
    if (typeof p.activeRegion === 'string' && VALID_REGIONS.includes(p.activeRegion as RegionCode)) {
      sanitizedRegion = p.activeRegion as RegionCode
    } else {
      errors.push(`activeRegion no reconocido: ${String(p.activeRegion)}`)
    }
  }

  let sanitizedProfile: EnterpriseExposureProfile = DEFAULT_ENTERPRISE_PROFILE
  if (p.enterpriseProfile !== undefined) {
    if (typeof p.enterpriseProfile !== 'object' || p.enterpriseProfile === null) {
      errors.push('enterpriseProfile debe ser un objeto válido')
    } else {
      const ep = p.enterpriseProfile as Record<string, unknown>
      const rev = Number(ep.revenueExportPct ?? DEFAULT_ENTERPRISE_PROFILE.revenueExportPct)
      const cost = Number(ep.costDollarizedPct ?? DEFAULT_ENTERPRISE_PROFILE.costDollarizedPct)
      const debt = Number(ep.debtExposurePct ?? ep.debtUsdPct ?? DEFAULT_ENTERPRISE_PROFILE.debtExposurePct)
      const labor = Number(ep.laborIntensityPct ?? DEFAULT_ENTERPRISE_PROFILE.laborIntensityPct)
      const runway = Number(ep.cashRunwayMonths ?? DEFAULT_ENTERPRISE_PROFILE.cashRunwayMonths)

      if (!Number.isFinite(rev) || rev < 0 || rev > 100) errors.push('revenueExportPct debe estar entre 0 y 100')
      if (!Number.isFinite(cost) || cost < 0 || cost > 100) errors.push('costDollarizedPct debe estar entre 0 y 100')
      if (!Number.isFinite(debt) || debt < 0 || debt > 100) errors.push('debtExposurePct debe estar entre 0 y 100')
      if (!Number.isFinite(labor) || labor < 0 || labor > 100) errors.push('laborIntensityPct debe estar entre 0 y 100')
      if (!Number.isFinite(runway) || runway < 0 || runway > 120) errors.push('cashRunwayMonths debe estar entre 0 y 120')

      const sectorVal = ['manufactura', 'comercio', 'servicios', 'agro', 'construccion', 'tecnologia'].includes(ep.sector as string)
        ? (ep.sector as EnterpriseExposureProfile['sector'])
        : DEFAULT_ENTERPRISE_PROFILE.sector

      sanitizedProfile = {
        companyName: sanitizeString(ep.companyName, 80) || DEFAULT_ENTERPRISE_PROFILE.companyName,
        sector: sectorVal,
        region: VALID_REGIONS.includes(ep.region as RegionCode) ? (ep.region as RegionCode) : sanitizedRegion,
        revenueExportPct: Math.max(0, Math.min(100, rev)),
        costDollarizedPct: Math.max(0, Math.min(100, cost)),
        debtExposurePct: Math.max(0, Math.min(100, debt)),
        laborIntensityPct: Math.max(0, Math.min(100, labor)),
        cashRunwayMonths: Math.max(0, Math.min(120, runway)),
      }
    }
  }

  const sanitizedJournal: DecisionJournalEntry[] = []
  if (p.journal !== undefined) {
    if (!Array.isArray(p.journal)) {
      errors.push('journal debe ser un array de decisiones')
    } else {
      p.journal.forEach((item, idx) => {
        if (!item || typeof item !== 'object') {
          errors.push(`journal[${idx}] debe ser un objeto`)
          return
        }
        const j = item as Record<string, unknown>
        const id = sanitizeString(j.id, 64)
        const title = sanitizeString(j.title, 150)
        const chosen = sanitizeString(j.chosenAlternative, 100)
        const conf = Number(j.confidencePct)

        if (!id) errors.push(`journal[${idx}].id es requerido`)
        if (!title) errors.push(`journal[${idx}].title es requerido`)
        if (!VALID_LEVELS.includes(j.level as DecisionLevel)) errors.push(`journal[${idx}].level no es válido`)
        if (!VALID_REGIONS.includes(j.region as RegionCode)) errors.push(`journal[${idx}].region no es válido`)
        if (!Number.isFinite(conf) || conf < 0 || conf > 100) errors.push(`journal[${idx}].confidencePct debe ser 0-100`)

        const status = ['pending', 'success', 'partial', 'failed'].includes(j.outcomeStatus as string)
          ? (j.outcomeStatus as DecisionJournalEntry['outcomeStatus'])
          : 'pending'

        sanitizedJournal.push({
          id: id || `imported-${Date.now()}-${idx}`,
          createdAt: typeof j.createdAt === 'string' ? j.createdAt : new Date().toISOString(),
          level: (VALID_LEVELS.includes(j.level as DecisionLevel) ? j.level : 'L3_EMPRESA') as DecisionLevel,
          region: (VALID_REGIONS.includes(j.region as RegionCode) ? j.region : 'GLOBAL') as RegionCode,
          title: title || 'Decisión Importada',
          chosenAlternative: chosen || 'Opción A',
          consensusAlternative: sanitizeString(j.consensusAlternative, 100) || chosen,
          minimaxRegretAlternative: sanitizeString(j.minimaxRegretAlternative, 100) || chosen,
          expectedValue: Number(j.expectedValue) || 0,
          maxRegret: Number(j.maxRegret) || 0,
          confidencePct: Math.max(0, Math.min(100, conf || 75)),
          reversibility: ['reversible', 'partially_reversible', 'irreversible'].includes(j.reversibility as string)
            ? (j.reversibility as DecisionJournalEntry['reversibility'])
            : 'reversible',
          notes: sanitizeString(j.notes, 500),
          outcomeStatus: status,
          reviewDueAt: typeof j.reviewDueAt === 'string' ? sanitizeString(j.reviewDueAt, 40) : undefined,
        })
      })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    sanitizedPayload: {
      schemaVersion: FEDERATION_SCHEMA_VERSION,
      exportedAt: typeof p.exportedAt === 'string' ? p.exportedAt : new Date().toISOString(),
      activeRegion: sanitizedRegion,
      enterpriseProfile: sanitizedProfile,
      journal: sanitizedJournal,
    },
  }
}

export function importFederationBundle(payload: unknown): boolean {
  const result = validateFederationBundle(payload)
  if (!result.valid || !result.sanitizedPayload) {
    return false
  }
  const clean = result.sanitizedPayload
  saveActiveRegion(clean.activeRegion)
  saveEnterpriseProfile(clean.enterpriseProfile)
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(clean.journal))
  } catch {
    // ignore
  }
  emitFederationEvent('mejora:bundle-imported', { payload: clean })
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

export interface FederatedUrlDecisionDraft {
  title?: string
  level?: DecisionLevel
  region?: RegionCode
  alternatives?: string[]
}

const VALID_LEVELS: DecisionLevel[] = ['L4_MACRO', 'L3_EMPRESA', 'L2_PERSONAL', 'L1_COTIDIANO']
const VALID_REGIONS: RegionCode[] = ['GLOBAL', 'AR', 'US', 'BR', 'MX', 'EU']

/**
 * Hidrata parámetros de decisión entrantes desde URL query params
 * (enlaces desde Indicadores Centinela, MejoraApp, Diagnóstico 4D u otros módulos).
 */
export function parseFederatedDecisionQuery(
  params: URLSearchParams,
): FederatedUrlDecisionDraft {
  const draft: FederatedUrlDecisionDraft = {}

  const rawTitle = params.get('title')?.trim()
  if (rawTitle) draft.title = rawTitle

  const rawLevel = params.get('level')?.trim() as DecisionLevel | undefined
  if (rawLevel && VALID_LEVELS.includes(rawLevel)) {
    draft.level = rawLevel
  }

  const rawRegion = params.get('region')?.trim() as RegionCode | undefined
  if (rawRegion && VALID_REGIONS.includes(rawRegion)) {
    draft.region = rawRegion
  }

  const optA = params.get('optA')?.trim()
  const optB = params.get('optB')?.trim()
  const optC = params.get('optC')?.trim()
  if (optA && optB && optC) {
    draft.alternatives = [optA, optB, optC]
  }

  return draft
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

let federationMessageListenerAttached = false

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

  if (!federationMessageListenerAttached) {
    federationMessageListenerAttached = true
    window.addEventListener('message', (event: MessageEvent) => {
      const data = event.data as
        | {
            target?: string
            type?: string
            action?: string
            payload?: Partial<FederationPayload>
            profile?: EnterpriseExposureProfile
          }
        | undefined
      if (!data || data.target !== 'MejoraDecisionesOS' || data.type !== 'MEJORA_FEDERATION_CMD') {
        return
      }
      if (data.action === 'PING') {
        emitFederationEvent('mejora:federation-pong', exportFederationBundle())
      } else if (data.action === 'IMPORT_BUNDLE' && data.payload) {
        importFederationBundle(data.payload)
      } else if (data.action === 'SET_ENTERPRISE_PROFILE' && data.profile) {
        const rev = Number(data.profile.revenueExportPct)
        const cost = Number(data.profile.costDollarizedPct)
        const debt = Number(data.profile.debtExposurePct)
        const labor = Number(data.profile.laborIntensityPct)
        const runway = Number(data.profile.cashRunwayMonths)
        const sectorVal = ['manufactura', 'comercio', 'servicios', 'agro', 'construccion', 'tecnologia'].includes(data.profile.sector)
          ? data.profile.sector
          : DEFAULT_ENTERPRISE_PROFILE.sector

        if (Number.isFinite(rev) && Number.isFinite(cost) && Number.isFinite(debt) && Number.isFinite(runway)) {
          saveEnterpriseProfile({
            companyName: sanitizeString(data.profile.companyName, 80) || DEFAULT_ENTERPRISE_PROFILE.companyName,
            sector: sectorVal,
            region: VALID_REGIONS.includes(data.profile.region) ? data.profile.region : DEFAULT_ENTERPRISE_PROFILE.region,
            revenueExportPct: Math.max(0, Math.min(100, rev)),
            costDollarizedPct: Math.max(0, Math.min(100, cost)),
            debtExposurePct: Math.max(0, Math.min(100, debt)),
            laborIntensityPct: Math.max(0, Math.min(100, Number.isFinite(labor) ? labor : 40)),
            cashRunwayMonths: Math.max(0, Math.min(120, runway)),
          })
        }
      }
    })
  }
}
