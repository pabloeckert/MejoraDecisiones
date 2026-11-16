// Feed de fuentes y análisis macroestratégico
// Migrado de nash-dashboard/app.js y calibrado a 2026-2027

export type FeedItem = {
  source: string;
  text: string;
  tag: string;
};

export const FEED_ITEMS: FeedItem[] = [
  { source: "The Economist Intelligence", text: "'Argentina's fiscal consolidation faces the test of the 2027 electoral cycle and structural reform delivery.'", tag: "análisis" },
  { source: "FMI WEO Octubre 2026 / 2027", text: "Proyección PIB 2027: +3,2%. Inflación anual proyectada: 28-32%.", tag: "dato" },
  { source: "Bloomberg Línea", text: "Inversiones del RIGI en energía y minería superan USD 12.000M comprometidos hacia 2027.", tag: "investigación" },
  { source: "Carlos Pagni", text: "'El balance de poder con los gobernadores provinciales define el piso de gobernabilidad legislativa.'", tag: "columnista" },
  { source: "Poliarquía", text: "Aprobación de gestión estabilizada en ~42% con alta polarización de cara a 2027.", tag: "sondeo" },
  { source: "IERAL", text: "Consolidación de superávit primario de 1,4% del PIB y reactivación del crédito al sector privado.", tag: "proyección" },
  { source: "Deloitte LATAM", text: "Exportaciones de Vaca Muerta y complejo litífero proyectan récord de divisas netas para 2027.", tag: "dato" },
  { source: "WEF", text: "Argentina escala posiciones en libertad económica y apertura de mercados de capitales.", tag: "internacional" },
  { source: "CERA / CAC", text: "PyMEs industriales demandan alivio de costos logísticos y modernización impositiva para competir.", tag: "gremial" },
];
