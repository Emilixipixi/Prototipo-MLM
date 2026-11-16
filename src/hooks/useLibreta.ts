import { useMemo } from 'react';
import { construirLibreta, type Libreta } from '../servicios/notasDocente';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { usePersonasStore } from '../store/usePersonasStore';

export function useLibretas(programaIds: string[]): Record<string, Libreta> {
  const programas = useAcademicoStore((estado) => estado.programas);
  const modulos = useAcademicoStore((estado) => estado.modulos);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const progreso = useCampusStore((estado) => estado.progreso);
  const intentos = useCampusStore((estado) => estado.intentos);
  const personas = usePersonasStore((estado) => estado.personas);
  const clave = programaIds.join('|');
  return useMemo(() => Object.fromEntries(clave.split('|').filter(Boolean).map((id) => [id, construirLibreta(id, personas, { programas, modulos }, { matriculas, progreso, intentos })])),
    [clave, programas, modulos, matriculas, progreso, intentos, personas]);
}
