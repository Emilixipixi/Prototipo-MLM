import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Programa } from '../tipos/academico';
import type { EventoAgenda } from './calendario';
import { programasQueIncluye } from './docentes';

export function diasHasta(fecha: string, hoy: string): number {
  return differenceInCalendarDays(parseISO(fecha), parseISO(hoy));
}

export function proximasFechas(agenda: EventoAgenda[], hoy: string, cantidad = 3, programa?: Programa, programas: Programa[] = []): EventoAgenda[] {
  const incluidos = programa ? programasQueIncluye(programa, programas) : null;
  return agenda
    .filter((evento) => evento.estado === 'programado' && evento.fecha >= hoy && (!incluidos || incluidos.includes(evento.programaId)))
    .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))
    .slice(0, cantidad);
}

export function textoCuentaRegresiva(dias: number): string {
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  return `En ${dias} días`;
}
