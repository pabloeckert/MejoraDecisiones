/**
 * Adaptador de IA Agéntica Cliente Zero-Server (BYOK / Ollama / Determinista)
 * 100% autónomo en el navegador: no requiere backend propio.
 * Las claves son estrictamente opcionales y nunca se envían a terceros.
 */

import type { DecisionLevel } from './decision-engine'

export type AIProvider = 'deterministic' | 'fallback' | 'gemini' | 'openai' | 'ollama'

export interface AICopilotConfig {
  provider: AIProvider
  apiKey?: string
  baseUrl?: string // e.g. http://localhost:11434 para Ollama o endpoint custom
  endpoint?: string // alias compatible
  model?: string
}

const AI_CONFIG_KEY = 'mejora_ai_copilot_config_v1'

export function loadAICopilotConfig(): AICopilotConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (raw) return JSON.parse(raw) as AICopilotConfig
  } catch {
    // ignore
  }
  return { provider: 'fallback' }
}

export function saveAICopilotConfig(config: AICopilotConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

/**
 * Extrae y parsea JSON de forma robusta desde respuestas de LLMs,
 * limpiando markdown fences (```json ... ```) o texto conversacional previo.
 */
export function extractJsonFromLLMResponse<T>(text: string, fallback: T): T {
  if (!text || typeof text !== 'string') return fallback

  const trimmed = text.trim()

  // 1. Intento parseo directo
  try {
    return JSON.parse(trimmed) as T
  } catch {
    // seguir con limpieza
  }

  // 2. Extraer bloques ```json ... ``` o ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T
    } catch {
      // seguir buscando corchetes
    }
  }

  // 3. Buscar primer { y último }
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T
    } catch {
      // ignore
    }
  }

  // 4. Buscar primer [ y último ]
  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1)) as T
    } catch {
      // ignore
    }
  }

  return fallback
}

// --- AGENTE 1: STRUCTURER AGENT ---

export interface StructuredDecisionDraft {
  title: string
  level: DecisionLevel
  alternatives: [string, string, string]
  scenarios: [string, string, string]
  probabilities: [number, number, number]
  payoffs: number[][]
  rationale: string
}

const DETERMINISTIC_STRUCTURER_FALLBACK: StructuredDecisionDraft = {
  title: 'Decisión Estratégica Estructurada',
  level: 'L3_EMPRESA',
  alternatives: [
    'A. Opción Defensiva / Cobertura de Capital',
    'B. Opción Balanceada / Crecimiento con Opciones',
    'C. Opción Agresiva / Todo o Nada',
  ],
  scenarios: [
    'S1. Escenario Favorable / Expansión (40%)',
    'S2. Escenario Neutro / Meseta (40%)',
    'S3. Escenario Adverso / Shock de Mercado (20%)',
  ],
  probabilities: [40, 40, 20],
  payoffs: [
    [70, 60, 45],
    [90, 75, 20],
    [110, 30, -50],
  ],
  rationale:
    'Estructuración algorítmica determinista: separa la decisión en una estrategia conservadora (A), una balanceada con opcionalidad (B) y una de alta exposición (C).',
}

export async function runStructurerAgent(
  dilemmaText: string,
  config = loadAICopilotConfig()
): Promise<StructuredDecisionDraft> {
  if (!dilemmaText.trim()) return DETERMINISTIC_STRUCTURER_FALLBACK

  if (config.provider === 'deterministic' || config.provider === 'fallback') {
    return {
      ...DETERMINISTIC_STRUCTURER_FALLBACK,
      title: dilemmaText.slice(0, 60),
    }
  }

  const prompt = `Eres un Decision Architect experto en Teoría de Juegos, Valor Esperado y Criterio de Savage.
Convierte el siguiente dilema o problema en una matriz de decisión cuantitativa con 3 alternativas y 3 escenarios mutuamente excluyentes (probabilidades suman exactamente 100):
Dilema: "${dilemmaText}"

Responde ÚNICAMENTE un objeto JSON válido con este esquema exacto:
{
  "title": "título sintético del dilema (máx 50 caracteres)",
  "level": "L4_MACRO" | "L3_EMPRESA" | "L2_PERSONAL" | "L1_COTIDIANO",
  "alternatives": ["A. Opción 1", "B. Opción 2", "C. Opción 3"],
  "scenarios": ["S1. Favorable", "S2. Neutro", "S3. Adverso"],
  "probabilities": [40, 40, 20],
  "payoffs": [
    [p11, p12, p13],
    [p21, p22, p23],
    [p31, p32, p33]
  ],
  "rationale": "breve justificación de supuestos"
}`

  try {
    const rawResponse = await callLLMProvider(prompt, config)
    const parsed = extractJsonFromLLMResponse<StructuredDecisionDraft>(
      rawResponse,
      DETERMINISTIC_STRUCTURER_FALLBACK
    )

    // Sanitización y normalización de probabilidades
    const probs = Array.isArray(parsed.probabilities) && parsed.probabilities.length === 3
      ? parsed.probabilities
      : [40, 40, 20]
    const sumP = probs.reduce((a, b) => a + b, 0) || 100
    const normalizedProbs: [number, number, number] = [
      Math.round((probs[0] / sumP) * 100),
      Math.round((probs[1] / sumP) * 100),
      100 - Math.round((probs[0] / sumP) * 100) - Math.round((probs[1] / sumP) * 100),
    ]

    return {
      title: parsed.title || dilemmaText.slice(0, 50),
      level: (['L4_MACRO', 'L3_EMPRESA', 'L2_PERSONAL', 'L1_COTIDIANO'].includes(parsed.level)
        ? parsed.level
        : 'L3_EMPRESA') as DecisionLevel,
      alternatives:
        Array.isArray(parsed.alternatives) && parsed.alternatives.length === 3
          ? (parsed.alternatives as [string, string, string])
          : DETERMINISTIC_STRUCTURER_FALLBACK.alternatives,
      scenarios:
        Array.isArray(parsed.scenarios) && parsed.scenarios.length === 3
          ? (parsed.scenarios as [string, string, string])
          : DETERMINISTIC_STRUCTURER_FALLBACK.scenarios,
      probabilities: normalizedProbs,
      payoffs:
        Array.isArray(parsed.payoffs) && parsed.payoffs.length === 3
          ? parsed.payoffs
          : DETERMINISTIC_STRUCTURER_FALLBACK.payoffs,
      rationale: parsed.rationale || 'Estructuración generada mediante IA agéntica.',
    }
  } catch {
    return {
      ...DETERMINISTIC_STRUCTURER_FALLBACK,
      title: dilemmaText.slice(0, 60),
    }
  }
}

