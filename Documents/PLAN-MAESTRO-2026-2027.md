# Plan Maestro Interno — Actualización 2026–2027 y Hoja de Ruta de Cierre (`v5.7.0` → `v6.0.0`)

> **Propósito de este documento:** Documento técnico interno vivo para auditar el estado real de **MejoraDecisiones (`Decision OS`)**, alinear datos y arquitectura con las **tendencias reales de finales de 2026 y proyección 2027**, corregir deuda técnica silenciosa y guiar la ejecución autónoma continua (**Bloques 6 a 9**) hasta dejar el proyecto 100% terminado, autónomo y listo para federarse con el ecosistema Mejora.  
> **Fecha de auditoría:** 2026-11-16 (v5.7.0 actual en `main`, commit `f1df0a4`)  
> **Trigger de ejecución:** Al decir `"continuemos"`, ejecutar el próximo bloque pendiente en orden estricto, validar `npm run test`, `npm run lint` y `npm run build`, actualizar `CHANGELOG.md`, `CTO-SESSION-STATE.md` y marcar las casillas de este documento antes de hacer commit y push a `origin/main`.

---

## 1. Auditoría Real del Código (`v5.7.0`) — Qué funciona y qué brechas existen

### A. Núcleo consolidado hoy
- **16 rutas funcionales** (`Overview`, `Decisiones`, `Grafo`, `Matriz`, `Escenarios`, `Indicadores`, `IA`, `Pymes`, `Kanban`, `Predictor`, `Congreso`, `Provincias`, `Sombra`, `Internacional`, `Alianzas`, `Feed`).
- **Motor matemático (`src/lib/decision-engine.ts`, 976 líneas):** Valor Esperado, Wald Maximin, Savage Minimax Regret, Hurwicz, Teoría Prospectiva ($\lambda = 2.25$), EVPI, Monte Carlo PERT (3.000 iteraciones con VaR 95%, CVaR 95% y Tornado), IESDS, Inducción Hacia Atrás (SPE), Banzhaf Power Index, TOPSIS, Criterio de Kelly, Bayes, Auditor Pre-Mortem (Bezos Tipo 1 vs 2 + Klein + Taleb Barbell), Exportadores Markdown y CSV.
- **Puente de Federación (`src/lib/federation.ts`):** Contrato `mejora.decision-os.v1`, `window.MejoraDecisionOS`, `CustomEvent`, `postMessage` bidireccional (`PING`, `IMPORT_BUNDLE`, `SET_ENTERPRISE_PROFILE`), `parseFederatedDecisionQuery`, Bitácora con Brier Score y Perfil Empresarial.
- **Tests y Build actuales:** 68 tests Vitest pasando (`data.test.ts`: 35, `nash.test.ts`: 17, `decision-engine.test.ts`: 16), `eslint .` 0 errores, `tsc -b && vite build` OK.

### B. Brechas, Bugs Silenciosos y Deuda Técnica Detectada (Auditoría 2026-11-16)
1. **`.github/workflows/` inexistente en el repositorio:** Aunque `CTO-SESSION-STATE.md` y `MASTER.md` daban por completados `pages.yml` y `ci.yml` en Fase 1, actualmente no existe el directorio `.github/` en el repo. No hay CI ni auto-deploy a GitHub Pages versionado.
2. **Bug silencioso en `fetchInflacion()` (`src/lib/api-client.ts:67-75`):**
   - Consulta `148.3_INIVELGENERAL_DICI_M_26` sin `representation_mode=percent_change` (devuelve el nivel de índice acumulado en miles, no la variación mensual %) y tipa `{ data: IndecSeries }` esperando `data.data.data` cuando la respuesta real de `datos.gob.ar` es `{ data: [[fecha, valor], ...] }`. En runtime falla o distorsiona y fuerza fallback estático.
3. **Riesgo País hardcodeado (`src/pages/Indicadores.tsx:129`):**
   - `const currentRiskBps = 650` está fijo en código en la evaluación de Alertas Centinela, ignorando las fluctuaciones reales (que hacia fines de 2026 rondaron la zona de 800–900+ bps) pese a existir API pública sin clave ni CORS bloqueado (`api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo`).
