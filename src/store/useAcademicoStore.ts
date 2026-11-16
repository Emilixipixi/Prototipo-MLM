import { create } from 'zustand';
import { modulosIniciales, temasIniciales, timsIniciales } from '../datos/academico/contenidos';
import { planesMembresiaIniciales } from '../datos/academico/membresias';
import { preguntasIniciales } from '../datos/academico/preguntas';
import { programasIniciales } from '../datos/academico/programas';
import type { Modulo, PlanMembresia, Pregunta, Programa, Tema, Tim } from '../tipos/academico';

interface DatosAcademico {
  programas: Programa[]; modulos: Modulo[]; temas: Tema[]; tims: Tim[]; preguntas: Pregunta[]; planes: PlanMembresia[];
}

interface EstadoAcademico extends DatosAcademico {
  actualizar: (cambios: Partial<DatosAcademico>) => void;
  reiniciar: () => void;
}

function datosIniciales(): DatosAcademico {
  return structuredClone({
    programas: programasIniciales, modulos: modulosIniciales, temas: temasIniciales, tims: timsIniciales,
    preguntas: preguntasIniciales, planes: planesMembresiaIniciales,
  });
}

export const useAcademicoStore = create<EstadoAcademico>((set) => ({
  ...datosIniciales(),
  actualizar: (cambios) => set(cambios),
  reiniciar: () => set(datosIniciales()),
}));
