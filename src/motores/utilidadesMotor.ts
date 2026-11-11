import { ordenRuns } from '../datos/reglas';
import type { CalificacionRun } from '../tipos/calificacion';
import type { BonoComision } from '../tipos/compensacion';
import type { MovimientoVolumen } from '../tipos/pedidos';
import type { Persona } from '../tipos/persona';
import type { Brazo, Patrocinio, PosicionTrinaria } from '../tipos/red';
import type { CodigoMotor, CodigoRun, ConfiguracionMotor, VersionReglas } from '../tipos/reglas';
import type { EntradaMotor } from './tipos';

export const brazos: Brazo[] = ['A', 'B', 'C'];

export function indiceRun(run: CodigoRun | null | undefined): number {
  return run ? ordenRuns.indexOf(run) : -1;
}

export function maximoRun(...runs: Array<CodigoRun | null | undefined>): CodigoRun | null {
  return runs.reduce<CodigoRun | null>((mayor, actual) => (indiceRun(actual) > indiceRun(mayor) ? actual ?? null : mayor), null);
}

export function configuracionMotor(reglas: VersionReglas, codigo: CodigoMotor): ConfiguracionMotor {
  const configuracion = reglas.motores.find((motor) => motor.codigo === codigo);
  if (!configuracion) throw new Error(`Motor no configurado: ${codigo}`);
  return configuracion;
}

export function parametroNumero(configuracion: ConfiguracionMotor, clave: string, porDefecto = 0): number {
  const parametro = configuracion.parametros.find((item) => item.clave === clave);
  return typeof parametro?.valor === 'number' ? parametro.valor : porDefecto;
}

export function parametroTexto(configuracion: ConfiguracionMotor, clave: string, porDefecto = ''): string {
  const parametro = configuracion.parametros.find((item) => item.clave === clave);
  return typeof parametro?.valor === 'string' ? parametro.valor : porDefecto;
}

export function totalesPorPersona(movimientos: MovimientoVolumen[]): Map<string, { vp: number; vc: number }> {
  const mapa = new Map<string, { vp: number; vc: number }>();
  movimientos.forEach((movimiento) => {
    const actual = mapa.get(movimiento.personaId) ?? { vp: 0, vc: 0 };
    mapa.set(movimiento.personaId, { vp: actual.vp + movimiento.vp, vc: actual.vc + movimiento.vc });
  });
  return mapa;
}

export function hijosUnilevel(patrocinios: Patrocinio[]): Map<string, string[]> {
  const mapa = new Map<string, string[]>();
  patrocinios.forEach((relacion) => {
    if (!relacion.patrocinadorId) return;
    mapa.set(relacion.patrocinadorId, [...(mapa.get(relacion.patrocinadorId) ?? []), relacion.personaId]);
  });
  return mapa;
}

export function nivelesUnilevel(personaId: string, hijos: Map<string, string[]>, profundidad: number): string[][] {
  const niveles: string[][] = [];
  let actuales = [personaId];
  for (let nivel = 1; nivel <= profundidad; nivel += 1) {
    const siguientes = actuales.flatMap((id) => hijos.get(id) ?? []);
    niveles.push(siguientes);
    actuales = siguientes;
  }
  return niveles;
}

export function posicionesActivas(posiciones: PosicionTrinaria[]): PosicionTrinaria[] {
  return posiciones.filter((posicion) => posicion.estado === 'activa');
}

export function hijosPosicion(posiciones: PosicionTrinaria[], padreId: string, brazo: Brazo): PosicionTrinaria | undefined {
  return posicionesActivas(posiciones).find((posicion) => posicion.padrePosicionId === padreId && posicion.brazo === brazo);
}