4. **Cero fuentes de noticias internacionales en vivo en `/feed` e `/internacional`:**
   - Solo se consultan divisas BCE (`Frankfurter`) y datos anuales con rezago del Banco Mundial. Falta ingesta en vivo desde **GDELT 2.0 DOC API** (`api.gdeltproject.org/api/v2/doc/doc`, gratuita, sin API key y con CORS `*`) con control estricto de rate-limit (1 req / 5s + caché local).
5. **Contenido estático congelado entre 2024 y Q1 2026 (requiere actualización 2026–2027):**
   - `src/lib/data/ai-thinking.ts`: cita modelos generación 2024 (`GPT-4o`, `Claude 3.5`, `Gemini Pro`, `Llama 3.1`, `DeepSeek V2`) y hechos previos a "junio [2026]".
   - `src/lib/data/analysts.ts`: mantiene una entrada activa con *Jorge Lanata* (fallecido en dic-2024) y referencias a mar/sep 2026 en futuro.
   - `src/lib/data/scenarios.ts`, `feed.ts`, `organisms.ts`, `pymes.ts`, `international.ts`, `social-trends.ts`, `ai-kb.ts`, `kanban.ts` y `MACRO_DATA` (`Indicadores.tsx` corta en `Mar-26`): necesitan calibrarse al cierre real de **noviembre 2026 y horizonte 2027** (elecciones EEUU nov-2026 ya ocurridas, elecciones Brasil 2026 ya resueltas, revisión T-MEC México 2026–2027, transición electoral Argentina 2027).
6. **Footer desincronizado (`src/components/dashboard-shell.tsx:235`):** Muestra `v5.2 Decision OS` en lugar de sincronizarse con la versión vigente.
7. **`Escenarios.tsx` acoplado solo a Argentina y UX mejorable:** Usa `prompt()` nativo del navegador para presets sin persistencia y sliders restringidos a rangos argentinos (`inflacion: 10..50`, `riesgo: 300..1000`), inutilizable para EE.UU., Europa, Brasil o México.
8. **Ausencia de capa IA Agéntica opcional (BYOK / Local) y Análisis 2D Cruzado:** Para estar al nivel de Decision Intelligence 2026–2027, falta Stress-Testing cruzado 2D, correlación de factores en Monte Carlo (cuando todo cae junto) y copiloto IA opcional *zero-server* (BYOK / Ollama).
9. **Cero tests de integración UI ni validación Zod en fronteras:** Existen 68 tests de lógica/datos, pero ninguna validación en runtime de `importFederationBundle` / `postMessage` con esquema estricto ni smoke tests de renderizado de componentes React.

---

## 2. Actualización Estratégica a Tendencias 2026–2027

### A. Contexto Geopolítico y Económico Real (Cierre 2026 → Escenarios 2027)
- **Global / Tasas / Geopolítica:** Economía mundial resiliente (~2,8%–3,4% PIB proyectado 2027) pero fragmentada estructuralmente por aranceles, *friend-shoring* y tensiones energéticas en Medio Oriente. La Reserva Federal enfrenta inflación pegajosa y adopta postura *Higher-for-Longer* (Treasury 10Y en rango ~4,5%–5,2%) mientras el CAPEX en infraestructura de IA y energía sostiene la inversión.
- **Argentina (Rumbo a Elecciones Presidenciales y Legislativas 2027):** Superávit primario sostenido (~1,4% PIB meta), pero desaceleración de actividad en 2026 (~0,5%–2,1% PIB) con repunte proyectado para 2027 impulsado por Vaca Muerta, minería (litio/cobre) y agro. Inflación mensual estabilizada en torno al piso del **~2,0%–2,5% mensual** (~31%–33% anual). **Riesgo País tensionado (>800–900 bps)** por selectividad financiera y vencimientos 2027, con FMI exigiendo acumulación neta de reservas y gobernadores pivote negociando en la antesala electoral de 2027.
- **Estados Unidos (Post-Midterms Nov 2026):** Congreso dividido que aumenta el riesgo de fricción fiscal y techo de deuda en 2027, continuidad de aranceles ejecutivos sobre importaciones estratégicas, fuerte ciclo de automatización e IA corporativa.
- **Brasil (Post-Elecciones Generales 2026 → 2027):** Gobierno de Lula políticamente acotado por un Congreso más inclinado al centro y centroderecha (*Centrão* árbitro); foco crítico de mercado en disciplina fiscal, tasa Selic alta y equilibrio comercial entre EE.UU. (minerales críticos) y China.
- **México (2026–2027):** Crecimiento moderado (~1,4%–1,9%), inflación convergiendo hacia el objetivo Banxico (~3,0%–3,8%), pero sujeto a alta incertidumbre por la **revisión del T-MEC (USMCA)**, reglas de origen frente a insumos asiáticos y cuellos de botella eléctricos/logísticos en polos de *nearshoring*.
- **Unión Europea / España (2026–2027):** Crecimiento moderado (~1,0%–1,4%), fuerte divergencia (España liderando crecimiento en servicios frente a estancamiento industrial alemán), inflación rebotando cerca de ~2,5%–2,8% por sensibilidad energética, BCE cauto y entrada en plena aplicación regulatoria del **AI Act**, CBAM/ESG y despliegue del acuerdo Mercosur–UE.