// --- AGENTE 2: RED TEAM / DEVIL'S ADVOCATE ---

export interface DevilsAdvocateAudit {
  targetAlternative?: string
  adversarialCritiques: string[]
  biasesDetected: string[]
  cognitiveBiasesIdentified: { bias: string; explanation: string }[]
  blindSpots: string[]
  steelmanCounterArguments: string[]
  killCritique: string
  preMortemScenario: string
}

export async function runDevilsAdvocateAgent(
  context: {
    title: string
    chosenAlternative: string
    alternatives: string[]
    reversibility: string
  },
  config = loadAICopilotConfig()
): Promise<DevilsAdvocateAudit> {
  const fallbackAudit: DevilsAdvocateAudit = {
    targetAlternative: context.chosenAlternative,
    adversarialCritiques: [
      'El modelo asume elasticidad-precio constante que rara vez se cumple ante desaceleración de consumo.',
      'Existe un riesgo de subestimar la velocidad de respuesta de competidores consolidados.',
      'La estructura de costos fijos puede volverse rígida ante una reversión de expectativas de demanda.',
    ],
    biasesDetected: [
      'Sesgo de exceso de optimismo en la estimación del escenario base',
      'Efecto anclaje respecto al costo histórico o esfuerzo ya invertido (Sunk Cost Fallacy)',
      'Descuento hiperbólico: subestimación del costo operativo diferido a 6-12 meses',
    ],
    cognitiveBiasesIdentified: [
      {
        bias: 'Optimism Bias (Exceso de Optimismo)',
        explanation:
          'Sobreestimación de la probabilidad de éxito en el escenario favorable sin provisiones para contingencias.',
      },
      {
        bias: 'Sunk Cost Fallacy (Costo Hundido)',
        explanation:
          'Tendencia a sostener una línea de negocio solo por el capital y tiempo ya invertido.',
      },
      {
        bias: 'Hyperbolic Discounting',
        explanation:
          'Priorizar ganancias inmediatas subestimando costos operativos y fricciones diferidas a mediano plazo.',
      },
      {
        bias: 'Confirmation Bias (Sesgo de Confirmación)',
        explanation:
          'Focalizar atención en datos que convalidan la tesis inicial ignorando alertas tempranas de los canarios.',
      },
    ],
    blindSpots: [
      'Respuesta de represalia o guerra de precios de competidores directos',
      'Escasez de liquidez o retrasos en la cadena de pagos en momentos de estrés',
      'Costo de salida y penalizaciones contractuales si la hipótesis fracasa',
    ],
    steelmanCounterArguments: [
      `Argumento fuerte a favor de la alternativa no elegida: ofrece menor riesgo de ruina y mayor opcionalidad para corregir el rumbo sin destruir capital.`,
      `El escenario adverso tiene mayor probabilidad real de ocurrencia que la asumida debido a correlación sistémica de factores macro.`,
    ],
    killCritique:
      'Si el mercado se contrae un 15% o los costos fijos suben un 20%, la opción elegida consume el colchón de caja antes de alcanzar el punto de equilibrio.',
    preMortemScenario:
      'Proyección de fracaso a 180 días: una combinación de demora de 90 días en la ejecución y compresión de márgenes del 12% agota la liquidez operativa, forzando un endeudamiento de emergencia en condiciones desfavorables.',
  }

  if (config.provider === 'deterministic' || config.provider === 'fallback') return fallbackAudit

  const prompt = `Eres el "Abogado del Diablo" (Red Team Auditor) de un comité de inversiones de élite.
Tu misión es destruir los supuestos complacientes de la siguiente decisión para proteger al decisor contra la ruina o el autoengaño:

Decisión: "${context.title}"
Opción Elegida: "${context.chosenAlternative}"
Opciones Disponibles: ${context.alternatives.join(' | ')}
Reversibilidad: "${context.reversibility}"

Responde ÚNICAMENTE en JSON con este esquema exacto:
{
  "adversarialCritiques": ["crítica 1", "crítica 2", "crítica 3"],
  "biasesDetected": ["sesgo 1 con nombre técnico", "sesgo 2", "sesgo 3"],
  "cognitiveBiasesIdentified": [{"bias": "Nombre", "explanation": "Por qué aplica"}],
  "blindSpots": ["punto ciego 1", "punto ciego 2", "punto ciego 3"],
  "steelmanCounterArguments": ["argumento más sólido en contra 1", "argumento 2"],
  "killCritique": "crítica demoledora directa de 2 oraciones sobre el vector fatal de fracaso",
  "preMortemScenario": "simulación narrativa de cómo fracasó todo en 180 días"
}`

  try {
    const raw = await callLLMProvider(prompt, config)
    const parsed = extractJsonFromLLMResponse<DevilsAdvocateAudit>(raw, fallbackAudit)
    return {
      ...parsed,
      targetAlternative: context.chosenAlternative,
      adversarialCritiques: parsed.adversarialCritiques?.length
        ? parsed.adversarialCritiques
        : fallbackAudit.adversarialCritiques,
      cognitiveBiasesIdentified: parsed.cognitiveBiasesIdentified?.length
        ? parsed.cognitiveBiasesIdentified
        : fallbackAudit.cognitiveBiasesIdentified,
      preMortemScenario: parsed.preMortemScenario || fallbackAudit.preMortemScenario,
    }
  } catch {
    return fallbackAudit
  }
}

