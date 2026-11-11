import { historialRunPrevio, remanentesPrevios } from '../datos/historial';
import type { ContextoCalculo } from '../motores/tipos';
import type { CalificacionRun, SaldoBrazo } from '../tipos/calificacion';
import type { EstadoFormativo } from '../tipos/formacion';
import type { MovimientoVolumen, Pedido } from '../tipos/pedidos';
import type { Persona } from '../tipos/persona';
import type { Patrocinio, PosicionTrinaria } from '../tipos/red';
import type { Periodo, VersionReglas } from '../tipos/reglas';

export interface FuenteDatos {
  personas: Persona[];
  patrocinios: Patrocinio[];
  posiciones: PosicionTrinaria[];
  movimientos: MovimientoVolumen[];
  pedidos: Pedido[];
  formacion: EstadoFormativo[];
  periodos: Periodo[];
  versiones: VersionReglas[];
  calificacionesCerradas: CalificacionRun[];
  saldosCerrados: SaldoBrazo[];
}

export interface OpcionesContexto {
  reglas?: VersionReglas;
  movimientoIds?: string[];
  excluirMovimientoIds?: string[];
}

export function periodoAnterior(periodos: Periodo[], periodo: Periodo): Periodo | undefined {
  return periodos
    .filter((item) => item.tipo === periodo.tipo && item.fechaFin < periodo.fechaInicio)
    .sort((a, b) => b.fechaFin.localeCompare(a.fechaFin))[0];
}

export function construirContexto(fuente: FuenteDatos, periodoId: string, opciones: OpcionesContexto = {}): ContextoCalculo {
  const periodo = fuente.periodos.find((item) => item.id === periodoId);
  if (!periodo) throw new Error(`Período no encontrado: ${periodoId}`);
  const reglas = opciones.reglas ?? fuente.versiones.find((version) => version.id === periodo.versionReglasId);
  if (!reglas) throw new Error(`Versión de reglas no encontrada: ${periodo.versionReglasId}`);
  const excluidos = new Set(opciones.excluirMovimientoIds ?? []);
  const incluidos = opciones.movimientoIds ? new Set(opciones.movimientoIds) : null;
  const movimientos = fuente.movimientos.filter((movimiento) => (
    (incluidos ? incluidos.has(movimiento.id) : movimiento.periodoId === periodoId) && !excluidos.has(movimiento.id)
  ));
  const anterior = periodoAnterior(fuente.periodos, periodo);
  return {
    periodo,
    reglas,
    personas: fuente.personas,
    patrocinios: fuente.patrocinios,
    posiciones: fuente.posiciones,
    movimientos,
    pedidos: fuente.pedidos,
    formacion: fuente.formacion,
    historialPrevio: historialRunPrevio,
    calificacionesAnteriores: anterior ? fuente.calificacionesCerradas.filter((item) => item.periodoId === anterior.id) : [],
    saldosAnteriores: anterior ? fuente.saldosCerrados.filter((item) => item.periodoId === anterior.id) : [],
    remanentesPrevios,
  };
}
