// Organismos nacionales e internacionales
// Migrado de nash-dashboard/app.js

export type Organism = {
  name: string;
  type: string;
  position: string;
};

export const ORGS_NATIONAL: Organism[] = [
  { name: "BCRA (Banco Central)", type: "Monetario", position: "Reservas USD 9.500M acumuladas. REM proyecta tipo de cambio $1.700/USD para dic-2026. Inflación esperada: 24,4% anual. Política de crawling peg mantiene ancla cambiaria." },
  { name: "INDEC", type: "Estadísticas", position: "Pobreza 31,6% (ultimo dato). Inflación marzo 3,4%. Canasta básica supera los $350.000/hogar. Desempleo 6,8% (mejoró pero subempleo persiste." },
  { name: "IERAL (Fundación Mediterránea)", type: "Think tank", position: "Proyección base: inflación 23% anual dic-2026. Optimista: 18-19%. Pesimista: hasta 30%. El modelo depende de la credibilidad del BCRA." },
  { name: "CGT / Sindicalismo", type: "Gremial", position: "Oposición activa al ajuste. Paro general pendiente. Debilitados electoralmente pero capacidad de movilización intacta. Negociación salarial como palanca." },
  { name: "Poliarquía / Catterberg", type: "Consultora", position: "LLA mantiene 40%+ imagen positiva pero núcleo duro más estrecho que voto oct-2025. Economía es el único driver de aprobación." },
];

export const ORGS_INTL: Organism[] = [
  { name: "FMI (Fondo Monetario Internacional)", type: "Multilateral", position: "Segunda revisión del programa esperada. Desembolso potencial USD 1.000M. Proyección PIB +3,5%, inflación 30,4%. Condicionalidad: metas fiscales y cambiarias." },
  { name: "OCDE", type: "Multilateral", position: "Mejoró proyecciones de PIB para Argentina. Proceso de ingreso como miembro formal en curso. Requiere reformas estructurales de mediano plazo." },
  { name: "Banco Mundial", type: "Multilateral", position: "Reconoce mejora en libertad económica. Pobreza sigue como principal desafío social. Programas de asistencia focalizada." },
  { name: "BID (Banco Interamericano)", type: "Regional", position: "Financiamiento para infraestructura y PyMEs en evaluación. Línea de crédito para modernización productiva." },
  { name: "BlackRock / Fidelity", type: "Financiero privado", position: "Posiciones largas en bonos argentinos. AL35 y GD35 como favoritos. Carry trade atractivo pero hedging costoso. Esperan desembolso FMI como catalizador." },
  { name: "Techint / Grupo Arcor", type: "Empresarial nacional", position: "Beneficiados por acuerdo Mercosur-UE. Inversión en Vaca Muerta y sector agroexportador. Lobby transversal por estabilidad macro." },
];
