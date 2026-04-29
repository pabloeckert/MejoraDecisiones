// Panel PyME — diagnóstico sectorial
// Migrado de nash-dashboard/app.js

export type PymeSector = {
  icon: string;
  name: string;
  detail: string;
  bar: number;
  color: string;
};

export type PymeIndicator = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
};

export type PymePolicy = {
  name: string;
  impact: string;
  detail: string;
};

export type PymeScenario = {
  title: string;
  pct: number;
  color: string;
  detail: string;
};

export const PYMES_DIAGNOSIS: PymeSector[] = [
  { icon: "🏭", name: "Manufactura", detail: "62% reportó caída de ventas en Q1 2026. Costos de insumos importados subieron 18% por devaluación. Cadena automotriz afectada por incertidumbre Brasil.", bar: 38, color: "var(--red)" },
  { icon: "🛒", name: "Comercio minorista", detail: "Caída del consumo real 8% interanual. PyMEs de barrio pierden contra cadenas grandes. E-commerce crece 22% pero desde base baja.", bar: 42, color: "var(--amber)" },
  { icon: "🔧", name: "Servicios profesionales", detail: "Consultoría y software como sectores resilientes. Exportación de servicios crece 15%. Talento joven migra a freelance USD.", bar: 68, color: "var(--green)" },
  { icon: "🌾", name: "Agroindustria", detail: "Sector más fuerte. Soja y cereales récord. PyMEs agroindustriales se benefician de tipo de cambio competitivo y acuerdo UE.", bar: 82, color: "var(--green)" },
  { icon: "🏗️", name: "Construcción", detail: "Caída 12% en obra privada. Obra pública paralizada. PyMEs constructoras sobreviven con refacciones y reformas menores.", bar: 30, color: "var(--red)" },
  { icon: "💻", name: "Tecnología", detail: "Sector estrella. PyMEs tech argentinas exportan USD 2.800M. Ley de Economía del Conocimiento renovada. Fuga de talentos moderada.", bar: 88, color: "var(--green)" },
];

export const PYMES_INDICATORS: PymeIndicator[] = [
  { label: "Ventas PyME (índice)", value: "78", change: "-6%", trend: "down" },
  { label: "Acceso a crédito", value: "28%", change: "+3%", trend: "up" },
  { label: "Cierre de empresas", value: "4.200/mes", change: "+15%", trend: "down" },
  { label: "Exportaciones PyME", value: "USD 1.200M", change: "+12%", trend: "up" },
  { label: "Empleo PyME", value: "-3,2%", change: "Estable", trend: "flat" },
  { label: "Confianza empresarial", value: "42 pts", change: "+5 pts", trend: "up" },
];

export const PYMES_POLICIES: PymePolicy[] = [
  { name: "Ley PyME (crédito subsidiado)", impact: "Parcial", detail: "Línea de crédito a tasa negativa para PyMEs. Acceso limitado por requisitos bancarios. Solo 28% de PyMEs accede." },
  { name: "Exporta Simple", impact: "Positivo", detail: "Simplificación de trámites de exportación. 12.000 PyMEs nuevas exportaron en 2025. Foco en servicios digitales y agro." },
  { name: "Ley de Economía del Conocimiento", impact: "Positivo", detail: "Beneficios fiscales para PyMEs tech. Incentivo a exportación de software. Sector crece 15% anual." },
  { name: "Ajuste fiscal / reducción obra pública", impact: "Negativo", detail: "PyMEs constructoras y proveedoras del Estado más afectadas. Cadena de pago rota en 14 provincias." },
  { name: "Régimen MiPyME", impact: "Neutral", detail: "Certificación vigente. Beneficios en IVA y Ganancias limitados por inflación. Burocracia de renovación." },
];

export const PYMES_SCENARIOS: PymeScenario[] = [
  { title: "Recuperación gradual", pct: 30, color: "var(--green)", detail: "Inflación baja, crédito se expande, consumo repunta. PyMEs manufactureras y de servicios crecen." },
  { title: "Estancamiento", pct: 45, color: "var(--amber)", detail: "Inflación persistente, crédito acotado, consumo plano. Solo agro y tech sobreviven bien." },
  { title: "Deterioro", pct: 25, color: "var(--red)", detail: "Inflación >35%, cierre masivo, desempleo PyME sube. Crisis social afecta demanda interna." },
];
