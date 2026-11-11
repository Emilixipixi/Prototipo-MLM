import { create } from 'zustand';
import { crearEstadoInicialCompensacion, type EstadoCompensacionInicial } from '../servicios/inicializacion';

interface EstadoCompensacion extends EstadoCompensacionInicial {
  establecer: (cambios: Partial<EstadoCompensacionInicial>) => void;
  reiniciar: () => void;
}

export const useCompensacionStore = create<EstadoCompensacion>((set) => ({
  ...crearEstadoInicialCompensacion(),
  establecer: (cambios) => set(cambios),
  reiniciar: () => set(crearEstadoInicialCompensacion()),
}));
