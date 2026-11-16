import type { Pregunta, Respuesta } from '../../tipos/academico';
import { redondear } from '../../utilidades/formatos';
import { estaAprobado, NOTA_MAXIMA } from './notas';

export interface ResultadoCalificacion {
  correctas: number; total: number; nota: number; aprobado: boolean;
  detalle: Array<{ preguntaId: string; correcta: boolean }>;
}

function mismaLista(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((valor, indice) => valor === b[indice]);
}

function esIdentidad(lista: number[], largo: number): boolean {
  return lista.length === largo && lista.every((valor, indice) => valor === indice);
}

export function esCorrecta(pregunta: Pregunta, respuesta: Respuesta | undefined): boolean {
  if (respuesta === null || respuesta === undefined) return false;
  switch (pregunta.tipo) {
    case 'opcion_multiple':
    case 'verdadero_falso':
      return typeof respuesta === 'number' && respuesta === pregunta.correctas[0];
    case 'seleccion_multiple':
      return Array.isArray(respuesta) && mismaLista([...new Set(respuesta)].sort((a, b) => a - b), [...pregunta.correctas].sort((a, b) => a - b));
    case 'emparejar':
      return Array.isArray(respuesta) && esIdentidad(respuesta, pregunta.pares?.length ?? 0);
    case 'ordenar':
      return Array.isArray(respuesta) && esIdentidad(respuesta, pregunta.orden?.length ?? 0);
    case 'numerica':
      return typeof respuesta === 'number' && Number.isFinite(respuesta)
        && Math.abs(respuesta - (pregunta.valorNumerico ?? 0)) <= (pregunta.tolerancia ?? 0) + 1e-9;
    default:
      return false;
  }
}

export function calificarIntento(preguntas: Pregunta[], respuestas: Record<string, Respuesta>): ResultadoCalificacion {
  const detalle = preguntas.map((pregunta) => ({ preguntaId: pregunta.id, correcta: esCorrecta(pregunta, respuestas[pregunta.id]) }));
  const correctas = detalle.filter((item) => item.correcta).length;
  const total = preguntas.length;
  const nota = total === 0 ? 0 : redondear((correctas * NOTA_MAXIMA) / total, 2);
  return { correctas, total, nota, aprobado: estaAprobado(nota), detalle };
}

export function respuestaCorrecta(pregunta: Pregunta): Respuesta {
  switch (pregunta.tipo) {
    case 'opcion_multiple':
    case 'verdadero_falso':
      return pregunta.correctas[0];
    case 'seleccion_multiple':
      return [...pregunta.correctas].sort((a, b) => a - b);
    case 'emparejar':
      return (pregunta.pares ?? []).map((_par, indice) => indice);
    case 'ordenar':
      return (pregunta.orden ?? []).map((_paso, indice) => indice);
    case 'numerica':
      return pregunta.valorNumerico ?? 0;
    default:
      return null;
  }
}

export function respuestaIncorrecta(pregunta: Pregunta): Respuesta {
  switch (pregunta.tipo) {
    case 'opcion_multiple':
    case 'verdadero_falso':
      return (pregunta.correctas[0] + 1) % Math.max(pregunta.opciones.length, 2);
    case 'seleccion_multiple':
      return [pregunta.correctas[0]];
    case 'emparejar': {
      const indices = (pregunta.pares ?? []).map((_par, indice) => indice);
      return indices.length > 1 ? [indices[1], indices[0], ...indices.slice(2)] : [];
    }
    case 'ordenar': {
      const indices = (pregunta.orden ?? []).map((_paso, indice) => indice);
      return [...indices].reverse();
    }
    case 'numerica':
      return (pregunta.valorNumerico ?? 0) + (pregunta.tolerancia ?? 0) + 1;
    default:
      return null;
  }
}

export function hashTexto(texto: string): number {
  let hash = 2166136261;
  for (let indice = 0; indice < texto.length; indice += 1) {
    hash ^= texto.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generadorAleatorio(semilla: string): () => number {
  let estado = hashTexto(semilla) || 1;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mezclar<T>(lista: T[], semilla: string): T[] {
  const aleatorio = generadorAleatorio(semilla);
  const copia = [...lista];
  for (let indice = copia.length - 1; indice > 0; indice -= 1) {
    const otro = Math.floor(aleatorio() * (indice + 1));
    [copia[indice], copia[otro]] = [copia[otro], copia[indice]];
  }
  return copia;
}

export function seleccionarPreguntas(banco: Pregunta[], cantidad: number, semilla: string): Pregunta[] {
  const activas = banco.filter((pregunta) => pregunta.activa);
  if (cantidad <= 0 || cantidad >= activas.length) return mezclar(activas, semilla);
  return mezclar(activas, semilla).slice(0, cantidad);
}
