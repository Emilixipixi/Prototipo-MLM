import { calificarIntento, seleccionarPreguntas, type ResultadoCalificacion } from '../motores/academico/calificacion';
import { evaluacionHabilitada } from '../motores/academico/desbloqueo';
import { notaRegistrada } from '../motores/academico/notas';
import { claveProgreso, intentosDe, intentosExtraPara } from '../motores/academico/progreso';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import type { AmbitoEvaluacion, DocumentoAcademico, IntentoEvaluacion, Pregunta, ProgresoComponente, Respuesta } from '../tipos/academico';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { emitirPendientes } from './certificados';
import { contextoActual } from './datosCampus';
import { fechaActualLocal, registrarEventoLms } from './eventosLms';
import { sincronizarFormacion } from './formacionLms';
import { registrarBitacora } from './registro';

function siguienteIdIntento(intentos: IntentoEvaluacion[]): string {
  const numeros = intentos.map((intento) => Number(intento.id.replace('DEMO-INT-', ''))).filter((numero) => !Number.isNaN(numero));
  return `DEMO-INT-${String(Math.max(0, ...numeros) + 1).padStart(4, '0')}`;
}

function validarAcceso(personaId: string, elementoId: string) {
  const contexto = contextoActual(personaId, elementoId);
  if (!contexto) return { error: 'El contenido no existe.', contexto: null };
  if (!contexto.acceso.acceso) return { error: 'No tienes acceso vigente a este programa. Puedes ver tus notas y certificados, pero no los contenidos ni las evaluaciones.', contexto };
  if (contexto.estado === 'bloqueado') return { error: 'Este contenido se desbloquea al aprobar el anterior.', contexto };
  return { error: null, contexto };
}

export function marcarComponente(personaId: string, temaId: string, componente: keyof ProgresoComponente): Resultado<ProgresoComponente> {
  const { error } = validarAcceso(personaId, temaId);
  if (error) return fallo(error);
  const { progreso, actualizar } = useCampusStore.getState();
  const clave = claveProgreso(personaId, temaId);
  const actual = progreso[clave] ?? { video: false, lectura: false, caso: false };
  if (actual[componente]) return exito(actual);
  const nuevo = { ...actual, [componente]: true };
  actualizar({ progreso: { ...progreso, [clave]: nuevo } });
  sincronizarFormacion(personaId);
  return exito(nuevo);
}

export interface IntentoEnCurso {
  ambito: AmbitoEvaluacion; elementoId: string; preguntas: Pregunta[]; inicio: string; segundos: number;
  numero: number; permitidos: number; mostrarRespuestas: boolean;
}

export function estadoIntentos(personaId: string, elementoId: string) {
  const contexto = contextoActual(personaId, elementoId);
  const lista = intentosDe(personaId, elementoId, useCampusStore.getState().intentos);
  const reglas = contexto?.curso.reglas;
  const permitidos = (reglas?.intentosMaximos ?? 0) + intentosExtraPara(personaId, elementoId, useCampusStore.getState().matriculas);
  return { contexto, intentos: lista, permitidos, usados: lista.length, registrada: reglas ? notaRegistrada(lista.map((item) => item.nota), reglas.politicaNota) : null };
}

export function iniciarIntento(personaId: string, ambito: AmbitoEvaluacion, elementoId: string): Resultado<IntentoEnCurso> {
  const { error, contexto } = validarAcceso(personaId, elementoId);
  if (error || !contexto) return fallo(error ?? 'Contenido no disponible.');
  if (contexto.elemento.tipo !== ambito) return fallo('El tipo de evaluación no coincide con el contenido.');
  if (contexto.estado === 'aprobado') return fallo('Ya aprobaste esta evaluación.');
  const { permitidos, usados, intentos } = estadoIntentos(personaId, elementoId);
  if (usados >= permitidos) return fallo('Agotaste los intentos permitidos. El área académica puede otorgarte un intento adicional.');
  const reglas = contexto.curso.reglas;
  if (ambito === 'tema' && !evaluacionHabilitada(useCampusStore.getState().progreso[claveProgreso(personaId, elementoId)])) {
    return fallo('Completa el video, la lectura y el caso práctico antes de rendir la evaluación.');
  }
  const ultimo = intentos[intentos.length - 1];
  if (ultimo && reglas.esperaMinutos > 0) {
    const espera = new Date(`${ultimo.fin}Z`).getTime() + reglas.esperaMinutos * 60000 - new Date(`${fechaActualLocal()}Z`).getTime();
    if (espera > 0) return fallo(`Debes esperar ${Math.ceil(espera / 60000)} minutos antes del siguiente intento.`);
  }
  const { preguntas, tims, temas } = useAcademicoStore.getState();
  const banco = ambito === 'tim'
    ? (tims.find((tim) => tim.id === elementoId)?.preguntaIds ?? []).map((id) => preguntas.find((pregunta) => pregunta.id === id)).filter((pregunta): pregunta is Pregunta => Boolean(pregunta?.activa))
    : preguntas.filter((pregunta) => pregunta.ambitoId === elementoId && pregunta.activa);
  const seleccion = ambito === 'tim' ? banco : seleccionarPreguntas(banco, reglas.preguntasPorEvaluacion, `${personaId}|${elementoId}|${usados + 1}|${Date.now()}`);
  if (seleccion.length === 0) return fallo('La evaluación no tiene preguntas activas.');
  const minutos = ambito === 'tema' ? temas.find((tema) => tema.id === elementoId)?.evaluacionMinutos ?? reglas.minutosEvaluacion : 60;
  return exito({
    ambito, elementoId, preguntas: seleccion, inicio: fechaActualLocal(), segundos: minutos * 60,
    numero: usados + 1, permitidos, mostrarRespuestas: reglas.mostrarRespuestas,
  });
}