### B. Tendencias de Software, Arquitectura y Decision Intelligence 2026–2027
1. **De Chatbots a *Agentic Decision Intelligence* con Gobernanza (*AI TRiSM*):** Motores matemáticos deterministas acoplados a un *Agent Harness* acotado (BYOK/local con validación estructurada JSON, nunca alucinación libre), manteniendo a la persona/directorio en control de supuestos y reglas de *Stop-Loss*.
2. **Digital Twins & *Policy Robustness* sobre Predicción Puntual:** Priorizar **matrices de estrés cruzado 2D** y **simulaciones con factores correlacionados** para encontrar políticas que sobrevivan múltiples shocks simultáneos en vez de optimizar un único escenario.
3. **OSINT en Tiempo Real sin Dependencias Privativas:** Conexión directa cliente a feeds abiertos globales (`GDELT 2.0`, `ArgentinaDatos`, `Frankfurter BCE`, `World Bank`) con tolerancia offline (*Stale-While-Revalidate*).
4. **Decision Hygiene & Superforecasting Auditado:** Seguimiento temporal obligatorio (`reviewAt`), detección de ruido/sobreconfianza por escala (`L4`–`L1`) y plantillas ricas para decisiones cotidianas/personales además de las corporativas.
5. **Local-First & Zero-Trust Portable Contracts:** Validación estricta (`Zod` / runtime guards) en fronteras de importación JSON y mensajería federada `postMessage` para futura integración limpia con **MejoraApp** y **Diagnóstico 4D**.

---

## 3. Hoja de Ruta Maestra hasta el Cierre Completo (`Bloques 6 a 9`)

---

### BLOQUE 6 (`v5.8.0`) — Datos Reales en Vivo, Reparación de APIs, CI/CD Real y Actualización Geopolítica 2026–2027
**Estado:** ✅ COMPLETO (2026-11-16)

**Objetivos y Tareas Exactas:**
1. **Reparación y Expansión de Conectores en Vivo (`src/lib/api-client.ts`, `src/hooks/useLiveIndicators.ts`):**
   - Corregir `fetchInflacion()`: consumir `https://api.argentinadatos.com/v1/finanzas/indices/inflacion` (últimos 6–12 meses en variación mensual `%` real) con fallback secundario a `apis.datos.gob.ar` usando `representation_mode=percent_change` y desestructuración correcta (`data.data` unidimensional).
   - Agregar `fetchRiesgoPais()`: consultar `https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo` (+ últimos registros) devolviendo `{ valor, fecha }`.
   - Agregar `fetchGlobalNewsGDELT(query, maxRecords)`: conector opcional al endpoint CORS nativo `https://api.gdeltproject.org/api/v2/doc/doc` con throttle mínimo de 5.5s entre requests y caché de 15 minutos en memoria + fallback silencioso.
   - Exportar tipo `RiesgoPaisSnapshot` y `GdeltArticle`, incorporando `riesgoPais` a `LiveIndicators`.
