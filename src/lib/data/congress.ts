// Datos del Congreso de la Nación Argentina
// Migrado de nash-dashboard/app.js

export type Block = {
  name: string;
  seats: string;
  position: string;
  note: string;
};

export type AgendaItem = {
  project: string;
  state: string;
  stateClass: string;
  actors: string;
  analysis: string;
};

export const CONGRESS = {
  diputados: {
    president: "Martín Menem (LLA)",
    twoThirds: 172,
    blocks: [
      { name: "La Libertad Avanza", seats: "~130+", position: "oficialismo", note: "Primera minoría. Controla agenda." },
      { name: "Unión por la Patria", seats: "~99", position: "oposición dura", note: "Máximo Kirchner." },
      { name: "PRO", seats: "~38", position: "aliado táctico", note: "Bullrich + Macri oscilan." },
      { name: "Provincias Unidas", seats: "~28", position: "bisagra", note: "Votan caso a caso." },
      { name: "UCR / Evolución", seats: "~22", position: "volátil", note: "Dividido tema a tema." },
    ] as Block[],
  },
  senado: {
    president: "Victoria Villarruel (LLA)",
    blocks: [
      { name: "Unión por la Patria", seats: "~33", position: "oposición", note: "Llave de PASO." },
      { name: "La Libertad Avanza", seats: "~22", position: "oficialismo", note: "Creció oct-2025." },
      { name: "PRO", seats: "~8", position: "táctico", note: "Gadano (Santa Cruz)." },
      { name: "Peronismo aliado", seats: "~12", position: "negociador", note: "Jaldo, Jalil, Sáenz." },
    ] as Block[],
  },
  villarruel: {
    role: "Presidenta del Senado. Poder de desempate.",
    tension: "Distanciamiento público con Milei. Perfil propio.",
    alliances: [
      ["Milei", "weak"] as const,
      ["PRO", "neutral"] as const,
      ["Sector militar", "solid"] as const,
    ],
  },
  agenda: [
    { project: "Reforma laboral", state: "Aprobada ✓", stateClass: "text-green", actors: "Provincias Unidas + PRO", analysis: "ATN como precio" },
    { project: "Acuerdo Mercosur-UE", state: "Media sanción ✓", stateClass: "text-green", actors: "Cancillería + oposición", analysis: "Consenso amplio" },
    { project: "Eliminación PASO", state: "En debate ⟳", stateClass: "text-amber", actors: "Senado KA", analysis: "Precio alto" },
    { project: "Baja imputabilidad", state: "Aprobada ✓", stateClass: "text-green", actors: "Bullrich / PRO", analysis: "Victoria imagen" },
    { project: "Presupuesto 2026", state: "Aprobado ✓", stateClass: "text-green", actors: "Acuerdo amplio", analysis: "1ra victoria post oct" },
  ] as AgendaItem[],
};
