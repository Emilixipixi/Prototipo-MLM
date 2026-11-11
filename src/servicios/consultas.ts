import { calcularCalificaciones } from '../motores/motorRangos';
import { calcularSaldosBrazos } from '../motores/motorTrinario';
import { hijosUnilevel, nivelesUnilevel, personasSubarbol, posicionesActivas } from '../motores/utilidadesMotor';
import { usePeriodosStore } from '../store/usePeriodosStore';
import type { CalificacionRun, SaldoBrazo } from '../tipos/calificacion';
import type { Brazo } from '../tipos/red';
import type { Periodo, VersionReglas } from '../tipos/reglas';
import { construirContexto } from './contexto';
import { obtenerFuente } from './fuente';

export function periodoAbiertoActual(): Periodo | undefined {
  return usePeriodosStore.getState().periodos.find((periodo) => periodo.tipo === 'ciclo' && periodo.estado === 'abierto');
}

export function versionDeReglas(id: string): VersionReglas | undefined {
  return usePeriodosStore.getState().versiones.find((version) => version.id === id);
}

export function consultarCalificaciones(periodoId: string): CalificacionRun[] {
  const fuente = obtenerFuente();
  const cerradas = fuente.calificacionesCerradas.filter((item) => item.periodoId === periodoId);
  if (cerradas.length > 0) return cerradas;
  return calcularCalificaciones(construirContexto(fuente, periodoId));
}

export function consultarCalificacion(personaId: string, periodoId: string): CalificacionRun | undefined {
  return consultarCalificaciones(periodoId).find((item) => item.personaId === personaId);
}

export function consultarSaldos(periodoId: string): SaldoBrazo[] {
  const fuente = obtenerFuente();
  const cerrados = fuente.saldosCerrados.filter((item) => item.periodoId === periodoId);
  if (cerrados.length > 0) return cerrados;
  return calcularSaldosBrazos(construirContexto(fuente, periodoId));
}

export function descendientesUnilevel(personaId: string, profundidad = 7): string[][] {
  return nivelesUnilevel(personaId, hijosUnilevel(obtenerFuente().patrocinios), profundidad);
}

export function personasPorBrazo(personaId: string): Record<Brazo, string[]> {
  const { posiciones } = obtenerFuente();
  const activas = posicionesActivas(posiciones);
  const propia = activas.find((posicion) => posicion.personaId === personaId);
  const resultado: Record<Brazo, string[]> = { A: [], B: [], C: [] };
  if (!propia) return resultado;
  (['A', 'B', 'C'] as Brazo[]).forEach((brazo) => {
    const hija = activas.find((posicion) => posicion.padrePosicionId === propia.id && posicion.brazo === brazo);
    if (hija) resultado[brazo] = personasSubarbol(posiciones, hija.id);
  });
  return resultado;
}

export function posicionesDisponibles(): Array<{ padrePosicionId: string; personaId: string; brazo: Brazo }> {
  const activas = posicionesActivas(obtenerFuente().posiciones);
  return activas.flatMap((posicion) => (['A', 'B', 'C'] as Brazo[])
    .filter((brazo) => !activas.some((hija) => hija.padrePosicionId === posicion.id && hija.brazo === brazo))
    .map((brazo) => ({ padrePosicionId: posicion.id, personaId: posicion.personaId, brazo })));
}
