// Escenarios Nash — modelo probabilístico calibrado a 2026-2027
// Migrado de nash-dashboard/app.js

export type Scenario = {
  title: string;
  pct: number;
  color: string;
  tag: string;
  body: string;
  indicators: string[];
};

export const SCENARIOS: Scenario[] = [
  {
    title: "A — Consolidación y Despegue Exportador 2027",
    pct: 35,
    color: "var(--green)",
    tag: "Nash cooperativo",
    body: "Superávit primario sostenido (~1,4% PIB). Vaca Muerta, minería y agro impulsan PIB al +3,0-3,5%. Inflación mensual anclada en 2,0-2,4%. Riesgo país comprime hacia 650 bps.",
    indicators: ["Inflación mensual <2,4%", "Riesgo país <700 bps", "Superávit financiero continuo"],
  },
  {
    title: "B — Estanflación y Fricción Pre-Electoral 2027",
    pct: 30,
    color: "var(--amber)",
    tag: "Nash desequilibrio",
    body: "Piso inflacionario persistente (~2,5-3,2% mensual). Consumo interno amesetado. Gobernadores provinciales endurecen la negociación fiscal y presupuestaria en el Congreso.",
    indicators: ["Inflación mensual >2,8%", "Tensión cambiaria puntual", "Bloques provinciales condicionan quórum"],
  },
  {
    title: "C — Shock Externo y Tasas Globales Altas",
    pct: 20,
    color: "var(--red)",
    tag: "Nash crisis",
    body: "Reserva Federal mantiene tasas 'Higher-for-Longer'. Fricciones comerciales globales y apreciación del dólar presionan a monedas emergentes y reducen flujos de capital.",
    indicators: ["Treasury 10Y >5,0%", "Dólar global fortalecido", "Brecha cambiaria >15%"],
  },
  {
    title: "D — Bloques Federales como Eje de Gobernabilidad",
    pct: 10,
    color: "var(--purple)",
    tag: "Nuevo equilibrio",
    body: "Provincias Unidas y gobernadores patagónicos articulan mayorías móviles parlamentarias, garantizando estabilidad institucional a cambio de reactivación de obras públicas estratégicas.",
    indicators: ["Bloque federal >35 bancas", "Pactos fiscales por provincia", "Blindaje institucional"],
  },
  {
    title: "E — Ruptura Sistémica y Estrés de Deuda",
    pct: 5,
    color: "var(--red)",
    tag: "Tail risk",
    body: "Shock geopolítico severo o crisis de financiamiento internacional. Riesgo país trepa sobre 1.200 bps forzando canje de deuda o controles extraordinarios.",
    indicators: ["Riesgo país >1.200 bps", "Interrupción de crédito externo", "Estrés de liquidez"],
  },
];
