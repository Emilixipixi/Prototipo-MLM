import type { Notificacion } from '../../tipos/notificacion';
import { eventosCalendarioIniciales } from './erickInicial';
import { relativoHoy } from './fechasCampus';
import { matriculasIniciales } from './matriculasIniciales';
import { programasIniciales } from './programas';

const titulos: Record<string, string> = {
  examen_final: 'Nueva fecha: Examen final', clase_en_vivo: 'Nueva fecha: Clase en vivo', entrega: 'Nueva fecha: Entrega',
  recordatorio: 'Nueva fecha: Recordatorio', sustentacion: 'Nueva fecha: Sustentación MID',
};

const legible = (fecha: string) => fecha.split('-').reverse().join('/');

function alumnosDe(programaId: string): string[] {
  const contenedores = programasIniciales.filter((programa) => programa.id === programaId || programa.cursoIds.includes(programaId) || programa.midId === programaId).map((programa) => programa.id);
  return [...new Set(matriculasIniciales.filter((matricula) => contenedores.includes(matricula.programaId)).map((matricula) => matricula.personaId))];
}

const destacados = ['DEMO-L01', 'DEMO-L02', 'DEMO-L03', 'DEMO-L12', 'DEMO-L17', 'DEMO-L20', 'DEMO-A01', 'DEMO-L08'];

export const notificacionesErick: Notificacion[] = eventosCalendarioIniciales
  .filter((evento) => evento.fecha >= relativoHoy(0))
  .flatMap((evento) => alumnosDe(evento.programaId).filter((personaId) => destacados.includes(personaId)).map((personaId) => ({ evento, personaId })))
  .map(({ evento, personaId }, indice): Notificacion => ({
    id: `DEMO-NOT-ERK-${String(indice + 1).padStart(3, '0')}`, personaId, tipo: 'estado',
    titulo: evento.estado === 'cancelado' ? 'Fecha cancelada' : titulos[evento.tipo],
    mensaje: evento.estado === 'cancelado'
      ? `${evento.titulo} del ${legible(evento.fecha)} se canceló. ${evento.descripcion}`
      : `${evento.titulo} el ${legible(evento.fecha)} a las ${evento.horaInicio}. Revísala en Mi calendario.`,
    fecha: evento.actualizado, leida: indice % 3 === 2,
  }));
