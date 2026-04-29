# 📚 Tablero Nash — Documentación Maestra Unificada

> **Trigger:** Cuando digas **"documentar"**, este archivo se actualiza con los trabajos realizados.
> **Última actualización:** 2026-04-30
> **Versión:** 4.2.0 — SPA unificada con 15 módulos funcionales

---

## Índice

1. [Visión General](#1-visión-general)
2. [Historia y Fusión de Repositorios](#2-historia-y-fusión-de-repositorios)
3. [Arquitectura Unificada](#3-arquitectura-unificada)
4. [Módulos](#4-módulos)
5. [Stack Técnico](#5-stack-técnico)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Fuentes de Datos](#7-fuentes-de-datos)
8. [Sistema de Documentación Viva](#8-sistema-de-documentación-viva)
9. [Análisis Multi-Equipo (40+ Roles)](#9-análisis-multi-equipo)
10. [Plan por Etapas](#10-plan-por-etapas)
11. [Decisiones Clave (ADRs)](#11-decisiones-clave)
12. [Runbooks](#12-runbooks)
13. [Changelog](#13-changelog)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Visión General

**Tablero Nash** es un dashboard analítico web que cruza un mapa de actores políticos argentinos con teoría de juegos para estudiar **poder, alianzas y escenarios**. Herramienta de análisis estratégico — no militante — con datos referenciados.

- **Repo unificado:** `pabloeckert/nash-power-play`
- **Producción:** GitHub Pages (auto-deploy desde main)
- **Stack:** Vite 5 · React 19 · React Router · Tailwind v4 · shadcn-inspired UI
- **Estado:** 15 módulos funcionales, 14 con datos completos
- **Versión:** 4.1.0

### Repositorios Fusionados

| Repo | Contenido aportado | Estado |
|------|-------------------|--------|
| `nash-power-play` | Arquitectura React, design system oklch, grafo xyflow | ✅ Base del unificado |
| `nash-dashboard` | 12 paneles de datos, PWA, CI/CD, tests, feed IA, analistas, PyMEs, Kanban, Predictor, provincias, congreso, alianzas, sombra, internacional | ✅ Datos migrados |

---

## 2. Historia y Fusión de Repositorios

### nash-dashboard (v1-v3.0)
- Vanilla JS/HTML/CSS, ~704 líneas en app.js monolítico
- 12 paneles funcionales con datos reales de Argentina 2026
- PWA + GitHub Actions + tests de validación
- Producción en `pabloeckert.github.io/nash-dashboard`

### nash-power-play (v0.1)
- React 19 + TanStack Start + Vite 7 + Tailwind v4
- shadcn/ui, xyflow para grafos
- Solo Etapa 1 implementada (grafo de actores)

### Decisión de Fusión (v4.0 → v4.1)
Se unifica en `nash-power-play` con arquitectura SPA pura:
1. **Vite 5 + React 19** como base (SPA, sin SSR)
2. **React Router** con HashRouter para compatibilidad GitHub Pages
3. **Tailwind v4** para styling
4. **xyflow** para el grafo interactivo
5. **15 módulos** con datos reales migrados

---

## 3. Arquitectura Unificada

```
nash-power-play/
├── src/
│   ├── components/
│   │   ├── dashboard-shell.tsx    # Layout global con nav
│   │   ├── stat-card.tsx          # Card de métrica
│   │   └── actor-graph.tsx        # Grafo interactivo (xyflow)
│   ├── pages/
│   │   ├── Overview.tsx           # / — Dashboard principal
│   │   ├── Grafo.tsx              # /grafo — Grafo de actores
│   │   ├── Matriz.tsx             # /matriz — Matriz de pagos
│   │   ├── Escenarios.tsx         # /escenarios — Simulador
│   │   ├── Indicadores.tsx        # /indicadores — KPIs
│   │   ├── IA.tsx                 # /ia — Pensamiento IA
│   │   ├── Pymes.tsx              # /pymes — Panel PyME
│   │   ├── Kanban.tsx             # /kanban — Kanban escenarios
│   │   ├── Predictor.tsx          # /predictor — Predictor
│   │   ├── Congreso.tsx           # /congreso — Congreso
│   │   ├── Provincias.tsx         # /provincias — 24 provincias
│   │   ├── Sombra.tsx             # /sombra — Actores sombra
│   │   ├── Internacional.tsx      # /internacional — Bloques
│   │   ├── Alianzas.tsx           # /alianzas — Mapa alianzas
│   │   └── Feed.tsx               # /feed — Feed fuentes
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── seed-data.ts           # Actores y relaciones (grafo)
│   │   └── data/                  # Datos migrados (14 módulos)
│   │       ├── ai-thinking.ts
│   │       ├── ai-kb.ts
│   │       ├── social-trends.ts
│   │       ├── analysts.ts
│   │       ├── organisms.ts
│   │       ├── pymes.ts
│   │       ├── kanban.ts
│   │       ├── provinces.ts
│   │       ├── congress.ts
│   │       ├── alliances.ts
│   │       ├── shadow.ts
│   │       ├── international.ts
│   │       ├── scenarios.ts
│   │       └── feed.ts
│   ├── App.tsx                    # Router principal
│   ├── main.tsx                   # Entry point
│   ├── styles.css                 # Design system oklch
│   └── vite-env.d.ts
├── Documents/
│   ├── MASTER.md                  # Este archivo
│   ├── CHANGELOG.md
│   ├── data-sources.md
│   ├── adr/
│   └── runbooks/
├── .github/workflows/
│   └── pages.yml                  # GitHub Actions → Pages
├── public/
│   └── manifest.json              # PWA manifest
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Módulos

| Código | Módulo | Ruta | Estado | Datos |
|--------|--------|------|--------|-------|
| 00 | Overview / Dashboard | `/` | ✅ | Stats, módulos |
| 01 | Grafo de actores | `/grafo` | ✅ | 30 actores, 40+ relaciones |
| 02 | Matriz de pagos | `/matriz` | ✅ | 6 plantillas, editor N×M, solver Nash puro + mixto |
| 03 | Escenarios | `/escenarios` | ✅ | 6 sliders, 5 escenarios Nash, guardado de presets |
| 04 | Indicadores | `/indicadores` | ✅ | 8 KPIs macro, 4 KPIs políticos, 3 charts, 8 sectores |
| 05 | Pensamiento IA | `/ia` | ✅ | 5 modelos IA, trends, analistas |
| 06 | PyMEs | `/pymes` | ✅ | 6 sectores, indicadores, políticas |
| 07 | Kanban | `/kanban` | ✅ | 10 escenarios |
| 08 | Predictor | `/predictor` | ✅ | Escenarios Nash, organismos |
| 09 | Congreso | `/congreso` | ✅ | Diputados, Senado, agenda |
| 10 | Provincias | `/provincias` | ✅ | 24 provincias |
| 11 | Sombra | `/sombra` | ✅ | Judiciales, digitales, económicos |
| 12 | Internacional | `/internacional` | ✅ | 8 bloques internacionales |
| 13 | Alianzas | `/alianzas` | ✅ | Sólidas, débiles, rotas |
| 14 | Feed | `/feed` | ✅ | 9 fuentes de análisis |

---

## 5. Stack Técnico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Build | Vite 5 | SPA estática para GitHub Pages |
| UI Library | React 19 | Client-side rendering |
| Routing | react-router-dom | HashRouter para GH Pages |
| Styling | Tailwind v4 | Utility-first |
| Graph | @xyflow/react | Grafo interactivo |
| Charts | recharts | Gráficos estadísticos |
| Language | TypeScript 5.8 | Type safety completo |
| Fonts | Inter + JetBrains Mono | Google Fonts |
| Theme | oklch dark | Bloomberg-terminal aesthetic |
| PWA | manifest.json | Offline support básico |
| CI/CD | GitHub Actions → Pages | Auto-deploy desde main |

---

## 6. Modelo de Datos

### Entidades principales

```typescript
// Actor político
type Actor = {
  id: string;
  name: string;
  kind: 'party' | 'leader' | 'union' | 'business' | 'media' | 'institution';
  ideology: number;  // -1 (izq) .. +1 (der)
  power: number;     // 0..1
  blurb: string;
};

// Relación entre actores
type Relation = {
  source: string;
  target: string;
  type: 'ally' | 'rival' | 'neutral';
  strength: number;  // 0..1
  note?: string;
};

// Escenario Nash
type Scenario = {
  title: string;
  pct: number;
  color: string;
  tag: string;
  body: string;
  indicators: string[];
};

// Provincia
type Province = {
  name: string;
  gov: string;
  party: string;
  align: 'allied' | 'hostile' | 'neutral';
  funds: string;
  note: string;
};
```

---

## 7. Fuentes de Datos

Ver [`data-sources.md`](./data-sources.md) para el listado completo.

### Cadena de datos
```
Eventos → Fuentes primarias → Medios → Think tanks → Análisis cruzado → Dashboard
```

### Niveles de confianza
- 🟢 **Alto:** Dato oficial verificado (INDEC, BCRA, FMI)
- 🟡 **Medio:** Consenso de analistas con 2+ fuentes
- 🔴 **Bajo:** Estimación o fuente única sin confirmar

---

## 8. Sistema de Documentación Viva

Carpeta `/Documents/` con esta estructura:

```
/Documents
├── MASTER.md            ← Este archivo (fuente de verdad)
├── CHANGELOG.md         ← Historial de cambios
├── data-sources.md      ← APIs y fuentes recomendadas
├── adr/                 ← Architecture Decision Records
│   ├── 0003-unificacion.md
│   └── 0004-deployment.md
└── runbooks/            ← Procedimientos de operación
    ├── deploy.md
    ├── incident-response.md
    └── data-refresh.md
```

**Comando "documentar"**: cuando escribas "documentar":
1. Se actualiza `MASTER.md` (estado, módulos, decisiones)
2. Se agrega entrada en `CHANGELOG.md` con fecha y cambios
3. Se crea/actualiza ADR si corresponde
4. Se crea/actualiza runbook si corresponde

---

## 9. Análisis Multi-Equipo

### Área Técnica

| Rol | Estado | Recomendación |
|-----|--------|---------------|
| **Software Architect** | ✅ SPA bien estructurada | Code-splitting para optimizar |
| **Cloud Architect** | ✅ GitHub Pages estático | Considerar Edge Functions para API futura |
| **Backend Developer** | 🟡 Datos estáticos en TS | Extraer a JSON/API para actualización independiente |
| **Frontend Developer** | ✅ React 19 + Tailwind v4 | Componentes modulares y consistentes |
| **iOS/Android Dev** | N/A | PWA como alternativa mobile |
| **DevOps Engineer** | ✅ GitHub Actions CI/CD | Agregar lint, tests al pipeline |
| **SRE** | 🟡 Sin monitoreo | Agregar error tracking (Sentry) |
| **Cybersecurity** | ✅ Sin backend, sin datos sensibles | CSP básico OK |
| **Data Engineer** | 🟡 Datos estáticos | Pipeline de actualización automática |
| **ML Engineer** | 🟡 Nash solver manual | Potencial para Monte Carlo |
| **QA Automation** | 🔧 Tests pendientes | Expandir cobertura |
| **DBA** | N/A | JSON estático |

### Área de Producto

| Rol | Estado | Recomendación |
|-----|--------|---------------|
| **Product Manager** | ✅ Roadmap claro en 5 etapas | KPIs de uso pendientes |
| **Product Owner** | ✅ Features bien definidos | Priorizar por impacto |
| **Scrum Master** | ✅ Flujo ágil implícito | Board visible opcional |
| **UX Researcher** | 🟡 Sin analytics | Agregar analytics sin PII |
| **UX Designer** | ✅ Flujo funcional | Testing de usabilidad |
| **UI Designer** | ✅ Design system oklch | Consistente y profesional |
| **UX Writer** | 🟡 Copy técnico | Tono más accesible |
| **Localization** | 🟡 Solo español | i18n futuro |
| **Delivery Manager** | ✅ Deploy automático | — |

### Área Comercial

| Rol | Estado | Recomendación |
|-----|--------|---------------|
| **Growth Manager** | 🟡 Sin estrategia | Landing page + SEO |
| **SEO Specialist** | 🟡 OG tags básico | Structured data completo |
| **Content Manager** | ✅ README + docs | Mantener documentación viva |
| **Community Manager** | ❌ Sin comunidad | Discord/Telegram futuro |

### Área Operaciones

| Rol | Estado | Recomendación |
|-----|--------|---------------|
| **BI Analyst** | 🟡 Sin analytics de uso | Agregar métricas |
| **Legal** | 🟡 MIT OK | Disclaimer necesario |
| **DPO** | ✅ Sin datos personales | — |
| **Customer Success** | N/A | Producto interno |

---

## 10. Plan por Etapas

### Estado Actual (2026-04-30)

| Etapa | Estado | Detalle |
|-------|--------|---------|
| 0. Unificación repos | ✅ | Fusión completada, SPA funcional |
| 1. Fundaciones + Grafo | ✅ | React + Vite + grafo xyflow |
| 2. Migración datos | ✅ | 14 módulos de datos migrados |
| 3. Deploy producción | ✅ | GitHub Pages con auto-deploy |
| 4. Matriz de pagos | ✅ | Editor N×M, 6 plantillas, solver Nash puro + mixto |
| 5. Escenarios | ✅ | Simulador what-if con 6 parámetros |
| 6. Indicadores | ✅ | KPIs macro + políticos + charts + sectores |
| 7. Hardening + QA | 🔧 Pendiente | Tests, performance, SEO |

---

## 11. Decisiones Clave

- [ADR-0003 — Unificación de repos](./adr/0003-unificacion.md)
- [ADR-0004 — Estrategia de deployment](./adr/0004-deployment.md)

### Decisión clave v4.1: SPA pura en vez de TanStack Start
- **Razón:** TanStack Start requiere Cloudflare Workers (SSR). GitHub Pages es estático.
- **Solución:** Vite 5 + React Router HashRouter = SPA pura, deploy en GH Pages.
- **Trade-off:** Sin SSR, pero simplicidad de deploy y compatibilidad total.

---

## 12. Runbooks

- [Deploy](./runbooks/deploy.md)
- [Respuesta a incidentes](./runbooks/incident-response.md)
- [Refresh de datos](./runbooks/data-refresh.md)

---

## 13. Changelog

### 2026-04-30 — v4.1.0 SPA Unificada
- Conversión de TanStack Start a SPA pura (Vite 5 + React Router)
- 15 módulos funcionales con routing completo
- Deploy automático a GitHub Pages
- Design system oklch dark theme preservado
- Grafo interactivo xyflow funcionando
- PWA manifest integrado
- Documentación consolidada en Documents/MASTER.md

### 2026-04-30 — v4.0.0 Unificación (original)
- Fusión de nash-power-play + nash-dashboard
- 12 paneles de datos migrados como módulos TypeScript
- CI/CD GitHub Actions configurado

### 2026-04-29 — v3.0 nash-dashboard
- Panel IA, PyMEs, Kanban, Predictor, Congreso, Provincias, Sombra, Internacional
- PWA + GitHub Actions + OG tags

### 2026-04-29 — v0.1 nash-power-play
- TanStack Start + React 19 + Design system oklch
- Grafo interactivo xyflow

---

## 14. Troubleshooting

### Build falla con errores de TypeScript
- **Causa:** Tipos CSS no declarados
- **Fix:** `src/vite-env.d.ts` incluye declaraciones de módulos CSS

### Grafo no muestra nodos
- **Verificar:** `nodes[]` tiene `position` y `data`
- **Verificar:** `filterKinds` incluye el kind del actor

### PWA no cachea
- **Verificar:** `manifest.json` está en `/public/`
- **Fix:** Hard refresh (Ctrl+Shift+R)

### Deploy no se actualiza
- **Verificar:** Push a `main` disparó GitHub Actions
- **Verificar:** Build completó sin errores en Actions

---

> **Instrucción:** Di **"documentar"** para actualizar este archivo con los trabajos realizados.
