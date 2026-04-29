// Mapa de alianzas: sólidas, débiles, rotas
// Migrado de nash-dashboard/app.js

export type Alliance = {
  title: string;
  detail: string;
};

export const ALLIANCES = {
  solid: [
    { title: "LLA — Casa Rosada", detail: "Karina, L. Caputo, Adorni, Pettovello, Sturzenegger." },
    { title: "Milei — Trump (EEUU)", detail: "Alineamiento total. Vaca Muerta. Acuerdo comercial." },
    { title: "Milei — Netanyahu", detail: "Relación personal. Múltiples viajes." },
    { title: "LLA — Evangélicos", detail: "Apoyo transversal. Pastores como puentes." },
  ] as Alliance[],
  weak: [
    { title: "LLA — PRO (Macri)", detail: "Convivencia sin fusión." },
    { title: "LLA — Provincias Unidas", detail: "Apoyo caso a caso. Poder de veto." },
    { title: "Villarruel — Milei", detail: "Tensiones públicas. Perfil propio." },
  ] as Alliance[],
  broken: [
    { title: "Nación — Buenos Aires", detail: "Asfixia financiera. Conflicto total." },
    { title: "Nación — Formosa / La Rioja", detail: "-72% y -87% transferencias." },
    { title: "Argentina — Venezuela", detail: "Ruptura diplomática." },
  ] as Alliance[],
};
