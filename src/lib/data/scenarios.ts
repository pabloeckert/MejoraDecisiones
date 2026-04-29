// Escenarios Nash — modelo probabilístico
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
    title: "A — Consolidación libertaria",
    pct: 35,
    color: "var(--green)",
    tag: "Nash cooperativo",
    body: "Karina desplaza Caputo. Economía 3-3,5%. Inflación 20-22%. FMI aprueba. Milei 2027.",
    indicators: ["Inflación <2,5%/mes", "Riesgo <600", "Superávit sostenido"],
  },
  {
    title: "B — Parálisis por interna",
    pct: 30,
    color: "var(--amber)",
    tag: "Nash desequilibrio",
    body: "Interna no resuelve. Inflación >2,5% Q3. Gobernadores se distancian.",
    indicators: ["Inflación >2,5% Q3", "Renuncia ministro", "PRO se distancia"],
  },
  {
    title: "C — Shock externo",
    pct: 20,
    color: "var(--red)",
    tag: "Nash crisis",
    body: "Medio Oriente escala. Inflación >35%. FMI retrasa.",
    indicators: ["Petróleo >$120", "FMI retrasa", "Brecha >15%"],
  },
  {
    title: "D — Provincias Unidas 3er polo",
    pct: 10,
    color: "var(--purple)",
    tag: "Nuevo equilibrio",
    body: "Bisagra legislativa autónoma. Tres jugadores.",
    indicators: ["PU >35 diputados", "Vetos coordinados"],
  },
  {
    title: "E — Ruptura sistémica",
    pct: 5,
    color: "var(--red)",
    tag: "Tail risk",
    body: "Shock + crisis + FMI cancela + movilización.",
    indicators: ["Crisis bancaria", "FMI cancela"],
  },
];
