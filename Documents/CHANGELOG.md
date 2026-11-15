# Changelog — Tablero Nash / MejoraDecisiones

## v5.7.0 — 2026-11-15 (Bloque 5: Auditor Pre-Mortem, Reversibilidad Tipo 1 vs 2, Exportador Markdown/CSV y PWA Offline Hardening)

### Added
- **Auditor Pre-Mortem & Matriz de Reversibilidad (`src/lib/decision-engine.ts`, `src/pages/Decisiones.tsx`):**
  - Implementada función matemática y heurística `analyzeReversibilityAndPreMortem(input)` que clasifica decisiones en Puertas Tipo 1 (irreversibles) vs Puertas Tipo 2 (reversibles) de Jeff Bezos, formula la regla de velocidad de ejecución correspondiente y calcula la asignación Barbell de Taleb (reserva segura vs exposición asimétrica).
  - Simulación retrospectiva de Gary Klein proyectando el fracaso en 12 meses, identificando 3 vectores críticos de falla, canarios tempranos en la mina (disparadores de stop-loss a 30-60 días) y salvaguardas mandatorias antes de ejecutar.
  - Bloque visual interactivo en `/decisiones` integrado tanto en la vista operativa como en la Sección 5 del Reporte Ejecutivo PDF imprimible.
- **Exportadores Universales de Decisiones (`src/lib/decision-engine.ts`, `src/pages/Decisiones.tsx`):**
  - Nueva función `generateDecisionMarkdownReport(data)` para copiar al portapapeles o descargar archivos `.md` formateados con tablas, EV, Wald, Savage, Monte Carlo, TOPSIS, 4 Lentes y Pre-Mortem listos para Obsidian, Notion o actas de directorio.
  - Nueva función `generateDecisionJournalCsv(entries)` y botón en la Bitácora para exportar el historial auditable completo en formato CSV compatible con Excel y Python.
- **Hardening PWA Offline & Cache de Mercado Global (`public/manifest.json`, `public/sw.js`, `index.html`):**
  - Service worker actualizado (`v5.7.0`) con estrategia *Stale-While-Revalidate* para APIs externas (DolarAPI, Frankfurter BCE, Banco Mundial, BCRA, INDEC), permitiendo que todo el Decision OS funcione sin conexión en aviones o viajes.
  - Manifiesto PWA y metadatos actualizados a `MejoraDecisiones · Decision OS`.
- **Tests Unitarios (`src/__tests__/decision-engine.test.ts`):** 2 nuevos tests cubriendo reversibilidad, simulación Pre-Mortem, generación Markdown y serialización CSV (**68 tests totales pasando**).

## v5.6.0 — 2026-11-14 (Bloque 4: Alertas Centinela, Comparador Global, Onboarding 60s y Federación Bidireccional)

### Added
- **Protocolo de Federación Bidireccional & Hidratación URL (`src/lib/federation.ts`, `src/pages/Decisiones.tsx`):**
  - Nueva función `parseFederatedDecisionQuery(params)` para pre-cargar en `/decisiones` título (`title`), nivel fractal (`level`), región (`region`) y alternativas (`optA`, `optB`, `optC`) desde enlaces profundos o aplicaciones externas del ecosistema Mejora.
  - Listener `postMessage` bidireccional en `registerFederationBridge()` aceptando comandos `PING`, `IMPORT_BUNDLE` y `SET_ENTERPRISE_PROFILE` bajo el contrato `mejora.decision-os.v1` con respuesta de estado al `event.source`.
- **Alertas Centinela Stop-Loss y Comparador Global (`src/pages/Indicadores.tsx`):**
  - Monitor configurable de 4 disparadores tempranos (Donella Meadows) persistido en `localStorage` (`mejora_sentinel_thresholds_v1`): Brecha Cambiaria %, Inflación Mensual INDEC %, Riesgo País (bps) y USD/BRL, con salto directo a `/decisiones?level=L3_EMPRESA&title=...` para activar protocolos pre-armados.
  - Nueva pestaña `🌐 Comparador Global` (`internacional`) con gráfico de barras comparativo y tabla multi-país en vivo para los 6 cartuchos regionales (`GLOBAL`, `AR`, `US`, `BR`, `MX`, `EU`).
- **Onboarding 60s y Consola Ejecutiva de Federación (`src/pages/Overview.tsx`):**
  - Modal interactivo de arranque en 60 segundos (`mejora_os_onboarded_v1`) con guía en 4 pasos y acceso directo en el Hero (`🧭 Guía Rápida (60s)`).
  - Nueva **Consola Ejecutiva de Estado & Puente de Federación** con resumen en vivo del Cartucho Regional activo, Perfil Empresarial vinculado, Bitácora con Calibración Brier, estado del bus `mejora.decision-os.v1`, descarga de backup JSON y enlace federado hacia Diagnóstico 4D.
