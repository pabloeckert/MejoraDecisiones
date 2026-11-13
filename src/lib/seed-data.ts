// Seed data — actores políticos, económicos y sociales relevantes en Argentina.
// Fuente: información pública (Wikipedia, sitios oficiales). Este dataset es ilustrativo
// y editable desde /admin. No representa una postura editorial.

export type ActorKind =
  | "party"      // partido político / coalición
  | "leader"     // figura individual
  | "union"      // sindicato / CGT / CTA
  | "business"   // sector empresarial
  | "media"      // grupo de medios
  | "institution"; // institución del Estado / poderes

export interface PowerVector4D {
  institutional: number; // Capacidad de veto formal / regulatorio (0..100)
  mobilization: number;  // Capacidad de bloqueo operativo / calle / ejecución (0..100)
  financial: number;     // Liquidez, flujo de caja o poder de mercado (0..100)
  narrative: number;     // Instalación de agenda, reputación y consenso (0..100)
}

export type Actor = {
  id: string;
  name: string;
  kind: ActorKind;
  ideology: number;       // -1 (izquierda) ... +1 (derecha)
  power: number;          // 0..1, peso relativo
  blurb: string;
  powerVector?: Partial<PowerVector4D>;
};

export type Relation = {
  source: string;
  target: string;
  type: "ally" | "rival" | "neutral";
  strength: number;       // 0..1
  note?: string;
};

export const ACTORS: Actor[] = [
  // Coaliciones / partidos
  { id: "lla",   name: "La Libertad Avanza",       kind: "party", ideology: 0.85, power: 0.85, blurb: "Coalición libertaria oficialista." },
  { id: "pro",   name: "PRO",                       kind: "party", ideology: 0.55, power: 0.60, blurb: "Centroderecha; aliado situacional del oficialismo." },
  { id: "ucr",   name: "UCR",                       kind: "party", ideology: 0.10, power: 0.45, blurb: "Partido histórico, fragmentado entre dialoguistas y opositores." },
  { id: "uxp",   name: "Unión por la Patria",       kind: "party", ideology: -0.55, power: 0.70, blurb: "Coalición peronista/kirchnerista, principal oposición." },
  { id: "fit",   name: "Frente de Izquierda",       kind: "party", ideology: -0.90, power: 0.15, blurb: "Izquierda trotskista, presencia parlamentaria mínima." },
  { id: "hcf",   name: "Hacemos Coalición Federal", kind: "party", ideology: 0.20, power: 0.25, blurb: "Centro federal, dialoguista." },

  // Líderes
  { id: "milei",  name: "Javier Milei",       kind: "leader", ideology: 0.90, power: 0.95, blurb: "Presidente de la Nación." },
  { id: "villarruel", name: "Victoria Villarruel", kind: "leader", ideology: 0.75, power: 0.55, blurb: "Vicepresidenta." },
  { id: "macri",  name: "Mauricio Macri",     kind: "leader", ideology: 0.55, power: 0.60, blurb: "Ex presidente, líder del PRO." },
  { id: "cfk",    name: "Cristina Fernández", kind: "leader", ideology: -0.70, power: 0.75, blurb: "Ex presidenta, referente del kirchnerismo." },
  { id: "kicillof", name: "Axel Kicillof",    kind: "leader", ideology: -0.65, power: 0.65, blurb: "Gobernador de Buenos Aires." },
  { id: "massa",  name: "Sergio Massa",       kind: "leader", ideology: -0.30, power: 0.40, blurb: "Ex ministro de Economía." },

  // Sindicatos
  { id: "cgt",    name: "CGT",                kind: "union", ideology: -0.40, power: 0.65, blurb: "Confederación General del Trabajo." },
  { id: "cta",    name: "CTA",                kind: "union", ideology: -0.60, power: 0.35, blurb: "Central de Trabajadores de la Argentina." },
  { id: "uocra",  name: "UOCRA",              kind: "union", ideology: -0.30, power: 0.45, blurb: "Sindicato de la construcción." },
  { id: "camioneros", name: "Camioneros",     kind: "union", ideology: -0.55, power: 0.55, blurb: "Sindicato con alta capacidad de presión." },

  // Sector empresarial
  { id: "uia",    name: "UIA",                kind: "business", ideology: 0.30, power: 0.55, blurb: "Unión Industrial Argentina." },
  { id: "sra",    name: "Sociedad Rural",     kind: "business", ideology: 0.65, power: 0.50, blurb: "Representa al agro tradicional." },
  { id: "amcham", name: "AmCham",             kind: "business", ideology: 0.55, power: 0.45, blurb: "Cámara de Comercio de EE.UU. en Argentina." },
  { id: "techint", name: "Techint",           kind: "business", ideology: 0.35, power: 0.65, blurb: "Grupo industrial de gran peso." },

  // Medios
  { id: "clarin", name: "Grupo Clarín",       kind: "media", ideology: 0.40, power: 0.75, blurb: "Mayor grupo multimedia del país." },
  { id: "lanacion", name: "La Nación",        kind: "media", ideology: 0.55, power: 0.55, blurb: "Diario tradicional de centroderecha." },
  { id: "pagina12", name: "Página 12",        kind: "media", ideology: -0.65, power: 0.30, blurb: "Diario afín al kirchnerismo." },
  { id: "infobae", name: "Infobae",           kind: "media", ideology: 0.20, power: 0.60, blurb: "Medio digital de alto alcance." },
  { id: "c5n",    name: "C5N",                kind: "media", ideology: -0.55, power: 0.40, blurb: "Cable opositor." },

  // Instituciones
  { id: "diputados", name: "H. Cám. Diputados", kind: "institution", ideology: 0.0, power: 0.80, blurb: "Cámara Baja del Congreso." },
  { id: "senado",    name: "H. Cám. Senado",    kind: "institution", ideology: 0.0, power: 0.75, blurb: "Cámara Alta del Congreso." },
  { id: "csjn",      name: "Corte Suprema",     kind: "institution", ideology: 0.10, power: 0.85, blurb: "Cabeza del Poder Judicial." },
  { id: "bcra",      name: "BCRA",              kind: "institution", ideology: 0.0, power: 0.80, blurb: "Banco Central de la República Argentina." },
  { id: "fmi",       name: "FMI",               kind: "institution", ideology: 0.40, power: 0.85, blurb: "Acreedor multilateral clave." },
];

