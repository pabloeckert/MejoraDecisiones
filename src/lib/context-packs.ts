/**
 * Cartuchos de Contexto Internacionales (ContextPacks), Plantillas Multi-Escala (L4 -> L1)
 * y Motor de Múltiples Visiones (Consejo de 4 Lentes Estratégicas).
 */

import type {
  DecisionLevel,
  SequentialGameBranch,
  TopsisAlternative,
  TopsisCriterion,
  MonteCarloFactor,
} from './decision-engine'

export type RegionCode = 'GLOBAL' | 'AR' | 'US' | 'BR' | 'MX' | 'EU'

export interface MacroVital {
  label: string
  value: string
  numericValue: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  source: string
  confidence: 'alta' | 'media' | 'estimada'
}

export interface RegionalContextPack {
  code: RegionCode
  name: string
  flag: string
  currency: string
  wbCountryIso: string // ISO para World Bank API
  summary: string
  baseParams: {
    inflacion: number
    popularidad: number
    fragmentacion: number
    reservas: number
    pobreza: number
    riesgo: number
  }
  vitals: MacroVital[]
  keyActors: { name: string; role: string; power: number; stance: 'ally' | 'rival' | 'pivotal' }[]
  strategicRisks: string[]
  opportunities: string[]
}

export const REGIONAL_CONTEXT_PACKS: Record<RegionCode, RegionalContextPack> = {
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global / Multinacional',
    flag: '🌐',
    currency: 'USD',
    wbCountryIso: 'WLD',
    summary: 'Tablero geoeconómico multipolar: tasas Fed/BCE, reconfiguración de cadenas de suministro (nearshoring), carrera de IA y tensión energética.',
    baseParams: {
      inflacion: 4.2,
      popularidad: 48,
      fragmentacion: 62,
      reservas: 50,
      pobreza: 18,
      riesgo: 320,
    },
    vitals: [
      { label: 'Inflación Global Media', value: '4.2%', numericValue: 4.2, unit: '%', trend: 'down', source: 'IMF / World Bank', confidence: 'alta' },
      { label: 'Tasa Fed Funds', value: '4.50%', numericValue: 4.5, unit: '%', trend: 'down', source: 'Federal Reserve', confidence: 'alta' },
      { label: 'Crecimiento PIB Global', value: '3.2%', numericValue: 3.2, unit: '%', trend: 'flat', source: 'IMF WEO', confidence: 'alta' },
      { label: 'Índice Tensión Geopolítica', value: '68/100', numericValue: 68, unit: 'pts', trend: 'up', source: 'GDELT / GPR', confidence: 'media' },
    ],
    keyActors: [
      { name: 'Reserva Federal (Fed)', role: 'Liquidez y tasa libre de riesgo global', power: 0.95, stance: 'pivotal' },
      { name: 'Bloque EE.UU. / USMCA', role: 'Demanda, tecnología y nearshoring', power: 0.92, stance: 'ally' },
      { name: 'China / BRICS+', role: 'Manufactura, minerales críticos y demanda de commodities', power: 0.89, stance: 'rival' },
      { name: 'Unión Europea', role: 'Superpotencia regulatoria y acuerdo Mercosur-UE', power: 0.78, stance: 'pivotal' },
    ],
    strategicRisks: [
      'Aranceles cruzados y fragmentación en bloques comerciales (friend-shoring).',
      'Shocks marítimos y energéticos en estrechos estratégicos.',
      'Costo de capital real positivo para empresas endeudadas a tasa variable.',
    ],
    opportunities: [
      'Exportación global de servicios basados en conocimiento e IA con arbitraje de costos.',
      'Relocalización de proveedores industriales hacia América Latina (nearshoring).',
      'Transición energética, agroindustria trazable y minerales críticos.',
    ],
  },
  AR: {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
    wbCountryIso: 'ARG',
    summary: 'Estabilización macroeconómica con superávit fiscal, desinflación gradual y negociación constante con gobernadores bisagra en el Congreso.',
    baseParams: {
      inflacion: 25,
      popularidad: 42,
      fragmentacion: 55,
      reservas: 35,
      pobreza: 32,
      riesgo: 650,
    },
    vitals: [
      { label: 'Inflación Mensual', value: '3.4%', numericValue: 3.4, unit: '%', trend: 'down', source: 'INDEC', confidence: 'alta' },
      { label: 'Reservas BCRA', value: 'USD 35B', numericValue: 35, unit: 'B USD', trend: 'up', source: 'BCRA', confidence: 'alta' },
      { label: 'Riesgo País (EMBI+)', value: '650 bps', numericValue: 650, unit: 'bps', trend: 'down', source: 'JP Morgan', confidence: 'alta' },
      { label: 'Superávit Primario', value: '+0.8% PIB', numericValue: 0.8, unit: '% PIB', trend: 'up', source: 'MECON', confidence: 'alta' },
    ],
    keyActors: [
      { name: 'Poder Ejecutivo (LLA)', role: 'Ancla fiscal y desregulación', power: 0.92, stance: 'ally' },
      { name: 'Gobernadores Bisagra (PU / PRO / UCR)', role: 'Llave de quórum y blindaje de vetos', power: 0.78, stance: 'pivotal' },
      { name: 'Oposición (UxP / CGT)', role: 'Capacidad de bloqueo legislativo y paro', power: 0.72, stance: 'rival' },
      { name: 'FMI / Mercado de Bonos', role: 'Refinanciamiento de vencimientos y salida del cepo', power: 0.85, stance: 'pivotal' },
    ],
    strategicRisks: [
      'Apreciación cambiaria que comprime márgenes de sectores transables e industriales.',
      'Fragmentación parlamentaria ante reformas estructurales e impositivas.',
      'Heterogeneidad sectorial: energía/agro/tech en expansión vs. consumo/construcción lentos.',
    ],
    opportunities: [
      'Expansión de crédito privado al sector productivo tras retiro del Estado del mercado de deuda.',
      'Inversiones en energía (Vaca Muerta), minería (litio/cobre), agroindustria y software.',
      'Reconversión competitiva de PyMEs mediante eficiencia operativa (Diagnóstico 4D).',
    ],
  },
  US: {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    currency: 'USD',
    wbCountryIso: 'USA',
    summary: 'Economía resiliente impulsada por inversión en IA, política industrial proteccionista y tensión fiscal de mediano plazo.',
    baseParams: {
      inflacion: 2.8,
      popularidad: 46,
      fragmentacion: 52,
      reservas: 58,
      pobreza: 11,
      riesgo: 120,
    },
    vitals: [
      { label: 'CPI Inflación Anual', value: '2.8%', numericValue: 2.8, unit: '%', trend: 'down', source: 'BLS / FRED', confidence: 'alta' },
      { label: 'PIB Anualizado', value: '2.7%', numericValue: 2.7, unit: '%', trend: 'up', source: 'BEA', confidence: 'alta' },
      { label: 'Desempleo', value: '4.1%', numericValue: 4.1, unit: '%', trend: 'flat', source: 'BLS', confidence: 'alta' },
      { label: 'Treasury 10Y Yield', value: '4.25%', numericValue: 4.25, unit: '%', trend: 'flat', source: 'US Treasury', confidence: 'alta' },
    ],
    keyActors: [
      { name: 'Ejecutivo Federal & Comercio', role: 'Política arancelaria y reindustrialización', power: 0.90, stance: 'ally' },
      { name: 'Federal Reserve (FOMC)', role: 'Control de inflación y liquidez', power: 0.94, stance: 'pivotal' },
      { name: 'Senado / Cámara Bisagra', role: 'Techo de deuda y presupuesto fiscal', power: 0.80, stance: 'pivotal' },
      { name: 'Big Tech / Capital de Riesgo', role: 'CAPEX en IA, nube e infraestructura', power: 0.88, stance: 'ally' },
    ],
    strategicRisks: [
      'Impacto inflacionario de nuevos aranceles sobre insumos importados.',
      'Déficit fiscal elevado que mantiene tasas largas estructuralmente altas.',
    ],
    opportunities: [
      'Demanda corporativa de automatización, agentes de IA y servicios B2B.',
      'Alianzas de nearshoring con proveedores confiables del hemisferio occidental.',
    ],
  },
  BR: {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    currency: 'BRL',
    wbCountryIso: 'BRA',
    summary: 'Potencia agroindustrial y energética con tensión entre impulso al gasto público y tasa Selic restrictiva del Banco Central.',
    baseParams: {
      inflacion: 4.6,
      popularidad: 44,
      fragmentacion: 64,
      reservas: 55,
      pobreza: 21,
      riesgo: 210,
    },
    vitals: [
      { label: 'IPCA Inflación Anual', value: '4.6%', numericValue: 4.6, unit: '%', trend: 'up', source: 'IBGE', confidence: 'alta' },
      { label: 'Tasa Selic', value: '11.25%', numericValue: 11.25, unit: '%', trend: 'up', source: 'Banco Central do Brasil', confidence: 'alta' },
      { label: 'Reservas Internacionales', value: 'USD 355B', numericValue: 355, unit: 'B USD', trend: 'flat', source: 'BCB', confidence: 'alta' },
      { label: 'Crecimiento PIB', value: '2.9%', numericValue: 2.9, unit: '%', trend: 'up', source: 'IBGE', confidence: 'alta' },
    ],
    keyActors: [
      { name: 'Banco Central (BCB)', role: 'Política monetaria ortodoxa (Selic)', power: 0.88, stance: 'pivotal' },
      { name: 'Centrão (Congreso)', role: 'Árbitro de reformas y presupuesto', power: 0.86, stance: 'pivotal' },
      { name: 'Poder Ejecutivo (Planalto)', role: 'Expansión fiscal e industrial', power: 0.84, stance: 'ally' },
      { name: 'Agronegocio & Exportadores', role: 'Superávit comercial récord', power: 0.82, stance: 'ally' },
    ],
    strategicRisks: [
      'Tasa de interés real elevada que encarece el capital de trabajo.',
      'Volatilidad del Real (BRL) ante dudas sobre el ancla fiscal.',
    ],
    opportunities: [
      'Integración de cadenas industriales y energéticas en el Mercosur.',
      'Digitalización financiera (ecosistema Pix) y mercado de consumo de 215M de habitantes.',
    ],
  },
  MX: {
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    currency: 'MXN',
    wbCountryIso: 'MEX',
    summary: 'Epicentro del nearshoring manufacturero hacia EE.UU., con alta integración T-MEC y desafíos en infraestructura eléctrica y seguridad jurídica.',
    baseParams: {
      inflacion: 4.5,
      popularidad: 58,
      fragmentacion: 32,
      reservas: 52,
      pobreza: 24,
      riesgo: 195,
    },
    vitals: [
      { label: 'Inflación Anual (INPC)', value: '4.5%', numericValue: 4.5, unit: '%', trend: 'down', source: 'INEGI', confidence: 'alta' },
      { label: 'Tasa Banxico', value: '10.25%', numericValue: 10.25, unit: '%', trend: 'down', source: 'Banxico', confidence: 'alta' },
      { label: 'Exportaciones a EE.UU.', value: 'USD 505B', numericValue: 505, unit: 'B USD', trend: 'up', source: 'US Census / INEGI', confidence: 'alta' },
      { label: 'Reservas Banxico', value: 'USD 226B', numericValue: 226, unit: 'B USD', trend: 'up', source: 'Banxico', confidence: 'alta' },
    ],
    keyActors: [
      { name: 'Ejecutivo & Mayoría Calificada', role: 'Control constitucional y legislativo', power: 0.93, stance: 'ally' },
      { name: 'Revisión T-MEC (USMCA)', role: 'Reglas de origen y comercio con EE.UU.', power: 0.90, stance: 'pivotal' },
      { name: 'Banxico', role: 'Estabilidad monetaria y diferencial de tasas', power: 0.85, stance: 'pivotal' },
    ],
    strategicRisks: [
      'Renegociación del T-MEC y exigencias sobre componentes de origen asiático.',
      'Cuellos de botella en energía eléctrica, agua y logística fronteriza.',
    ],
    opportunities: [
      'Proveeduría industrial, logística y tecnológica para corredores del norte y bajío.',
      'Servicios financieros, B2B y consumo interno respaldado por empleo e ingresos.',
    ],
  },
  EU: {
    code: 'EU',
    name: 'Unión Europea / España',
    flag: '🇪🇺',
    currency: 'EUR',
    wbCountryIso: 'ESP',
    summary: 'Inflación controlada y recorte de tasas del BCE, con liderazgo de España en crecimiento por servicios/turismo y apertura del acuerdo Mercosur-UE.',
    baseParams: {
      inflacion: 2.3,
      popularidad: 41,
      fragmentacion: 66,
      reservas: 54,
      pobreza: 16,
      riesgo: 140,
    },
    vitals: [
      { label: 'Inflación Eurozona (HICP)', value: '2.3%', numericValue: 2.3, unit: '%', trend: 'down', source: 'Eurostat', confidence: 'alta' },
      { label: 'Tasa Depósito BCE', value: '3.25%', numericValue: 3.25, unit: '%', trend: 'down', source: 'ECB', confidence: 'alta' },
      { label: 'PIB España Anual', value: '3.0%', numericValue: 3.0, unit: '%', trend: 'up', source: 'INE / Eurostat', confidence: 'alta' },
      { label: 'Prima de Riesgo', value: '75 bps', numericValue: 75, unit: 'bps', trend: 'down', source: 'BCE', confidence: 'alta' },
    ],
    keyActors: [
      { name: 'Banco Central Europeo (BCE)', role: 'Relajación monetaria gradual', power: 0.92, stance: 'pivotal' },
      { name: 'Comisión Europea', role: 'Regulación IA, Pacto Verde y Mercosur-UE', power: 0.85, stance: 'ally' },
      { name: 'Parlamentos Fragmentados', role: 'Gobiernos de coalición con socios bisagra', power: 0.78, stance: 'pivotal' },
    ],
    strategicRisks: [
      'Sobrerregulación normativa (ESG, AI Act) que eleva costos de cumplimiento para PyMEs.',
      'Estancamiento industrial en Europa Central por costos energéticos.',
    ],
    opportunities: [
      'Puente natural España-LATAM para internacionalización de empresas de servicios y agro.',
      'Fondos europeos de digitalización y transición energética.',
    ],
  },
}

