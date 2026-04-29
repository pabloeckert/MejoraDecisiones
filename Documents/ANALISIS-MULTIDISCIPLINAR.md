# Nash — Análisis Multidisciplinar Profundizado
## Desde la óptica de 40+ roles profesionales

**Fecha:** 30 de abril de 2026  
**Analista:** Equipo multidisciplinar Nash  
**Repositorios:** `nash-power-play` (canónico) · `nash-dashboard` (archivar)  
**Documento base:** Nash.docx v1.0

---

## Veredicto Ejecutivo

El análisis entregado en Nash.docx es **sólido y bien estructurado**. Este documento complementa, profundiza y en algunos puntos **rebate o matiza** lo dicho, con base en la inspección directa del código fuente. La recomendación global coincide: **nash-power-play es el repo canónico**, el análisis del documento es correcto en lo esencial, pero hay matices importantes que un equipo real necesitaría resolver antes de ejecutar.

---

## 1. ÁREA TÉCNICA

### 1.1 Software Architect

**Dictamen sobre el código real:**

El código de `nash-power-play` está **mejor organizado de lo que sugiere el diagnóstico**. Se observa:

- ✅ Code splitting real con `React.lazy` + `Suspense` en los 15 módulos — no es aspiracional, ya funciona.
- ✅ Separación clara: `pages/` (rutas), `components/` (UI), `lib/data/` (dominio), `__tests__/` (validación).
- ✅ Zod presente en `nash-dashboard` (dependencies), aunque `nash-power-play` no lo tiene como dependencia directa — **gap real**.
- ✅ Modelo de datos tipado (`Actor`, `Relation`, `ActorKind`) con tipos algebraicos — buena práctica.

**Donde discrepo con el documento:**

El documento sugiere migrar a **Next.js 15**. Yo siendo arquitecto evaluaría primero **si realmente necesitas SSR/ISR**. Tu producto es una SPA analítica para usuarios autenticados. El SEO importa en las landing pages, no en los dashboards. Alternativa más barata:

- Mantener Vite + React para la app.
- Agregar una landing estática con Next.js/Astro separada.
- Solo migrar a Next.js si el SEO de módulos individuales (provincias, actores) genera tráfico orgánico real.

**Entregable que aporto:**
```
ADR-001: Mantener Vite+React para SPA, separar landing → ahorra 3-4 semanas de migración.
ADR-002: Monorepo con Turborepo sí, pero packages/ui primero, apps/web después.
ADR-003: Arquitectura hexagonal prematura — primero backend funcional, luego refactor.
```

### 1.2 Cloud Architect

**Mi lectura:**

El documento propone Cloudflare Workers/D1/R2. Es sensato para LATAM por latencia, pero **D1 todavía tiene limitaciones serias** para queries analíticas complejas (JOINs, agregaciones). Mi propuesta:

| Capa | Opción recomendada | Razón |
|------|-------------------|-------|
| Edge/CDN | Cloudflare | Latencia LATAM, WAF incluido |
| Compute API | Hono en Cloudflare Workers o Fly.io | Cold start <50ms, costo |
| DB transaccional | Neon (Postgres serverless) | Scale-to-zero, PITR incluido |
| Cache | Cloudflare KV o Upstash Redis | Para datos políticos que cambian 1-2x/día |
| Object storage | R2 | Assets, exports PDF |
| Data warehouse | ClickHouse Cloud | Analítica pesada, barato |

**Riesgo que el documento no menciona:** Cloudflare Workers tiene límite de 30s por request. Si el motor Nash calculara equilibrios mixtos de matrices 4×4 con múltiples iteraciones, podría necesitar Durable Objects o externalizar el cálculo.

### 1.3 Backend Developer

**Hallazgo importante en el código:**

El módulo `Matriz.tsx` ya tiene implementada la **búsqueda de equilibrios puros de Nash** con templates de dilema del prisionero, coordinación, gallina y escenarios políticos argentinos. El motor de cálculo existe en el frontend:

```typescript
// Ya implementado en Matriz.tsx:
// - findPureNash(): encuentra equilibrios puros por mejor respuesta
// - findMixedNash(): calcula equilibrios mixtos (2x2)
// - 5 templates políticos argentinos precargados
```