2. **Conexión en UI de Datos Reales (`src/pages/Indicadores.tsx`, `src/pages/Feed.tsx`, `src/pages/Internacional.tsx`, `src/components/dashboard-shell.tsx`):**
   - En `Indicadores.tsx`: reemplazar `const currentRiskBps = 650` por `live.riesgoPais?.valor ?? 840` (fallback actualizado a cierre 2026), conectar el KPI `'Riesgo país'` con `live.riesgoPais`, actualizar `MACRO_DATA` hasta `Oct-26 / Nov-26` (piso inflacionario ~2,1%–2,4%, riesgo 820–860 bps), y ajustar `DEFAULT_THRESHOLDS` (`riskBpsMax: 950`).
   - En `Feed.tsx`: integrar titulares reales de `fetchGlobalNewsGDELT` filtrados según el `region` activo (`AR`, `US`, `BR`, `MX`, `EU`, `GLOBAL`) con etiqueta `🌐 GDELT Live OSINT`.
   - En `dashboard-shell.tsx`: mostrar versión centralizada (`v5.8.0 Decision OS` o constante compartida `APP_VERSION` en `src/lib/federation.ts` / `package.json`).
3. **Actualización Integral de Datos y ContextPacks a Cierre 2026 → Horizonte 2027:**
   - Actualizar `src/lib/context-packs.ts`: reflejar tasas Fed *Higher-for-Longer* / post-Midterms EEUU nov-2026, Brasil post-elecciones 2026, México revisión T-MEC 2027, UE AI Act + divergencia energética, y Argentina transición electoral 2027 (inflación ~2%–2,5%/mes, riesgo país ~840 bps, superávit 1,4% PIB).
   - Actualizar `src/lib/data/`: `scenarios.ts`, `ai-thinking.ts` (familia de perspectivas modelo 2026–2027: Frontier Reasoning, Systems Macro Analyst, Risk & Tail Auditor, Geopolitical Strategist, Quant Stress Modeler), `analysts.ts` (remover citas anacrónicas y reflejar analistas vigentes 2026–2027), `feed.ts`, `organisms.ts`, `pymes.ts`, `international.ts`, `social-trends.ts`, `ai-kb.ts`, `kanban.ts`.
   - **Regla de no regresión:** Verificar que `src/__tests__/data.test.ts` sigue pasando el 100% de sus invariantes sin relajar aserciones.
4. **CI/CD Real en `.github/workflows/`:**
   - Crear `.github/workflows/ci.yml` (`npm ci`, `npm run lint`, `npm run test`, `npm run build` en PRs y ramas).
   - Crear `.github/workflows/pages.yml` (`quality` job con lint + test antes del job `build-and-deploy` a GitHub Pages en push a `main`).

**Criterios de Aceptación Bloque 6:**
- Nuevos tests unitarios en `decision-engine.test.ts` (o `api-client.test.ts`) mockeando `fetch` para verificar parseo correcto de `fetchInflacion`, `fetchRiesgoPais` y `fetchGlobalNewsGDELT` (incluyendo caché/fallback).
- `npm run test`, `npm run lint`, `npm run build` en 0 errores.
- `.github/workflows/ci.yml` y `.github/workflows/pages.yml` versionados y válidos.

---

### BLOQUE 7 (`v5.9.0`) — Simulación Avanzada 2027: Stress-Test Cruzado 2D, Correlación Monte Carlo y Biblioteca Multi-Escala Global
**Estado:** ✅ COMPLETO (2026-11-16)

**Objetivos y Tareas Exactas:**
1. **Stress-Test Cruzado 2D / Heatmap de Robustez (`src/lib/decision-engine.ts` + `/decisiones`):**
   - Nueva función pura `evaluateCrossImpactGrid(input)` que cruza 2 variables macro/operativas ($5 \times 5$ celdas: eje X vs eje Y), evalúa cada alternativa en cada punto y retorna la alternativa ganadora por celda, su payoff neto y el porcentaje de robustez global de la política elegida.
   - Panel visual tipo Mapa de Calor en la pestaña de simulación de `/decisiones` permitiendo detectar rápidamente en qué combinación de shocks colapsa una estrategia.
2. **Correlación Sistémica en Monte Carlo (`runMonteCarloSimulation`):**
   - Agregar parámetro opcional `systemicCorrelation` ($\rho \in [-0.8, 0.8]$, default `0`) en `src/lib/decision-engine.ts` usando mezcla gaussiana / factor común reproducible para modelar crisis donde múltiples riesgos caen al unísono, más selector de régimen en `/decisiones` (`Normal ρ=0`, `Estrés Sistémico ρ=0.6`, `Antifrágil / Cobertura ρ=-0.4`).
