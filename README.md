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
| 00 | Overview | ✅ |
| 01 | Grafo de actores | ✅ Grafo interactivo real (`@xyflow/react`), filtros y layout por ideología |
| 02 | Matriz de pagos | ✅ Equilibrios de Nash puros y mixtos (2×2) calculados de verdad, 6 escenarios |
| 03 | Escenarios | ✅ Simulador what-if con modelo ponderado de 6 parámetros macro |
| 04 | Indicadores | 🟡 Parcial — dólar, reservas BCRA e inflación en vivo (DolarAPI, BCRA, datos.gob.ar/INDEC), el resto de los KPIs es estático |
| 05 | Pensamiento IA | ✅ |
| 06 | PyMEs | ✅ |
| 07 | Kanban | ✅ |
| 08 | Predictor | 🔧 Cascarón — mapea datos estáticos a tarjetas, sin modelo de predicción real |
| 09 | Congreso | 🔧 Cascarón — sin cómputo, solo datos estáticos |
| 10 | Provincias | ✅ |
| 11 | Sombra | ✅ |
| 12 | Internacional | ✅ |
| 13 | Alianzas | 🔧 Cascarón — sin cómputo, solo datos estáticos |
| 14 | Feed | 🔧 Cascarón — sin cómputo, solo datos estáticos |

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
| `Documents/MASTER.md` | Fuente de verdad del proyecto |
| `Documents/ANALISIS-MULTIDISCIPLINAR.md` | Análisis desde 40+ roles profesionales |
| `Documents/Nash-Plan-Maestro.docx` | Plan maestro original |
| `Documents/CHANGELOG.md` | Historial de cambios |

Cuando escribas **"documentar"**, toda la documentación en `Documents/` se actualiza.

## Licencia

MIT