export const RELATIONS: Relation[] = [
  // Oficialismo y aliados
  { source: "milei", target: "lla", type: "ally", strength: 1.0, note: "Líder de la coalición." },
  { source: "villarruel", target: "lla", type: "ally", strength: 0.7, note: "Tensiones internas reportadas." },
  { source: "lla", target: "pro", type: "ally", strength: 0.65, note: "Alianza legislativa caso a caso." },
  { source: "macri", target: "pro", type: "ally", strength: 0.95 },
  { source: "macri", target: "milei", type: "ally", strength: 0.55, note: "Apoyo crítico." },
  { source: "lla", target: "ucr", type: "neutral", strength: 0.45, note: "UCR dividida." },
  { source: "lla", target: "hcf", type: "neutral", strength: 0.40 },

  // Oposición
  { source: "cfk", target: "uxp", type: "ally", strength: 0.95 },
  { source: "kicillof", target: "uxp", type: "ally", strength: 0.85, note: "Tensión con CFK por liderazgo." },
  { source: "cfk", target: "kicillof", type: "neutral", strength: 0.40, note: "Disputa de conducción." },
  { source: "massa", target: "uxp", type: "ally", strength: 0.60 },
  { source: "uxp", target: "lla", type: "rival", strength: 0.95 },
  { source: "fit", target: "lla", type: "rival", strength: 1.0 },
  { source: "fit", target: "uxp", type: "rival", strength: 0.55 },

  // Sindicatos
  { source: "cgt", target: "uxp", type: "ally", strength: 0.70 },
  { source: "cgt", target: "lla", type: "rival", strength: 0.85, note: "Paros generales 2024-2025." },
  { source: "cta", target: "uxp", type: "ally", strength: 0.60 },
  { source: "cta", target: "lla", type: "rival", strength: 0.90 },
  { source: "camioneros", target: "cgt", type: "ally", strength: 0.85 },
  { source: "uocra", target: "cgt", type: "ally", strength: 0.80 },

  // Empresariado
  { source: "uia", target: "lla", type: "neutral", strength: 0.55, note: "Apoyo crítico, preocupación por industria." },
  { source: "sra", target: "lla", type: "ally", strength: 0.75, note: "Quita de retenciones." },
  { source: "amcham", target: "lla", type: "ally", strength: 0.70 },
  { source: "techint", target: "lla", type: "neutral", strength: 0.55 },
  { source: "uia", target: "cgt", type: "neutral", strength: 0.45 },

  // Medios
  { source: "clarin", target: "lla", type: "neutral", strength: 0.55 },
  { source: "lanacion", target: "lla", type: "ally", strength: 0.65 },
  { source: "infobae", target: "lla", type: "neutral", strength: 0.50 },
  { source: "pagina12", target: "lla", type: "rival", strength: 0.85 },
  { source: "pagina12", target: "uxp", type: "ally", strength: 0.80 },
  { source: "c5n", target: "uxp", type: "ally", strength: 0.75 },
  { source: "c5n", target: "lla", type: "rival", strength: 0.85 },
  { source: "clarin", target: "uxp", type: "rival", strength: 0.75 },

  // Instituciones
  { source: "lla", target: "diputados", type: "neutral", strength: 0.50, note: "Minoría, depende de aliados." },
  { source: "uxp", target: "diputados", type: "neutral", strength: 0.65 },
  { source: "lla", target: "senado", type: "neutral", strength: 0.45 },
  { source: "uxp", target: "senado", type: "neutral", strength: 0.70 },
  { source: "milei", target: "csjn", type: "neutral", strength: 0.50 },
  { source: "milei", target: "bcra", type: "ally", strength: 0.85 },
  { source: "milei", target: "fmi", type: "ally", strength: 0.75, note: "Programa vigente." },
  { source: "uxp", target: "fmi", type: "rival", strength: 0.65 },
];