**Esto cambia la prioridad del roadmap.** El documento dice "módulos 02-04 incompletos" pero **Matriz ya tiene lógica de Nash funcionando**. Lo que falta es:
- Editor interactivo (drag & drop celdas).
- Export a PDF/imagen.
- Conexión con datos reales del Congreso.

**Mi recomendación:** No reescribas el motor Nash en el backend todavía. Primero conecta los templates con datos reales (votaciones del Congreso), y deja el cálculo en el cliente hasta que las matrices sean >6×6.

### 1.4 Frontend Developer

**Inspección del stack:**

`nash-power-play` usa React Router (hash-based), `nash-dashboard` usa TanStack Router (file-based routing más moderno). El documento dice que son "casi idénticos" — **no es exacto**. `nash-dashboard` tiene:
- TanStack Router + TanStack Start (Vite 7)
- shadcn/ui completo (40+ componentes Radix)
- Cloudflare Vite plugin

`nash-power-play` tiene:
- React Router v7 (Vite 5)
- Componentes propios más simples
- Vitest incluido como dependencia (no solo devDependency)

**Dictamen:** Si consolidas, la dirección correcta es tomar el **sistema de UI de nash-dashboard** (shadcn/ui es superior a componentes ad-hoc) pero el **patrón de code splitting de nash-power-play** (que sí funciona). Mezclar lo mejor de ambos.

### 1.5 iOS / Android Developer

**Acuerdo con el documento pero con matiz:** El público objetivo (CEOs, inversores) vive en iPhone, no en Android. Si los recursos son limitados:

1. **Fase 1:** PWA optimizada con push notifications web (ya cubre 70% del valor).
2. **Fase 2:** App iOS nativa primero (SwiftUI).
3. **Fase 3:** Android solo si hay demanda real demostrada.

React Native/Expo es una opción intermedia razonable, pero para un producto premium con 15 módulos complejos (grafos, matrices, charts), **las apps nativas dan mejor resultado** en UX y performance.

### 1.6 DevOps Engineer

**El CI/CD de nash-power-play funciona.** El workflow de GitHub Actions despliega a Pages. Lo que falta:

```yaml
# Agregar al pipeline:
steps:
  - name: Type check        # ← NO existe hoy
    run: npx tsc --noEmit
  - name: Lint              # ← script existe pero no está en CI
    run: npm run lint
  - name: Unit tests        # ← existe ✅
    run: npm test
  - name: Build             # ← existe ✅
    run: npm run build
  - name: Bundle analysis   # ← NO existe
    run: npx vite-bundle-visualizer
  - name: Lighthouse CI     # ← NO existe
    run: npx lhci autorun
```

**Prioridad inmediata:** Agregar type-check al CI. Si `tsc --noEmit` falla, no deploy. Esto evita bugs silenciosos.

### 1.7 SRE

**SLOs propuestos por el documento son razonables** pero prematuros. Hoy no hay backend que monitorear. Para la SPA estática en GH Pages:

- **SLO realistic:** 99.5% (GH Pages tiene su propio SLA).
- **Métrica real:** Lighthouse Performance Score >90, First Contentful Paint <1.5s.
- **Alerta:** GitHub Actions workflow failure → Slack/email.

Cuando haya backend, los SLOs del documento (99.9%, p95 TTFB <300ms) son correctos.

### 1.8 Cybersecurity Architect

**Hallazgo crítico en el código:**

```typescript
// seed-data.ts contiene datos de actores políticos con:
// - ideology: -1 a +1 (escala ideológica explícita)
// - power: 0 a 1 (poder relativo asignado)
```

Esto es **riesgo reputacional serio**. Asignar un score de "poder" y una posición ideológica a personas reales (Milei, CFK, Macri) sin fuentes citadas ni metodología publicada es un blanco fácil para demandas por difamación o manipulación.

**Acción inmediata:**
1. Agregar disclaimer legal visible en cada módulo.
2. Documentar metodología de scoring (fuentes, criterios, actualización).
3. Considerar que los scores sean derivados de datos públicos (votaciones, encuestas) no de opinión editorial.

### 1.9 Data Engineer

**Lo que el documento no dice:** Los datos en `lib/data/` son **archivos TypeScript estáticos**. No hay JSON, no hay CSV, no hay API. Cada cambio de dato requiere:
1. Editar el archivo .ts.
2. Hacer commit.
3. Esperar el build + deploy.

