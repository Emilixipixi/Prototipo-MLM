import { relativoHoy } from '../datos/academico/fechasCampus';
import { contextoElemento, type DatosContexto } from '../motores/academico/contexto';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';

export function datosContextoActual(): DatosContexto {
  const { programas, modulos } = useAcademicoStore.getState();
  const { matriculas, membresias, progreso, intentos } = useCampusStore.getState();
  return { programas, modulos, matriculas, membresias, progreso, intentos };
}

export function contextoActual(personaId: string, elementoId: string) {
  return contextoElemento(personaId, elementoId, datosContextoActual(), relativoHoy(0));
}
