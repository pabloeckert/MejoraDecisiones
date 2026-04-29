# ADR-0004 — Estrategia de Deployment

## Estado: Aceptado
## Fecha: 2026-04-30

## Contexto

El proyecto necesita deployment automático con las siguientes características:
- Push a `main` → deploy automático
- URL estable para producción
- PWA support (offline)
- Preview en PRs (opcional)

## Decisión

**GitHub Pages** como hosting primario con **GitHub Actions** como CI/CD.

## Configuración

### GitHub Actions workflow
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
```

### Build
- `vite build` genera output estático
- Upload como artifact a GitHub Pages

### PWA
- `manifest.json` en raíz
- `sw.js` con cache-first strategy
- Offline fallback al index

## Alternativas consideradas

1. **Cloudflare Workers**: Más complejo, no necesario para contenido estático
2. **Vercel**: Bien pero introduce dependencia externa
3. **Netlify**: Similar a Vercel
4. **Lovable Cloud**: Mencionado en plan original pero no disponible

## Futuro

- Dominio propio cuando esté listo
- CDN edge caching si el tráfico lo justifica
- Error tracking (Sentry/LogRocket) en Etapa 5
