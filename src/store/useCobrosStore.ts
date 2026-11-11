import { create } from 'zustand';
import { datosCobroIniciales, solicitudesRetiroIniciales } from '../datos/cobros';
import type { DatosCobro, SolicitudRetiro } from '../tipos/cobros';

interface EstadoCobros {
  datos: DatosCobro[];
  solicitudes: SolicitudRetiro[];
  establecer: (cambios: Partial<Pick<EstadoCobros, 'datos' | 'solicitudes'>>) => void;
  reiniciar: () => void;
}

const copiar = () => ({ datos: structuredClone(datosCobroIniciales), solicitudes: structuredClone(solicitudesRetiroIniciales) });

export const useCobrosStore = create<EstadoCobros>((set) => ({
  ...copiar(),
  establecer: (cambios) => set(cambios),
  reiniciar: () => set(copiar()),
}));