Para un MVP esto es aceptable. Para v2, la migración debe ser:

```
Archivos .ts → JSON en /public/data/ → API REST → Base de datos
```

El paso intermedio (JSON en `/public/data/`) ya permite actualizaciones sin recompilar, y es trivial de implementar.

### 1.10 Machine Learning Engineer

**El predictor actual (Escenarios.tsx) NO es ML.** Es un modelo heurístico lineal con coeficientes hardcodeados:

```typescript
const inflEffect = (p.inflacion - 20) * -0.4
base.consolidacion += inflEffect
```

Esto es **regresión manual**, no machine learning. El documento lo llama "módulo Predictor" como si fuera ML — hay que ser honestos con los usuarios sobre qué es y qué no es.

**Para hacerlo real:**
1. Recopilar dataset histórico: elecciones, votaciones, indicadores económicos → resultados.
2. Entrenar modelo bayesiano o XGBoost.
3. Publicar Brier score y calibration plot.
4. El modelo heurístico puede ser el "baseline" contra el cual se mide el ML.

### 1.11 QA Automation Engineer

**Los tests actuales son buenos para lo que son:** validación de integridad de datos (que no haya IDs duplicados, que los actores tengan campos requeridos, que las relaciones referencien actores válidos). Pero:

- 0 tests de componentes.
- 0 tests E2E.
- 0 tests visuales.
- 0 tests de accesibilidad.

**Plan realista:**
```
Semana 1: Agregar Vitest + Testing Library para componentes críticos (Grafo, Matriz, Overview).
Semana 2: Playwright E2E para los 5 módulos principales.
Semana 3: axe-core para accesibilidad automatizada.
```

### 1.12 DBA

**El modelo ER propuesto por el documento es correcto.** Agrego:

```sql
-- Tabla adicional crítica no mencionada:
CREATE TABLE modelo_versiones (
  id UUID PRIMARY KEY,
  modelo_tipo VARCHAR(50), -- 'nash_equilibrium', 'scenario_prediction'
  parametros JSONB,
  resultado JSONB,
  brier_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Permite auditoría: "¿qué predecía el modelo el 1 de enero?"
```

Esto es **fundamental para credibilidad**: si publicás predicciones, necesitás poder demostrar qué decías antes de que pasara.

---

## 2. ÁREA DE PRODUCTO Y GESTIÓN

### 2.1 Product Manager

**El documento define bien las personas pero le falta un JTBD (Job-to-be-done) más concreto:**

> "Cada lunes a las 8am, necesito saber en 60 segundos: ¿qué cambió en el tablero de poder argentino esta semana y qué decisiones debería tomar mi empresa?"

Ese es el momento de valor. Todo el producto debería optimizarse para ese instante.

**North Star Metric del documento ("decisiones tomadas/usuario/mes") es difícil de medir.** Alternativa más práctica: **"módulos consultados por usuario por semana"** — medible con analytics simples y correlaciona con retención.

### 2.2 Product Owner

**Backlog prioritizado (primeras 10 historias):**

| # | Historia | Prioridad | Esfuerzo |
|---|----------|-----------|----------|
| 1 | Como CEO, quiero ver qué cambió esta semana en un solo vistazo | P0 | M |
| 2 | Como analista, quiero editar la matriz de pagos con datos reales del Congreso | P0 | L |
| 3 | Como usuario, quiero recibir alertas cuando un equilibrio Nash cambia | P1 | M |
| 4 | Como inversor, quiero exportar un reporte PDF del escenario actual | P1 | S |
| 5 | Como usuario nuevo, quiero un onboarding de 60 segundos | P1 | M |
| 6 | Como CEO, quiero login con Google/SSO para acceder rápido | P1 | S |
| 7 | Como usuario, quiero modo oscuro/claro según contexto | P2 | S |
| 8 | Como analista, quiero comparar dos escenarios lado a lado | P2 | L |
| 9 | Como usuario, quiero buscar cualquier actor con ⌘K | P2 | M |
| 10 | Como admin, quiero actualizar datos sin redeploy | P0 | L |

### 2.3 Scrum Master

**Para un equipo de 1-3 personas, Scrum formal es overkill.** Recomiendo Kanban con WIP limit de 3 items. Sprints solo si hay más de 3 personas.

### 2.4 UX Researcher

