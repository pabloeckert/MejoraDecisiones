// Organismos nacionales e internacionales
// Migrado de nash-dashboard/app.js y calibrado a 2026-2027

export type Organism = {
  name: string;
  type: string;
  position: string;
};

export const ORGS_NATIONAL: Organism[] = [
  { name: "BCRA (Banco Central)", type: "Monetario", position: "Reservas brutas consolidadas sobre USD 38.000M. Convergencia hacia esquema de competencia de monedas y flexibilización cambiaria gradual. Tasa real positiva como ancla antinflacionaria." },
  { name: "INDEC", type: "Estadísticas", position: "Pobreza en 31,6% con tendencia de desaceleración. Inflación mensual consolidada en piso de 2,1-2,4%. Desempleo en 6,8% con heterogeneidad sectorial." },
  { name: "IERAL (Fundación Mediterránea)", type: "Think tank", position: "Proyección 2027: superávit primario de 1,4% del PIB, reactivación del crédito comercial e hipotecario. Desafío central: competitividad cambiaria y costo impositivo subnacional." },
  { name: "CGT / Centrales Sindicales", type: "Gremial", position: "Estrategia de negociación paritaria defensiva frente a reformas de modernización laboral. Foco en defensa de convenios colectivos y obras sociales." },
  { name: "Poliarquía / Catterberg", type: "Consultora", position: "Gestión gubernamental estabilizada en ~42% de aprobación. La percepción de estabilidad económica y baja de inflación sostiene el respaldo de cara a 2027." },
];

export const ORGS_INTL: Organism[] = [
  { name: "FMI (Fondo Monetario Internacional)", type: "Multilateral", position: "Metas cumplidas en el plano fiscal. Revisión enfocada en acumulación neta de reservas internacionales y transición ordenada hacia la unificación cambiaria plena." },
  { name: "OCDE", type: "Multilateral", position: "Avance sostenido en el proceso de adhesión como miembro formal. Recomendaciones de gobernanza corporativa, desregulación y transparencia estadística." },
  { name: "Banco Mundial", type: "Multilateral", position: "Líneas de crédito activas para transición energética, electrificación rural y fortalecimiento de capital humano en sectores vulnerables." },
  { name: "BID (Banco Interamericano)", type: "Regional", position: "Financiamiento para infraestructura logística de exportación y programas de modernización tecnológica para PyMEs." },
  { name: "Fondos Globales de Inversión", type: "Financiero privado", position: "Ponderación positiva en bonos soberanos con cupón en dólares (GD35/GD38). Monitoreo continuo de riesgo país (rango 750-900 bps) y liquidez en 2027." },
  { name: "Grandes Conglomerados Productivos", type: "Empresarial", position: "Liderazgo inversor en infraestructura energética (gasoductos, GNL) y minería de cobre y litio bajo amparo del RIGI." },
];
