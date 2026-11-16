import type { EstadoElemento, IntentoEvaluacion, Matricula, Membresia, Modulo, ProgresoComponente, Programa } from '../../tipos/academico';
import { accesoPrograma, type AccesoPrograma } from './accesos';
import type { ElementoRuta } from './desbloqueo';
import { resumirPrograma, type ResumenPrograma } from './progreso';

export interface DatosContexto {
  programas: Programa[]; modulos: Modulo[]; matriculas: Matricula[]; membresias: Membresia[];
  progreso: Record<string, ProgresoComponente>; intentos: IntentoEvaluacion[];
}

export interface ContextoElemento {
  elemento: ElementoRuta; modulo: Modulo; curso: Programa; programa: Programa; acceso: AccesoPrograma;
  resumen: ResumenPrograma; estado: EstadoElemento; indice: number; anterior: ElementoRuta | null; siguiente: ElementoRuta | null;
}

export function moduloDeElemento(elementoId: string, modulos: Modulo[]): Modulo | null {
  return modulos.find((modulo) => modulo.timId === elementoId || modulo.temaIds.includes(elementoId)) ?? null;
}

export function contextoElemento(personaId: string, elementoId: string, datos: DatosContexto, fecha: string): ContextoElemento | null {
  const modulo = moduloDeElemento(elementoId, datos.modulos);
  if (!modulo) return null;
  const curso = datos.programas.find((programa) => programa.id === modulo.programaId);
  if (!curso) return null;
  const acceso = accesoPrograma(personaId, curso.id, datos.matriculas, datos.membresias, datos.programas, fecha);
  let programa = curso;
  if (acceso.via === 'diplomado' && acceso.matricula) {
    programa = datos.programas.find((item) => item.id === acceso.matricula?.programaId) ?? curso;
  } else if (!acceso.acceso) {
    const diplomado = datos.matriculas
      .filter((matricula) => matricula.personaId === personaId)
      .map((matricula) => datos.programas.find((item) => item.id === matricula.programaId))
      .find((item) => item?.tipo === 'diplomado' && item.cursoIds.includes(curso.id));
    const directa = datos.matriculas.some((matricula) => matricula.personaId === personaId && matricula.programaId === curso.id);
    if (diplomado && !directa) programa = diplomado;
  }
  const resumen = resumirPrograma(personaId, programa.id, { programas: datos.programas, modulos: datos.modulos }, datos);
  if (!resumen) return null;
  const indice = resumen.ruta.findIndex((elemento) => elemento.id === elementoId);
  if (indice < 0) return null;
  return {
    elemento: resumen.ruta[indice], modulo, curso, programa, acceso, resumen, estado: resumen.estados[elementoId], indice,
    anterior: resumen.ruta[indice - 1] ?? null, siguiente: resumen.ruta[indice + 1] ?? null,
  };
}
