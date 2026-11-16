import type {
  DocumentoAcademico, IntentoEvaluacion, Matricula, Membresia, Modulo, Pregunta, ProgresoComponente, Programa, Tema, Tim,
} from '../../tipos/academico';
import type { EstadoFormativo } from '../../tipos/formacion';
import type { Persona } from '../../tipos/persona';
import { calificarIntento } from '../../motores/academico/calificacion';
import { resumirPrograma } from '../../motores/academico/progreso';
import type { Verificacion } from '../verificarConsistencia';
import { programaExternoPorPrograma } from './formacionCampus';

export interface FuenteAcademica {
  programas: Programa[]; modulos: Modulo[]; temas: Tema[]; tims: Tim[]; preguntas: Pregunta[];
  matriculas: Matricula[]; membresias: Membresia[]; progreso: Record<string, ProgresoComponente>;
  intentos: IntentoEvaluacion[]; documentos: DocumentoAcademico[]; formacion: EstadoFormativo[]; personas: Persona[];
}

export function verificarConsistenciaAcademica(fuente: FuenteAcademica): Verificacion[] {
  const resultados: Verificacion[] = [];
  const agregar = (nombre: string, ok: boolean, detalle: string) => resultados.push({ nombre, ok, detalle });
  const estructura = { programas: fuente.programas, modulos: fuente.modulos };
  const registro = { matriculas: fuente.matriculas, progreso: fuente.progreso, intentos: fuente.intentos };

  fuente.programas.forEach((programa) => {
    if (programa.tipo === 'curso') {
      const modulos = programa.moduloIds.map((id) => fuente.modulos.find((modulo) => modulo.id === id));
      const horas = modulos.reduce((suma, modulo) => suma + (modulo?.horas ?? 0), 0);
      const temasCompletos = modulos.every((modulo) => modulo && modulo.temaIds.length === 5 && modulo.horas === 20
        && fuente.tims.some((tim) => tim.id === modulo.timId && tim.horas === 5));
      agregar(`Horas de ${programa.id}`, horas === programa.horas && programa.horas === 60 && modulos.length === 3 && temasCompletos,
        `${modulos.length} módulos, ${horas} h (esperado 3 módulos de 20 h con 5 temas y 1 TIM)`);
    }
    if (programa.tipo === 'diplomado') {
      const horas = programa.cursoIds.reduce((suma, id) => suma + (fuente.programas.find((item) => item.id === id)?.horas ?? 0), 0);
      agregar(`Horas de ${programa.id}`, horas === programa.horas && programa.horas === 120 && programa.cursoIds.length === 2,
        `${programa.cursoIds.length} cursos, ${horas} h (esperado 2 cursos y 120 h)`);
    }
  });

  const temasSinBanco = fuente.temas.filter((tema) => fuente.preguntas.filter((pregunta) => pregunta.ambitoId === tema.id && pregunta.activa).length < 5);
  const timsIncompletos = fuente.tims.filter((tim) => tim.preguntaIds.some((id) => !fuente.preguntas.some((pregunta) => pregunta.id === id)));
  agregar('Bancos de preguntas', temasSinBanco.length === 0 && timsIncompletos.length === 0,
    `${fuente.temas.length} temas y ${fuente.tims.length} TIM; sin banco suficiente: ${[...temasSinBanco, ...timsIncompletos].map((item) => item.id).join(', ') || 'ninguno'}`);

  const intentosDistintos = fuente.intentos.filter((intento) => {
    const preguntas = intento.preguntaIds.map((id) => fuente.preguntas.find((pregunta) => pregunta.id === id)).filter((pregunta): pregunta is Pregunta => Boolean(pregunta));
    const calculo = calificarIntento(preguntas, intento.respuestas);
    return calculo.nota !== intento.nota || calculo.aprobado !== intento.aprobado;
  });
  agregar('Notas de intentos recalculadas', intentosDistintos.length === 0, `${fuente.intentos.length} intentos; diferencias: ${intentosDistintos.map((intento) => intento.id).join(', ') || 'ninguna'}`);

  const notasDistintas = fuente.documentos.filter((documento) => {
    if (documento.tipo === 'constancia_mid') return false;
    const resumen = resumirPrograma(documento.personaId, documento.programaId, estructura, registro);
    return !resumen || resumen.nota.nota !== documento.nota || resumen.nota.estado !== 'aprobado';
  });
  agregar('Notas de documentos recalculadas', notasDistintas.length === 0, `${fuente.documentos.length} documentos; diferencias: ${notasDistintas.map((documento) => documento.codigo).join(', ') || 'ninguna'}`);

  const vigentes = fuente.documentos.filter((documento) => documento.estado === 'emitido');
  const claves = vigentes.map((documento) => `${documento.personaId}|${documento.programaId}|${documento.tipo}`);
  const duplicadas = claves.filter((clave, indice) => claves.indexOf(clave) !== indice);
  const codigos = fuente.documentos.map((documento) => documento.codigoVerificacion);
  agregar('Un documento vigente por estudiante y programa', duplicadas.length === 0 && new Set(codigos).size === codigos.length,
    `${vigentes.length} vigentes y ${fuente.documentos.length - vigentes.length} anulados; duplicados: ${duplicadas.join(', ') || 'ninguno'}`);

  const huerfanas = fuente.matriculas.filter((matricula) => !fuente.personas.some((persona) => persona.id === matricula.personaId)
    || !fuente.programas.some((programa) => programa.id === matricula.programaId));
  agregar('Matrículas con persona y programa', huerfanas.length === 0, `${fuente.matriculas.length} matrículas; sin referencia: ${huerfanas.map((item) => item.id).join(', ') || 'ninguna'}`);

  const incoherentes: string[] = [];
  Object.entries(programaExternoPorPrograma).forEach(([programaId, nombre]) => {
    fuente.formacion.filter((fila) => fila.programaExterno === nombre).forEach((fila) => {
      const matriculado = fuente.matriculas.some((matricula) => matricula.personaId === fila.personaId
        && (matricula.programaId === programaId || fuente.programas.some((programa) => programa.id === matricula.programaId && programa.cursoIds.includes(programaId))));
      const resumen = resumirPrograma(fila.personaId, programaId, estructura, registro);
      const conAvance = Boolean(resumen && (resumen.aprobados > 0 || resumen.ruta.some((elemento) => fuente.progreso[`${fila.personaId}|${elemento.id}`])));
      const campus = resumen?.nota.estado === 'aprobado' ? 'aprobado' : conAvance ? 'cursando' : matriculado ? 'matriculado' : 'sin_matricula';
      if (campus !== fila.estado) incoherentes.push(`${fila.id} ${fila.personaId} (${fila.estado} frente a ${campus})`);
    });
  });
  agregar('Estado formativo coherente con el campus', incoherentes.length === 0, incoherentes.join('; ') || 'Todas las filas vinculadas coinciden');

  return resultados;
}
