# Prompt para siguiente sesión — MejoraDecisiones

**Contexto:**
- MejoraDecisiones es el repo canónico del Tablero Nash: dashboard analítico de poder político argentino con teoría de juegos.
- Repo: https://github.com/pabloeckert/MejoraDecisiones
- Producción: https://pabloeckert.github.io/MejoraDecisiones/
- Stack: Vite 5 + React 19 + TypeScript + Tailwind v4 + xyflow + recharts + Zod
- Deploy: GitHub Actions → GitHub Pages (automático en push a main)
- 15 módulos: Overview, Grafo, Matriz, Escenarios, Indicadores, IA, PyMEs, Kanban, Predictor, Congreso, Provincias, Sombra, Internacional, Alianzas, Feed
- Es para uso particular, luego se integrará como módulo gratuito en MejoraApp (app para CEOs/gerencia).
- NO tocar MejoraApp.

**Documentación en Documents/:**
- MASTER.md — fuente de verdad
- ANALISIS-MULTIDISCIPLINAR.md — análisis desde 40+ roles
- Nash-Plan-Maestro.docx — plan maestro original
- CHANGELOG.md — historial

**Tareas pendientes (en orden de prioridad):**

1. **Grafo visual con xyflow** — el módulo Grafo (src/pages/Grafo.tsx) ya usa @xyflow/react. Mejorar: agregar physics layout, filtros por tipo de actor, expand/collapse nodos, tooltip con info del actor.

2. **Completar Matriz de pagos** — src/pages/Matriz.tsx tiene templates pero falta editor interactivo (drag & drop celdas), heatmap de colores, y export a imagen/PDF.

3. **Completar Escenarios** — src/pages/Escenarios.tsx tiene sliders. Conectar con datos reales (APIs públicas: BCRA, INDEC) y agregar "qué cambió esta semana".

4. **Completar Indicadores** — src/pages/Indicadores.tsx necesita KPIs en vivo: riesgo país, dólar oficial/blue, inflación mensual, reservas BCRA.

5. **Weekly diff** — en Overview, mostrar qué cambió desde la última visita. Necesita persistencia (localStorage o snapshot).

6. **Tests** — hay 35 tests Vitest. Agregar tests para Matriz (Nash equilibrium calculation), Escenarios (simulator), y Grafo (data integrity).

7. **Mejoras visuales** — modo claro/claro alternativo, command bar (⌘K) para búsqueda rápida, onboarding de 60 segundos para nuevos usuarios.

**Regla:** Todo va en este repo. No tocar otros repos.
