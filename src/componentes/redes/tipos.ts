import type { Brazo } from '../../tipos/red';
import type { CodigoRun } from '../../tipos/reglas';

export interface ResumenNodo {
  personaId: string;
  nombre: string;
  codigo: string;
  estado: string;
  runCobro: CodigoRun | null;
  vpCiclo: number;
  vcCiclo: number;
  patrocinadorId: string | null;
  posicionId: string | null;
  padrePosicionPersonaId: string | null;
  brazo: Brazo | null;
}
