# Runbook — Deploy

## Flujo automático (GitHub Actions)

1. Push a `main` → GitHub Actions se dispara
2. `vite build` genera output estático
3. Upload artifact a GitHub Pages
4. Live se actualiza en ~2 minutos

## Build local

```bash
bun install
bun run build
# Output en .output/ o dist/
```

## Verificación post-deploy

- [ ] `/` carga overview con stats
- [ ] `/grafo` renderiza ≥25 nodos
- [ ] `/ia` muestra 5 modelos de IA
- [ ] `/pymes` muestra 6 sectores
- [ ] `/kanban` permite drag-drop
- [ ] `/congreso` muestra bloques
- [ ] `/provincias` muestra 24 provincias
- [ ] PWA instala correctamente
- [ ] No errores en consola

## Rollback

- `git revert HEAD` + push
- O restaurar versión anterior en GitHub → Releases

## Contacto

Owner: Pablo Eckert · @pabloeckert
