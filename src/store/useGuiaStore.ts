import { create } from 'zustand';

interface EstadoGuiaStore {
  abierta: boolean;
  marcados: string[];
  flujoActivo: string;
  abrir: () => void;
  cerrar: () => void;
  alternarPaso: (pasoId: string) => void;
  elegirFlujo: (flujoId: string) => void;
  reiniciar: () => void;
}

export const useGuiaStore = create<EstadoGuiaStore>((set) => ({
  abierta: false,
  marcados: [],
  flujoActivo: 'F01',
  abrir: () => set({ abierta: true }),
  cerrar: () => set({ abierta: false }),
  alternarPaso: (pasoId) => set((estado) => ({ marcados: estado.marcados.includes(pasoId) ? estado.marcados.filter((id) => id !== pasoId) : [...estado.marcados, pasoId] })),
  elegirFlujo: (flujoId) => set({ flujoActivo: flujoId }),
  reiniciar: () => set({ marcados: [], flujoActivo: 'F01' }),
}));
