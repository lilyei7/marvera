import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initHTTPS } from './utils/httpsRedirect'

// 🔒 INICIALIZAR HTTPS INMEDIATAMENTE
initHTTPS();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
