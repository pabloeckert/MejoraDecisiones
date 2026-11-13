# MejoraDecisiones — Tablero Nash

Dashboard analítico sobre poder, alianzas y escenarios políticos en Argentina, construido con teoría de juegos.

**→ [Ver producción](https://pabloeckert.github.io/MejoraDecisiones/)**

## Repositorio canónico

Este repo unifica el desarrollo de Nash. Los repos anteriores están archivados:
- `nash-power-play` → archivado
- `nash-dashboard` → archivado

## Módulos

Estados de Matriz de pagos, Escenarios, Indicadores, Predictor, Congreso, Alianzas y Feed corregidos tras auditoría de código real (2026-09-14) — no reflejaban su nivel real de implementación.

| # | Módulo | Estado |
|---|--------|--------|
| 00 | Overview | ✅ Lanzador multi-escala (L4–L1) + stats y diff |
| OS | Decision OS (`/decisiones`) | ✅ Motor universal: Wald, Savage, Prospect Theory (Ariely), Monte Carlo, Árboles Secuenciales, TOPSIS, 4 Lentes, Bitácora Brier Score y Context Packs Internacionales |
| 01 | Grafo de actores | ✅ Grafo interactivo real (`@xyflow/react`), filtros y layout por ideología |
| 02 | Matriz de pagos | ✅ Equilibrios de Nash puros y mixtos (2×2), poda de dominancia estricta (IESDS), exportación JSON y 6 plantillas |
| 03 | Escenarios | ✅ Simulador what-if con 6 parámetros, URL compartible y sincronización en vivo con BCRA/INDEC |
| 04 | Indicadores | ✅ Dólar, reservas BCRA, inflación INDEC, divisas globales (Frankfurter) y Banco Mundial en vivo |
| 05 | Pensamiento IA | ✅ |
| 06 | PyMEs & Gemelo | ✅ Simulador interactivo de exposición y resiliencia empresarial (Monte Carlo + Federación Diagnóstico 4D) |
| 07 | Kanban | ✅ |
| 08 | Predictor | ✅ Motor Bayesiano multi-horizonte con auto-calibración en vivo y Brier Score conectado a Bitácora |
| 09 | Congreso & Banzhaf | ✅ Calculadora real de poder de coalición (Índice de Banzhaf), quórum y blindaje de vetos |
| 10 | Provincias | ✅ |
| 11 | Sombra | ✅ |
| 12 | Internacional | ✅ |
| 13 | Alianzas | ✅ Analizador de estabilidad de coaliciones en Juegos Repetidos (Teorema del Folklore) + simulador de balance de poder |
| 14 | Feed | ✅ Centro de Inteligencia Multi-Fuente con nivel de evidencia y triangulación en 4 Lentes Estratégicas |

## Stack

- Vite 5 · React 19 · React Router
- Tailwind v4 · oklch dark theme
- @xyflow/react (grafo interactivo)
- recharts (gráficos)
- TypeScript · Zod

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy

Push a `main` → GitHub Actions → GitHub Pages (automático).

## Documentación

| Archivo | Propósito |
|---------|-----------|
| `Documents/ARQUITECTURA-DECISION-OS.md` | Informe de diseño y arquitectura del Sistema Operativo Universal de Decisiones (L4–L1, Internacional y Federación) |
| `Documents/MASTER.md` | Fuente de verdad del proyecto |
| `Documents/ANALISIS-MULTIDISCIPLINAR.md` | Análisis desde 40+ roles profesionales |
| `Documents/Nash-Plan-Maestro.docx` | Plan maestro original |
| `Documents/CHANGELOG.md` | Historial de cambios |

Cuando escribas **"documentar"**, toda la documentación en `Documents/` se actualiza.

## Licencia

MIT
