import { create } from 'zustand';
import { formacionInicial } from '../datos/formacion';
import type { EstadoFormativo } from '../tipos/formacion';

interface EstadoFormacionStore {
  estados: EstadoFormativo[];
  establecer: (estados: EstadoFormativo[]) => void;
  reiniciar: () => void;
}

export const useFormacionStore = create<EstadoFormacionStore>((set) => ({
  estados: structuredClone(formacionInicial),
  establecer: (estados) => set({ estados }),
  reiniciar: () => set({ estados: structuredClone(formacionInicial) }),
}));
