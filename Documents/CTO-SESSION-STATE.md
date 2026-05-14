# CTO Session State — Para "continuemos"

> **Instrucción:** Cuando digas "continuemos", Claude lee este archivo primero para retomar exactamente donde quedamos.
> **Última actualización:** 2026-05-14
> **Rama de trabajo:** `claude/cto-analysis-framework-E583b`

---

## ¿Cómo retomar?

Di exactamente: **"continuemos"**

Claude leerá este archivo, entenderá el estado exacto, y continuará desde la siguiente fase pendiente sin repetir trabajo ya hecho.

---

## Estado de Fases

| Fase | Estado | Completado en |
|------|--------|--------------|
| FASE 0 — Plan CTO + Documentación | ✅ COMPLETA | 2026-05-14 |
| FASE 1 — Hardening CI/CD + Tests | ✅ COMPLETA | 2026-05-14 |
| FASE 2 — UX Crítica (Weekly Diff + Grafo) | ✅ COMPLETA | 2026-05-14 |
| FASE 3 — Datos en Vivo (APIs públicas) | ⏳ PENDIENTE | — |
| FASE 4 — Export + Compartir | ⏳ PENDIENTE | — |
| FASE 5 — PWA Completo + Light Mode | ⏳ PENDIENTE | — |
| FASE 6 — Integración MejoraApp | ⏳ FUTURO | — |

---

## Lo que se hizo en esta sesión (2026-05-14)

### FASE 0 — Plan CTO + Documentación ✅
**Archivos creados/modificados:**
- `Documents/CTO-ROADMAP.md` — Plan maestro por fases (nuevo)
- `Documents/CTO-SESSION-STATE.md` — Este archivo (nuevo)
- `Documents/MASTER.md` — Actualizado con sección CTO
- `Documents/CHANGELOG.md` — Entrada v5.0.0 agregada

**Commit:** "feat(cto-fase-0): plan maestro CTO, roadmap por fases y sistema de continuidad"

### FASE 1 — Hardening CI/CD + Tests ✅
**Archivos creados/modificados:**
- `.github/workflows/pages.yml` — Job `quality` (lint + vitest) antes de build
- `.github/workflows/ci.yml` — Workflow dedicado a CI en PRs/branches
- `src/__tests__/nash.test.ts` — Tests de equilibrios Nash puro y mixto

**Commit:** "feat(cto-fase-1): CI/CD con lint+test antes de deploy, tests Nash solver"

### FASE 2 — UX Crítica ✅
**Archivos creados/modificados:**
- `src/lib/weekly-diff.ts` — Lógica de diff con localStorage
- `src/pages/Overview.tsx` — Sección "Desde tu última visita" con diff
- `src/pages/Grafo.tsx` — Panel lateral de detalle de actor al hacer click

**Commit:** "feat(cto-fase-2): weekly diff en Overview, panel de detalle en Grafo"

---

## Próxima fase a ejecutar: FASE 3 — Datos en Vivo

### Contexto necesario para FASE 3

**Objetivo:** Reemplazar datos ficticios con APIs públicas argentinas en tiempo real.

**APIs a integrar:**
1. **DolarAPI** (`api.dolarapi.com/v1/dolares`) — dólar oficial, blue, MEP, CCL
2. **BCRA** (`api.bcra.gob.ar/estadisticas/v2.0/datosvariable/1/...`) — reservas
3. **INDEC/datos.gob.ar** (`apis.datos.gob.ar/series/api/series/?ids=...`) — inflación
4. **CPI INDEC Serie** — id: `148.3_INIVELGENERAL_DICI_M_26` para IPC general

**Archivos a crear:**
- `src/lib/api-client.ts` — cliente fetch con cache (5min) y fallback
- `src/hooks/useLiveIndicators.ts` — hook con polling cada 5min
- Actualizar `src/pages/Indicadores.tsx` — KPIs en vivo

**Archivos a modificar:**
- `src/lib/data/social-trends.ts` — agregar timestamp de actualización
- `src/pages/Escenarios.tsx` — sliders inicializados con datos reales de BCRA/INDEC

**Patrón a seguir:**
```typescript
// api-client.ts pattern:
const CACHE = new Map<string, { data: unknown; ts: number }>()
const TTL = 5 * 60 * 1000 // 5 min

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = CACHE.get(url)
  if (cached && Date.now() - cached.ts < TTL) return cached.data as T
  const res = await fetch(url)
  const data = await res.json()
  CACHE.set(url, { data, ts: Date.now() })
  return data as T
}
```

**Notas importantes:**
- DolarAPI NO requiere API key, CORS habilitado para browser
- BCRA requiere header `Accept: application/json`
- INDEC/datos.gob.ar es CORS habilitado
- Todos los datos deben tener fallback estático si la API falla
- Mostrar timestamp de última actualización en Indicadores.tsx

---

## Stack y rutas clave del proyecto

```
/home/user/MejoraDecisiones/
├── src/
│   ├── pages/          ← 15 módulos React
│   ├── components/     ← dashboard-shell, actor-graph, stat-card
│   ├── lib/
│   │   ├── seed-data.ts     ← 30 actores, 40+ relaciones
│   │   ├── utils.ts
│   │   └── data/            ← 14 módulos de datos estáticos
│   └── __tests__/
├── Documents/          ← Documentación viva (este directorio)
│   ├── CTO-ROADMAP.md
│   ├── CTO-SESSION-STATE.md  ← ESTE ARCHIVO
│   ├── MASTER.md
│   └── CHANGELOG.md
└── .github/workflows/  ← CI/CD
```

**URL de producción:** https://pabloeckert.github.io/MejoraDecisiones/
**Rama de trabajo:** `claude/cto-analysis-framework-E583b`
**Rama de deploy:** `main` (auto-deploy via GitHub Actions)

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
