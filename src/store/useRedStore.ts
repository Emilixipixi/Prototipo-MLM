import { create } from 'zustand';
import { patrociniosIniciales, posicionesIniciales } from '../datos/red';
import type { Patrocinio, PosicionTrinaria } from '../tipos/red';

interface EstadoRed {
  patrocinios: Patrocinio[];
  posiciones: PosicionTrinaria[];
  establecer: (cambios: Partial<Pick<EstadoRed, 'patrocinios' | 'posiciones'>>) => void;
  reiniciar: () => void;
}

const copiar = () => ({
  patrocinios: structuredClone(patrociniosIniciales),
  posiciones: structuredClone(posicionesIniciales),
});

export const useRedStore = create<EstadoRed>((set) => ({
  ...copiar(),
  establecer: (cambios) => set(cambios),
  reiniciar: () => set(copiar()),
}));