// ============================================================================
// CONSEJO DE LAS 4 LENTES ESTRATÉGICAS (MULTI-VISIÓN BASADA EN TUS LIBROS)
// ============================================================================

export interface StrategicLensAnalysis {
  id: 'realpolitik' | 'systems' | 'behavioral' | 'execution'
  title: string
  authors: string
  icon: string
  diagnosis: string
  blindSpotWarning: string
  tacticalPrescription: string
}

export function generateMultiVisionAnalysis(params: {
  title: string
  level: DecisionLevel
  consensusChoice: string
  maximinChoice: string
  regretChoice: string
  evpi: number
  region: RegionCode
}): StrategicLensAnalysis[] {
  const pack = REGIONAL_CONTEXT_PACKS[params.region]
  const diverge = params.consensusChoice !== params.maximinChoice

  return [
    {
      id: 'realpolitik',
      title: 'Lente Realpolitik, Poder y Posición (Shi)',
      authors: 'Nicolás Maquiavelo · Sun Bin',
      icon: '♟️',
      diagnosis:
        params.level === 'L4_MACRO' || params.level === 'L3_EMPRESA'
          ? `En el contexto ${pack.name}, quien controla el nodo bisagra captura la renta de la negociación. Elegir "${params.consensusChoice}" solo es sostenible si preservás autonomía y evitás depender de un único proveedor, cliente o aliado político.`
          : `En toda negociación o decisión personal, tu poder real no es lo que pedís sino tu mejor alternativa fuera de la mesa (BATNA). "${params.consensusChoice}" fortalece tu posición sin entregar poder de veto.`,
      blindSpotWarning:
        'No confundas declaraciones de buena voluntad con incentivos reales: si a la contraparte le conviene cambiar las reglas cuando vos ya invertiste el costo hundido, lo hará.',
      tacticalPrescription:
        'Asegurá opcionalidad: mantené siempre un segundo canal/opción activa y exigí compromisos escalonados verificables.',
    },
    {
      id: 'systems',
      title: 'Lente de Dinámica de Sistemas y Cuellos de Botella',
      authors: 'Donella Meadows · Martin Kleppmann',
      icon: '🔄',
      diagnosis: diverge
        ? `Hay una tensión estructural entre maximizar retorno ("${params.consensusChoice}") y blindar la supervivencia ("${params.maximinChoice}"). Esto indica un bucle de retroalimentación: si el entorno se deteriora, el apalancamiento amplifica el daño.`
        : `Existe alineación sistémica: "${params.consensusChoice}" domina tanto en valor esperado como en control de daños, actuando como un bucle estabilizador.`,
      blindSpotWarning:
        'Cuidado con los retardos (delays) del sistema: los beneficios suelen tardar más en aparecer que los costos fijos inmediatos.',
      tacticalPrescription:
        'Definí un indicador centinela temprano (umbral de stop-loss o métrica líder) para ajustar el rumbo antes de que el bucle negativo tome velocidad.',
    },
    {
      id: 'behavioral',
      title: 'Lente Conductual y Aversión a la Pérdida',
      authors: 'Dan Ariely · Don Norman · Steve Krug',
      icon: '🧠',
      diagnosis: `Según el criterio de Mínimo Arrepentimiento de Savage y la Teoría Prospectiva (λ = 2.25), la opción que mejor protege tu tranquilidad futura y evita el peor arrepentimiento es "${params.regretChoice}".`,
      blindSpotWarning:
        'Sesgo del status quo y falacia del costo hundido: no sigas inyectando tiempo o dinero en una opción mediocre solo por lo que ya gastaste ayer.',
      tacticalPrescription:
        params.evpi > 10
          ? `El Valor Esperado de la Información Perfecta es alto (${params.evpi.toFixed(1)} pts): vale la pena hacer una prueba pequeña o consulta experta antes de comprometer el 100%.`
          : `El valor de seguir esperando información adicional es bajo (${params.evpi.toFixed(1)} pts): evitá la parálisis por análisis y ejecutá.`,
    },
    {
      id: 'execution',
      title: 'Lente de Valor, Posicionamiento y Ejecución',
      authors: 'Peter Drucker · Osterwalder · Kim & Mauborgne · Geoffrey Moore',
      icon: '🚀',
      diagnosis: `La decisión efectiva convierte incertidumbre en foco. En vez de competir por desgaste en un océano rojo, "${params.consensusChoice}" debe ejecutarse concentrando recursos en el segmento ("cabeza de playa" de Moore) donde tu propuesta de valor sea insustituible.`,
      blindSpotWarning:
        'Intentar abarcar todas las opciones a medias diluye el capital y el foco operativo.',
      tacticalPrescription:
        'Dividí la ejecución en un tramo reversible de 30 días (Puerta Tipo 2) con métricas claras de caja/resultado antes de escalar el compromiso estructural.',
    },
  ]
}

