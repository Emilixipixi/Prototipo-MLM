import { create } from 'zustand';
import type { Descuento } from '../tipos/catalogo';

interface EstadoDescuentos {
  descuentos: Descuento[];
  establecer: (descuentos: Descuento[]) => void;
  reiniciar: () => void;
}

export const useDescuentosStore = create<EstadoDescuentos>((set) => ({
  descuentos: [],
  establecer: (descuentos) => set({ descuentos }),
  reiniciar: () => set({ descuentos: [] }),
}));
