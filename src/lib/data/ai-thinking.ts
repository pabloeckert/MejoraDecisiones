// Pensamiento IA — consenso de 5 modelos
// Migrado de nash-dashboard/app.js

export type AIThought = {
  source: string;
  text: string;
  confidence: string;
};

export const AI_THINKING: AIThought[] = [
  {
    source: "Gemini 2.5 Flash — análisis geopolítico y trade",
    text: "El equilibrio macro argentino hacia 2027 muestra un desacople positivo respecto al riesgo emergente, condicionado a la balanza energética (Vaca Muerta y GNL). En teoría de juegos, el gobierno mantiene una estrategia dominante al priorizar anclaje fiscal, pero el costo de oportunidad legislativo se eleva al acercarse el ciclo 2027.",
    confidence: "82% confianza en escenario base macro",
  },
  {
    source: "Claude 3.7 Sonnet — dinámica de sistemas y deuda",
    text: "La paradoja de estabilización: la compresión del riesgo país coexiste con un consumo interno selectivo. El FMI y los acreedores externos operan como anclas disciplinadoras. El punto de inflexión del sistema reside en la velocidad de acumulación de reservas netas frente al perfil de vencimientos de 2027.",
    confidence: "85% confianza en modelado de reservas",
  },
  {
    source: "OpenAI o3 — análisis institucional y parlamentario",
    text: "El tercio de bloqueo en Diputados y el rol de Provincias Unidas configuran un juego de veto permanente. Los gobernadores maximizan apalancamiento territorial sin romper puentes institucionales. El equilibrio de Nash favorece acuerdos transaccionales ley por ley antes que una coalición orgánica.",
    confidence: "79% confianza en equilibrio parlamentario",
  },
  {
    source: "Llama 3.3 — opinión pública y tejido social",
    text: "La tolerancia social se sostiene en la desinflación continua. La elasticidad ante nuevos ajustes tarifarios es decreciente. Si la inflación mensual se afianza en torno al 2%, el oficialismo conserva competitividad plena hacia las elecciones 2027.",
    confidence: "74% confianza en cohesión de opinión pública",
  },
  {
    source: "DeepSeek R1 — stress-test cuantitativo y tail risk",
    text: "Matriz de riesgos de cola: los factores exógenos más críticos son la fortaleza del dólar global y la volatilidad del Real brasileño. Un salto de la brecha cambiaria por encima del 15% detonaría presiones sobre la curva de pesos; la cobertura en liquidez preventiva es mandatoria.",
    confidence: "80% confianza en stress-testing de colas",
  },
];
