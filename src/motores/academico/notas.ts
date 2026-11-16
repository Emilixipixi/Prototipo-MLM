import type { EstadoNota, PoliticaNota, ResultadoNota } from '../../tipos/academico';
import { redondear } from '../../utilidades/formatos';

export const NOTA_MAXIMA = 20;
export const NOTA_APROBATORIA = 14;
export const HORAS_TEMA = 3;
export const HORAS_TIM = 5;

export function estaAprobado(nota: number): boolean {
  return redondear(nota, 2) > NOTA_APROBATORIA;
}

export function estadoDeNota(nota: number | null): EstadoNota {
  if (nota === null) return 'pendiente';
  return estaAprobado(nota) ? 'aprobado' : 'desaprobado';
}

export function resultado(nota: number | null): ResultadoNota {
  const valor = nota === null ? null : redondear(nota, 2);
  return { nota: valor, estado: estadoDeNota(valor) };
}

export function notaRegistrada(notas: number[], politica: PoliticaNota): number | null {
  if (notas.length === 0) return null;
  if (politica === 'ultimo') return redondear(notas[notas.length - 1], 2);
  if (politica === 'promedio') return redondear(notas.reduce((suma, nota) => suma + nota, 0) / notas.length, 2);
  return redondear(Math.max(...notas), 2);
}

export function notaElemento(notas: number[], politica: PoliticaNota, intentosPermitidos: number): ResultadoNota {
  const registrada = notaRegistrada(notas, politica);
  if (registrada === null) return { nota: null, estado: 'pendiente' };
  if (estaAprobado(registrada)) return { nota: registrada, estado: 'aprobado' };
  if (notas.length >= intentosPermitidos) return { nota: registrada, estado: 'desaprobado' };
  return { nota: null, estado: 'pendiente' };
}

export function notaPonderada(partes: Array<{ nota: number | null; horas: number }>): ResultadoNota {
  if (partes.length === 0 || partes.some((parte) => parte.nota === null)) return { nota: null, estado: 'pendiente' };
  const horas = partes.reduce((suma, parte) => suma + parte.horas, 0);
  const puntos = partes.reduce((suma, parte) => suma + (parte.nota ?? 0) * parte.horas, 0);
  return resultado(puntos / horas);
}

export function notaModulo(notasTemas: Array<number | null>, notaTim: number | null): ResultadoNota {
  return notaPonderada([
    ...notasTemas.map((nota) => ({ nota, horas: HORAS_TEMA })),
    { nota: notaTim, horas: HORAS_TIM },
  ]);
}

export function notaPromedio(partes: ResultadoNota[]): ResultadoNota {
  if (partes.length === 0 || partes.some((parte) => parte.nota === null)) return { nota: null, estado: 'pendiente' };
  return resultado(partes.reduce((suma, parte) => suma + (parte.nota ?? 0), 0) / partes.length);
}

export const notaCurso = notaPromedio;
export const notaDiplomado = notaPromedio;