**Validación urgente:** El documento asume que el público pagará USD 49-150k/año. Pero **no hay evidencia de demanda real**. Antes de escribir más código:

1. Crear una landing page con pricing (sin producto funcional).
2. Correr USD 500 en LinkedIn Ads dirigido a CEOs/consultores argentinos.
3. Medir: ¿cuántos registran interés? ¿Cuántos aceptan una demo?
4. Si >5% de los que ven la landing se registran → hay señal. Si <1% → pivotear.

### 2.5 UX Designer

**Onboarding que el código actual NO tiene:**

```
Pantalla 1: "Bienvenido a Tablero Nash" → [Ver demo de 60s] o [Explorar solo]
Pantalla 2: "¿Quién sos?" → [CEO / Analista / Inversor / Periodista]
Pantalla 3: "Te recomendamos empezar por:" → módulo personalizado
```

Esto se puede implementar con `localStorage` en 2 horas. Alto impacto, bajo esfuerzo.

### 2.6 UI Designer

**La paleta azul oklch dark de v4.4.0 es profesional.** Pero el documento no menciona un problema: **los grafos con muchos nodos (25+ actores) se vuelven ilegibles en dark mode** porque los bordes y labels se pierden. Necesitamos:

- Contraste mínimo 4.5:1 en labels del grafo.
- Highlight de nodos seleccionados con glow effect.
- Minimap persistente en la esquina.

### 2.7 UX Writer

**Microcopy inconsistente detectado en el código:**

- El README dice "🔧 Etapa 2" para Matriz — el usuario no sabe qué es "Etapa 2". Mejor: "🚧 En construcción".
- Los templates de Matriz usan "Dilema del Prisionero" — bien para académicos, pero el CEO promedio no sabe qué es. Tooltip explicativo necesario.

### 2.8 Localization Manager

**Para expansión LATAM, el orden de idiomas debe ser:**

1. **es-AR** (actual) ✅
2. **en** (inversores internacionales, embajadas, fondos)
3. **es-MX** (mercado más grande de LATAM)
4. **pt-BR** (Brasil es el vecino con más capital)
5. **es-CO, es-CL** (mercados secundarios)

No es solo traducción: la estructura de datos (actores, provincias, alianzas) es **completamente diferente por país**. Cada mercado necesita su propio `seed-data.ts`.

---

## 3. ÁREA COMERCIAL Y DE CRECIMIENTO

### 3.1 Growth Manager

**El funnel AARRR del documento es correcto pero le falta la métrica más importante para un producto B2B analítico:**

> **Time to Value (TTV):** ¿Cuántos segundos desde que el CEO abre la app hasta que entiende algo que no sabía?

Objetivo: **<30 segundos**. Si el Overview no entrega un insight inmediato ("Milei perdió 5 puntos de poder legislativo esta semana"), el usuario se va.

### 3.2 ASO Specialist

**Cuando lancen apps nativas, los keywords prioritarios son:**

- "riesgo país argentina"
- "política argentina"
- "análisis político"
- "teoría de juegos"
- "escenarios políticos"

Competencia baja en estos nichos en App Store. Ventana de oportunidad real.

### 3.3 SEO Specialist

**El documento tiene razón: SPA en GH Pages es un desierto SEO.** Acción inmediata sin migrar a Next.js:

1. Crear `nash.com.ar` (dominio propio).
2. Landing estática en `/` con los 15 módulos como cards.
3. Generar OG images dinámicas por módulo (Vercel OG Image o Satori).
4. Sitemap XML manual actualizado mensualmente.

### 3.4 Business Development Manager

**Top 10 cuentas target (priorizadas por probabilidad de cierre):**

| # | Cuenta | Por qué | Ticket estimado |
|---|--------|---------|-----------------|
| 1 | Banco Galicia | Riesgo país core business | $50k/año |
| 2 | CIPPEC | Think tank, necesita datos | $15k/año |
| 3 | Embajada de EE.UU. | Monitoreo político LATAM | $80k/año |
| 4 | JP Morgan Argentina | Riesgo soberano | $100k/año |
| 5 | Grupo Clarín | Inteligencia mediática | $30k/año |
| 6 | IERAL (Fundación Mediterránea) | Policy research | $20k/año |
| 7 | Embajada de Brasil | Vecino estratégico | $60k/año |
| 8 | Techint | Riesgo regulatorio | $40k/año |
| 9 | Adcap Securities | Inversión | $25k/año |
| 10 | Diario La Nación | Periodismo de datos | $15k/año |

