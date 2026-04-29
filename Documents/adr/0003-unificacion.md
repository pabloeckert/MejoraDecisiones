# ADR-0003 — Unificación de repositorios

## Estado: Aceptado
## Fecha: 2026-04-30

## Contexto

Existían dos repositorios con el mismo objetivo (Tablero Nash) pero arquitecturas diferentes:

- **nash-power-play**: React 19 + TanStack Start + shadcn/ui + xyflow. Solo Etapa 1 implementada (grafo). Arquitectura moderna, escalable, type-safe.
- **nash-dashboard**: Vanilla JS/HTML/CSS. 12 paneles funcionales con datos reales. Monolítico (app.js de 704 líneas). PWA + CI/CD + tests.

## Decisión

Unificar en **nash-power-play** usando React/TanStack como base y migrando los datos y paneles de nash-dashboard como módulos TypeScript.

## Razonamiento

### Por qué React/TanStack como base
1. **Escalabilidad**: Componentes modulares vs app.js monolítico
2. **Type Safety**: TypeScript previene bugs en datos complejos (24 provincias, 30+ actores, matrices)
3. **DX**: Hot Module Replacement, file-based routing, tree-shaking
4. **UI Consistencia**: shadcn/ui garantiza accesibilidad y consistencia visual
5. **Grafo**: xyflow ya implementado y funcionando

### Por qué migrar datos de nash-dashboard
1. **Contenido valioso**: 12 paneles con datos reales de Argentina 2026
2. **Validado**: Tests de datos ya escritos y pasando
3. **Completo**: Cubre más superficie que los placeholders de power-play

## Consecuencias

### Positivas
- Un solo repo para mantener
- Arquitectura moderna con todo el contenido
- Type safety en todos los datos
- Deploy unificado

### Negativas
- Esfuerzo de migración (datos + componentes)
- Pérdida temporal de la URL de GitHub Pages de nash-dashboard
- Curva de aprendizaje para contributors que solo conocen vanilla JS

### Mitigaciones
- Migración incremental (datos primero, componentes después)
- Redirect desde la URL antigua
- Documentación clara en README

## Alternativas consideradas

1. **Mantener ambos repos**: Rechazado. Duplicación de esfuerzo, datos desincronizados.
2. **Migrar power-play a vanilla JS**: Rechazado. Pierde las ventajas de React/TanStack.
3. **Usar Next.js**: Rechazado. TanStack Start ya elegido y funcionando.
