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
    name: "Estados Unidos / Washington",
    status: "aliado estratégico",
    statusColor: "var(--green)",
    body: "<strong>Estado:</strong> Relación bilateral sólida. Vaca Muerta, litio, cobre y acuerdos tecnológicos en el centro de la agenda post-midterms 2026. Alianza en defensa y seguridad regional.",
    actors: ["Administración EE.UU.", "Departamento de Estado", "Cámara de Comercio"],
    risk: "Volatilidad arancelaria global y tasas de interés de la Fed elevadas.",
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
    body: "Metas de superávit primario cumplidas. Foco en acumulación neta de reservas y salida ordenada del esquema cambiario residual. Riesgo país en zona de 800-850 bps.",
    actors: ["Kristalina Georgieva", "Staff FMI"],
    risk: "Exigencia de mayor acumulación de reservas netas de cara a vencimientos 2027.",
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
