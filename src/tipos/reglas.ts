export type CodigoRun = 'RUN300' | 'RUN1K' | 'RUN3K' | 'RUN5K' | 'RUN10K' | 'RUN30K'
  | 'RUN50K' | 'RUN100K' | 'RUN300K' | 'RUN500K' | 'RUN1M';

export type CodigoMotor = 'actividad_comercial' | 'patrocinio_activacion' | 'unilevel'
  | 'trinario' | 'generaciones' | 'bono_rango' | 'fondo_liderazgo';

export type EstadoPeriodo = 'programado' | 'abierto' | 'en_cierre' | 'cerrado';

export interface Periodo {
  id: string; nombre: string; tipo: 'ciclo' | 'mensual'; fechaInicio: string; fechaFin: string;
  duracionDias: number; estado: EstadoPeriodo;
  versionReglasId: string;
}

export type TipoRequisito = 'vp_personal' | 'vp_grupal' | 'vc_grupal'
  | 'directos_activos' | 'equilibrio_brazos' | 'lideres_calificados' | 'formacion_aprobada';

export interface RequisitoRango {
  id: string; tipo: TipoRequisito;
  descripcion: string; valor: number; evaluacion: 'ciclo' | 'mensual';
}

export interface DefinicionRango {
  codigo: CodigoRun; orden: number; nombreVisible: string; requisitos: RequisitoRango[];
}

export interface ReglaTrinaria {
  reglaConsumo: string; ciclosCaducidad: number; porcentajeIlustrativo: number;
}

export interface ParametroMotor { clave: string; etiqueta: string; valor: number | string | boolean; unidad?: string; }

export interface ConfiguracionMotor {
  codigo: CodigoMotor; nombre: string; activo: boolean; descripcion: string;
  parametros: ParametroMotor[];
}

export interface VersionReglas {
  id: string; numero: number; vigenteDesde: string; vigenteHasta: string | null;
  actorId: string; fecha: string; motivo: string;
  rangos: DefinicionRango[]; motores: ConfiguracionMotor[]; trinario: ReglaTrinaria;
  topes: { maximoPorCicloAfiliado: number }; esDemostracion: true;
}
