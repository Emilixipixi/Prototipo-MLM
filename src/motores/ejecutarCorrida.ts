import type { CalificacionRun, SaldoBrazo } from '../tipos/calificacion';
import type { CorridaCalculo } from '../tipos/compensacion';
import type { CodigoMotor } from '../tipos/reglas';
import { motorActividadComercial } from './motorActividadComercial';
import { motorBonoRango } from './motorBonoRango';
import { motorFondoLiderazgo } from './motorFondoLiderazgo';
import { motorGeneraciones } from './motorGeneraciones';
import { motorPatrocinioActivacion } from './motorPatrocinioActivacion';
import { calcularCalificaciones } from './motorRangos';
import { calcularSaldosBrazos, motorTrinario } from './motorTrinario';
import { motorUnilevel } from './motorUnilevel';
import type { ContextoCalculo, Motor } from './tipos';

export const motores: Record<CodigoMotor, Motor> = {
  actividad_comercial: motorActividadComercial,
  patrocinio_activacion: motorPatrocinioActivacion,
  unilevel: motorUnilevel,
  trinario: motorTrinario,
  generaciones: motorGeneraciones,
  bono_rango: motorBonoRango,
  fondo_liderazgo: motorFondoLiderazgo,
};

export const ordenMotores: CodigoMotor[] = [
  'actividad_comercial', 'patrocinio_activacion', 'unilevel', 'trinario', 'generaciones', 'bono_rango', 'fondo_liderazgo',
];

export interface OpcionesCorrida {
  corridaId: string;
  creadaPor: string;
  fecha: string;
  parametrosTemporales?: boolean;
}

export interface ResultadoCorrida {
  corrida: CorridaCalculo;
  calificaciones: CalificacionRun[];
  saldos: SaldoBrazo[];
}

export function crearClaveIdempotencia(periodoId: string, versionReglasId: string, movimientoIds: string[]): string {
  const texto = [...movimientoIds].sort().join('|');
  let hash = 0;
  for (let indice = 0; indice < texto.length; indice += 1) hash = (hash * 31 + texto.charCodeAt(indice)) >>> 0;
  return `${periodoId}:${versionReglasId}:${movimientoIds.length}:${hash.toString(16).toUpperCase()}`;
}

export function ejecutarCorrida(contexto: ContextoCalculo, opciones: OpcionesCorrida): ResultadoCorrida {
  const calificaciones = calcularCalificaciones(contexto);
  const saldos = calcularSaldosBrazos(contexto);
  const entrada = { ...contexto, corridaId: opciones.corridaId, calificaciones, saldos };
  const activos = ordenMotores.filter((codigo) => contexto.reglas.motores.find((motor) => motor.codigo === codigo)?.activo);
  const resultados = activos.flatMap((codigo) => motores[codigo](entrada));
  const movimientoIds = contexto.movimientos.map((movimiento) => movimiento.id);
  return {
    calificaciones,
    saldos,
    corrida: {
      id: opciones.corridaId,
      periodoId: contexto.periodo.id,
      versionReglasId: contexto.reglas.id,
      movimientoIds,
      estado: 'simulada',
      creadaPor: opciones.creadaPor,
      fecha: opciones.fecha,
      claveIdempotencia: crearClaveIdempotencia(contexto.periodo.id, contexto.reglas.id, movimientoIds),
      resultados,
      parametrosTemporales: opciones.parametrosTemporales ?? false,
    },
  };
}