3. **Internacionalización Completa de `/escenarios` (`src/pages/Escenarios.tsx`):**
   - Agregar selector de `RegionCode` (`GLOBAL`, `AR`, `US`, `BR`, `MX`, `EU`) que recalibra rangos y etiquetas de sliders a cada región (ej. inflación 0%–10% y riesgo 50–400 bps en US/EU/MX/BR vs rango emergente en AR), reemplaza el `prompt()` nativo por input inline elegante + persistencia de presets en `localStorage` (`mejora_scenario_presets_v1`).
4. **Biblioteca Enriquecida de Decisiones Cotidianas y Personales (`L1_COTIDIANO` y `L2_PERSONAL` en `src/lib/context-packs.ts` + selector rápido en `/decisiones`):**
   - Sumar 6 sub-plantillas listas en 1 clic orientadas a cualquier persona o líder PyME:
     - `L1`: Negociación de precio / cliente difícil; Compra estratégica vs alquiler / tercerización; Resolución de conflicto con socio o equipo.
     - `L2`: Cambio de carrera vs emprendimiento propio; Relocalización internacional / trabajo remoto multi-moneda; Distribución de patrimonio personal (Liquidez vs Negocio vs Cobertura).

**Criterios de Aceptación Bloque 7:**
- Tests matemáticos deterministas para `evaluateCrossImpactGrid` y `runMonteCarloSimulation` con correlación $\rho \neq 0$ (verificando que con $\rho > 0$ aumenta la dispersión/cola extrema VaR95 respecto a $\rho = 0$).
- Cero llamadas a `window.prompt` en `Escenarios.tsx`.
- `npm run test`, `npm run lint`, `npm run build` pasando sin warnings ni errores.

---

### BLOQUE 8 (`v5.10.0`) — Agentic Decision Copilot (BYOK / Local LLM) + Higiene Cognitiva y Revisión de Bitácora
**Estado:** ✅ COMPLETO

**Objetivos y Tareas Exactas:**
1. **Adaptador de IA Agéntica Cliente *Zero-Server* (`src/lib/ai-copilot.ts`):**
   - Sistema BYOK (*Bring Your Own Key*) 100% autónomo en el navegador (claves optativas guardadas en `sessionStorage` o `localStorage` a elección del usuario, nunca enviadas a terceros propios) con soporte unificado para:
     - **Google Gemini REST API** (`generativelanguage.googleapis.com`)
     - **OpenAI / OpenRouter compatible** (`/v1/chat/completions`)
     - **Ollama Local** (`http://localhost:11434/api/generate` para uso 100% privado y offline en PC)
     - **Modo Determinista Integrado** (siempre disponible sin API key).
   - Prompts estructurados con salida JSON validada (*Agent Harness*):
     1. *Structurer Agent:* Convierte texto libre de un dilema en título, nivel `L4–L1`, alternativas, escenarios, matriz de pagos y supuestos Monte Carlo cargables con 1 clic en `/decisiones`.
     2. *Red-Team / Devil's Advocate Agent:* Audita la decisión actual detectando sesgos cognitivos específicos (efecto anclaje, costos hundidos, exceso de optimismo) y contra-argumentos reales.
     3. *OSINT Synthesizer:* En `/ia` y `/feed`, sintetiza en bullets ejecutivos los artículos vivos de GDELT + indicadores macro de la región elegida.
2. **Gobernanza Temporal de la Bitácora (`reviewAt`, Notificaciones de Auditoría y *Noise Check*):**
   - Extender `DecisionJournalEntry` en `src/lib/federation.ts` (retrocompatible) con `reviewDueAt?: string` (`7d`, `30d`, `90d`, `365d`).
   - En `Overview.tsx` y `Decisiones.tsx`: indicador de **"Decisiones pendientes de auditoría vencidas"** y desglose de calibración **Brier Score por Escala (`L4` vs `L3` vs `L2` vs `L1`)** para detectar si el usuario calibra bien sus finanzas pero sobreestima en macro o viceversa.
3. **Actualizar Service Worker (`public/sw.js`):** Añadir soporte seguro de passthrough (nunca cachear ni interceptar POST/peticiones con `Authorization` o claves BYOK de IA).

