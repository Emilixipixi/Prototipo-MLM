import { create } from 'zustand';
import { periodosIniciales } from '../datos/periodos';
import { versionesReglasIniciales } from '../datos/reglas';
import type { Periodo, VersionReglas } from '../tipos/reglas';

interface EstadoPeriodos {
  periodos: Periodo[];
  versiones: VersionReglas[];
  establecer: (cambios: Partial<Pick<EstadoPeriodos, 'periodos' | 'versiones'>>) => void;
  reiniciar: () => void;
}

const copiar = () => ({ periodos: structuredClone(periodosIniciales), versiones: structuredClone(versionesReglasIniciales) });

export const usePeriodosStore = create<EstadoPeriodos>((set) => ({
  ...copiar(),
  establecer: (cambios) => set(cambios),
  reiniciar: () => set(copiar()),
}));
