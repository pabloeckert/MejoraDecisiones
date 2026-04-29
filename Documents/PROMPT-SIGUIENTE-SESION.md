# Prompt para siguiente sesión — Nash en MejoraApp

**Contexto rápido:**
- Nash es un módulo de inteligencia política argentina (teoría de juegos) dentro de MejoraApp (app para CEOs/gerencia).
- Ya integrado en MejoraApp como tab "Nash" con 5 sub-secciones: Resumen, Actores, Matriz, Escenarios, Alianzas.
- Repo MejoraApp: https://github.com/pabloeckert/MejoraApp (React 18 + Vite + Supabase + shadcn/ui, deploy en Vercel)
- Repo Nash original: https://github.com/pabloeckert/nash-power-play (fuente de datos, a consolidar)
- Documentos en nash-power-play/Documents/: ANALISIS-MULTIDISCIPLINAR.md y Nash-Plan-Maestro.docx
- Es para uso particular, será parte gratuita de la comunidad MejoraApp.

**Tareas pendientes (en orden de prioridad):**

1. **Grafo visual con xyflow** — agregar @xyflow/react al tab "Actores" para visualizar nodos (actores) y edges (relaciones aliadas/rivales) como grafo interactivo. Usar los datos de src/data/nash/actors.ts.

2. **Weekly diff** — en el tab Resumen, agregar una sección "Qué cambió esta semana" comparando datos actuales vs snapshot anterior. Necesita persistencia (localStorage o Supabase).

3. **Datos en vivo** — reemplazar los archivos .ts hardcodeados con fetch a APIs públicas:
   - Riesgo país: API del BCRA o Ámbito
   - Dólar: API de DolarAPI.com
   - Inflación: API de INDEC

4. **Export PDF** — botón en Escenarios para descargar reporte del escenario actual como PDF (ya existe jspdf en MejoraApp).

5. **Completar módulo Indicadores** — dashboard con KPIs en vivo (riesgo país, dólar, inflación, reservas BCRA).

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase, recharts (ya instalado), lucide-react.

**Regla:** Todo se integra en MejoraApp/src/components/nash/ y MejoraApp/src/data/nash/. No tocar otros módulos existentes.
