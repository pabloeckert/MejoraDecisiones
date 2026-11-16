# CTO Session State — Para "continuemos"

> **Instrucción:** Al decir **"continuemos"**, leer primero este archivo y [Documents/PLAN-MAESTRO-2026-2027.md](./PLAN-MAESTRO-2026-2027.md) para retomar exactamente desde el bloque pendiente.
> **Última actualización:** 2026-11-16 (Auditoría integral v5.7.0 + Plan Maestro 2026–2027 creado)
> **Rama de trabajo:** `main`

---

## ¿Cómo retomar?

Di exactamente: **"continuemos"**

Claude leerá este archivo, entenderá el estado exacto, y continuará desde la siguiente fase pendiente sin repetir trabajo ya hecho.

---

## Estado de Fases

| Fase | Estado | Completado en |
|------|--------|--------------|
| FASE 0 — Plan CTO + Documentación | ✅ COMPLETA | 2026-05-14 sesión 1 |
| FASE 1 — Hardening CI/CD + Tests | ✅ COMPLETA | 2026-05-14 sesión 2 |
| FASE 2 — UX Crítica (Weekly Diff + Grafo) | ✅ COMPLETA | 2026-05-14 sesión 2 |
| FASE 3 — Datos en Vivo (APIs públicas) | ✅ COMPLETA | 2026-05-14 sesión 2 |
| FASE 4 — Export + URL State + Command Bar + Importador | ✅ COMPLETA | 2026-11-13 (`Decisiones.tsx`, `Matriz.tsx`, `Escenarios.tsx`) |
| FASE 5 — Decision OS Multi-Escala (L4–L1) + Wizard 60s + PDF | ✅ COMPLETA | 2026-11-13 (v5.4 Decision OS) |
| FASE 6 — Grafo Multi-País / Empresarial + Vector 4D | ✅ COMPLETA | 2026-11-13 (`Grafo.tsx`, `seed-data.ts`) |
| FASE 7 — Elevación Total 16/16 Módulos (Kanban, IA, Intl, Provincias, Sombra) | ✅ COMPLETA | 2026-11-14 (v5.5 Bloque 3) |
| FASE 8 — Alertas Centinela, Comparador Global, Onboarding 60s y Federación Bidireccional | ✅ COMPLETA | 2026-11-14 (v5.6 Bloque 4: `Indicadores.tsx`, `Overview.tsx`, `federation.ts`) |
| FASE 9 — Auditor Pre-Mortem, Reversibilidad Tipo 1 vs 2, Exportador Markdown/CSV y PWA Offline | ✅ COMPLETA | 2026-11-15 (v5.7 Bloque 5: `decision-engine.ts`, `Decisiones.tsx`, `sw.js`) |
| FASE 10 (Bloque 6) — Reparación APIs en Vivo (`ArgentinaDatos` + `GDELT 2.0`), Datos 2026–2027 y CI/CD Real | ✅ COMPLETA | 2026-11-16 (v5.8.0 Bloque 6: `api-client.ts`, `Indicadores.tsx`, `Feed.tsx`, `ci.yml`, `pages.yml`) |
| FASE 11 (Bloque 7) — Stress-Test Cruzado 2D, Correlación Monte Carlo y Escenarios/L1-L2 Globales | ⏳ SIGUIENTE | Plan en `PLAN-MAESTRO-2026-2027.md` (`v5.9.0`) |
| FASE 12 (Bloque 8) — Agentic Decision Copilot (BYOK/Local LLM) y Gobernanza Temporal Bitácora | ⏳ PENDIENTE | Plan en `PLAN-MAESTRO-2026-2027.md` (`v5.10.0`) |
| FASE 13 (Bloque 9) — Validación Fronteras, UI Smoke Tests, WCAG Directorio + ES/EN y SDK | ⏳ PENDIENTE | Plan en `PLAN-MAESTRO-2026-2027.md` (`v6.0.0`) |

---

