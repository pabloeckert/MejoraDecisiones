# CTO Roadmap — Tablero Nash / MejoraDecisiones

> **Última actualización:** 2026-05-14
> **CTO Session ID:** claude/cto-analysis-framework-E583b
> **Versión base analizada:** 4.2.0
> **Para retomar:** leer `CTO-SESSION-STATE.md`

---

## Diagnóstico Ejecutivo (2026-05-14)

### Fortalezas
- SPA React 19 bien estructurada, code splitting funcional
- 15 módulos operacionales, design system oklch consistente
- Nash solver implementado (puro + mixto en Matriz.tsx)
- CI/CD GitHub Actions → GitHub Pages funcionando
- Documentación viva en Documents/ con ADRs y runbooks
- 35+ tests Vitest sobre datos

### Deuda Técnica Identificada

| Área | Severidad | Descripción |
|------|-----------|-------------|
| CI/CD | 🟡 Media | Pipeline no corre lint ni tests antes de deploy |
| Tests | 🟡 Media | Solo cubre datos; faltan tests de lógica Nash y UI |
| Datos | 🟠 Alta | Todos los datos son estáticos/ficticios (sin APIs) |
| UX | 🟡 Media | Sin weekly diff, sin command bar, sin onboarding |
| PWA | 🟡 Media | manifest.json presente pero sin funcionalidad offline real |
| Performance | 🟢 Baja | Bundle size OK con code splitting |
| Seguridad | 🟢 Baja | Sin backend, sin datos sensibles, CSP básico OK |

---

## Arquitectura de Fases

```
FASE 0 ✅  → Plan + Docs CTO
FASE 1 ✅  → Hardening CI/CD + Tests
FASE 2 ✅  → UX Crítica (Weekly Diff + Grafo mejorado)
FASE 3     → Datos en Vivo (APIs públicas)
FASE 4     → Export + Compartir
FASE 5     → PWA completo + Light mode
FASE 6     → Integración MejoraApp (futuro)
```

---

## FASE 0 — Plan Maestro CTO y Documentación ✅

**Objetivo:** Establecer el plan, documentar el estado base, crear el sistema de continuidad entre sesiones.

**Entregables:**
- [x] `Documents/CTO-ROADMAP.md` — este archivo
- [x] `Documents/CTO-SESSION-STATE.md` — estado de sesión para "continuemos"
- [x] `Documents/MASTER.md` actualizado con plan CTO
- [x] `Documents/CHANGELOG.md` con entrada v5.0.0

**Criterio de completitud:** Archivos presentes en repo, pusheados a `claude/cto-analysis-framework-E583b`.

---

## FASE 1 — Hardening CI/CD + Tests ✅

**Objetivo:** El pipeline de CI debe fallar antes de llegar a producción si hay errores de lint o tests.

**Entregables:**
- [x] `.github/workflows/pages.yml` — agregar job `quality` (lint + test) antes de `build-and-deploy`
- [x] `.github/workflows/ci.yml` — workflow dedicado a PRs
- [x] `src/__tests__/data.test.ts` — ampliar con tests de Nash solver
- [x] `src/__tests__/nash.test.ts` — tests de equilibrios puros y mixtos

**Criterio de completitud:** `npm run test` y `npm run lint` pasan en local antes de push.

---

## FASE 2 — UX Crítica ✅

**Objetivo:** Mejorar la experiencia del usuario con features de alto impacto percibido.

**Sub-tareas:**
1. **Weekly Diff en Overview:** mostrar "desde tu última visita" usando localStorage
2. **Grafo mejorado:** panel lateral de detalle del actor al hacer click en nodo
3. **Stats en tiempo real en Overview:** contadores de alianzas/rivales dinámicos con animación

**Entregables:**
- [x] `src/pages/Overview.tsx` — sección "Desde tu última visita"
- [x] `src/pages/Grafo.tsx` — panel de detalle de actor
- [x] `src/lib/weekly-diff.ts` — lógica de diff con localStorage

**Criterio de completitud:** Features visibles y funcionales en producción.

---

## FASE 3 — Datos en Vivo (Pendiente)

**Objetivo:** Reemplazar datos ficticios con APIs públicas argentinas.

**APIs a integrar:**

| Dato | API | URL | Frecuencia |
|------|-----|-----|------------|
| Dólar oficial/blue | DolarAPI | `api.dolarapi.com` | Diaria |
| Inflación | INDEC | `apis.datos.gob.ar/series` | Mensual |
| Reservas BCRA | BCRA | `api.bcra.gob.ar` | Diaria |
| Riesgo país | Ambito | scraping / RSS | Diaria |

**Sub-tareas:**
1. Crear `src/lib/api-client.ts` — cliente con cache y retry
2. Crear `src/hooks/useLiveIndicators.ts` — hook React con SWR pattern
3. Actualizar `src/pages/Indicadores.tsx` — KPIs en vivo con fallback estático
4. Actualizar `src/pages/Escenarios.tsx` — sliders inicializados con datos reales
5. Agregar ADR-0005 sobre decisión de arquitectura de datos en vivo

**Criterio de completitud:** Al menos dólar e inflación mostrando datos reales con timestamp.

---

## FASE 4 — Export y Compartir (Pendiente)

**Objetivo:** Permitir exportar análisis y compartir snapshots.

**Sub-tareas:**
1. Export de Matriz a imagen (canvas) y JSON
2. Snapshots de Escenarios en URL (query params)
3. Botón "Compartir análisis" en Overview con URL copiable
4. Onboarding de 60s para nuevos usuarios (primera visita)

---

## FASE 5 — PWA Completo + Light Mode (Pendiente)

**Objetivo:** Experiencia móvil de primera clase y accesibilidad mejorada.

**Sub-tareas:**
1. Service Worker funcional con estrategia cache-first para datos estáticos
2. Light mode con toggle (oklch light theme)
3. Command bar ⌘K para navegación rápida
4. SEO mejorado: structured data, sitemap

---

## FASE 6 — Integración MejoraApp (Futuro)

**Objetivo:** Empaquetar Tablero Nash como módulo reutilizable para MejoraApp.

**Restricción:** NO tocar el repo MejoraApp sin autorización explícita.

**Sub-tareas (pendiente definir):**
- Exponer módulos como componentes independientes
- API de datos compartida
- Sistema de autenticación compartido

---

## Métricas de Calidad Objetivo

| Métrica | Actual | Objetivo |
|---------|--------|---------|
| Test coverage | ~30% (solo datos) | 70%+ (lógica + datos) |
| CI/CD calidad | ❌ Sin lint/test en pipeline | ✅ lint+test+build |
| Datos en vivo | 0% (todo estático) | 4 indicadores clave |
| Lighthouse Performance | No medido | 90+ |
| Lighthouse Accessibility | No medido | 90+ |

---

## Decisiones de Arquitectura Tomadas

1. **SPA pura sin SSR** — GitHub Pages estático, sin Cloudflare Workers
2. **HashRouter** — compatibilidad con GitHub Pages sin 404
3. **Datos estáticos en TS** — sin backend, sin DB
4. **Code splitting manual** — vendor-react, vendor-xyflow, vendor-recharts, vendor-data

---

*Actualizar este archivo al completar cada fase. Ver `CTO-SESSION-STATE.md` para estado de sesión activa.*