export function personasSubarbol(posiciones: PosicionTrinaria[], raizPosicionId: string): string[] {
  const activas = posicionesActivas(posiciones);
  const raiz = activas.find((posicion) => posicion.id === raizPosicionId);
  if (!raiz) return [];
  const resultado: string[] = [];
  const pendientes = [raiz];
  while (pendientes.length > 0) {
    const actual = pendientes.shift()!;
    resultado.push(actual.personaId);
    activas.filter((posicion) => posicion.padrePosicionId === actual.id).forEach((hija) => pendientes.push(hija));
  }
  return resultado;
}

export interface ProduccionBrazo { brazo: Brazo; vp: number; vc: number; personas: string[]; }

export function produccionPorBrazo(
  personaId: string, posiciones: PosicionTrinaria[], totales: Map<string, { vp: number; vc: number }>,
): ProduccionBrazo[] {
  const posicion = posicionesActivas(posiciones).find((item) => item.personaId === personaId);
  return brazos.map((brazo) => {
    if (!posicion) return { brazo, vp: 0, vc: 0, personas: [] };
    const hija = hijosPosicion(posiciones, posicion.id, brazo);
    if (!hija) return { brazo, vp: 0, vc: 0, personas: [] };
    const personas = personasSubarbol(posiciones, hija.id);
    const suma = personas.reduce((acumulado, id) => {
      const total = totales.get(id) ?? { vp: 0, vc: 0 };
      return { vp: acumulado.vp + total.vp, vc: acumulado.vc + total.vc };
    }, { vp: 0, vc: 0 });
    return { brazo, ...suma, personas };
  });
}

export interface Elegibilidad { elegible: boolean; retener: boolean; motivos: string[]; }

export function evaluarElegibilidad(persona: Persona | undefined): Elegibilidad {
  if (!persona) return { elegible: false, retener: false, motivos: ['Persona no encontrada'] };
  if (persona.tipo !== 'empresario') return { elegible: false, retener: false, motivos: [`El tipo ${persona.tipo} no participa en comisiones por defecto`] };
  if (persona.estado === 'pendiente') return { elegible: false, retener: false, motivos: ['Cuenta pendiente de activación'] };
  if (persona.estado === 'bloqueado') return { elegible: false, retener: true, motivos: ['Cuenta bloqueada: comisiones retenidas'] };
  if (persona.estado === 'suspendido') return { elegible: true, retener: true, motivos: ['Cuenta suspendida: la comisión se calcula y queda retenida'] };
  return { elegible: true, retener: false, motivos: [] };
}

export function buscarCalificacion(calificaciones: CalificacionRun[], personaId: string): CalificacionRun | undefined {
  return calificaciones.find((item) => item.personaId === personaId);
}

export function nombrePersona(personas: Persona[], id: string): string {
  const persona = personas.find((item) => item.id === id);
  return persona ? `${persona.nombres} ${persona.apellidos}` : id;
}

export function crearBono(
  entrada: EntradaMotor, motor: CodigoMotor, personaId: string,
  datos: Pick<BonoComision, 'base' | 'regla' | 'fuente' | 'calculo' | 'monto'> & Partial<Pick<BonoComision, 'detalle' | 'motivosNoElegible' | 'elegible'>>,
): BonoComision {
  const persona = entrada.personas.find((item) => item.id === personaId);
  const elegibilidad = evaluarElegibilidad(persona);
  const motivos = [...elegibilidad.motivos, ...(datos.motivosNoElegible ?? [])];
  const elegible = elegibilidad.elegible && (datos.elegible ?? true);
  return {
    id: `${entrada.corridaId}-${motor}-${personaId}`,
    corridaId: entrada.corridaId,
    personaId,
    motor,
    periodoId: entrada.periodo.id,
    base: datos.base,
    regla: datos.regla,
    fuente: datos.fuente,
    calculo: datos.calculo,
    monto: elegible ? datos.monto : 0,
    estado: elegibilidad.retener ? 'retenida' : 'estimada',
    ajustes: [],
    elegible,
    motivosNoElegible: motivos,
    detalle: datos.detalle,
  };
}

export function empresariosEvaluables(personas: Persona[]): Persona[] {
  return personas.filter((persona) => persona.tipo === 'empresario');
}