### 3.5 Content Manager

**Newsletter "Equilibrio Nash" — formato sugerido:**

```
📊 Nash de la semana
━━━━━━━━━━━━━━━━━━━
🏆 Actor que más subió: [nombre] (+X puntos de poder)
📉 Actor que más bajó: [nombre] (-Y puntos)
🤝 Alianza clave: [qué cambió]
🎯 Escenario más probable: [nombre] (Z% probabilidad)
📈 Indicadores clave: Riesgo país | Dólar | Inflación
💡 Insight accionable: [1 oración]
```

Esto se puede generar semi-automáticamente con un template y datos actualizados.

---

## 4. ÁREA DE OPERACIONES, LEGAL Y ANÁLISIS

### 4.1 Business Intelligence Analyst

**Instrumentación mínima para v1 (sin backend):**

```javascript
// PostHog (gratuito hasta 1M events/mes):
import posthog from 'posthog-js'
posthog.init('phc_...', { api_host: 'https://us.i.posthog.com' })

// Eventos a trackear:
posthog.capture('module_viewed', { module: 'matriz' })
posthog.capture('scenario_simulated', { params: { ... } })
posthog.capture('export_clicked', { format: 'pdf' })
posthog.capture('actor_clicked', { actorId: 'milei' })
```

Esto se puede integrar en 1 hora y da visibilidad inmediata del comportamiento real.

### 4.2 Data Scientist

**El modelo de Escenarios.tsx tiene un problema metodológico:** los coeficientes son arbitrarios (`-0.4`, `0.3`, `0.2`). No hay forma de saber si son correctos sin backtesting.

**Plan de backtesting:**
1. Tomar datos de enero 2024.
2. Correr el modelo con parámetros de ese momento.
3. Comparar predicción con lo que realmente pasó.
4. Ajustar coeficientes.
5. Repetir para 6 meses diferentes.
6. Publicar resultados (transparencia = credibilidad).

### 4.3 Legal & Compliance Officer

**El documento cubre bien los legales.** Agrego un punto crítico:

Los actores políticos modelados (Milei, CFK, Macri) son **personas públicas**. En Argentina, la jurisprudencia sobre "libertad de expresión vs. derecho al honor" es matizada. Mientras el producto:
- Sea explícitamente analítico (no editorial).
- No afirme hechos falsos.
- Muestre metodología transparente.
- Tenga disclaimer claro.

...está protegido por el derecho a la información. Pero **los scores de "poder" e "ideología" sin fuente son vulnerables**. Recomiendo:
1. Cada score debe tener tooltip con fuente.
2. Agregar "Este modelo es ilustrativo y no representa una postura editorial."
3. Permitir que los actores soliciten revisión de sus datos (mecanismo de ARCO).

### 4.4 DPO

**Hoy no hay datos personales de usuarios** (sin auth, sin backend). Pero los datos de actores políticos SÍ son datos personales bajo GDPR/Ley 25.326 (información sobre personas identificadas). Obligaciones:

1. Publicar política de tratamiento de datos de actores.
2. Base legal: interés legítimo (análisis político de figuras públicas).
3. Mecanismo de contacto para solicitudes ARCO.

### 4.5 Customer Success Manager

**Onboarding playbook para los primeros 10 clientes enterprise:**

```
Semana 1: Demo personalizada (30 min) con datos relevantes para SU industria.
Semana 2: Acceso Pro gratis por 30 días.
Semana 3: Check-in: "¿Qué módulo usás más? ¿Qué falta?"
Semana 4: Revisión de valor: "¿Qué decisión tomaste gracias a Nash?"
Mes 2: QBR: métricas de uso + roadmap de features que les importan.
```

### 4.6 Technical Support

**Sin backend, el soporte hoy es:**
- T1: GitHub Issues (ya existe).
- T2: Email del fundador.
- T3: No aplica aún.

**Cuando haya backend:** Zendesk o Intercom para T1, on-call rotation para T2/T3.

### 4.7 RevOps

**Unit economics baseline (estimación):**

