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
    name: "Marina Dal Poggetto",
    outlet: "EcoGo",
    stance: "bearish",
    quote: "El ancla fiscal y el superávit financiero son indiscutibles, pero el esquema hacia 2027 exige acumulación neta de reservas y resolver la competitividad cambiaria sin disparar la inflación.",
  },
  {
    name: "Sergio Berensztein",
    outlet: "Berensztein / Bloomberg Línea",
    stance: "neutral",
    quote: "Rumbo al ciclo electoral 2027, la aprobación presidencial se estabiliza en torno al 40-42%, pero la relación con los bloques federales de gobernadores es el fiel de la balanza de gobernabilidad.",
  },
  {
    name: "Rosendo Fraga",
    outlet: "Nuevo Mundo",
    stance: "bullish",
    quote: "El despliegue comercial con el Mercosur y las inversiones estratégicas en el RIGI (Vaca Muerta y Minería) consolidan el perfil exportador argentino en la previa del año electoral 2027.",
  },
  {
    name: "Alejandro Catterberg",
    outlet: "Poliarquía",
    stance: "bearish",
    quote: "Los bloques provinciales en el Congreso operan con autonomía estratégica: apoyan reformas pro-inversión pero condicionan el quórum a la restitución de partidas coparticipables para 2027.",
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