// --- AGENTE 3: OSINT SYNTHESIZER ---

export interface OsintSynthesis {
  executiveSummary: string[]
  macroOutlook: string
  earlySignals: string[]
}

export async function runOsintSynthesizerAgent(
  articles: { title: string; domain: string }[],
  regionName: string,
  config = loadAICopilotConfig()
): Promise<OsintSynthesis> {
  const fallback: OsintSynthesis = {
    executiveSummary: [
      `Monitoreo de fuentes abiertas activo para ${regionName}: ${articles.length} señales registradas en tiempo real.`,
      'Persiste cautela en flujos de inversión ante divergencia de tasas globales y tensión en cadenas comerciales.',
    ],
    macroOutlook:
      'El consenso de inteligencia abierta refleja una economía en transición donde la selectividad crediticia y la liquidez mandan.',
    earlySignals: [
      'Alerta de volatilidad en cotizaciones de insumos importados',
      'Reconfiguración de alianzas regionales y acuerdos bilaterales',
    ],
  }

  if (
    config.provider === 'deterministic' ||
    config.provider === 'fallback' ||
    articles.length === 0
  ) {
    return fallback
  }

  const titles = articles.map((a) => `- ${a.title} (${a.domain})`).join('\n')
  const prompt = `Sintetiza como analista de inteligencia estratégica para líderes empresariales los siguientes titulares de noticias de fuentes abiertas de ${regionName}:
${titles}

Responde ÚNICAMENTE en JSON:
{
  "executiveSummary": ["bullet 1", "bullet 2"],
  "macroOutlook": "párrafo breve de perspectiva",
  "earlySignals": ["señal 1", "señal 2"]
}`

  try {
    const raw = await callLLMProvider(prompt, config)
    return extractJsonFromLLMResponse<OsintSynthesis>(raw, fallback)
  } catch {
    return fallback
  }
}

// --- LLM HTTP DISPATCHER ---

async function callLLMProvider(prompt: string, config: AICopilotConfig): Promise<string> {
  const timeoutSignal = AbortSignal.timeout(12000)

  // 1. Google Gemini REST API
  if (config.provider === 'gemini') {
    const key = config.apiKey || ''
    if (!key) throw new Error('Falta API Key de Gemini')
    const model = config.model || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
      signal: timeoutSignal,
    })
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }

  // 2. OpenAI / OpenRouter
  if (config.provider === 'openai') {
    const key = config.apiKey || ''
    if (!key) throw new Error('Falta API Key de OpenAI / OpenRouter')
    const base = config.baseUrl || config.endpoint || 'https://api.openai.com/v1'
    const model = config.model || 'gpt-4o-mini'
    const url = `${base.replace(/\/$/, '')}/chat/completions`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
      signal: timeoutSignal,
    })
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`)
    const data = await res.json()
    return data?.choices?.[0]?.message?.content ?? ''
  }

  // 3. Ollama Local (100% privado en PC)
  if (config.provider === 'ollama') {
    const base = config.baseUrl || config.endpoint || 'http://localhost:11434'
    const model = config.model || 'llama3'
    const url = `${base.replace(/\/$/, '')}/api/generate`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json',
      }),
      signal: timeoutSignal,
    })
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
    const data = await res.json()
    return data?.response ?? ''
  }

  throw new Error(`Proveedor ${config.provider} no implementado`)
}
