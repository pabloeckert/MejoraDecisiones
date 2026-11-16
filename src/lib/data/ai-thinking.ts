// Pensamiento IA — consenso de 5 modelos de frontera 2026-2027
// Migrado de nash-dashboard/app.js y calibrado a escenario 2026-2027

export type AIThought = {
  source: string;
  text: string;
  confidence: string;
};

export const AI_THINKING: AIThought[] = [
  {
    source: "Frontier Reasoning (GPT-5 class) — análisis geopolítico",
    text: "El equilibrio macro argentino hacia 2027 muestra resiliencia fiscal pero alta selectividad crediticia. Con un superávit primario en torno al 1,4% del PIB y el ancla fiscal sostenida, la estrategia dominante es mantener disciplina presupuestaria mientras la inversión privada y las exportaciones energéticas absorben el crecimiento.",
    confidence: "80% confianza en escenario base de estabilización",
  },
  {
    source: "Claude 3.7 Sonnet — modelo macrofinanciero",
    text: "La dinámica de desinflación ha encontrado un piso estructural mensual en torno al 2,1%-2,4%. El riesgo de cola principal ya no es hiperinflación sino la divergencia entre sectores transables (Vaca Muerta, minería, tech) y el consumo masivo doméstico, en un contexto global de tasas de la Fed en rango 4,5%-5,0%.",
    confidence: "85% confianza en piso inflacionario 2026-2027",
  },
  {
    source: "Gemini 2.5 Pro — dinámica federal y legislativa",
    text: "Provincias Unidas y los gobernadores del centro y Patagonia se consolidan como árbitros indispensables del Congreso. En términos de teoría de juegos, su función de utilidad maximiza fondos de infraestructura sin ruptura institucional, jugando a un equilibrio de cooperación condicionada hacia las elecciones 2027.",
    confidence: "76% confianza en poder de veto federal",
  },
  {
    source: "Llama 3.3 — análisis sociopolítico y electoral",
    text: "La opinión pública se estructura en tercios estables: el tercio libertario-republicano duro (~38-42%), el tercio opositor consolidado (~32-35%) y un tercio flotante pragmático que vota en función del crédito hipotecario, el salario real y la estabilidad de precios de cara a 2027.",
    confidence: "72% confianza en estructura tripartita",
  },
  {
    source: "DeepSeek R1 — modelado estocástico de colas y liquidez",
    text: "Comparado con los ciclos de estabilización latinoamericanos: las reservas brutas del BCRA en USD 38.000M+ y el superávit comercial energético amortiguan shocks cambiarios severos. La métrica crítica centinela es la brecha cambiaria (>15%) y el spread de riesgo país (>950 bps).",
    confidence: "79% confianza en modelos de absorción de shock",
  },
];
