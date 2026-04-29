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

export type Actor = {
  id: string;
  name: string;
  kind: ActorKind;
  ideology: number;       // -1 (izquierda) ... +1 (derecha)
  power: number;          // 0..1, peso relativo
  blurb: string;
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
