import { relativoHoy } from '../datos/academico/fechasCampus';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { useErickStore } from '../store/useErickStore';
import type { EventoCalendario, Matricula, Programa, SustentacionMid, TipoEventoCalendario } from '../tipos/academico';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { programasQueIncluye, puedeGestionarPrograma } from './docentes';
import { fechaActualLocal } from './eventosLms';
import { notificar, registrarBitacora } from './registro';

export const nombresTipoEvento: Record<TipoEventoCalendario, string> = {
  examen_final: 'Examen final', clase_en_vivo: 'Clase en vivo', entrega: 'Entrega', sustentacion: 'Sustentación MID', recordatorio: 'Recordatorio',
};

export interface DatosEventoCalendario {
  programaId: string; tipo: TipoEventoCalendario; titulo: string; descripcion: string;
  fecha: string; horaInicio: string; horaFin: string | null; enlace: string | null;
}

export interface EventoAgenda extends EventoCalendario { virtual: boolean }

export function validarEvento(datos: DatosEventoCalendario, hoy: string, nuevo: boolean): string | null {
  if (datos.titulo.trim().length < 5) return 'El título debe tener al menos 5 caracteres.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) return 'Indica la fecha.';
  if (nuevo && datos.fecha < hoy) return 'La fecha debe ser hoy o posterior.';
  if (!/^\d{2}:\d{2}$/.test(datos.horaInicio)) return 'Indica la hora de inicio.';
  if (datos.horaFin && datos.horaFin <= datos.horaInicio) return 'La hora de fin debe ser posterior a la de inicio.';
  if (datos.enlace && !/^https:\/\/\S+$/.test(datos.enlace.trim())) return 'El enlace debe empezar con https://';
  if (datos.tipo === 'sustentacion') return 'Las sustentaciones se agendan desde Sustentaciones MID.';
  return null;
}

export function matriculadosDePrograma(programaId: string, matriculas: Matricula[], programas: Programa[]): string[] {
  const contenedores = programas.filter((programa) => programasQueIncluye(programa, programas).includes(programaId)).map((programa) => programa.id);
  return [...new Set(matriculas.filter((matricula) => contenedores.includes(matricula.programaId)).map((matricula) => matricula.personaId))];
}

export function programasDePersona(personaId: string, matriculas: Matricula[], programas: Programa[]): string[] {
  return [...new Set(matriculas.filter((matricula) => matricula.personaId === personaId).flatMap((matricula) => {
    const programa = programas.find((item) => item.id === matricula.programaId);
    return programa ? programasQueIncluye(programa, programas) : [];
  }))];
}

export function eventoDeSustentacion(sustentacion: SustentacionMid): EventoAgenda | null {
  if (!sustentacion.fechaAsignada || sustentacion.estado !== 'asignado') return null;
  return {
    id: `AGENDA-${sustentacion.id}`, programaId: sustentacion.programaId, tipo: 'sustentacion', titulo: `Sustentación MID: ${sustentacion.titulo}`,
    descripcion: `${sustentacion.id}. Presenta tu trabajo ante el docente evaluador.`, fecha: sustentacion.fechaAsignada, horaInicio: '10:00', horaFin: '11:00',
    enlace: null, creadoPor: sustentacion.evaluadorId ?? 'DEMO-U04', estado: 'programado', actualizado: `${sustentacion.fechaAsignada}T08:00:00`, virtual: true,
  };
}

