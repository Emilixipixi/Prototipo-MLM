import type { CodigoMotor, VersionReglas } from './reglas';

export type EstadoBono = 'estimada' | 'en_revision' | 'aprobada' | 'retenida' | 'liquidada' | 'revertida';

export interface BonoComision {
  id: string; corridaId: string; personaId: string; motor: CodigoMotor; periodoId: string;
  base: number; regla: string; fuente: string[]; calculo: string; monto: number;
  estado: EstadoBono;
  ajustes: string[]; elegible: boolean; motivosNoElegible: string[];
  detalle?: Array<{ etiqueta: string; base: number; porcentaje: number; monto: number; fuente: string }>;
}

export interface CorridaCalculo {
  id: string; periodoId: string; versionReglasId: string; movimientoIds: string[];
  estado: 'simulada' | 'en_revision' | 'aprobada' | 'rechazada';
  creadaPor: string; fecha: string; claveIdempotencia: string; resultados: BonoComision[];
  parametrosTemporales: boolean;
  reglasUsadas?: VersionReglas;
}

export interface Ajuste {
  id: string; tipo: 'devolucion' | 'correccion' | 'retencion' | 'liberacion';
  personaId: string; periodoId: string; referenciaId: string; monto: number; vp: number; vc: number;
  motivo: string; evidencia: string | null;
  estado: 'propuesto' | 'autorizado' | 'aplicado' | 'rechazado';
  propuestoPor: string; autorizadoPor: string | null; fecha: string;
  periodoAfectadoId?: string; motor?: CodigoMotor;
}

export type EstadoLiquidacion = 'borrador' | 'en_revision' | 'aprobada' | 'apta_para_desembolso' | 'retenida' | 'liquidada_simulada';

export interface Liquidacion {
  id: string; personaId: string; periodoId: string; corridaId: string;
  conceptos: { motor: CodigoMotor; monto: number }[]; ajustes: string[];
  total: number; moneda: string;
  estado: EstadoLiquidacion;
  aprobaciones: { actorId: string; fecha: string; accion: string }[];
  comprobante: string | null;
  motivoRetencion?: string | null;
}
