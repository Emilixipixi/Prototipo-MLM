import { addDays, format, parseISO } from 'date-fns';
import { hijosUnilevel, produccionPorBrazo, totalesPorPersona } from '../motores/utilidadesMotor';
import type { MovimientoVolumen } from '../tipos/pedidos';
import type { Patrocinio, PosicionTrinaria } from '../tipos/red';
import type { Periodo } from '../tipos/reglas';

export function organizacionTrinaria(personaId: string, posiciones: PosicionTrinaria[]): string[] {
  return produccionPorBrazo(personaId, posiciones, new Map()).flatMap((brazo) => brazo.personas);
}

export function organizacionUnilevel(personaId: string, patrocinios: Patrocinio[], profundidad = 7): string[] {
  const hijos = hijosUnilevel(patrocinios);
  const resultado: string[] = [];
  let actuales = [personaId];
  for (let nivel = 0; nivel < profundidad; nivel += 1) {
    actuales = actuales.flatMap((id) => hijos.get(id) ?? []);
    resultado.push(...actuales);
  }
  return resultado;
}

export function volumenAcumuladoDiario(periodo: Periodo, movimientos: MovimientoVolumen[], personas: string[], campo: 'vp' | 'vc' = 'vp'): number[] {
  const conjunto = new Set(personas);
  const delPeriodo = movimientos.filter((movimiento) => movimiento.periodoId === periodo.id && conjunto.has(movimiento.personaId));
  const valores: number[] = [];
  let acumulado = 0;
  for (let dia = 0; dia < periodo.duracionDias; dia += 1) {
    const fecha = format(addDays(parseISO(periodo.fechaInicio), dia), 'yyyy-MM-dd');
    acumulado += delPeriodo.filter((movimiento) => movimiento.fecha.slice(0, 10) === fecha).reduce((suma, movimiento) => suma + movimiento[campo], 0);
    valores.push(acumulado);
  }
  return valores;
}

export function totalesPersona(personaId: string, movimientos: MovimientoVolumen[], periodoId: string) {
  return totalesPorPersona(movimientos.filter((movimiento) => movimiento.periodoId === periodoId)).get(personaId) ?? { vp: 0, vc: 0 };
}