export const ACTOR_KIND_LABELS: Record<ActorKind, string> = {
  party: "Partido / Coalición",
  leader: "Líder político",
  union: "Sindicato",
  business: "Sector empresarial",
  media: "Medio de comunicación",
  institution: "Institución",
};

const KIND_VECTOR_WEIGHTS: Record<ActorKind, PowerVector4D> = {
  institution: { institutional: 0.98, mobilization: 0.34, financial: 0.66, narrative: 0.50 },
  leader:      { institutional: 0.86, mobilization: 0.72, financial: 0.54, narrative: 0.94 },
  party:       { institutional: 0.82, mobilization: 0.76, financial: 0.48, narrative: 0.80 },
  union:       { institutional: 0.46, mobilization: 0.98, financial: 0.52, narrative: 0.66 },
  business:    { institutional: 0.52, mobilization: 0.48, financial: 0.98, narrative: 0.62 },
  media:       { institutional: 0.30, mobilization: 0.42, financial: 0.64, narrative: 0.99 },
};

/**
 * Vector de 4 Dimensiones de Poder (Maquiavelo / Sun Bin) para cualquier actor.
 */
export function getActorPowerVector(actor: Actor): PowerVector4D {
  const weights = KIND_VECTOR_WEIGHTS[actor.kind];
  const base = Math.max(0.1, Math.min(1, actor.power)) * 100;
  const polarityBoost = Math.round(Math.abs(actor.ideology) * 6);
  const clamp = (n: number) => Math.max(10, Math.min(99, Math.round(n)));

  return {
    institutional:
      actor.powerVector?.institutional ??
      clamp(base * weights.institutional + (actor.kind === "institution" ? 4 : 0)),
    mobilization:
      actor.powerVector?.mobilization ??
      clamp(base * weights.mobilization + (actor.kind === "union" ? polarityBoost : 0)),
    financial:
      actor.powerVector?.financial ??
      clamp(base * weights.financial + (actor.kind === "business" ? 4 : 0)),
    narrative:
      actor.powerVector?.narrative ??
      clamp(base * weights.narrative + polarityBoost * 0.5),
  };
}

