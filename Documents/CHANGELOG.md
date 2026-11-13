# Changelog — Tablero Nash / MejoraDecisiones

## v5.2.0 — 2026-11-13 (Decision OS Completo — Autónomo + Federation-Ready)

### Added
- **Documento rector:** `Documents/ARQUITECTURA-DECISION-OS.md` con arquitectura fractal L4–L1, algoritmos matemáticos y protocolo de federación.
- **Núcleo Matemático Universal (`src/lib/decision-engine.ts`):** Wald Maximin, Savage Minimax Regret, Hurwicz, Prospect Theory (Ariely/Kahneman λ=2.25), EVPI, Simulación de Monte Carlo PERT (3.000 iteraciones con VaR 95%, CVaR 95% y Sensibilidad Tornado), Dominancia Estricta (IESDS), Inducción Hacia Atrás (SPE), Índice de Poder de Banzhaf, TOPSIS, Criterio de Kelly y Actualización Bayesiana.
- **ContextPacks Internacionales y 4 Lentes (`src/lib/context-packs.ts`):** Soporte para `GLOBAL`, `AR`, `US`, `BR`, `MX` y `EU`, plantillas L4–L1 y Consejo de 4 Lentes Estratégicas (Maquiavelo/Sun Bin, Meadows, Ariely, Drucker/Osterwalder/Moore).
- **Puente de Federación (`src/lib/federation.ts`):** Persistencia autónoma (Bitácora de Decisiones con Brier Score + Perfil de Empresa) e interfaz `window.MejoraDecisionOS`, `CustomEvent`, `postMessage` y exportación JSON `mejora.decision-os.v1`.
- **APIs Globales (`src/lib/api-client.ts`, `src/hooks/useLiveIndicators.ts`):** Frankfurter FX (BCE) y World Bank Open Data API junto a DolarAPI, BCRA e INDEC.
- **Módulo `/decisiones` (`src/pages/Decisiones.tsx`)** y **Command Bar `⌘K` (`src/components/dashboard-shell.tsx`)**.
- **Suite de tests (`src/__tests__/decision-engine.test.ts`).**

### Changed
- **Predictor (`src/pages/Predictor.tsx`):** Reemplazado el cascarón estático por Predictor Bayesiano multi-horizonte con auto-calibración en vivo y Brier Score.
- **Alianzas (`src/pages/Alianzas.tsx`):** Agregada calculadora de Juegos Repetidos (Teorema del Folklore δ*) y simulador interactivo de balance de poder sobre el grafo de relaciones.
- **Feed (`src/pages/Feed.tsx`):** Convertido en Centro de Inteligencia Multi-Fuente con niveles de evidencia y lectura cruzada en 4 Lentes Estratégicas.
- **Matriz (`src/pages/Matriz.tsx`):** Poda de estrategias estrictamente dominadas (IESDS) y exportación a JSON.
- **Escenarios (`src/pages/Escenarios.tsx`):** Estado compartible en URL (`useSearchParams`), sincronización con BCRA/INDEC y puente directo a Decision OS.
- **Congreso (`src/pages/Congreso.tsx`) y PyMEs (`src/pages/Pymes.tsx`):** Calculadora de Índice de Banzhaf y Gemelo de Exposición Empresarial con Monte Carlo.

## v5.3.0 — 2026-05-14 (CTO Fases 1-3 completas)

### Added
- **Fase 1 — CI/CD hardened:**
  - `pages.yml`: job `quality` (lint + vitest) obligatorio antes del deploy
  - `ci.yml`: workflow CI para feature branches y PRs
  - `nash-solver.ts`: módulo testeable con `findPureNash`, `solve2x2Mixed`, `solveNash`
  - `nash.test.ts`: 17 tests de equilibrios Nash puros, mixtos y propiedades invariantes
  - **Total: 52 tests pasando**
- **Fase 2 — UX Crítica:**
  - `weekly-diff.ts`: snapshot de visita con localStorage, cálculo de deltas
  - `Overview.tsx`: banda "Desde tu última visita" con cambios en alianzas/rivales/actores
  - `actor-graph.tsx`: expone `selectedId`/`onSelectActor` al padre
  - `Grafo.tsx`: panel lateral de detalle — poder, ideología, vínculos clickeables
- **Fase 3 — Datos en Vivo:**
  - `api-client.ts`: cliente fetch con caché 5min, timeout 8s, 3 APIs argentinas
  - `useLiveIndicators.ts`: hook con polling cada 5min, fallback parcial con Promise.allSettled
  - `Indicadores.tsx`: panel "Dólar hoy" (oficial/blue/MEP/CCL), KPIs con badge LIVE, timestamp

### Changed
- `Matriz.tsx`: refactorizado para importar Nash solver desde módulo separado

## v5.0.0 — 2026-05-14 (CTO Roadmap + Hardening)

