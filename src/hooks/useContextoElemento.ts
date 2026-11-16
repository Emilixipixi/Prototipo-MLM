import { useMemo } from 'react';
import { relativoHoy } from '../datos/academico/fechasCampus';
import { contextoElemento } from '../motores/academico/contexto';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';

export function useContextoElemento(personaId: string | undefined, elementoId: string | undefined) {
  const programas = useAcademicoStore((estado) => estado.programas);
  const modulos = useAcademicoStore((estado) => estado.modulos);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const membresias = useCampusStore((estado) => estado.membresias);
  const progreso = useCampusStore((estado) => estado.progreso);
  const intentos = useCampusStore((estado) => estado.intentos);
  return useMemo(() => (personaId && elementoId
    ? contextoElemento(personaId, elementoId, { programas, modulos, matriculas, membresias, progreso, intentos }, relativoHoy(0))
    : null), [personaId, elementoId, programas, modulos, matriculas, membresias, progreso, intentos]);
}

export function useResumenProgramaPersona(personaId: string | undefined, programaId: string | undefined) {
  const programas = useAcademicoStore((estado) => estado.programas);
  const modulos = useAcademicoStore((estado) => estado.modulos);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const membresias = useCampusStore((estado) => estado.membresias);
  const progreso = useCampusStore((estado) => estado.progreso);
  const intentos = useCampusStore((estado) => estado.intentos);
  return useMemo(() => ({ programas, modulos, matriculas, membresias, progreso, intentos, personaId, programaId }),
    [programas, modulos, matriculas, membresias, progreso, intentos, personaId, programaId]);
}
