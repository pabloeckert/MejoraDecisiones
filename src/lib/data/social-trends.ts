// Tendencias en redes sociales
// Migrado de nash-dashboard/app.js

export type SocialTrend = {
  platform: "twitter" | "reddit" | "youtube" | "telegram";
  icon: string;
  topic: string;
  heat: number;
  trend: string;
  change: string;
};

export const SOCIAL_TRENDS: SocialTrend[] = [
  {
    platform: "twitter",
    icon: "𝕏",
    topic: "#KarinaGate",
    heat: 92,
    trend: "Explosión de tuits sobre la interna Karina vs Caputo. 48k menciones en 24h. Memes, filtraciones y análisis cruzados.",
    change: "+340%",
  },
  {
    platform: "reddit",
    icon: "📡",
    topic: "r/argentina — '¿Milei 2027?'",
    heat: 78,
    trend: "Debate extenso sobre reelección. Consenso: economía mejora pero interna preocupa. 2.1k comentarios.",
    change: "+120%",
  },
  {
    platform: "youtube",
    icon: "📺",
    topic: "Luis Majul — 'La noche de los tapados'",
    heat: 85,
    trend: "Entrevista reveladora sobre actores en la sombra. 890k views en 18h. Trending #1 Argentina.",
    change: "Nuevo",
  },
  {
    platform: "telegram",
    icon: "✈️",
    topic: "Canales libertarios — 'Fuerzas del Cielo'",
    heat: 70,
    trend: "Ecosistema digital de Caputo bajo presión. Gordo Dan publicó 14 mensajes en 6h. Señal de nerviosismo.",
    change: "+85%",
  },
  {
    platform: "twitter",
    icon: "𝕏",
    topic: "#Desdoblamiento2027",
    heat: 65,
    trend: "Gobernadores twittean sobre elecciones provinciales desdobladas. Tendencia creciente en interior.",
    change: "+200%",
  },
  {
    platform: "reddit",
    icon: "📡",
    topic: "r/merval — 'Riesgo país 634'",
    heat: 58,
    trend: "Análisis técnico de bonos. Optimismo cauteloso. Algunos usuarios reportan compras en AL35.",
    change: "+45%",
  },
];
