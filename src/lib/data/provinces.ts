// 24 provincias argentinas con gobernadores, alianzas y transferencias
// Migrado de nash-dashboard/app.js

export type Province = {
  name: string;
  gov: string;
  party: string;
  align: "allied" | "hostile" | "neutral";
  funds: string;
  note: string;
};

export const PROVINCES: Province[] = [
  { name: "Buenos Aires", gov: "Axel Kicillof", party: "UxP", align: "hostile", funds: "-ajuste 20%", note: "No invitado a reunión de gobernadores. Caso Aubasa/hidrovía. Conflicto total con Nación." },
  { name: "CABA", gov: "Jorge Macri", party: "PRO", align: "allied", funds: "+57,3% vs 2024", note: "Aliada por Corte Suprema. Bullrich senadora. Alianza LLA-PRO >50%." },
  { name: "Córdoba", gov: "Martín Llaryora", party: "Prov.Unidas", align: "neutral", funds: "variable", note: "Desdoblamiento 2027. Provincias Unidas. Perfil presidencial propio." },
  { name: "Santa Fe", gov: "Maximiliano Pullaro", party: "Prov.Unidas", align: "neutral", funds: "variable", note: "Desdoblamiento confirmado. Referente interior no peronista." },
  { name: "Mendoza", gov: "Alfredo Cornejo", party: "UCR", align: "neutral", funds: "media", note: "LLA ganó Mendoza oct-2025. Ley Glaciares genera tensión." },
  { name: "Tucumán", gov: "Osvaldo Jaldo", party: "PJ-aliado", align: "allied", funds: "+fondos", note: "Puente peronismo pragmático-Nación." },
  { name: "Salta", gov: "Gustavo Sáenz", party: "PJ-aliado", align: "allied", funds: "+fondos", note: "Frente regional con Figueroa y Passalacqua." },
  { name: "Misiones", gov: "Hugo Passalacqua", party: "FR-aliado", align: "allied", funds: "+$4.000M ATN", note: "ATN como precio de cooperación legislativa." },
  { name: "Entre Ríos", gov: "Rogelio Frigerio", party: "PRO/LLA", align: "allied", funds: "media", note: "Referente PRO alineado con LLA." },
  { name: "Neuquén", gov: "Rolando Figueroa", party: "MPN", align: "allied", funds: "+récord (incendios)", note: "$15.000M en feb. Vaca Muerta = prioridad compartida." },
  { name: "Chubut", gov: "Ignacio Torres", party: "Prov.Unidas", align: "neutral", funds: "media", note: "Bisagra. Hidrocarburos patagónicos." },
  { name: "Río Negro", gov: "Alberto Weretilneck", party: "regional", align: "neutral", funds: "media", note: "Relación funcional. Sin conflictos mayores." },
  { name: "Jujuy", gov: "Carlos Sadir", party: "UCR/JxC", align: "neutral", funds: "media", note: "Litio. Posición oscilante." },
  { name: "Catamarca", gov: "Raúl Jalil", party: "PJ-aliado", align: "allied", funds: "+fondos", note: "Peronista pragmático." },
  { name: "Corrientes", gov: "Juan Pablo Valdés", party: "ECO/Prov.Unidas", align: "neutral", funds: "+$3.000M ATN", note: "Apoyo funcional." },
  { name: "Chaco", gov: "Leandro Zdero", party: "PRO/LLA", align: "allied", funds: "media", note: "LLA ganó Chaco oct-2025." },
  { name: "Formosa", gov: "Gildo Insfrán", party: "PJ-K", align: "hostile", funds: "-72,1% vs 2023", note: "Kirchnerismo duro. Resistencia peronista." },
  { name: "La Rioja", gov: "Ricardo Quintela", party: "PJ-K", align: "hostile", funds: "-87,9% vs 2023", note: "Provincia más castigada. Símbolo de resistencia." },
  { name: "San Juan", gov: "Marcelo Orrego", party: "PRO/LLA", align: "allied", funds: "media", note: "Excelente relación con Ejecutivo." },
  { name: "San Luis", gov: "Claudio Poggi", party: "LLA", align: "allied", funds: "positiva", note: "Gobernador LLA puro." },
  { name: "Santa Cruz", gov: "Claudio Vidal", party: "Prov.Unidas", align: "neutral", funds: "+$4.000M ATN", note: "Negociador pragmático." },
  { name: "La Pampa", gov: "Sergio Ziliotto", party: "PJ", align: "hostile", funds: "-70,9% vs 2023", note: "Peronista no kirchnerista." },
  { name: "Tierra del Fuego", gov: "Gustavo Melella", party: "MFUT", align: "hostile", funds: "baja", note: "Actor insular independiente." },
  { name: "Santiago del Estero", gov: "Gerardo Zamora", party: "FRES", align: "neutral", funds: "media", note: "Pragmático. Negocia con todos." },
];
