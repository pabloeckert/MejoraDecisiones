import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { registerFederationBridge } from './lib/federation'
import './styles.css'

// Registrar puente de federación autónomo para integraciones futuras (MejoraApp / Diagnóstico 4D)
registerFederationBridge()

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/MejoraDecisiones/sw.js').catch(() => {
      // SW registration failed, app works without it
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
