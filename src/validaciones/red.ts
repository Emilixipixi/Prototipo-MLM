import type { Patrocinio, PosicionTrinaria, Brazo } from '../tipos/red';

export function validarCicloPatrocinio(patrocinios: Patrocinio[], personaId: string, nuevoPatrocinadorId: string): string | null {
  if (personaId === nuevoPatrocinadorId) return 'Una persona no puede ser su propio patrocinador.';
  const padres = new Map(patrocinios.map((relacion) => [relacion.personaId, relacion.patrocinadorId]));
  let actual: string | null | undefined = nuevoPatrocinadorId;
  const visitados = new Set<string>();
  while (actual && !visitados.has(actual)) {
    if (actual === personaId) {
      return `Se formaría un ciclo de patrocinio: ${nuevoPatrocinadorId} pertenece a la descendencia de ${personaId}.`;
    }
    visitados.add(actual);
    actual = padres.get(actual);
  }
  return null;
}

export function validarPosicionLibre(
  posiciones: PosicionTrinaria[], personaId: string, padrePosicionId: string, brazo: Brazo,
): string | null {
  const activas = posiciones.filter((posicion) => posicion.estado === 'activa');
  const padre = activas.find((posicion) => posicion.id === padrePosicionId);
  if (!padre) return `La posición ${padrePosicionId} no existe o no está activa.`;
  if (activas.some((posicion) => posicion.personaId === personaId)) {
    return `${personaId} ya ocupa una posición Trinaria activa. No se permiten posiciones duplicadas.`;
  }
  const ocupante = activas.find((posicion) => posicion.padrePosicionId === padrePosicionId && posicion.brazo === brazo);
  if (ocupante) return `El brazo ${brazo} de ${padrePosicionId} ya está ocupado por ${ocupante.personaId}.`;
  return null;
}