### Added
- **CTO-ROADMAP.md:** Plan maestro por fases con diagnóstico ejecutivo, métricas objetivo y decisiones de arquitectura
- **CTO-SESSION-STATE.md:** Sistema de continuidad entre sesiones — di "continuemos" para retomar exactamente donde quedamos
- **CI/CD hardened:** Job `quality` (lint + vitest) ejecuta ANTES del build; si falla, no se despliega
- **Workflow CI:** `.github/workflows/ci.yml` dedicado a PRs y branches de feature
- **Tests Nash solver:** `src/__tests__/nash.test.ts` — cobertura de equilibrios puros y mixtos, estrategias dominantes
- **Weekly Diff:** `src/lib/weekly-diff.ts` — snapshot de visita con localStorage; Overview muestra "desde tu última visita"
- **Panel de detalle en Grafo:** click en un nodo muestra panel lateral con info completa del actor

### Changed
- `MASTER.md` actualizado con roadmap CTO v5.0.0 y referencias a nuevos archivos de continuidad
- Pipeline CI/CD ahora incluye calidad (lint + test) antes de deploy a producción

## v4.2.0 — 2026-04-30 (Módulos 02-04)

### Added
- **Matriz de pagos (Módulo 02):** Editor N×M interactivo (2×2, 3×3, 4×4), 6 plantillas (Dilema del Prisionero, Coordinación, Gallina, Milei vs UxP, Nación vs Gobernadores, Triple Juego), solver Nash puro (inspección de mejores respuestas), solver mixto (fórmula cerrada 2×2), visualización de equilibrios
- **Escenarios (Módulo 03):** Simulador what-if con 6 sliders (inflación, popularidad, fragmentación, reservas, pobreza, riesgo país), 5 escenarios Nash con probabilidades dinámicas, guardado/carga de presets, modelo Nash inspirado en datos reales
- **Indicadores (Módulo 04):** 8 KPIs macroeconómicos, 4 KPIs políticos, 3 gráficos (inflación, reservas, riesgo país) con recharts, vista de 8 sectores productivos con variación PIB y empleo

## v4.1.0 — 2026-04-30 (SPA Unificada)

### Changed
- Arquitectura: TanStack Start (SSR/Cloudflare) → SPA pura (Vite 5 + React Router)
- Routing: file-based TanStack → React Router HashRouter (GitHub Pages compatible)
- Build: Vite 7 + TanStack config → Vite 5 estándar
- Deploy: Cloudflare Workers → GitHub Pages estático

### Added
- 15 módulos con routing completo
- HashRouter para compatibilidad con GitHub Pages
- PWA manifest en /public/
- Documentación consolidada en Documents/MASTER.md

### Removed
- Dependencia a config externa heredada
- Dependencia a @cloudflare/vite-plugin
- SSR (Server-Side Rendering) — no necesario para contenido estático

## v4.0.0 — 2026-04-30 (Unificación)

### Added
- Fusión de repositorios `nash-power-play` + `nash-dashboard`
- 12 paneles de datos migrados como módulos TypeScript
- Datos de analistas (6 nacionales + 5 internacionales)
- Datos de organismos (5 nacionales + 6 internacionales)
- Panel PyMEs con diagnóstico sectorial (6 sectores)
- Kanban con 10 escenarios drag-drop
- Predictor con carga de datos y proyecciones
- Simulador Nash interactivo
- Datos de 24 provincias con alianzas
- Datos del Congreso (Diputados + Senado)
- Mapa de alianzas (sólidas, débiles, rotas)
- Actores en la sombra (judiciales, digitales, económicos)
- Bloques internacionales (8 bloques)
- Knowledge base IA para consultas
- Feed de fuentes con análisis
- PWA (manifest.json + service worker)
- CI/CD GitHub Actions → Pages
- Documentación consolidada en MASTER.md

## v3.0 — 2026-04-29 (nash-dashboard)

### Added
- Panel IA (5 modelos: GPT-4o, Claude, Gemini, Llama, DeepSeek)
- Panel redes sociales (Twitter, Reddit, YouTube, Telegram)
- Panel analistas nacionales e internacionales
- Panel organismos nacionales e internacionales
- Panel PyMEs (diagnóstico, indicadores, políticas, escenarios)
- Panel Kanban (10 escenarios drag-drop con recalculo Nash)
- Panel Predictor (carga datos, proyecciones multihorizonte)
- Simulador Nash (elegir jugadores + estrategia, ver payoff)
- Consulta IA (modal con knowledge base)
- PWA (Service Worker + manifest.json)
- GitHub Actions deploy
- OG tags + accesibilidad básica

## v2.0 — 2026-04-29 (nash-dashboard)

### Added
- Documents/ creado
- Internacional expandido a 15 bloques
- Actores en la sombra expandidos

## v1.0 — 2026-04-25 (nash-dashboard)

### Added
- Dashboard base con 10 paneles
- 24 provincias con alianzas
- Escenarios Nash con matriz de pagos
- Feed de fuentes

## v0.1 — 2026-04-29 (nash-power-play)

### Added
- TanStack Start v1 + React 19 + Vite 7
- Design system oklch dark theme
- shadcn/ui (50+ componentes)
- Grafo interactivo xyflow
- Seed data ~30 actores, ~40 relaciones
- File-based routing
