import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { informarConsistencia, verificarConsistencia } from './datos/verificarConsistencia';
import { obtenerFuente } from './servicios/fuente';
import { iniciarPersistencia } from './store/persistencia';
import { useCompensacionStore } from './store/useCompensacionStore';
import { verificarConsistenciaAcademica } from './datos/academico/verificarConsistenciaAcademica';
import { useAcademicoStore } from './store/useAcademicoStore';
import { useCampusStore } from './store/useCampusStore';
import { useFormacionStore } from './store/useFormacionStore';
import { usePersonasStore } from './store/usePersonasStore';
import './index.css';

iniciarPersistencia();

if (import.meta.env.DEV) {
  informarConsistencia(verificarConsistencia(obtenerFuente(), useCompensacionStore.getState().corridas));
  informarConsistencia(verificarConsistenciaAcademica({
    ...useAcademicoStore.getState(), ...useCampusStore.getState(),
    formacion: useFormacionStore.getState().estados, personas: usePersonasStore.getState().personas,
  }));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
