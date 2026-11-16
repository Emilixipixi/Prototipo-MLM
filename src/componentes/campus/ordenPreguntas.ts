import { mezclar } from '../../motores/academico/calificacion';
import type { Pregunta } from '../../tipos/academico';

export function ordenInicial(pregunta: Pregunta): number[] {
  const indices = (pregunta.orden ?? []).map((_paso, indice) => indice);
  const mezclado = mezclar(indices, `${pregunta.id}|orden`);
  return mezclado.every((valor, indice) => valor === indice) ? [...mezclado].reverse() : mezclado;
}