## Lo que se hizo en sesión 2 (2026-05-14)

### FASE 1 — Hardening CI/CD + Tests ✅
**Archivos creados/modificados:**
- `.github/workflows/pages.yml` — job `quality` (lint + vitest) ANTES del deploy; si falla, no llega a producción
- `.github/workflows/ci.yml` — workflow CI dedicado a feature branches y PRs
- `src/lib/nash-solver.ts` — funciones `findPureNash` y `solve2x2Mixed` extraídas a módulo testeable
- `src/pages/Matriz.tsx` — refactorizado: importa desde `nash-solver.ts`
- `src/__tests__/nash.test.ts` — 17 tests nuevos: equilibrios puros, mixtos, matching pennies, gallina, coordinación, propiedades invariantes

**Resultado:** 52 tests pasando (35 datos + 17 Nash solver)

**Commit:** `e1ec95b` — "feat(cto-fase-1): CI/CD hardened, Nash solver extraído, 52 tests pasando"

### FASE 2 — UX Crítica ✅
**Archivos creados/modificados:**
- `src/lib/weekly-diff.ts` — snapshot de visita con localStorage, función `computeDiff`
- `src/pages/Overview.tsx` — banda "Desde tu última visita" con deltas de alianzas/rivales/actores
- `src/components/actor-graph.tsx` — expone `selectedId`/`onSelectActor` al componente padre
- `src/pages/Grafo.tsx` — panel lateral de 288px con: nombre, tipo, blurb, barra de poder, escala ideológica, lista de vínculos clickeable

**Commit:** `f8fd206` — "feat(cto-fase-2): weekly diff en Overview y panel de detalle en Grafo"

### FASE 3 — Datos en Vivo ✅
**Archivos creados/modificados:**
- `src/lib/api-client.ts` — cliente fetch con caché 5min en memoria, timeout 8s
  - `fetchDolar()` → `api.dolarapi.com/v1/dolares` — sin API key requerida
  - `fetchReservasBCRA()` → `api.bcra.gob.ar` — reservas internacionales
  - `fetchInflacion()` → `apis.datos.gob.ar` — IPC INDEC últimos 6 meses
- `src/hooks/useLiveIndicators.ts` — hook React con polling cada 5min, Promise.allSettled
- `src/pages/Indicadores.tsx` — panel "Dólar hoy" con 4 cotizaciones en vivo, KPIs con badge LIVE, fallback estático si API falla

**Commit:** `ddda200` — "feat(cto-fase-3): indicadores en vivo — DolarAPI, BCRA, INDEC"

---

## Próxima fase a ejecutar: BLOQUE 6 (`v5.8.0`) — Ver `Documents/PLAN-MAESTRO-2026-2027.md`

### Contexto crítico detectado en Auditoría 2026-11-16

1. **`.github/workflows/` no existe actualmente** en el repositorio: hay que crear `ci.yml` y `pages.yml` reales para habilitar CI/CD y deploy automático a GitHub Pages.
2. **APIs en vivo con brechas en `src/lib/api-client.ts` y `src/pages/Indicadores.tsx`:**
   - `fetchInflacion()` apunta a `148.3_INIVELGENERAL_DICI_M_26` sin `representation_mode=percent_change` y desestructura `{ data: IndecSeries }` con doble `.data`. Reemplazar/priorizar `api.argentinadatos.com/v1/finanzas/indices/inflacion`.
   - `currentRiskBps = 650` en `Indicadores.tsx` está hardcodeado; conectar `api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo`.
   - Conectar **GDELT 2.0 DOC API** (noticias internacionales CORS en tiempo real sin API key, con throttle `>= 5.5s` y caché 15m) para `/feed` e `/internacional`.
