import type { CalificacionRun, HistorialRunPrevio, RemanentePrevio, SaldoBrazo } from '../tipos/calificacion';
import type { BonoComision } from '../tipos/compensacion';
import type { EstadoFormativo } from '../tipos/formacion';
import type { MovimientoVolumen, Pedido } from '../tipos/pedidos';
import type { Persona } from '../tipos/persona';
import type { Patrocinio, PosicionTrinaria } from '../tipos/red';
import type { Periodo, VersionReglas } from '../tipos/reglas';

export interface ContextoCalculo {
  periodo: Periodo;
  reglas: VersionReglas;
  personas: Persona[];
  patrocinios: Patrocinio[];
  posiciones: PosicionTrinaria[];
  movimientos: MovimientoVolumen[];
  pedidos: Pedido[];
  formacion: EstadoFormativo[];
  historialPrevio: HistorialRunPrevio[];
  calificacionesAnteriores: CalificacionRun[];
  saldosAnteriores: SaldoBrazo[];
  remanentesPrevios: RemanentePrevio[];
}

export interface EntradaMotor extends ContextoCalculo {
  corridaId: string;
  calificaciones: CalificacionRun[];
  saldos: SaldoBrazo[];
}

export type Motor = (entrada: EntradaMotor) => BonoComision[];
