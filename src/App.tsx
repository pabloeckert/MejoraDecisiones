import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DashboardShell } from './components/dashboard-shell'

// Lazy load all pages for code splitting
const OverviewPage = lazy(() => import('./pages/Overview'))
const GrafoPage = lazy(() => import('./pages/Grafo'))
const MatrizPage = lazy(() => import('./pages/Matriz'))
const EscenariosPage = lazy(() => import('./pages/Escenarios'))
const IndicadoresPage = lazy(() => import('./pages/Indicadores'))
const IAPage = lazy(() => import('./pages/IA'))
const PymesPage = lazy(() => import('./pages/Pymes'))
const KanbanPage = lazy(() => import('./pages/Kanban'))
const PredictorPage = lazy(() => import('./pages/Predictor'))
const CongresoPage = lazy(() => import('./pages/Congreso'))
const ProvinciasPage = lazy(() => import('./pages/Provincias'))
const SombraPage = lazy(() => import('./pages/Sombra'))
const InternacionalPage = lazy(() => import('./pages/Internacional'))
const AlianzasPage = lazy(() => import('./pages/Alianzas'))
const FeedPage = lazy(() => import('./pages/Feed'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="font-display text-primary text-2xl animate-pulse">▲</div>
        <div className="mt-2 text-xs font-display text-muted-foreground">Cargando módulo...</div>
      </div>
    </div>
  )
}

function App() {
  return (
    <DashboardShell>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/grafo" element={<GrafoPage />} />
          <Route path="/matriz" element={<MatrizPage />} />
          <Route path="/escenarios" element={<EscenariosPage />} />
          <Route path="/indicadores" element={<IndicadoresPage />} />
          <Route path="/ia" element={<IAPage />} />
          <Route path="/pymes" element={<PymesPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/congreso" element={<CongresoPage />} />
          <Route path="/provincias" element={<ProvinciasPage />} />
          <Route path="/sombra" element={<SombraPage />} />
          <Route path="/internacional" element={<InternacionalPage />} />
          <Route path="/alianzas" element={<AlianzasPage />} />
          <Route path="/feed" element={<FeedPage />} />
        </Routes>
      </Suspense>
    </DashboardShell>
  )
}

export default App