export const GLOBAL_ACTORS: Actor[] = [
  { id: "fed", name: "Fed / Tesoro EE.UU.", kind: "institution", ideology: 0.45, power: 0.95, blurb: "Define tasas globales de referencia y liquidez en dólares." },
  { id: "whitehouse", name: "Casa Blanca / EE.UU.", kind: "leader", ideology: 0.55, power: 0.92, blurb: "Aranceles, sanciones, política industrial y seguridad." },
  { id: "pboc", name: "China / PBoC", kind: "institution", ideology: -0.65, power: 0.90, blurb: "Fábrica del mundo, demanda de commodities y crédito estatal." },
  { id: "eu_ecb", name: "Unión Europea / BCE", kind: "institution", ideology: 0.15, power: 0.80, blurb: "Marco regulatorio verde, tasas en EUR y bloque comercial." },
  { id: "imf_wb", name: "FMI / Banco Mundial", kind: "institution", ideology: 0.35, power: 0.78, blurb: "Financiamiento multilateral y condicionalidades macroeconómicas." },
  { id: "opec_plus", name: "OPEP+ / Energía", kind: "business", ideology: 0.10, power: 0.82, blurb: "Regulación de oferta petrolera y precios energéticos globales." },
  { id: "big_tech", name: "Big Tech / IA", kind: "business", ideology: 0.30, power: 0.88, blurb: "Semiconductores, nube e infraestructura crítica de IA." },
  { id: "brics_plus", name: "Bloque BRICS+", kind: "party", ideology: -0.45, power: 0.76, blurb: "Eje de mercados emergentes y comercio en monedas locales." },
  { id: "mercosur", name: "Mercosur / LatAm", kind: "party", ideology: -0.10, power: 0.52, blurb: "Corredor agroalimentario, minero y energético sudamericano." },
  { id: "global_logistics", name: "Cadenas Logísticas", kind: "union", ideology: 0.05, power: 0.72, blurb: "Rutas marítimas, fletes internacionales y cuellos de botella." },
  { id: "wall_street", name: "Wall St. / Fondos", kind: "business", ideology: 0.70, power: 0.86, blurb: "Flujos de capital, riesgo país y valuación de activos." },
  { id: "global_media", name: "Prensa Financiera Global", kind: "media", ideology: 0.25, power: 0.68, blurb: "Formación de expectativas en Bloomberg, FT y Reuters." },
];

export const GLOBAL_RELATIONS: Relation[] = [
  { source: "fed", target: "wall_street", type: "ally", strength: 0.85, note: "Liquidez y tasas guían flujos." },
  { source: "whitehouse", target: "fed", type: "neutral", strength: 0.55, note: "Tensión por ritmo de tasas vs. crecimiento." },
  { source: "whitehouse", target: "pboc", type: "rival", strength: 0.90, note: "Disputa comercial, aranceles y tecnología." },
  { source: "whitehouse", target: "big_tech", type: "ally", strength: 0.75, note: "Liderazgo estratégico en IA." },
  { source: "pboc", target: "brics_plus", type: "ally", strength: 0.88 },
  { source: "pboc", target: "global_logistics", type: "ally", strength: 0.80 },
  { source: "pboc", target: "mercosur", type: "ally", strength: 0.70, note: "Socio clave en soja, litio y proteínas." },
  { source: "eu_ecb", target: "whitehouse", type: "ally", strength: 0.70 },
  { source: "eu_ecb", target: "mercosur", type: "neutral", strength: 0.55, note: "Negociación comercial UE-Mercosur." },
  { source: "imf_wb", target: "fed", type: "ally", strength: 0.80 },
  { source: "imf_wb", target: "mercosur", type: "neutral", strength: 0.60 },
  { source: "opec_plus", target: "brics_plus", type: "ally", strength: 0.72 },
  { source: "opec_plus", target: "whitehouse", type: "rival", strength: 0.65 },
  { source: "wall_street", target: "big_tech", type: "ally", strength: 0.90 },
  { source: "global_media", target: "wall_street", type: "ally", strength: 0.75 },
  { source: "global_logistics", target: "opec_plus", type: "neutral", strength: 0.65 },
];