export function agendaCompleta(eventos: EventoCalendario[], sustentaciones: SustentacionMid[]): EventoAgenda[] {
  return [
    ...eventos.map((evento) => ({ ...evento, virtual: false })),
    ...sustentaciones.map(eventoDeSustentacion).filter((evento): evento is EventoAgenda => evento !== null),
  ].sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`));
}

export function eventosDePersona(personaId: string): EventoAgenda[] {
  const { matriculas, sustentaciones } = useCampusStore.getState();
  const programas = useAcademicoStore.getState().programas;
  const propios = programasDePersona(personaId, matriculas, programas);
  const eventos = useErickStore.getState().eventosCalendario.filter((evento) => propios.includes(evento.programaId));
  return agendaCompleta(eventos, sustentaciones.filter((item) => item.personaId === personaId));
}

function avisar(evento: EventoCalendario, titulo: string, mensaje: string): number {
  const { matriculas } = useCampusStore.getState();
  const destinatarios = matriculadosDePrograma(evento.programaId, matriculas, useAcademicoStore.getState().programas);
  destinatarios.forEach((personaId) => notificar({ personaId, tipo: 'estado', titulo, mensaje }));
  return destinatarios.length;
}

function fechaLegible(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function crearEvento(datos: DatosEventoCalendario, actorId: string): Resultado<{ evento: EventoCalendario; avisados: number }> {
  const error = validarEvento(datos, relativoHoy(0), true);
  if (error) return fallo(error);
  if (!puedeGestionarPrograma(actorId, datos.programaId)) return fallo('Solo puedes agendar fechas de tus programas asignados.');
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === datos.programaId);
  if (!programa) return fallo('Programa no encontrado.');
  const { eventosCalendario, actualizar } = useErickStore.getState();
  const numeros = eventosCalendario.map((item) => Number(item.id.replace('DEMO-CAL-', ''))).filter((numero) => !Number.isNaN(numero));
  const evento: EventoCalendario = {
    ...datos, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), enlace: datos.enlace?.trim() || null,
    id: `DEMO-CAL-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`, creadoPor: actorId, estado: 'programado', actualizado: fechaActualLocal(),
  };
  actualizar({ eventosCalendario: [...eventosCalendario, evento] });
  registrarBitacora({ actorId, accion: 'Fecha agendada en el calendario', modulo: 'calendario', motivo: evento.titulo, referenciaId: evento.id, despues: { programa: evento.programaId, fecha: evento.fecha } });
  const avisados = avisar(evento, `Nueva fecha: ${nombresTipoEvento[evento.tipo]}`, `${evento.titulo} (${programa.nombre}) el ${fechaLegible(evento.fecha)} a las ${evento.horaInicio}.`);
  return exito({ evento, avisados });
}

export function editarEvento(id: string, datos: DatosEventoCalendario, actorId: string): Resultado<EventoCalendario> {
  const { eventosCalendario, actualizar } = useErickStore.getState();
  const actual = eventosCalendario.find((item) => item.id === id);
  if (!actual) return fallo('Fecha no encontrada.');
  if (actual.estado === 'cancelado') return fallo('La fecha está cancelada.');
  const error = validarEvento(datos, relativoHoy(0), datos.fecha !== actual.fecha);
  if (error) return fallo(error);
  if (!puedeGestionarPrograma(actorId, actual.programaId) || !puedeGestionarPrograma(actorId, datos.programaId)) return fallo('Solo puedes modificar fechas de tus programas asignados.');
  const nuevo: EventoCalendario = { ...actual, ...datos, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), enlace: datos.enlace?.trim() || null, actualizado: fechaActualLocal() };
  actualizar({ eventosCalendario: eventosCalendario.map((item) => (item.id === id ? nuevo : item)) });
  registrarBitacora({ actorId, accion: 'Fecha modificada en el calendario', modulo: 'calendario', motivo: nuevo.titulo, referenciaId: id, antes: { fecha: actual.fecha, hora: actual.horaInicio }, despues: { fecha: nuevo.fecha, hora: nuevo.horaInicio } });
  if (actual.fecha !== nuevo.fecha || actual.horaInicio !== nuevo.horaInicio) {
    avisar(nuevo, 'Cambio de fecha', `${nuevo.titulo}: ahora el ${fechaLegible(nuevo.fecha)} a las ${nuevo.horaInicio}.`);
  }
  return exito(nuevo);
}

export function cancelarEvento(id: string, actorId: string, motivo: string): Resultado<EventoCalendario> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { eventosCalendario, actualizar } = useErickStore.getState();
  const actual = eventosCalendario.find((item) => item.id === id);
  if (!actual) return fallo('Fecha no encontrada.');
  if (actual.estado === 'cancelado') return fallo('La fecha ya está cancelada.');
  if (!puedeGestionarPrograma(actorId, actual.programaId)) return fallo('Solo puedes cancelar fechas de tus programas asignados.');
  const cancelado: EventoCalendario = { ...actual, estado: 'cancelado', descripcion: `${actual.descripcion} Cancelada: ${motivo.trim()}`.trim(), actualizado: fechaActualLocal() };
  actualizar({ eventosCalendario: eventosCalendario.map((item) => (item.id === id ? cancelado : item)) });
  registrarBitacora({ actorId, accion: 'Fecha cancelada en el calendario', modulo: 'calendario', motivo: motivo.trim(), referenciaId: id, antes: 'programado', despues: 'cancelado' });
  avisar(cancelado, 'Fecha cancelada', `${cancelado.titulo} del ${fechaLegible(cancelado.fecha)} se canceló: ${motivo.trim()}`);
  return exito(cancelado);
}
