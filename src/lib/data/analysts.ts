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
    quote: "La interna Karina-Caputo no es una disputa de estilos. Es una disputa por quién conduce la Argentina después de Milei. El presidente lo sabe y por eso no elige — porque elegir es definir su propio sucesor.",
  },
  {
    name: "Eduardo van der Kooy",
    outlet: "Clarín",
    stance: "bullish",
    quote: "Villarruel es el comodín que nadie mira. Desde el Senado está construyendo silenciosamente su propio espacio. Si LLA se fractura, ella tiene la llave del Senado.",
  },
  {
    name: "Jorge Lanata",
    outlet: "LN+/Radio Mitre",
    stance: "bearish",
    quote: "El modelo económico funciona en el Excel pero la calle dice otra cosa. Los números macro son reales pero la gente no llega a fin de mes. Esa contradicción tiene fecha de vencimiento.",
  },
  {
    name: "Sergio Berensztein",
    outlet: "Poliarquía / Bloomberg Línea",
    stance: "neutral",
    quote: "La aprobación de Milei mantiene 40%+ pero el núcleo duro es más estrecho que el voto de octubre 2025. La economía es el único driver — si la inflación no baja, todo se complica.",
  },
  {
    name: "Rosendo Fraga",
    outlet: "Nuevo Mundo",
    stance: "bullish",
    quote: "El acuerdo Mercosur-UE es el hito más importante de política exterior en 20 años. Beneficia al agro y al sector automotriz. Milei lo usará como carta de reelección.",
  },
  {
    name: "Alejandro Catterberg",
    outlet: "Poliarquía",
    stance: "bearish",
    quote: "Encuesta interna: los gobernadores aliados están en modo 'esperar y ver'. Si la economía no despega antes de septiembre, la deserción legislativa es inevitable.",
  },
];

export const ANALYSTS_INTL: Analyst[] = [
  {
    name: "The Economist Intelligence Unit",
    outlet: "The Economist",
    stance: "neutral",
    quote: "Argentina is a case study in whether shock therapy can work in a democracy. The fiscal results are real; the social costs, also real. The Nash equilibrium favors continued austerity.",
  },
  {
    name: "Bloomberg Economics",
    outlet: "Bloomberg",
    stance: "bullish",
    quote: "Milei's stabilization is the most credible since Convertibilidad. Risk premium at 634bp from 2000+ shows market confidence. But inflation convergence to target is the make-or-break variable.",
  },
  {
    name: "Financial Times — Editorial",
    outlet: "FT",
    stance: "neutral",
    quote: "The Argentine experiment is being watched globally. If it works, it validates libertarian economics in emerging markets. If it fails, it's a cautionary tale for the next populist-turned-reformer.",
  },
  {
    name: "Moody's Analytics",
    outlet: "Moody's",
    stance: "bullish",
    quote: "Argentina's credit profile is improving. Superávit fiscal sostenido + desinflación gradual = upgrade path. Risk: interna política puede descarrilar el programa.",
  },
  {
    name: "Reuters — Emerging Markets",
    outlet: "Reuters",
    stance: "neutral",
    quote: "Latin American fund managers are cautiously long Argentina. The carry trade is attractive but hedging costs remain high. Key variable: BCRA reserves trajectory.",
  },
];