**Criterios de Aceptación Bloque 8:**
- Tests unitarios de parseo y sanitización de salidas del `ai-copilot` (extracción robusta de JSON desde respuestas LLM con markdown fences o campos faltantes) y de cálculo Brier por escala + vencimientos `reviewDueAt`.
- Garantía explícita de no persistir secretos por defecto fuera del control del usuario y no enviar nunca PII/API keys en `exportFederationBundle()` ni en `postMessage`.

---

### BLOQUE 9 (`v6.0.0`) — Cierre Production-Grade: Zod Validation, UI Smoke Tests, Modo Directorio WCAG + i18n (`ES`/`EN`) y SDK Contrato
**Estado:** ✅ COMPLETO

**Objetivos y Tareas Exactas:**
1. **Validación en Fronteras sin Dependencias Pesadas (o Zod-ready Guards en `src/lib/federation.ts` y `src/lib/api-client.ts`):**
   - Endurecer `importFederationBundle` y el listener `postMessage` (`MEJORA_FEDERATION_CMD`) validando tipos, rangos numéricos (`0..100`), regiones válidas y sanitización de strings para bloquear payloads corruptos o inyecciones desde orígenes externos.
2. **Tests de Componentes UI & Enrutamiento (`vitest` + `@testing-library/react` + `jsdom`):**
   - Verificar montaje sin errores de las rutas clave (`Overview`, `Decisiones`, `Indicadores`, `Matriz`, `Escenarios`, `Grafo`, `Pymes`, `IA`) y flujos críticos end-to-end (hidratación URL en `/decisiones`, activación de Alerta Centinela, guardado/auditoría en Bitácora).
3. **Auditoría Visual Completa: Modo Directorio (Claro), Móvil Responsive e Internacionalización (`ES` / `EN`):**
   - Auditar todas las páginas bajo `[data-theme="directorio"]` en `src/styles.css` corrigiendo textos con contraste bajo (`text-amber-300` o similares sobre fondo claro `#fcfcfc` en Directorio!).
   - Añadir selector ligero de idioma `ES / EN` en `dashboard-shell.tsx` cubriendo shell, escalas `L4–L1`, motores matemáticos de `/decisiones` y reportes ejecutivos (clave para el uso internacional del proyecto).
4. **Contrato Final de Federación (`Documents/INTEGRACION-ECOSISTEMA-MEJORA.md`):**
   - Documentar la especificación técnica definitiva v1 (`window.MejoraDecisionOS`, `postMessage`, deep links `?level=&region=&title=&optA=&optB=&optC=`, retorno a Diagnóstico 4D / MejoraApp), actualizar `Documents/MASTER.md` y marcar el proyecto como **Production Complete `v6.0.0`**.

**Criterios de Aceptación Bloque 9 (Cierre Final):**
- Cobertura consolidada >90 tests pasando (`data`, `nash`, `decision-engine`, `api-client`, `ai-copilot`, `federation` + UI smoke tests).
- Contraste legible en ambos temas (`tactico` oscuro y `directorio` claro) + soporte `ES`/`EN` funcional en Decision OS.
- `npm run test`, `npm run lint`, `npm run build` limpios en local y verificados en CI.

---

## 4. Invariantes Obligatorias para Cualquier Sesión Futura

1. **Autonomía ante todo:** MejoraDecisiones debe operar al 100% sin backend propio, sin API keys obligatorias y sin depender de MejoraApp.
2. **Prohibido tocar repos externos:** No modificar `MejoraApp` ni proyectos fuera de `c:\github\MejoraDecisiones`.
3. **Protección de tests base:** No debilitar ni saltear aserciones de `src/__tests__/data.test.ts`, `nash.test.ts` ni `decision-engine.test.ts`.
4. **Reglas de entorno Windows PowerShell 5.1:** Encadenar comandos con `; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE };` (nunca `&&` ni `rg`).
5. **Seguridad y Higiene React/TS:** Mantener `tsc -b` (`verbatimModuleSyntax`, `noUnusedLocals`, sin `any`), reglas de pureza de ESLint React Hooks y no filtrar jamás API keys BYOK en exports JSON/Markdown/federación.
6. **Cierre de cada Bloque:** Ejecutar `npm run test`, `npm run lint`, `npm run build`, actualizar este plan (`✅`), `CHANGELOG.md` y `CTO-SESSION-STATE.md`, y hacer commit + push a `origin/main`.