export const ENTERPRISE_ACTORS: Actor[] = [
  { id: "board", name: "Directorio / Socios", kind: "leader", ideology: 0.45, power: 0.90, blurb: "Conducción estratégica, apetito de riesgo y asignación de capital." },
  { id: "key_clients", name: "Clientes Clave (80/20)", kind: "business", ideology: 0.10, power: 0.88, blurb: "Cuentas que concentran facturación y poder de negociación de precios." },
  { id: "competitor", name: "Competidor Dominante", kind: "party", ideology: 0.60, power: 0.80, blurb: "Referente del sector capaz de responder con guerra de precios o bundles." },
  { id: "suppliers", name: "Proveedores Críticos", kind: "business", ideology: 0.25, power: 0.72, blurb: "Insumos importados, licencias o materias primas con alto costo de reemplazo." },
  { id: "banks", name: "Bancos / Financiamiento", kind: "institution", ideology: 0.50, power: 0.78, blurb: "Líneas de crédito, tasas de descuento y calificación crediticia." },
  { id: "team_union", name: "Equipo Clave / Sindicato", kind: "union", ideology: -0.45, power: 0.70, blurb: "Talento crítico de ejecución, productividad y paritarias." },
  { id: "regulator", name: "Regulador / Fisco", kind: "institution", ideology: -0.20, power: 0.82, blurb: "Autoridad impositiva, aduanera, laboral y habilitaciones." },
  { id: "channels", name: "Canal Digital / Aliados", kind: "party", ideology: 0.15, power: 0.64, blurb: "Socios de distribución, marketplaces y ecosistemas complementarios." },
  { id: "investors", name: "Inversores / Acreedores", kind: "business", ideology: 0.75, power: 0.76, blurb: "Expectativas de retorno, dividendos y covenants financieros." },
  { id: "brand_media", name: "Comunidad / Reputación", kind: "media", ideology: -0.10, power: 0.68, blurb: "Percepción de marca, reseñas y licencia social en medios/redes." },
];

export const ENTERPRISE_RELATIONS: Relation[] = [
  { source: "board", target: "investors", type: "ally", strength: 0.85, note: "Alineación por rentabilidad y crecimiento." },
  { source: "board", target: "key_clients", type: "ally", strength: 0.80 },
  { source: "board", target: "competitor", type: "rival", strength: 0.90, note: "Disputa directa por cuota de mercado y talento." },
  { source: "board", target: "channels", type: "ally", strength: 0.72 },
  { source: "key_clients", target: "competitor", type: "neutral", strength: 0.65, note: "Pueden arbitrar precios si no hay diferenciación." },
  { source: "suppliers", target: "board", type: "neutral", strength: 0.60, note: "Plazos de pago y traspaso de tipo de cambio." },
  { source: "banks", target: "board", type: "neutral", strength: 0.68 },
  { source: "banks", target: "investors", type: "ally", strength: 0.75 },
  { source: "team_union", target: "board", type: "neutral", strength: 0.62, note: "Negociación salarial e incentivos de productividad." },
  { source: "regulator", target: "board", type: "neutral", strength: 0.70, note: "Cumplimiento fiscal y regulatorio." },
  { source: "brand_media", target: "key_clients", type: "ally", strength: 0.78 },
  { source: "channels", target: "key_clients", type: "ally", strength: 0.74 },
];

export type GraphNetworkId = "AR" | "GLOBAL" | "EMPRESA";

export const GRAPH_NETWORKS: Record<
  GraphNetworkId,
  {
    id: GraphNetworkId;
    label: string;
    badge: string;
    description: string;
    actors: Actor[];
    relations: Relation[];
  }
> = {
  AR: {
    id: "AR",
    label: "🇦🇷 Argentina (Político-Económico)",
    badge: "30 actores · Nacional",
    description:
      "Red de coaliciones, líderes, sindicatos, cámaras empresariales, medios e instituciones del Estado en Argentina.",
    actors: ACTORS,
    relations: RELATIONS,
  },
  GLOBAL: {
    id: "GLOBAL",
    label: "🌐 Geopolítica y Mercados Globales",
    badge: "12 potencias y nodos",
    description:
      "Mapa multipolar entre bancos centrales, potencias, bloques comerciales, energía, Big Tech y flujos financieros.",
    actors: GLOBAL_ACTORS,
    relations: GLOBAL_RELATIONS,
  },
  EMPRESA: {
    id: "EMPRESA",
    label: "🏢 Ecosistema de Mi Empresa / Stakeholders",
    badge: "10 stakeholders + Editable",
    description:
      "Red de poder alrededor de cualquier empresa: clientes 80/20, competidores, proveedores, bancos, regulador y equipo. Podés agregar nodos propios.",
    actors: ENTERPRISE_ACTORS,
    relations: ENTERPRISE_RELATIONS,
  },
};
