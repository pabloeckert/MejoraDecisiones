# Runbook — Respuesta a incidentes

## Severidad

- **SEV-1**: App caída, error en home
- **SEV-2**: Módulo degradado (grafo no carga, datos no renderizan)
- **SEV-3**: Bug visual o filtro roto

## Pasos

1. **Detectar**: error en consola, reporte de usuario
2. **Reproducir**: abrir en incógnito, anotar ruta y viewport
3. **Acotar**: `git log` para identificar commit problemático
4. **Mitigar**: rollback si SEV-1, fix forward si SEV-2/3
5. **Postmortem**: documento en `Documents/incidents/`

## Errores conocidos

- `[unenv] X is not implemented` → librería Node-only, reemplazar
- `__dirname is not defined` → CommonJS en ESM, corregir
- Grafo sin nodos → verificar `nodes[].position` y `data`
- Aristas invisibles → verificar `source`/`target` matchean `id`