- **Tests Unitarios (`src/__tests__/decision-engine.test.ts`):** Test para `parseFederatedDecisionQuery` validando hidratación de parámetros válidos y descarte de niveles/regiones inválidos (**66 tests totales pasando**).

## v5.5.0 — 2026-11-14 (Bloque 3 Completo: 100% de los 16 Módulos Interactivos Decision OS)

### Changed
- **Kanban Interactivo (`src/pages/Kanban.tsx`):** Persistencia en `localStorage`, movimiento entre columnas (`Emerging`, `Active`, `Dominant`, `Collapsed`), recalibración de probabilidades (`1%–95%`), KPIs de exposición de riesgo, creación de nuevas hipótesis y salto directo a `/decisiones`.
- **Sintetizador de Consenso IA (`src/pages/IA.tsx`):** Ponderación dinámica de credibilidad por modelo (`0%–100%`), Índice de Consenso Ponderado + Dispersión Epistémica ($\sigma$), Auditor de Hipótesis Propia en las 4 Lentes Estratégicas y Termómetro Bullish/Neutral/Bearish de analistas.
- **Radar Internacional y Shocks Globales (`src/pages/Internacional.tsx`):** Conectado a cotizaciones BCE Frankfurter y Banco Mundial por región, con Simulador de Transmisión de 5 Shocks Geopolíticos (Fed, Aranceles, Energía, Mercosur-UE, Devaluación Brasil) y filtrado seguro de bloques internacionales.
- **Simulador de Pacto Federal (`src/pages/Provincias.tsx`):** Cambio en vivo de postura por provincia (`Aliada`, `Bisagra`, `Hostil`), escenarios rápidos de *Provincias Unidas*, cálculo de Mayoría Pacto Fiscal (`13/24`) y Tercio de Blindaje (`8/24`), e Índice de Poder de Coalición de Banzhaf territorial.
- **Mapeo de Operadores en la Sombra (`src/pages/Sombra.tsx`):** Doble contexto (`🇦🇷 Poder Informal Político` y `🏢 Poder Informal en Empresas / Gatekeepers`), operadores propios persistidos en `localStorage` y diagnóstico táctico Maquiavelo / Sun Bin (Veto Oculto, Acceso, Agenda, Ruptura, Neutralización y Alineamiento).

## v5.4.0 — 2026-11-13 (Bloque 1 & Bloque 2: Wizard 60s, Reporte Ejecutivo PDF, Importador JSON y Grafo Multi-Red 4D)

### Added
- **Wizard Guiado de 60 Segundos (`src/pages/Decisiones.tsx`):** Asistente conversacional de 4 pasos que sintetiza automáticamente matriz de pagos, factores estocásticos de Monte Carlo, árbol secuencial (SPE), criterio de Kelly y ranking TOPSIS desde un problema libre.
- **Generador de Informe Ejecutivo One-Pager PDF (`src/pages/Decisiones.tsx`, `src/styles.css`):** Vista modal imprimible (`window.print()` con hoja limpia `@media print`) resumiendo contexto macro, 5 criterios bajo incertidumbre + EVPI, distribución Monte Carlo + VaR/CVaR + Kelly, SPE, TOPSIS y las 4 Lentes Estratégicas.
- **Importador de Paquetes Federados JSON (`src/pages/Decisiones.tsx`):** Carga de archivos `.json` con esquema `mejora.decision-os.v1` restaurando región activa, perfil empresarial y bitácora auditable con validación.
- **Grafo de Poder Multi-País y Empresarial (`src/lib/seed-data.ts`, `src/components/actor-graph.tsx`, `src/pages/Grafo.tsx`):**
  - Nuevas redes `GLOBAL_ACTORS` (12 potencias y organismos multipolares) y `ENTERPRISE_ACTORS` (10 stakeholders empresariales arquetípicos) exportadas en `GRAPH_NETWORKS`.
  - **Vector de 4 Dimensiones de Poder (`getActorPowerVector`):** Desglose Institucional/Veto, Operativo/Movilización, Financiero/Caja y Narrativo/Agenda inspirado en Maquiavelo y Sun Bin.
  - Creación de stakeholders propios en vivo con persistencia en `localStorage` y salto directo al simulador de decisiones (`/decisiones?level=L3_EMPRESA`).
- **Tests Unitarios (`src/__tests__/decision-engine.test.ts`):** Agregados tests de puente de federación, cálculo del Vector 4D e integridad referencial de `GRAPH_NETWORKS` (**65 tests totales pasando**).

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
