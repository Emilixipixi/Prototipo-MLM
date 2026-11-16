import type { IntentoEvaluacion } from '../../tipos/academico';

const rangosNota = [
  { etiqueta: '0 a 10', minimo: 0, maximo: 10, aprobado: false },
  { etiqueta: '10 a 14', minimo: 10, maximo: 14, aprobado: false },
  { etiqueta: '14 a 17', minimo: 14, maximo: 17, aprobado: true },
  { etiqueta: '17 a 20', minimo: 17, maximo: 20, aprobado: true },
];

export function distribuirNotas(intentos: IntentoEvaluacion[]) {
  return rangosNota.map((rango) => ({
    ...rango,
    cantidad: intentos.filter((intento) => (rango.aprobado
      ? intento.nota > rango.minimo && intento.nota <= rango.maximo
      : intento.nota >= rango.minimo && (rango.maximo === 14 ? intento.nota <= 14 : intento.nota < rango.maximo))).length,
  }));
}
