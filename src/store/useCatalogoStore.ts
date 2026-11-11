import { create } from 'zustand';
import { productosIniciales } from '../datos/productos';
import type { Producto } from '../tipos/catalogo';

interface EstadoCatalogo {
  productos: Producto[];
  establecer: (productos: Producto[]) => void;
  reiniciar: () => void;
}

export const useCatalogoStore = create<EstadoCatalogo>((set) => ({
  productos: structuredClone(productosIniciales),
  establecer: (productos) => set({ productos }),
  reiniciar: () => set({ productos: structuredClone(productosIniciales) }),
}));
