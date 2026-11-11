import { create } from 'zustand';
import { conectoresIniciales, mercadosIniciales } from '../datos/integraciones';
import type { Conector, Mercado } from '../tipos/integraciones';

interface EstadoIntegraciones {
  conectores: Conector[];
  mercados: Mercado[];
  reiniciar: () => void;
}

export const useIntegracionesStore = create<EstadoIntegraciones>((set) => ({
  conectores: structuredClone(conectoresIniciales),
  mercados: structuredClone(mercadosIniciales),
  reiniciar: () => set({ conectores: structuredClone(conectoresIniciales), mercados: structuredClone(mercadosIniciales) }),
}));
