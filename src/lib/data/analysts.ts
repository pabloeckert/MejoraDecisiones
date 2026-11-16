// Analistas nacionales e internacionales
// Migrado de nash-dashboard/app.js

export type Analyst = {
  name: string;
  outlet: string;
  stance: "bullish" | "bearish" | "neutral";
  quote: string;
};

export const ANALYSTS_NATIONAL: Analyst[] = [
  {
    name: "Carlos Pagni",
    outlet: "La Nación / LN+",
    stance: "neutral",
    quote: "La interna del oficialismo hacia 2027 no es solo de estilos, sino de sucesión y armado territorial. Quien controle las listas legislativas definirá el margen de maniobra del próximo mandato.",
  },
  {
    name: "Eduardo van der Kooy",
    outlet: "Clarín",
    stance: "bullish",
    quote: "El Senado sigue siendo el terreno donde se definen los límites del poder presidencial. Sin acuerdos interbloque con Provincias Unidas, cada veto implica un costo político creciente.",
  },
  {
    name: "Marina Dal Poggetto",
    outlet: "EcoGo Consultores",
    stance: "bearish",
    quote: "La consolidación fiscal es incuestionable, pero la salida del cepo y el ancla cambiaria exigen un colchón de reservas genuinas mucho mayor para evitar un salto de volatilidad en el año electoral 2027.",
  },
  {
    name: "Sergio Berensztein",
    outlet: "Poliarquía / Bloomberg Línea",
    stance: "neutral",
    quote: "La aprobación se consolida en torno al 40-42%, pero con una polarización asimétrica: la tolerancia social al plan económico depende de que la desinflación perfore el 2% sostenido.",
  },
  {
    name: "Rosendo Fraga",
    outlet: "Centro de Estudios Nueva Mayoría",
    stance: "bullish",
    quote: "El escenario electoral 2027 comenzará a diseñarse hacia fines de 2026. Los gobernadores del centro y del norte buscarán provincializar comicios para maximizar apalancamiento.",
  },
  {
    name: "Alejandro Catterberg",
    outlet: "Poliarquía",
    stance: "bearish",
    quote: "El humor social muestra dos velocidades: optimismo en sectores exportadores e inversores, y cautela estricta en el consumo masivo y pymes urbanas.",
  },
];

export const ANALYSTS_INTL: Analyst[] = [
  {
    name: "The Economist Intelligence Unit",
    outlet: "The Economist",
    stance: "neutral",
    quote: "Argentina's fiscal transformation marks a rare turnaround in modern emerging market history. The challenge now is translating fiscal discipline into durable institutional depth ahead of the 2027 electoral cycle.",
  },
  {
    name: "Bloomberg Economics",
    outlet: "Bloomberg",
    stance: "bullish",
    quote: "With country risk compressing toward 800 bps, voluntary market access is the ultimate litmus test for 2026–2027 debt amortizations. Disinflation progress remains the anchor.",
  },
  {
    name: "Financial Times — Editorial",
    outlet: "FT",
    stance: "neutral",
    quote: "President Milei's radical reform agenda enters its structural execution phase: regulatory consolidation and foreign direct investment under the RIGI framework.",
  },
  {
    name: "Moody's Analytics",
    outlet: "Moody's",
    stance: "bullish",
    quote: "Credit profile upgrades depend on sustained primary surpluses and foreign reserve accumulation at BCRA through the 2026-2027 transition.",
  },
  {
    name: "Reuters — Emerging Markets",
    outlet: "Reuters",
    stance: "neutral",
    quote: "Latin American asset managers maintain selective positioning. Carry-trade adjustments and global tariff shifts represent the principal exogenous vulnerabilities.",
  },
];