export interface ResultadoEnvio {
  intento: IntentoEvaluacion; calificacion: ResultadoCalificacion; registrada: number | null;
  restantes: number; documentos: DocumentoAcademico[];
}

export function enviarIntento(personaId: string, enCurso: IntentoEnCurso, respuestas: Record<string, Respuesta>): Resultado<ResultadoEnvio> {
  const { error, contexto } = validarAcceso(personaId, enCurso.elementoId);
  if (error || !contexto) return fallo(error ?? 'Contenido no disponible.');
  const { permitidos, usados } = estadoIntentos(personaId, enCurso.elementoId);
  if (usados >= permitidos) return fallo('Agotaste los intentos permitidos.');
  const calificacion = calificarIntento(enCurso.preguntas, respuestas);
  const { intentos, actualizar } = useCampusStore.getState();
  const intento: IntentoEvaluacion = {
    id: siguienteIdIntento(intentos), personaId, ambito: enCurso.ambito, ambitoId: enCurso.elementoId,
    matriculaId: contexto.acceso.matricula?.id ?? contexto.acceso.membresia?.id ?? 'sin-matricula',
    preguntaIds: enCurso.preguntas.map((pregunta) => pregunta.id),
    respuestas: Object.fromEntries(enCurso.preguntas.map((pregunta) => [pregunta.id, respuestas[pregunta.id] ?? null])),
    nota: calificacion.nota, aprobado: calificacion.aprobado, inicio: enCurso.inicio, fin: fechaActualLocal(),
  };
  actualizar({ intentos: [...intentos, intento] });
  registrarBitacora({ actorId: personaId, accion: 'Evaluación rendida', modulo: 'academico', referenciaId: intento.id, despues: { elemento: enCurso.elementoId, nota: intento.nota, aprobado: intento.aprobado } });
  if (calificacion.aprobado) {
    registrarEventoLms('avance_actualizado', personaId, contexto.programa.id, { elemento: enCurso.elementoId, nota: intento.nota }, `${enCurso.ambito === 'tim' ? 'TIM' : 'Tema'} ${enCurso.elementoId} aprobado con ${intento.nota.toFixed(2)}`);
  }
  const documentos = emitirPendientes(personaId);
  sincronizarFormacion(personaId);
  const registrada = notaRegistrada(intentosDe(personaId, enCurso.elementoId, useCampusStore.getState().intentos).map((item) => item.nota), contexto.curso.reglas.politicaNota);
  return exito({ intento, calificacion, registrada, restantes: permitidos - usados - 1, documentos });
}

export function otorgarIntentoExtra(matriculaId: string, elementoId: string, cantidad: number, actorId: string, motivo: string): Resultado<number> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  if (cantidad < 1 || cantidad > 3) return fallo('Se pueden otorgar entre 1 y 3 intentos.');
  const { matriculas, actualizar } = useCampusStore.getState();
  const matricula = matriculas.find((item) => item.id === matriculaId);
  if (!matricula) return fallo('Matrícula no encontrada.');
  const total = (matricula.intentosExtra[elementoId] ?? 0) + cantidad;
  actualizar({
    matriculas: matriculas.map((item) => (item.id === matriculaId ? {
      ...item, intentosExtra: { ...item.intentosExtra, [elementoId]: total },
      historial: [...item.historial, { fecha: fechaActualLocal(), actorId, accion: `Intento adicional en ${elementoId} (+${cantidad})`, motivo: motivo.trim() }],
    } : item)),
  });
  registrarBitacora({ actorId, accion: 'Intento adicional otorgado', modulo: 'matriculas', motivo: motivo.trim(), referenciaId: matriculaId, despues: { elemento: elementoId, intentosExtra: total } });
  return exito(total);
}
