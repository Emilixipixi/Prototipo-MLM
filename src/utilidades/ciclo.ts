import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Periodo } from '../tipos/reglas';

export interface AvanceCiclo { dia: number; total: number; restantes: number; estado: 'antes' | 'en_curso' | 'despues'; }

export function avanceCiclo(periodo: Periodo, hoy = new Date()): AvanceCiclo {
  const total = periodo.duracionDias;
  const transcurridos = differenceInCalendarDays(hoy, parseISO(periodo.fechaInicio)) + 1;
  if (transcurridos < 1) return { dia: 0, total, restantes: total, estado: 'antes' };
  if (transcurridos > total) return { dia: total, total, restantes: 0, estado: 'despues' };
  return { dia: transcurridos, total, restantes: total - transcurridos, estado: 'en_curso' };
}
