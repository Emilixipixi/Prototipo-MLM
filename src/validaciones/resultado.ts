export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export function exito<T>(valor: T): Resultado<T> {
  return { ok: true, valor };
}

export function fallo<T = never>(error: string): Resultado<T> {
  return { ok: false, error };
}