| Métrica | Target |
|---------|--------|
| CAC (Pro self-service) | <$50 |
| CAC (Enterprise B2B) | <$2,000 |
| LTV Pro (12 meses) | $588 |
| LTV Enterprise | $50k-150k |
| Payback Pro | <1 mes |
| Payback Enterprise | <6 meses |
| NRR target | >115% |
| Gross margin | >80% (SaaS) |

---

## 5. PUNTOS DE DISCREPANCIA CON EL DOCUMENTO BASE

| Punto | Documento dice | Mi dictamen |
|-------|---------------|-------------|
| Migrar a Next.js | Recomendado para SEO | **Prematuro** — landing separada + SPA Vite es más barato |
| Módulos 02-04 "incompletos" | Etapa pendiente | **Matriz ya tiene motor Nash funcional** — el diagnóstico subestima el avance |
| Monetización | Stripe en etapa 6 | **Mover a etapa 2** — sin revenue, el proyecto muere en 6 meses |
| Predictor como "ML" | Modelo predictivo | **Es heurística lineal** — hay que ser honestos con los usuarios |
| Equipo de 4 personas | USD 280-450k/año | **Optimista** — un equipo senior de 4 en LATAM cuesta USD 300-500k, en USA >$800k |
| Apps nativas | Etapa 5 | **PWA primero, iOS nativo en etapa 3** — el CEO no instala PWAs |
| 15 módulos | Fortaleza | **Riesgo** — mejor 5 módulos excelentes que 15 mediocres |

---

## 6. PLAN DE ACCIÓN — PRIMEROS 30 DÍAS

### Semana 1: Consolidar
- [ ] Archivar `nash-dashboard` con redirect a `nash-power-play`.
- [ ] Agregar `tsc --noEmit` al CI pipeline.
- [ ] Agregar `SECURITY.md`, `CODEOWNERS`, `dependabot.yml`.
- [ ] Publicar disclaimer legal en la app.
- [ ] Agregar `CONTRIBUTING.md`.

### Semana 2: Completar núcleo
- [ ] Matriz de pagos: conectar templates con datos reales de votaciones del Congreso.
- [ ] Escenarios: agregar "qué cambió esta semana" en el Overview.
- [ ] Indicadores: al menos 3 KPIs con datos reales (riesgo país, dólar, inflación).

### Semana 3: Validar mercado
- [ ] Landing page con pricing en dominio propio.
- [ ] USD 500 en LinkedIn Ads → medir conversión.
- [ ] 5 entrevistas con potenciales clientes pagos.

### Semana 4: Medir
- [ ] Integrar PostHog (analytics gratuito).
- [ ] Definir métricas norte reales (TTV, módulos/usuario/semana).
- [ ] Primer reporte de usage para tomar decisiones informadas.

---

## 7. LO QUE EL DOCUMENTO ACIERTA DE LLENO

1. **"Producto sin clientes pagos es un hobby caro"** — frase más importante del documento.
2. **Consolidar en un solo repo** — urgente e indiscutible.
3. **El orden de prioridades del CEO** — correcto: consolidar → completar → backend → datos → mobile → monetizar.
4. **Riesgo reputacional** — el punto más infravalorado y más importante.
5. **"Disciplina es cerrar lo que está, cobrarlo, escuchar al que paga"** — oro puro.

---

## 8. LO QUE EL DOCUMENTO NO DICE (PERO DEBERÍA)

1. **El fundador necesita un co-founder técnico o un CTO.** Un solo developer no puede ejecutar este plan solo.
2. **La competencia existe:** Datlas, Poliarquía, consultoras como Management & Fit ya hacen análisis político. Nash necesita un diferenciador claro (teoría de juegos + visualización).
3. **El timing es perfecto:** Argentina está en el radar global. Fondos internacionales buscan herramientas de monitoreo político. La ventana es de 6-12 meses.
4. **GitHub Pages no es un hosting de producción** para un producto que pretende cobrar. Migrar a Vercel/Cloudflare Pages es trivial y da dominio custom + SSL + analytics.
5. **Los datos hardcodeados son una ventaja para el MVP**, no solo una debilidad. Permiten iterar rápido sin infraestructura. La clave es saber cuándo migrar.

---

*Documento generado por análisis multidisciplinar del código fuente, el documento Nash.docx v1.0, y los repositorios nash-power-play y nash-dashboard. Este análisis es complementario al documento base, no reemplazante.*
