// Kanban de escenarios estratégicos con drag-drop
// Migrado de nash-dashboard/app.js

export type KanbanCard = {
  id: string;
  title: string;
  pct: number;
  color: string;
  tag: string;
  col: "emerging" | "active" | "dominant" | "collapsed";
  desc: string;
};

export const KANBAN_CARDS: KanbanCard[] = [
  { id: "k1", title: "Consolidación libertaria", pct: 35, color: "var(--green)", tag: "Cooperativo", col: "dominant", desc: "Karina desplaza Caputo. Economía sostiene. FMI aprueba. Milei 2027 sólido." },
  { id: "k2", title: "Parálisis por interna", pct: 30, color: "var(--amber)", tag: "Desequilibrio", col: "active", desc: "Karina-Caputo no resuelve. Inflación >2,5% mensual. Gobernadores se distancian." },
  { id: "k3", title: "Shock externo + crisis", pct: 20, color: "var(--red)", tag: "Crisis", col: "active", desc: "Medio Oriente escala. Inflación >35%. FMI retrasa. Dilema ajuste vs expansión." },
  { id: "k4", title: "Provincias Unidas como 3er polo", pct: 10, color: "var(--purple)", tag: "Nuevo equilibrio", col: "emerging", desc: "Llaryora-Pullaro-Torres consolidan bisagra legislativa. Milei pierde monopolio." },
  { id: "k5", title: "Ruptura sistémica", pct: 5, color: "var(--red)", tag: "Tail risk", col: "emerging", desc: "Shock + crisis interna + FMI cancela + movilización. Baja prob, altísima consecuencia." },
  { id: "k6", title: "Boom Vaca Muerta", pct: 15, color: "var(--blue)", tag: "Oportunidad", col: "emerging", desc: "Inversión US récord. Energía como motor de crecimiento. Arrastra PyMEs regionales." },
  { id: "k7", title: "Victoria legislativa total", pct: 8, color: "var(--green)", tag: "Oficialismo", col: "emerging", desc: "Reforma laboral + PASO + presupuesto aprobados. LLA domina Congreso post oct-2025." },
  { id: "k8", title: "Deserción gobernadores", pct: 22, color: "var(--amber)", tag: "Riesgo", col: "active", desc: "12+ provincias desdobladas. ATN no alcanza. Gobernadores aliados migran a oposición." },
  { id: "k9", title: "Inflación controlada <20%", pct: 18, color: "var(--green)", tag: "Optimista", col: "emerging", desc: "BCRA acumula reservas. Credibilidad ancla cambiaria. Consumo repunta." },
  { id: "k10", title: "Crisis social / estallido", pct: 7, color: "var(--red)", tag: "Colapso", col: "emerging", desc: "Pobreza >35%. Paro general. Desgaste acelera. Referente: 2001." },
];
