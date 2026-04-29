// Pensamiento IA — consenso de 5 modelos
// Migrado de nash-dashboard/app.js

export type AIThought = {
  source: string;
  text: string;
  confidence: string;
};

export const AI_THINKING: AIThought[] = [
  {
    source: "GPT-4o — análisis geopolítico",
    text: "El equilibrio argentino es frágil pero resiliente. La interna Karina-Caputo es el factor de mayor incertidumbre. Si se resuelve antes de junio, la probabilidad de estabilización sube 12 puntos. El modelo Nash sugiere que Milei tiene estrategia dominante: consolidar el superávit y dejar que la interna se resuelva por desgaste natural.",
    confidence: "78% confianza en escenario base",
  },
  {
    source: "Claude 3.5 — modelo económico",
    text: "La paradoja argentina: superávit fiscal récord pero pobreza creciente. El modelo de Nash muestra que el gobierno maximiza utilidad al mantener austeridad incluso con costo social, porque el FMI actúa como 'jugador disciplinador'. El punto de quiebre es inflación >35% anual — ahí el equilibrio migra a crisis.",
    confidence: "82% confianza en análisis de quiebre",
  },
  {
    source: "Gemini Pro — análisis político",
    text: "Provincias Unidas emerge como el 'tercer jugador' más importante del tablero. Llaryora, Pullaro y Torres construyen identidad propia. En el modelo de Nash, su función de utilidad es maximizar transferencias sin comprometer autonomía. El desdoblamiento 2027 es su jugada dominante.",
    confidence: "71% confianza en tercer polo",
  },
  {
    source: "Llama 3.1 — análisis social",
    text: "El factor evangélico está subestimado en los modelos actuales. 10-15% del padrón con capacidad de movilización territorial comparable al peronismo. Si el ajuste social erosiona la base de pastores barriales, el costo para LLA puede ser irreversible. El 'voto evangélico' no es monolítico.",
    confidence: "65% confianza en riesgo evangélico",
  },
  {
    source: "DeepSeek V2 — modelado de crisis",
    text: "Comparando con México 1994 y Argentina 2001: el factor diferenciador es la posición externa. Reservas del BCRA en USD 9.500M + FMI como respaldo reducen probabilidad de crisis cambiaria aguda. Pero la brecha cambiaria es el indicador adelantado clave — si supera 15%, el modelo migra a tail risk.",
    confidence: "74% confianza en comparación histórica",
  },
];
