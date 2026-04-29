# MejoraDecisiones — Tablero Nash

Dashboard analítico sobre poder, alianzas y escenarios políticos en Argentina, construido con teoría de juegos.

**→ [Ver producción](https://pabloeckert.github.io/nash-power-play/)**

## Repositorio canónico

Este repo unifica el desarrollo de Nash. Los repos anteriores están archivados:
- `nash-power-play` → archivado
- `nash-dashboard` → archivado

## Módulos

| # | Módulo | Estado |
|---|--------|--------|
| 00 | Overview | ✅ |
| 01 | Grafo de actores | ✅ |
| 02 | Matriz de pagos | 🔧 Etapa 2 |
| 03 | Escenarios | 🔧 Etapa 3 |
| 04 | Indicadores | 🔧 Etapa 4 |
| 05 | Pensamiento IA | ✅ |
| 06 | PyMEs | ✅ |
| 07 | Kanban | ✅ |
| 08 | Predictor | ✅ |
| 09 | Congreso | ✅ |
| 10 | Provincias | ✅ |
| 11 | Sombra | ✅ |
| 12 | Internacional | ✅ |
| 13 | Alianzas | ✅ |
| 14 | Feed | ✅ |

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