3. **Actualización de datos a cierre Nov-2026 → 2027:** Actualizar `src/lib/context-packs.ts` y `src/lib/data/*` (modelos de IA 2026–2027, analistas vigentes, macro cierre 2026 y ciclo electoral/geopolítico 2027) respetando el 100% de invariantes de `src/__tests__/data.test.ts`.
4. **Versión en UI:** Sincronizar footer `dashboard-shell.tsx` (actualmente muestra `v5.2 Decision OS`).

---

## Stack y rutas reales del proyecto

```
c:\github\MejoraDecisiones\
├── src/
│   ├── pages/          ← 16 módulos React (Overview + Decisiones + 14 analíticos)
│   ├── components/     ← dashboard-shell, actor-graph, stat-card
│   ├── hooks/          ← useLiveIndicators
│   ├── lib/
│   │   ├── decision-engine.ts
│   │   ├── context-packs.ts
│   │   ├── federation.ts
│   │   ├── nash-solver.ts
│   │   ├── api-client.ts
│   │   ├── weekly-diff.ts
│   │   ├── seed-data.ts
│   │   └── data/       ← 14 archivos de datos base
│   └── __tests__/
│       ├── data.test.ts (35)
│       ├── nash.test.ts (17)
│       └── decision-engine.test.ts (16)
├── public/             ← manifest.json + sw.js (v5.7.0)
└── Documents/
    ├── PLAN-MAESTRO-2026-2027.md  ← PLAN COMPLETO BLOQUES 6–9
    ├── ARQUITECTURA-DECISION-OS.md
    ├── CTO-ROADMAP.md
    ├── CTO-SESSION-STATE.md       ← ESTE ARCHIVO
    ├── MASTER.md
    └── CHANGELOG.md
```

**URL de producción:** https://pabloeckert.github.io/MejoraDecisiones/
**Rama de trabajo y deploy:** `main` (auto-deploy via GitHub Actions)

---

## Métricas de calidad actuales

| Métrica | Antes (Sesión 2) | Actual (`v5.7.0` Auditado 2026-11-16) |
|---------|------------------|---------------------------------------|
| Tests | 52 (datos + Nash solver) | 68 pasando (datos + Nash + Decision Engine + 4D Graph + Federación + Pre-Mortem) |
| CI/CD en repo | ❌ `.github/workflows` eliminado/ausente | ⚠️ **Brecha detectada:** Recrear `ci.yml` + `pages.yml` en Bloque 6 |
| Datos en vivo | 3 APIs | 5 conectores (`fetchInflacion()` con bug a reparar + `currentRiskBps` fijo; sumar `ArgentinaDatos` + `GDELT` en Bloque 6) |
| Módulos Interactivos | 5/16 interactivos | 16/16 módulos interactivos + Comparador Global + Onboarding 60s + Consola Federación |
| Motor Decisiones | Básico (Nash 2×2) | L4–L1 + Wizard 60s + Monte Carlo + Informe PDF + Markdown + CSV + Pre-Mortem |
| Grafo de Poder | Solo Argentina (30 nodos) | Multi-Red (Argentina / Global / Empresa editable) + Vector 4D |
| PWA & Offline | manifest estático | Hardened v5.7 (SW Stale-While-Revalidate para APIs y assets) |

---

## Reglas de trabajo (no cambiar sin autorización)

1. Todo el desarrollo va en la rama `main` (repo `MejoraDecisiones`)
2. NO tocar el repo `MejoraApp`
3. Ejecutar `npm run test`, `npm run lint` y `npm run build` + Commit & Push al cierre de cada bloque
4. Actualizar `PLAN-MAESTRO-2026-2027.md`, `CTO-SESSION-STATE.md` y `CHANGELOG.md` en cada bloque
5. Datos estáticos calibrados al ciclo **2026–2027** como fallback seguro, siempre priorizando APIs reales en vivo cuando respondan
6. Mantener `MejoraDecisiones` 100% autónomo (*Standalone-First*) y con contrato de federación limpio (*Federation-Ready*)

---

*Este archivo es el único punto de entrada para retomar trabajo. Actualizarlo es obligatorio al final de cada sesión.*
