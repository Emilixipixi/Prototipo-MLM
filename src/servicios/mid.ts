import { relativoHoy } from '../datos/academico/fechasCampus';
import { esVigente, estadoMatricula } from '../motores/academico/accesos';
import { estaAprobado } from '../motores/academico/notas';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { CriterioRubrica, DocumentoAcademico, Programa, SustentacionMid } from '../tipos/academico';
import { redondear } from '../utilidades/formatos';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { transicionesMid, validarTransicion } from '../validaciones/transiciones';
import { emitirConstanciaMid } from './certificados';
import { fechaActualLocal, registrarEventoLms } from './eventosLms';
import { notificar, registrarBitacora } from './registro';

export const rubricaBase: Array<Omit<CriterioRubrica, 'nota'>> = [
  { criterio: 'Dominio del tema', peso: 30 },
  { criterio: 'Metodología de investigación', peso: 30 },
  { criterio: 'Aplicación práctica de la propuesta', peso: 20 },
  { criterio: 'Comunicación y defensa', peso: 20 },
];

export const nombresEstadoMid: Record<SustentacionMid['estado'], string> = {
  solicitado: 'Solicitado', asignado: 'Evaluador asignado', sustentado: 'Sustentado', aprobado: 'Aprobado', desaprobado: 'Desaprobado',
};

export function midDisponible(personaId: string): { programa: Programa; diplomado: Programa } | null {
  const { programas } = useAcademicoStore.getState();
  const { matriculas, documentos } = useCampusStore.getState();
  const hoy = relativoHoy(0);
  const diplomado = programas.find((programa) => programa.tipo === 'diplomado' && programa.midId && (
    documentos.some((documento) => documento.estado === 'emitido' && documento.tipo === 'diploma' && documento.personaId === personaId && documento.programaId === programa.id)
    || matriculas.some((matricula) => matricula.personaId === personaId && matricula.programaId === programa.id && esVigente(estadoMatricula(matricula, hoy)))));
  const programa = diplomado ? programas.find((item) => item.id === diplomado.midId) : undefined;
  return diplomado && programa ? { programa, diplomado } : null;
}

export interface DatosSolicitudMid { titulo: string; resumen: string; archivo: string; fechaPropuesta: string }

export function solicitarMid(personaId: string, datos: DatosSolicitudMid): Resultado<SustentacionMid> {
  const disponible = midDisponible(personaId);
  if (!disponible) return fallo('El MID está disponible para quienes aprobaron o cursan un diplomado que lo incluye.');
  if (datos.titulo.trim().length < 10) return fallo('El título debe tener al menos 10 caracteres.');
  if (datos.resumen.trim().length < 30) return fallo('El resumen debe tener al menos 30 caracteres.');
  if (!datos.archivo.trim()) return fallo('Adjunta el archivo del trabajo (solo se registra el nombre).');
  if (!datos.fechaPropuesta || datos.fechaPropuesta < relativoHoy(0)) return fallo('La fecha propuesta debe ser hoy o posterior.');
  const { sustentaciones, actualizar } = useCampusStore.getState();
  const abierta = sustentaciones.find((item) => item.personaId === personaId && item.programaId === disponible.programa.id && item.estado !== 'desaprobado');
  if (abierta) return fallo(`Ya tienes una sustentación ${nombresEstadoMid[abierta.estado].toLowerCase()} (${abierta.id}).`);
  const numeros = sustentaciones.map((item) => Number(item.id.replace('DEMO-SUS-', ''))).filter((numero) => !Number.isNaN(numero));
  const sustentacion: SustentacionMid = {
    id: `DEMO-SUS-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`, personaId, programaId: disponible.programa.id,
    titulo: datos.titulo.trim(), resumen: datos.resumen.trim(), archivo: datos.archivo.trim(), fechaPropuesta: datos.fechaPropuesta,
    evaluadorId: null, fechaAsignada: null, rubrica: rubricaBase.map((criterio) => ({ ...criterio, nota: null })),
    notaFinal: null, observaciones: null, estado: 'solicitado',
  };
  actualizar({ sustentaciones: [...sustentaciones, sustentacion] });
  registrarBitacora({ actorId: personaId, accion: 'Solicitud de sustentación MID', modulo: 'academico', referenciaId: sustentacion.id, despues: { titulo: sustentacion.titulo } });
  notificar({ personaId: null, tipo: 'estado', titulo: 'Nueva solicitud MID', mensaje: `${sustentacion.id}: "${sustentacion.titulo}" espera la asignación de un evaluador.` });
  return exito(sustentacion);
}

