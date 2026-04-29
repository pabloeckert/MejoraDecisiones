// Actores en la sombra — "Los Tapados"
// Migrado de nash-dashboard/app.js

export type ShadowActor = {
  name: string;
  role: string;
  note: string;
};

export const SHADOW_ACTORS = {
  judicial: [
    { name: "Cristian Auguarda", role: "SIDE / Caputo", note: "Conducción SIDE bajo Caputo. Objetivo de desplazamiento por Karina." },
    { name: "Eduardo Casal", role: "Procurador interino", note: "9 años de interinato. Comodoro Py como campo de batalla." },
    { name: "Ángelici", role: "Operador judicial", note: "Ex-abogado de Boca. Opera designaciones judiciales." },
  ] as ShadowActor[],
  digital: [
    { name: "Gordo Dan", role: "Influencer libertario", note: "Ecosistema Caputo. Alcance masivo. Cruce con Lemoine." },
    { name: "Agustín Laje", role: "Ideólogo", note: "Contenido ideológico libertario sin cargo formal." },
  ] as ShadowActor[],
  economic: [
    { name: "Techint / Rocca", role: "Industrial", note: "Lobby transversal. Beneficiado Mercosur-UE." },
    { name: "YPF / Vaca Muerta", role: "Eje energético", note: "Herramienta geopolítica. Chevron, Shell, Total." },
    { name: "Grupo Clarín / La Nación", role: "Medios", note: "Poder de agenda intacto." },
  ] as ShadowActor[],
};
