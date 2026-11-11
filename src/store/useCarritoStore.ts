import { create } from 'zustand';

export interface LineaCarrito { productoId: string; cantidad: number; }

interface EstadoCarrito {
  lineas: LineaCarrito[];
  agregar: (productoId: string, cantidad?: number) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  quitar: (productoId: string) => void;
  vaciar: () => void;
  reiniciar: () => void;
}

export const useCarritoStore = create<EstadoCarrito>((set) => ({
  lineas: [],
  agregar: (productoId, cantidad = 1) => set((estado) => {
    const existente = estado.lineas.find((linea) => linea.productoId === productoId);
    if (existente) {
      return { lineas: estado.lineas.map((linea) => (linea.productoId === productoId ? { ...linea, cantidad: Math.min(99, linea.cantidad + cantidad) } : linea)) };
    }
    return { lineas: [...estado.lineas, { productoId, cantidad: Math.min(99, cantidad) }] };
  }),
  cambiarCantidad: (productoId, cantidad) => set((estado) => ({
    lineas: estado.lineas.map((linea) => (linea.productoId === productoId ? { ...linea, cantidad: Math.max(1, Math.min(99, cantidad)) } : linea)),
  })),
  quitar: (productoId) => set((estado) => ({ lineas: estado.lineas.filter((linea) => linea.productoId !== productoId) })),
  vaciar: () => set({ lineas: [] }),
  reiniciar: () => set({ lineas: [] }),
}));

export function useCantidadCarrito(): number {
  return useCarritoStore((estado) => estado.lineas.reduce((suma, linea) => suma + linea.cantidad, 0));
}
