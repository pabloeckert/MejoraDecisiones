// Feed de fuentes y análisis
// Migrado de nash-dashboard/app.js

export type FeedItem = {
  source: string;
  text: string;
  tag: string;
};

export const FEED_ITEMS: FeedItem[] = [
  { source: "The Economist — 2026", text: "'Argentina is a case study in shock therapy in democracy.'", tag: "análisis" },
  { source: "FMI WEO Abril 2026", text: "PIB +3,5% (↓). Inflación 30,4% (↑).", tag: "dato" },
  { source: "Bloomberg Línea", text: "ATN de $20.000M a 6 provincias antes de reforma laboral. 'Fondos por votos'.", tag: "investigación" },
  { source: "Carlos Pagni", text: "'La interna Karina-Caputo define quién conduce después de Milei.'", tag: "columnista" },
  { source: "Poliarquía", text: "LLA 40%+ imagen positiva pero núcleo duro más estrecho.", tag: "sondeo" },
  { source: "IERAL", text: "Proyección inflación 23% dic-2026. Optimista: 18%. Pesimista: 30%.", tag: "proyección" },
  { source: "Deloitte LATAM", text: "PIB 2025: +4,4%. Finanzas y minería lideraron.", tag: "dato" },
  { source: "WEF", text: "Argentina: mayor mejora libertad económica global 2025.", tag: "internacional" },
  { source: "VisionPolítica", text: "Milei presiona a gobernadores para evitar desdoblamientos.", tag: "análisis" },
];
