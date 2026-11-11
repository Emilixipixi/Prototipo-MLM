import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatearFecha(fechaIso: string): string {
  return format(parseISO(fechaIso), 'dd/MM/yyyy', { locale: es });
}

export function formatearFechaHora(fechaIso: string): string {
  return format(parseISO(fechaIso), 'dd/MM/yyyy HH:mm', { locale: es });
}

export function fechaHoraActualIso(): string {
  return new Date().toISOString();
}
