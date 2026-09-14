# CTO Session State — Para "continuemos"

> **Instrucción:** Cuando digas "continuemos", Claude lee este archivo primero para retomar exactamente donde quedamos.
> **Última actualización:** 2026-05-14 (sesión 2)
> **Rama de trabajo:** `claude/cto-analysis-framework-E583b`

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
| FASE 4 — Export + Compartir | ⏳ PENDIENTE | — |
| FASE 5 — PWA Completo + Light Mode | ⏳ PENDIENTE | — |
| FASE 6 — Integración MejoraApp | ⏳ FUTURO | — |

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

## Próxima fase a ejecutar: FASE 4 — Export + Compartir

### Contexto necesario para FASE 4

**Objetivo:** Permitir exportar análisis y compartir snapshots de escenarios.

**Sub-tareas en orden de prioridad:**

#### 4.1 — Export JSON de Matriz de Pagos
- En `src/pages/Matriz.tsx`, agregar botón "Exportar JSON" que descargue el estado actual de la matriz
- Formato: `{ size, rowLabels, colLabels, matrix, nashResult, template, exportedAt }`
- Usar `URL.createObjectURL` + `<a>` programático

#### 4.2 — Snapshots de Escenarios en URL (query params)
- En `src/pages/Escenarios.tsx`, serializar el estado de los 6 sliders en la URL como `#/escenarios?inf=3.4&pop=0.42&...`
- Al cargar la página, leer los params y restaurar el estado
- Botón "Compartir" que copia la URL al portapapeles con `navigator.clipboard.writeText`

#### 4.3 — Onboarding 60s para primera visita
- En `src/pages/Overview.tsx`, detectar primera visita (localStorage `nash_onboarded`)
- Modal simple con 3 slides:
  1. "Qué es el Tablero Nash" (10s)
  2. "Cómo usar el Grafo" (10s)
  3. "Cómo interpretar la Matriz" (10s)
- Botón "Entendido" para cerrar y no volver a mostrar

**Archivos a crear/modificar:**
- `src/pages/Matriz.tsx` — botón Export JSON (agregar, no reescribir)
- `src/pages/Escenarios.tsx` — leer estado de Escenarios antes de modificar
- `src/components/onboarding-modal.tsx` — componente nuevo (crear)
- `src/pages/Overview.tsx` — integrar OnboardingModal

**Notas técnicas:**
- Para el export de imagen de Matriz: `html2canvas` no está instalado. Alternativa: export PNG con `<canvas>` nativo requiere re-renderizar la tabla como canvas. Mejor empezar con JSON + CSV que son simples.
- Para `Escenarios.tsx`: leer el archivo completo antes de modificar, ya que tiene 6 sliders con estado complejo.
- El `useSearchParams` de react-router v7 puede usarse para leer/escribir query params en HashRouter — verificar compatibilidad antes de usar.

---

## Stack y rutas clave del proyecto

```
/home/user/MejoraDecisiones/
├── src/
│   ├── pages/          ← 15 módulos React
│   ├── components/     ← dashboard-shell, actor-graph, stat-card
│   ├── hooks/          ← useLiveIndicators (nuevo en F3)
│   ├── lib/
│   │   ├── seed-data.ts
│   │   ├── nash-solver.ts   ← nuevo en F1
│   │   ├── weekly-diff.ts   ← nuevo en F2
│   │   ├── api-client.ts    ← nuevo en F3
│   │   └── data/
│   └── __tests__/
│       ├── data.test.ts
│       └── nash.test.ts     ← nuevo en F1
├── Documents/
│   ├── CTO-ROADMAP.md
│   ├── CTO-SESSION-STATE.md  ← ESTE ARCHIVO
│   ├── MASTER.md
│   └── CHANGELOG.md
└── .github/workflows/
    ├── pages.yml  ← quality job agregado en F1
    └── ci.yml     ← nuevo en F1
```

**URL de producción:** https://pabloeckert.github.io/MejoraDecisiones/
**Rama de trabajo:** `claude/cto-analysis-framework-E583b`
**Rama de deploy:** `main` (auto-deploy via GitHub Actions)

---

## Métricas de calidad actuales

| Métrica | Antes sesión 2 | Después sesión 2 |
|---------|---------------|-----------------|
| Tests | 35 (solo datos) | 52 (datos + Nash solver) |
| CI/CD calidad | ❌ Sin lint/test | ✅ lint+test+build |
| Datos en vivo | 0% | 3 APIs integradas (dólar, reservas, inflación) |
| UX — weekly diff | ❌ | ✅ localStorage |
| UX — Grafo detalle | ❌ Click sin info | ✅ Panel lateral completo |

---

## Reglas de trabajo (no cambiar sin autorización)

1. Todo el desarrollo va en `claude/cto-analysis-framework-E583b`
2. NO tocar el repo MejoraApp
3. Commit + Push al cierre de cada fase
4. Actualizar este archivo (CTO-SESSION-STATE.md) en cada sesión
5. Actualizar CHANGELOG.md con cada versión
6. Datos ficticios = OK como fallback, pero siempre con datos reales cuando hay API

---

*Este archivo es el único punto de entrada para retomar trabajo. Actualizarlo es obligatorio al final de cada sesión.*
