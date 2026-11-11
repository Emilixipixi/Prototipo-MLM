import type { Brazo } from './red';
import type { CodigoRun } from './reglas';

export interface SaldoBrazo {
  personaId: string; periodoId: string; brazo: Brazo;
  generadoVp: number; generadoVc: number; utilizado: number; restante: number;
  acumulado: number; caducado: number;
  remanenteAnterior: number;
}

export interface ResultadoRequisito {
  requisitoId: string; descripcion: string; requerido: number; logrado: number;
  cumple: boolean; fuente: string;
}

export interface CalificacionRun {
  id: string; personaId: string; periodoId: string;
  runCobro: CodigoRun | null; runHistorico: CodigoRun | null;
  desglose: ResultadoRequisito[];
  siguienteRun: CodigoRun | null;
  desgloseSiguiente: ResultadoRequisito[];
  vpPersonal: number; vcPersonal: number; vpGrupal: number; vcGrupal: number;
}

export interface HistorialRunPrevio {
  personaId: string;
  runHistoricoPrevio: CodigoRun | null;
  runCobroCicloAnterior: CodigoRun | null;
  nota: string;
}

export interface RemanentePrevio {
  personaId: string; brazo: Brazo; remanente: number; caducaEnPeriodoId: string | null; montoQueCaduca: number;
}
