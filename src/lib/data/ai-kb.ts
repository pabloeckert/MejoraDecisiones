// Knowledge base para consultas IA
// Migrado de nash-dashboard/app.js

export type KBEntry = {
  answer: string;
  sources: string;
};

export const AI_KB: Record<string, KBEntry> = {
  inflacion: {
    answer: "La inflación de marzo 2026 fue 3,4% mensual, acumulando ~30% anual. El BCRA proyecta convergencia a 20-22% para diciembre, pero el FMI estima 30,4%. El punto de quiebre del modelo Nash es 35% anual — por encima de eso, el equilibrio migra a crisis.",
    sources: "BCRA REM, FMI WEO, IERAL",
  },
  pobreza: {
    answer: "Pobreza 31,6% (INDEC). La canasta básica supera $350.000/hogar. El ajuste fiscal mantiene superávit pero erosiona capacidad de compra. Las PyMEs son las más afectadas — 62% reportó caída de ventas. El dilema Nash: austeridad sostenida genera credibilidad pero riesgo social.",
    sources: "INDEC, Poliarquía, IERAL",
  },
  milei: {
    answer: "Milei opera como 'árbitro supremo' en el modelo Nash. Su función de utilidad maximiza imagen para reelección 2027. No elige en la interna Karina-Caputo porque elegir es definir sucesor. Estrategia dominante: consolidar superávit + desinflación como narrativa central.",
    sources: "Análisis propio, Pagni, van der Kooy",
  },
  karina: {
    answer: "Karina Milei controla 4 de 9 ministerios (Defensa, Seguridad, Justicia, Interior). Impulsa desplazamiento de Caputo de SIDE. Armado territorial vertical. Su poder es orgánico, no institucional. Bloqueó 203 ternas de jueces de Caputo durante 2 años.",
    sources: "Infobae, LN+, análisis interno",
  },
  provincias: {
    answer: "24 provincias con 3 bloques: aliadas (10), neutrales (9), hostiles (5). El desdoblamiento 2027 es la jugada dominante — cada gobernador tiene incentivo a desdoblar. Se esperan 12-14 provincias desdobladas. Provincias Unidas emerge como tercer polo.",
    sources: "VisionPolítica, Infobae, análisis propio",
  },
  pymes: {
    answer: "62% de PyMEs con caída de ventas. 41% redujo personal. Solo 28% accede a crédito. Sectores resilientes: agro (82%), tech (88%), servicios profesionales (68%). Sectores críticos: construcción (30%), comercio minorista (42%), manufactura (38%).",
    sources: "CAME, PyMEs Argentinas, Deloitte",
  },
  fmi: {
    answer: "Segunda revisión del programa FMI esperada. Desembolso potencial USD 1.000M. Riesgo país cayó de ~2.000 a 634pb. Condicionalidad: metas fiscales y cambiarias. Si se cumple, el equilibrio Nash se estabiliza. Si no, migra a escenario C.",
    sources: "FMI, BCRA, Bloomberg",
  },
  default: {
    answer: "Basado en el modelo Nash actual: el sistema político argentino opera en equilibrio no cooperativo de segundo orden. Milei maximiza poder post-electoral, gobernadores cooperan legislativamente por ATN, oposición fragmentada. El FMI disciplina el eje económico. Punto de quiebre: inflación >35%.",
    sources: "Modelo Nash Tablero, fuentes múltiples",
  },
};
