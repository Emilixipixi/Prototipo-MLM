import { useMemo } from 'react';
import { programasDeDocente } from '../servicios/docentes';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useErickStore } from '../store/useErickStore';
import { usePersonaSesion } from '../store/useSesionStore';

export function useProgramasDocente(): string[] {
  const persona = usePersonaSesion();
  const asignaciones = useErickStore((estado) => estado.asignacionesDocentes);
  const programas = useAcademicoStore((estado) => estado.programas);
  return useMemo(() => (persona ? programasDeDocente(persona.id, asignaciones, programas) : []), [persona, asignaciones, programas]);
}
