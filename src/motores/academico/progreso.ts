import type {
  EstadoElemento, IntentoEvaluacion, Matricula, Modulo, ProgresoComponente, Programa, ResultadoNota,
} from '../../tipos/academico';
import { calcularDesbloqueos, construirRuta, cursosDePrograma, type AvanceElemento, type ElementoRuta } from './desbloqueo';
import { notaCurso, notaDiplomado, notaElemento, notaModulo } from './notas';

export interface EstructuraAcademica { programas: Programa[]; modulos: Modulo[] }

export interface RegistroCampus {
  matriculas: Matricula[]; progreso: Record<string, ProgresoComponente>; intentos: IntentoEvaluacion[];
}

export interface ResumenModulo { modulo: Modulo; temas: Array<{ id: string; nota: ResultadoNota }>; tim: ResultadoNota; nota: ResultadoNota }
export interface ResumenCurso { programa: Programa; modulos: ResumenModulo[]; nota: ResultadoNota }

export interface ResumenPrograma {
  programa: Programa; cursos: ResumenCurso[]; nota: ResultadoNota; ruta: ElementoRuta[];
  estados: Record<string, EstadoElemento>; notas: Record<string, ResultadoNota>;
  aprobados: number; total: number; avance: number; fechaCulminacion: string | null;
}

export function claveProgreso(personaId: string, temaId: string): string {
  return `${personaId}|${temaId}`;
}

export function intentosExtraPara(personaId: string, elementoId: string, matriculas: Matricula[]): number {
  return matriculas
    .filter((matricula) => matricula.personaId === personaId)
    .reduce((suma, matricula) => suma + (matricula.intentosExtra[elementoId] ?? 0), 0);
}

export function intentosDe(personaId: string, elementoId: string, intentos: IntentoEvaluacion[]): IntentoEvaluacion[] {
  return intentos
    .filter((intento) => intento.personaId === personaId && intento.ambitoId === elementoId)
    .sort((a, b) => a.fin.localeCompare(b.fin));
}

export function resumirPrograma(personaId: string, programaId: string, estructura: EstructuraAcademica, registro: RegistroCampus): ResumenPrograma | null {
  const programa = estructura.programas.find((item) => item.id === programaId);
  if (!programa) return null;
  const ruta = construirRuta(programaId, estructura.programas, estructura.modulos);
  const cursos = cursosDePrograma(programa, estructura.programas);
  const avance: Record<string, AvanceElemento> = {};
  const notas: Record<string, ResultadoNota> = {};
  let fechaCulminacion: string | null = null;

  ruta.forEach((elemento) => {
    const curso = cursos.find((item) => item.id === elemento.cursoId) ?? programa;
    const lista = intentosDe(personaId, elemento.id, registro.intentos);
    const permitidos = curso.reglas.intentosMaximos + intentosExtraPara(personaId, elemento.id, registro.matriculas);
    const nota = notaElemento(lista.map((intento) => intento.nota), curso.reglas.politicaNota, permitidos);
    notas[elemento.id] = nota;
    avance[elemento.id] = {
      componentes: elemento.tipo === 'tema' ? registro.progreso[claveProgreso(personaId, elemento.id)] : undefined,
      intentos: lista.length, aprobado: nota.estado === 'aprobado', intentosPermitidos: permitidos,
    };
    const aprobatorio = lista.find((intento) => intento.aprobado);
    if (nota.estado === 'aprobado' && aprobatorio && (!fechaCulminacion || aprobatorio.fin > fechaCulminacion)) fechaCulminacion = aprobatorio.fin;
  });

  const estados = calcularDesbloqueos(ruta, avance, programa.reglas.modoDesbloqueo);
  const resumenCursos: ResumenCurso[] = cursos.map((curso) => {
    const modulos: ResumenModulo[] = curso.moduloIds
      .map((id) => estructura.modulos.find((modulo) => modulo.id === id))
      .filter((modulo): modulo is Modulo => Boolean(modulo))
      .map((modulo) => {
        const temas = modulo.temaIds.map((id) => ({ id, nota: notas[id] ?? { nota: null, estado: 'pendiente' as const } }));
        const tim = notas[modulo.timId] ?? { nota: null, estado: 'pendiente' as const };
        return { modulo, temas, tim, nota: notaModulo(temas.map((tema) => tema.nota.nota), tim.nota) };
      });
    return { programa: curso, modulos, nota: notaCurso(modulos.map((modulo) => modulo.nota)) };
  });
  const nota = programa.tipo === 'diplomado'
    ? notaDiplomado(resumenCursos.map((curso) => curso.nota))
    : resumenCursos[0]?.nota ?? { nota: null, estado: 'pendiente' as const };
  const aprobados = ruta.filter((elemento) => estados[elemento.id] === 'aprobado').length;
  return {
    programa, cursos: resumenCursos, nota, ruta, estados, notas, aprobados, total: ruta.length,
    avance: ruta.length === 0 ? 0 : Math.round((aprobados / ruta.length) * 100),
    fechaCulminacion: nota.estado === 'pendiente' ? null : fechaCulminacion,
  };
}
