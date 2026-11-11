import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { informarConsistencia, verificarConsistencia } from './datos/verificarConsistencia';
import { obtenerFuente } from './servicios/fuente';
import { useCompensacionStore } from './store/useCompensacionStore';
import './index.css';

if (import.meta.env.DEV) {
  informarConsistencia(verificarConsistencia(obtenerFuente(), useCompensacionStore.getState().corridas));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
