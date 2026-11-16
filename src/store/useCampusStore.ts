import { create } from 'zustand';
import {
  documentosIniciales, eventosIniciales, intentosIniciales, matriculasIniciales, membresiasIniciales, progresoInicial,
  sustentacionesIniciales,
} from '../datos/academico/matriculasIniciales';
import type {
  DocumentoAcademico, EventoIntegracion, IntentoEvaluacion, Matricula, Membresia, ProgresoComponente, SustentacionMid,
} from '../tipos/academico';

interface DatosCampus {
  matriculas: Matricula[]; membresias: Membresia[]; progreso: Record<string, ProgresoComponente>;
  intentos: IntentoEvaluacion[]; documentos: DocumentoAcademico[]; sustentaciones: SustentacionMid[]; eventos: EventoIntegracion[];
  avisos: string[];
}

interface EstadoCampus extends DatosCampus {
  actualizar: (cambios: Partial<DatosCampus>) => void;
  reiniciar: () => void;
}

function datosIniciales(): DatosCampus {
  return structuredClone({
    matriculas: matriculasIniciales, membresias: membresiasIniciales, progreso: progresoInicial, intentos: intentosIniciales,
    documentos: documentosIniciales, sustentaciones: sustentacionesIniciales, eventos: eventosIniciales,
    avisos: [] as string[],
  });
}

export const useCampusStore = create<EstadoCampus>((set) => ({
  ...datosIniciales(),
  actualizar: (cambios) => set(cambios),
  reiniciar: () => set(datosIniciales()),
}));
