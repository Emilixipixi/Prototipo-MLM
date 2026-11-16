import { useMemo } from 'react';
import { relativoHoy } from '../datos/academico/fechasCampus';
import { estadoMatricula, estadoMembresia } from '../motores/academico/accesos';
import { resumirPrograma } from '../motores/academico/progreso';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { EstadoMatricula, Matricula, Membresia, ResultadoNota } from '../tipos/academico';
import type { Persona } from '../tipos/persona';

export interface FilaMatricula { matricula: Matricula; persona: Persona | undefined; programa: string; estado: EstadoMatricula; avance: number; nota: ResultadoNota }
export interface FilaMembresia { membresia: Membresia; persona: Persona | undefined; plan: string; estado: EstadoMatricula }

export function useDatosAcademicos() {
  const academico = useAcademicoStore();
  const campus = useCampusStore();
  const personas = usePersonasStore((estado) => estado.personas);
  return useMemo(() => {
    const hoy = relativoHoy(0);
    const estructura = { programas: academico.programas, modulos: academico.modulos };
    const registro = { matriculas: campus.matriculas, progreso: campus.progreso, intentos: campus.intentos };
    const filasMatriculas: FilaMatricula[] = campus.matriculas.map((matricula) => {
      const resumen = resumirPrograma(matricula.personaId, matricula.programaId, estructura, registro);
      return {
        matricula, persona: personas.find((persona) => persona.id === matricula.personaId),
        programa: academico.programas.find((programa) => programa.id === matricula.programaId)?.nombre ?? matricula.programaId,
        estado: estadoMatricula(matricula, hoy), avance: resumen?.avance ?? 0, nota: resumen?.nota ?? { nota: null, estado: 'pendiente' },
      };
    });
    const filasMembresias: FilaMembresia[] = campus.membresias.map((membresia) => ({
      membresia, persona: personas.find((persona) => persona.id === membresia.personaId),
      plan: academico.planes.find((plan) => plan.id === membresia.planId)?.nombre ?? membresia.planId, estado: estadoMembresia(membresia, hoy),
    }));
    const nombrePersona = (id: string) => {
      const persona = personas.find((item) => item.id === id);
      return persona ? `${persona.nombres} ${persona.apellidos}` : id;
    };
    const nombrePrograma = (id: string | null) => (id ? academico.programas.find((programa) => programa.id === id)?.nombre ?? id : '-');
    return { hoy, academico, campus, personas, filasMatriculas, filasMembresias, nombrePersona, nombrePrograma };
  }, [academico, campus, personas]);
}