// ============================================================================
// PLANTILLAS DE DECISIÓN PRECARGADAS EN LOS 4 NIVELES (L4, L3, L2, L1)
// ============================================================================

export interface DecisionTemplate {
  id: string
  level: DecisionLevel
  levelLabel: string
  title: string
  subtitle: string
  reversibilityDefault: 'reversible' | 'partially_reversible' | 'irreversible'
  // Para Matriz de Incertidumbre y Monte Carlo
  alternatives: string[]
  scenarios: string[]
  probabilities: number[]
  payoffs: number[][]
  monteCarloFactors: MonteCarloFactor[]
  // Para Árbol Secuencial
  sequentialBranches: SequentialGameBranch[]
  // Para Multicriterio TOPSIS
  topsisCriteria: TopsisCriterion[]
  topsisAlternatives: TopsisAlternative[]
}

export const DECISION_TEMPLATES: DecisionTemplate[] = [
  {
    id: 'l4_geopolitics_supply',
    level: 'L4_MACRO',
    levelLabel: 'Nivel L4 · Macro & Internacional',
    title: 'Estrategia Internacional de Mercados y Moneda',
    subtitle: 'Diversificación entre mercado local, exportación regional (LATAM/EE.UU.) y cobertura ante shocks geopolíticos.',
    reversibilityDefault: 'partially_reversible',
    alternatives: [
      'A. Concentrar 100% en mercado local',
      'B. Estrategia Dual (60% Local + 40% Exportación USD/EUR)',
      'C. Expansión agresiva internacional con deuda',
    ],
    scenarios: [
      'S1. Estabilización y crecimiento local (45%)',
      'S2. Estancamiento con apreciación cambiaria (35%)',
      'S3. Shock externo / devaluación brusca (20%)',
    ],
    probabilities: [45, 35, 20],
    payoffs: [
      [85, 30, -45],
      [75, 65, 55],
      [95, 20, -60],
    ],
    monteCarloFactors: [
      { id: 'fx', name: 'Variación Tipo de Cambio Real (%)', min: -15, mode: 5, max: 35, weight: 1.2 },
      { id: 'ext_demand', name: 'Demanda Internacional (%)', min: -5, mode: 8, max: 20, weight: 1.5 },
      { id: 'rate', name: 'Costo Financiero / Tasas (%)', min: 4, mode: 9, max: 22, weight: -1.4 },
    ],
    sequentialBranches: [
      {
        firstMoveLabel: 'Abrir canal exportador con socio local',
        responses: [
          { responseLabel: 'Regulador/Mercado acompaña con estabilidad', firstMoverPayoff: 82, secondMoverPayoff: 70 },
          { responseLabel: 'Suba de aranceles o trabas cambiarias', firstMoverPayoff: 58, secondMoverPayoff: 40 },
        ],
      },
      {
        firstMoveLabel: 'Esperar sin diversificar mercados',
        responses: [
          { responseLabel: 'Competidores capturan el nicho externo', firstMoverPayoff: 25, secondMoverPayoff: 80 },
          { responseLabel: 'Demanda interna se sostiene sola', firstMoverPayoff: 60, secondMoverPayoff: 55 },
        ],
      },
    ],
    topsisCriteria: [
      { id: 'roi', name: 'Retorno Esperado (1-10)', weight: 9, direction: 'benefit' },
      { id: 'resilience', name: 'Blindaje Multimoneda (1-10)', weight: 10, direction: 'benefit' },
      { id: 'capex', name: 'Inversión / Complejidad (1-10)', weight: 7, direction: 'cost' },
    ],
    topsisAlternatives: [
      { id: 'a1', name: '100% Mercado Local', scores: { roi: 6, resilience: 3, capex: 3 }, reversibility: 'reversible' },
      { id: 'a2', name: 'Modelo Dual 60/40 (Alianza Internacional)', scores: { roi: 8, resilience: 9, capex: 5 }, reversibility: 'partially_reversible' },
      { id: 'a3', name: 'Filial Propia con Deuda', scores: { roi: 9, resilience: 7, capex: 9 }, reversibility: 'irreversible' },
    ],
  },
  {
    id: 'l3_corporate_pricing_capex',
    level: 'L3_EMPRESA',
    levelLabel: 'Nivel L3 · Estratégico Empresarial / PyME',
    title: 'Decisión de Directorio: Inversión, Precios y Capital de Trabajo',
    subtitle: 'Cómo posicionar la empresa ante incertidumbre de demanda, inflación y competencia (Océano Azul + Diagnóstico 4D).',
    reversibilityDefault: 'partially_reversible',
    alternatives: [
      'A. Defender margen subiendo precios (foco rentable)',
      'B. Invertir en eficiencia + propuesta diferenciada (Océano Azul)',
      'C. Guerra de precios por volumen y endeudamiento',
    ],
    scenarios: [
      'S1. Consumo se recupera + crédito activo (35%)',
      'S2. Meseta competitiva / costos en alza (45%)',
      'S3. Contracción de ventas y tensión en cadena de pagos (20%)',
    ],
    probabilities: [35, 45, 20],
    payoffs: [
      [60, 55, 25],
      [90, 75, 40],
      [80, 15, -55],
    ],
    monteCarloFactors: [
      { id: 'sales', name: 'Variación de Ventas Reales (%)', min: -18, mode: 4, max: 22, weight: 1.8 },
      { id: 'cost_usd', name: 'Suba de Costos Operativos (%)', min: 2, mode: 10, max: 30, weight: -1.5 },
      { id: 'productivity', name: 'Ganancia por Mejora Continua / IA (%)', min: 5, mode: 15, max: 30, weight: 1.6 },
    ],
    sequentialBranches: [
      {
        firstMoveLabel: 'Lanzar oferta premium diferenciada + automatizar procesos',
        responses: [
          { responseLabel: 'Competencia intenta imitar tarde', firstMoverPayoff: 85, secondMoverPayoff: 45 },
          { responseLabel: 'Competencia baja precios en gama baja', firstMoverPayoff: 72, secondMoverPayoff: 50 },
        ],
      },
      {
        firstMoveLabel: 'Entrar en guerra de descuentos masivos',
        responses: [
          { responseLabel: 'Competencia iguala descuento (erosión mutua)', firstMoverPayoff: 15, secondMoverPayoff: 15 },
          { responseLabel: 'Competencia cede cuota', firstMoverPayoff: 60, secondMoverPayoff: 20 },
        ],
      },
    ],
    topsisCriteria: [
      { id: 'margin', name: 'Protección de Margen Neto (1-10)', weight: 10, direction: 'benefit' },
      { id: 'moat', name: 'Diferenciación Competitiva (1-10)', weight: 9, direction: 'benefit' },
      { id: 'cash_strain', name: 'Tensión de Caja / Riesgo Financiero (1-10)', weight: 9, direction: 'cost' },
    ],
    topsisAlternatives: [
      { id: 'b1', name: 'Ajuste defensivo + foco en clientes A', scores: { margin: 8, moat: 6, cash_strain: 3 }, reversibility: 'reversible' },
      { id: 'b2', name: 'Innovación de Valor + Eficiencia 4D', scores: { margin: 9, moat: 10, cash_strain: 4 }, reversibility: 'partially_reversible' },
      { id: 'b3', name: 'Expansión por volumen con deuda corta', scores: { margin: 4, moat: 3, cash_strain: 9 }, reversibility: 'irreversible' },
    ],
  },
  {
    id: 'l2_personal_vision',
    level: 'L2_PERSONAL',
    levelLabel: 'Nivel L2 · Estructural Personal y Visión de Vida',
    title: 'Decisión Estructural de Carrera, Patrimonio y Proyecto de Vida',
    subtitle: 'Evaluación de horizonte 1 a 5 años minimizando el arrepentimiento máximo (Criterio de Savage + Kelly).',
    reversibilityDefault: 'partially_reversible',
    alternatives: [
      'A. Mantener posición actual y capital en liquidez conservadora',
      'B. Transición Híbrida: Construir activo/negocio propio en paralelo',
      'C. Salto Total inmediato (quemar naves con ahorros propios)',
    ],
    scenarios: [
      'S1. Tracción rápida del nuevo proyecto (35%)',
      'S2. Maduración lenta (requiere 12-18 meses) (45%)',
      'S3. Contracción del sector / imprevisto personal (20%)',
    ],
    probabilities: [35, 45, 20],
    payoffs: [
      [35, 35, 30],
      [85, 75, 45],
      [110, 20, -65],
    ],
    monteCarloFactors: [
      { id: 'income_growth', name: 'Crecimiento de Ingresos Nuevos (%)', min: -10, mode: 25, max: 80, weight: 1.4 },
      { id: 'runway', name: 'Colchón Financiero (Meses de reserva)', min: 3, mode: 12, max: 24, weight: 2.0 },
      { id: 'burnout', name: 'Carga de Estrés / Costo Fijo (%)', min: 10, mode: 25, max: 60, weight: -1.1 },
    ],
    sequentialBranches: [
      {
        firstMoveLabel: 'Validar con primeros 3 clientes pagos antes de dejar ingreso base',
        responses: [
          { responseLabel: 'Mercado valida y financia el salto', firstMoverPayoff: 92, secondMoverPayoff: 85 },
          { responseLabel: 'Se requiere pivotar la oferta sin perder liquidez', firstMoverPayoff: 65, secondMoverPayoff: 60 },
        ],
      },
      {
        firstMoveLabel: 'Comprometer todo el ahorro sin validación previa',
        responses: [
          { responseLabel: 'Éxito inmediato en primer intento', firstMoverPayoff: 95, secondMoverPayoff: 80 },
          { responseLabel: 'Demora comercial agota reservas y fuerza retroceso', firstMoverPayoff: -50, secondMoverPayoff: 20 },
        ],
      },
    ],
    topsisCriteria: [
      { id: 'vision', name: 'Alineación con Visión de Largo Plazo (1-10)', weight: 10, direction: 'benefit' },
      { id: 'autonomy', name: 'Libertad y Crecimiento Patrimonial (1-10)', weight: 9, direction: 'benefit' },
      { id: 'ruin_risk', name: 'Riesgo de Pérdida Patrimonial (1-10)', weight: 10, direction: 'cost' },
    ],
    topsisAlternatives: [
      { id: 'p1', name: 'Inercia Conservadora', scores: { vision: 3, autonomy: 4, ruin_risk: 2 }, reversibility: 'reversible' },
      { id: 'p2', name: 'Estrategia Barbell / Transición Validada', scores: { vision: 9, autonomy: 9, ruin_risk: 3 }, reversibility: 'reversible' },
      { id: 'p3', name: 'Salto Sin Red (Todo o Nada)', scores: { vision: 9, autonomy: 8, ruin_risk: 9 }, reversibility: 'irreversible' },
    ],
  },
  {
    id: 'l1_daily_tactical',
    level: 'L1_COTIDIANO',
    levelLabel: 'Nivel L1 · Problemas Cotidianos y Negociación Rápida',
    title: 'Resolución Táctica del Día: Negociación, Prioridades y Conflictos',
    subtitle: 'Para problemas cotidianos con un cliente, socio, proveedor, equipo o agenda: decidir en 3 minutos sin desgaste.',
    reversibilityDefault: 'reversible',
    alternatives: [
      'A. Ceder rápido para evitar fricción hoy',
      'B. Propuesta Firme con Opciones de Valor Mutuo (Acondicionada)',
      'C. Confrontación dura / Ultimátum',
    ],
    scenarios: [
      'S1. La otra parte valora la relación y coopera (50%)',
      'S2. La otra parte está presionada y regatea (35%)',
      'S3. Actitud oportunista / mala fe (15%)',
    ],
    probabilities: [50, 35, 15],
    payoffs: [
      [40, 20, -20],
      [90, 75, 50],
      [30, 40, 45],
    ],
    monteCarloFactors: [
      { id: 'time_saved', name: 'Ahorro de Tiempo y Energía (pts)', min: -10, mode: 20, max: 45, weight: 1.2 },
      { id: 'rel_value', name: 'Preservación del Vínculo / Confianza', min: -20, mode: 15, max: 40, weight: 1.3 },
      { id: 'immediate_gain', name: 'Beneficio Económico Inmediato', min: 0, mode: 20, max: 50, weight: 1.5 },
    ],
    sequentialBranches: [
      {
        firstMoveLabel: 'Presentar 2 opciones equivalentes (Anclaje + Reciprocidad)',
        responses: [
          { responseLabel: 'Contraparte elige una opción y cierra acuerdo', firstMoverPayoff: 88, secondMoverPayoff: 80 },
          { responseLabel: 'Contraparte pide ajuste menor con contrapartida', firstMoverPayoff: 74, secondMoverPayoff: 75 },
        ],
      },
      {
        firstMoveLabel: 'Ceder unilateralmente sin pedir nada a cambio',
        responses: [
          { responseLabel: 'Contraparte exige aún más concesiones', firstMoverPayoff: 15, secondMoverPayoff: 85 },
          { responseLabel: 'Contraparte acepta y fija precedente bajo', firstMoverPayoff: 35, secondMoverPayoff: 70 },
        ],
      },
    ],
    topsisCriteria: [
      { id: 'impact', name: 'Resolución Definitiva del Problema (1-10)', weight: 10, direction: 'benefit' },
      { id: 'speed', name: 'Velocidad y Paz Mental (1-10)', weight: 8, direction: 'benefit' },
      { id: 'friction', name: 'Desgaste / Costo de Oportunidad (1-10)', weight: 8, direction: 'cost' },
    ],
    topsisAlternatives: [
      { id: 'd1', name: 'Postergar o ceder sin condiciones', scores: { impact: 3, speed: 7, friction: 6 }, reversibility: 'reversible' },
      { id: 'd2', name: 'Acuerdo Condicionado (Dar X si y solo si Y)', scores: { impact: 9, speed: 9, friction: 3 }, reversibility: 'reversible' },
      { id: 'd3', name: 'Escalar el conflicto sin alternativa lista', scores: { impact: 5, speed: 3, friction: 9 }, reversibility: 'irreversible' },
    ],
  },
]