function actualizarSustentacion(id: string, cambios: Partial<SustentacionMid>): SustentacionMid | null {
  const { sustentaciones, actualizar } = useCampusStore.getState();
  const actual = sustentaciones.find((item) => item.id === id);
  if (!actual) return null;
  const nueva = { ...actual, ...cambios };
  actualizar({ sustentaciones: sustentaciones.map((item) => (item.id === id ? nueva : item)) });
  return nueva;
}

export function asignarEvaluador(id: string, evaluadorId: string, fecha: string, actorId: string): Resultado<SustentacionMid> {
  const actual = useCampusStore.getState().sustentaciones.find((item) => item.id === id);
  if (!actual) return fallo('Sustentación no encontrada.');
  const error = validarTransicion(transicionesMid, actual.estado, 'asignado', 'la sustentación');
  if (error) return fallo(error);
  const evaluador = usePersonasStore.getState().buscarPorId(evaluadorId);
  if (!evaluador || evaluador.perfil !== 'evaluador') return fallo('Selecciona una persona con perfil de evaluador académico.');
  if (!fecha) return fallo('Indica la fecha de sustentación.');
  const nueva = actualizarSustentacion(id, { evaluadorId, fechaAsignada: fecha, estado: 'asignado' });
  if (!nueva) return fallo('Sustentación no encontrada.');
  registrarBitacora({ actorId, accion: 'Evaluador MID asignado', modulo: 'academico', referenciaId: id, antes: actual.estado, despues: { estado: 'asignado', evaluador: evaluadorId, fecha } });
  notificar({ personaId: actual.personaId, tipo: 'estado', titulo: 'Sustentación MID programada', mensaje: `Tu sustentación ${id} se realizará el ${fecha} con ${evaluador.nombres} ${evaluador.apellidos}.` });
  notificar({ personaId: evaluadorId, tipo: 'estado', titulo: 'Nueva sustentación asignada', mensaje: `${id}: "${actual.titulo}" el ${fecha}.` });
  return exito(nueva);
}

export function notaRubrica(rubrica: CriterioRubrica[]): number | null {
  if (rubrica.some((criterio) => criterio.nota === null)) return null;
  const pesos = rubrica.reduce((suma, criterio) => suma + criterio.peso, 0);
  return redondear(rubrica.reduce((suma, criterio) => suma + (criterio.nota ?? 0) * criterio.peso, 0) / pesos, 2);
}

export function calificarSustentacion(id: string, evaluadorId: string, notas: number[], observaciones: string): Resultado<{ sustentacion: SustentacionMid; constancia: DocumentoAcademico | null }> {
  const actual = useCampusStore.getState().sustentaciones.find((item) => item.id === id);
  if (!actual) return fallo('Sustentación no encontrada.');
  if (actual.evaluadorId !== evaluadorId) return fallo('Solo el evaluador asignado puede calificar esta sustentación.');
  const error = validarTransicion(transicionesMid, actual.estado, 'sustentado', 'la sustentación');
  if (error) return fallo(error);
  if (notas.length !== actual.rubrica.length || notas.some((nota) => !Number.isFinite(nota) || nota < 0 || nota > 20)) return fallo('Cada criterio requiere una nota entre 0 y 20.');
  if (observaciones.trim().length < 10) return fallo('Las observaciones son obligatorias (al menos 10 caracteres).');
  const rubrica = actual.rubrica.map((criterio, indice) => ({ ...criterio, nota: notas[indice] }));
  const notaFinal = notaRubrica(rubrica) ?? 0;
  const estado = estaAprobado(notaFinal) ? 'aprobado' : 'desaprobado';
  const nueva = actualizarSustentacion(id, { rubrica, notaFinal, observaciones: observaciones.trim(), estado });
  if (!nueva) return fallo('Sustentación no encontrada.');
  registrarBitacora({ actorId: evaluadorId, accion: 'Sustentación MID calificada', modulo: 'academico', motivo: observaciones.trim(), referenciaId: id, antes: actual.estado, despues: { estado, notaFinal, fecha: fechaActualLocal() } });
  let constancia: DocumentoAcademico | null = null;
  if (estado === 'aprobado') {
    constancia = emitirConstanciaMid(actual.personaId, actual.programaId, notaFinal, evaluadorId);
    registrarEventoLms('mid_aprobado', actual.personaId, actual.programaId, { sustentacion: id, nota: notaFinal, documento: constancia?.codigo ?? null }, `MID aprobado con ${notaFinal.toFixed(2)}`);
  }
  notificar({ personaId: actual.personaId, tipo: 'estado', titulo: `Sustentación MID ${estado}`, mensaje: `Nota final ${notaFinal.toFixed(2)}. ${observaciones.trim()}` });
  return exito({ sustentacion: nueva, constancia });
}
