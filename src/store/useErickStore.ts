import { create } from 'zustand';
import {
  asignacionesIniciales, configuracionErickInicial, eventosCalendarioIniciales, observacionesIniciales,
} from '../datos/academico/erickInicial';
import type { AsignacionDocente, ConfiguracionErick, EventoCalendario, ObservacionDocente } from '../tipos/academico';

interface DatosErick {
  eventosCalendario: EventoCalendario[]; asignacionesDocentes: AsignacionDocente[];
  observacionesDocentes: ObservacionDocente[]; configuracion: ConfiguracionErick;
}

interface EstadoErick extends DatosErick {
  actualizar: (cambios: Partial<DatosErick>) => void;
  reiniciar: () => void;
}

function datosIniciales(): DatosErick {
  return structuredClone({
    eventosCalendario: eventosCalendarioIniciales, asignacionesDocentes: asignacionesIniciales,
    observacionesDocentes: observacionesIniciales, configuracion: configuracionErickInicial,
  });
}

export const useErickStore = create<EstadoErick>((set) => ({
  ...datosIniciales(),
  actualizar: (cambios) => set(cambios),
  reiniciar: () => set(datosIniciales()),
}));
