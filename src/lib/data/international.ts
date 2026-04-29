// Bloques internacionales
// Migrado de nash-dashboard/app.js

export type IntlBloc = {
  flag: string;
  name: string;
  status: string;
  statusColor: string;
  body: string;
  actors: string[];
  risk: string;
};

export const INTL_BLOCS: IntlBloc[] = [
  {
    flag: "🇺🇸",
    name: "Estados Unidos / Trump",
    status: "aliado estratégico",
    statusColor: "var(--green)",
    body: "<strong>Estado:</strong> Relación más cálida desde Reagan. Vaca Muerta como moneda de cambio. CNA creado 2026. Acuerdo comercial feb 2026.",
    actors: ["Donald Trump", "Scott Bessent", "Marco Rubio"],
    risk: "Dependencia del alineamiento hace vulnerable ante cambio en Washington.",
  },
  {
    flag: "🇮🇱",
    name: "Israel / Netanyahu",
    status: "alianza personal",
    statusColor: "var(--green)",
    body: "3 viajes de Milei. Conversión al judaísmo en proceso. Apoyo post-7/10.",
    actors: ["Benjamin Netanyahu"],
    risk: "Alineamiento total tensiona relación con países árabes.",
  },
  {
    flag: "🇧🇷",
    name: "Brasil / Lula",
    status: "tensión ideológica",
    statusColor: "var(--red)",
    body: "Relación fría. Sin embargo, acuerdo Mercosur-UE requirió coordinación.",
    actors: ["Lula", "Geraldo Alckmin"],
    risk: "Paradoja: Milei critica pero necesita firma de Lula.",
  },
  {
    flag: "🇨🇳",
    name: "China",
    status: "tensión silenciosa",
    statusColor: "var(--amber)",
    body: "Licitación hidrovía excluyó empresas con capitales soberanos. Swap BCRA renovado.",
    actors: ["Embajada China"],
    risk: "China es 2do destino de exportaciones.",
  },
  {
    flag: "🇪🇺",
    name: "Unión Europea / Mercosur",
    status: "hito histórico",
    statusColor: "var(--green)",
    body: "Acuerdo Mercosur-UE: acceso a 700M de consumidores.",
    actors: ["Comisión Europea", "Mercosur"],
    risk: "Oposición europea a deforestación puede complicar.",
  },
  {
    flag: "🌐",
    name: "FMI / BM / OCDE",
    status: "relación clave",
    statusColor: "var(--green)",
    body: "2da revisión esperada. Desembolso USD 1.000M. Riesgo país cayó a 634pb.",
    actors: ["Kristalina Georgieva"],
    risk: "Condicionalidad fiscal y cambiaria.",
  },
  {
    flag: "🕌",
    name: "Medio Oriente / Irán-Israel",
    status: "impacto directo",
    statusColor: "var(--red)",
    body: "FMI cita conflicto como factor que redujo PIB. Argentina exportador neto de energía.",
    actors: ["Irán", "Israel", "Arabia Saudita"],
    risk: "Escalada puede disparar commodities.",
  },
  {
    flag: "🇻🇪",
    name: "Venezuela / Cuba / Nicaragua",
    status: "confrontación",
    statusColor: "var(--red)",
    body: "Ruptura diplomática con Venezuela. Rechazo a Maduro.",
    actors: ["Maduro", "Díaz-Canel"],
    risk: "Ruptura reduce influencia en foros regionales.",
  },
];
