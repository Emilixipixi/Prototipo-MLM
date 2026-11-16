import type { DocumentoAcademico, EstadoElemento, EstadoMatricula, EstadoMid, EstadoPrograma, EventoIntegracion } from '../tipos/academico';
import type { EstadoBono, EstadoLiquidacion } from '../tipos/compensacion';
import type { EstadoFormacion } from '../tipos/formacion';
import type { EstadoPedido } from '../tipos/pedidos';
import type { EstadoCuenta } from '../tipos/persona';
import type { EstadoPeriodo } from '../tipos/reglas';

type Maquina<T extends string> = Record<T, T[]>;

export const transicionesPedido: Maquina<EstadoPedido> = {
  borrador: ['pendiente', 'cancelada'],
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['devuelta'],
  cancelada: [],
  devuelta: [],
};

export const transicionesCuenta: Maquina<EstadoCuenta> = {
  pendiente: ['activo', 'suspendido', 'bloqueado'],
  activo: ['suspendido', 'bloqueado'],
  suspendido: ['activo', 'bloqueado'],
  bloqueado: ['activo', 'suspendido'],
};

export const transicionesBono: Maquina<EstadoBono> = {
  estimada: ['en_revision'],
  en_revision: ['aprobada', 'retenida'],
  aprobada: ['liquidada', 'retenida', 'revertida'],
  retenida: ['aprobada'],
  liquidada: ['revertida'],
  revertida: [],
};

export const transicionesLiquidacion: Maquina<EstadoLiquidacion> = {
  borrador: ['en_revision'],
  en_revision: ['aprobada', 'retenida'],
  aprobada: ['apta_para_desembolso', 'retenida'],
  apta_para_desembolso: ['liquidada_simulada', 'retenida'],
  retenida: ['aprobada'],
  liquidada_simulada: [],
};

export const transicionesCorrida: Maquina<'simulada' | 'en_revision' | 'aprobada' | 'rechazada'> = {
  simulada: ['en_revision'],
  en_revision: ['aprobada', 'rechazada'],
  aprobada: [],
  rechazada: [],
};

export const transicionesPeriodo: Maquina<EstadoPeriodo> = {
  programado: ['abierto'],
  abierto: ['en_cierre'],
  en_cierre: ['cerrado', 'abierto'],
  cerrado: [],
};

export const transicionesFormacion: Maquina<EstadoFormacion> = {
  matriculado: ['cursando'],
  cursando: ['aprobado'],
  aprobado: [],
};

export const transicionesAjuste: Maquina<'propuesto' | 'autorizado' | 'aplicado' | 'rechazado'> = {
  propuesto: ['autorizado', 'rechazado'],
  autorizado: ['aplicado'],
  aplicado: [],
  rechazado: [],
};

export function validarTransicion<T extends string>(maquina: Maquina<T>, desde: T, hacia: T, entidad: string): string | null {
  if (maquina[desde]?.includes(hacia)) return null;
  const permitidos = maquina[desde]?.length ? maquina[desde].join(', ') : 'ninguno (estado final)';
  return `Transición no permitida en ${entidad}: de "${desde}" a "${hacia}". Estados siguientes permitidos: ${permitidos}.`;
}

export const transicionesPrograma: Maquina<EstadoPrograma> = {
  borrador: ['publicado'],
  publicado: ['borrador', 'archivado'],
  archivado: [],
};

export const transicionesMatricula: Maquina<EstadoMatricula> = {
  activa: ['por_vencer', 'vencida', 'suspendida'],
  por_vencer: ['vencida', 'suspendida', 'activa'],
  vencida: ['activa'],
  suspendida: ['activa'],
};

export const transicionesElemento: Maquina<EstadoElemento> = {
  bloqueado: ['disponible'],
  disponible: ['en_curso'],
  en_curso: ['aprobado', 'desaprobado'],
  desaprobado: ['en_curso', 'bloqueado_por_intentos'],
  bloqueado_por_intentos: ['en_curso'],
  aprobado: [],
};

export const transicionesDocumento: Maquina<DocumentoAcademico['estado']> = {
  emitido: ['anulado'],
  anulado: [],
};

export const transicionesMid: Maquina<EstadoMid> = {
  solicitado: ['asignado'],
  asignado: ['sustentado'],
  sustentado: ['aprobado', 'desaprobado'],
  aprobado: [],
  desaprobado: [],
};

export const transicionesEventoLms: Maquina<EventoIntegracion['estado']> = {
  enviado: ['procesado', 'error'],
  error: ['enviado'],
  procesado: [],
};
