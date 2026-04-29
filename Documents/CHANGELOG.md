# Changelog — Tablero Nash

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
- Dependencia a @lovable.dev/vite-tanstack-config
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
