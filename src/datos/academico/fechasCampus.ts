import { addDays, addMonths, format, parseISO } from 'date-fns';
import { fechaHoraActualIso } from '../../utilidades/fechas';

export function hoyCampus(): string {
  return fechaHoraActualIso().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  return format(addDays(parseISO(fecha.slice(0, 10)), dias), 'yyyy-MM-dd');
}

export function sumarMeses(fecha: string, meses: number): string {
  return format(addMonths(parseISO(fecha.slice(0, 10)), meses), 'yyyy-MM-dd');
}

export function relativoHoy(dias: number): string {
  return sumarDias(hoyCampus(), dias);
}
