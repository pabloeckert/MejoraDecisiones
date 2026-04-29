# Runbook — Refresh de datos

## Datos estáticos (actuales)

Editar archivos en `src/lib/data/` y hacer commit. El cambio se refleja al instante.

### Archivos de datos

| Archivo | Contenido | Frecuencia |
|---------|-----------|-----------|
| `seed-data.ts` | Actores y relaciones del grafo | Mensual |
| `ai-thinking.ts` | Pensamiento IA (5 modelos) | Semanal |
| `social-trends.ts` | Tendencias redes sociales | Semanal |
| `analysts.ts` | Analistas nacionales/internacionales | Semanal |
| `organisms.ts` | Organismos nacionales/internacionales | Mensual |
| `pymes.ts` | Diagnóstico PyME | Mensual |
| `kanban.ts` | Escenarios Kanban | Quincenal |
| `provinces.ts` | 24 provincias | Mensual |
| `congress.ts` | Congreso (Diputados + Senado) | Post-sesión |
| `alliances.ts` | Mapa de alianzas | Quincenal |
| `shadow.ts` | Actores en la sombra | Mensual |
| `international.ts` | Bloques internacionales | Mensual |
| `scenarios.ts` | Escenarios Nash | Mensual |
| `feed.ts` | Feed de fuentes | Semanal |
| `ai-kb.ts` | Knowledge base IA | Semanal |

## Verificación antes de editar

1. Consultar fuentes públicas (ver `data-sources.md`)
2. Citar fuente en cada dato
3. Verificar con tests: `node tests/data.test.js`

## Datos automáticos (futuro, Etapa 4+)

- Cron llama a `/api/refresh-indicators`
- Valida firma compartida
- Upsertea en tabla de indicadores
- Frecuencias: dólar (5min), riesgo (30min), inflación (mensual)
