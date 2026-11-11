import { create } from 'zustand';
import { movimientosIniciales } from '../datos/movimientos';
import { pedidosIniciales } from '../datos/pedidos';
import type { MovimientoVolumen, Pedido } from '../tipos/pedidos';

interface EstadoPedidos {
  pedidos: Pedido[];
  movimientos: MovimientoVolumen[];
  establecer: (cambios: Partial<Pick<EstadoPedidos, 'pedidos' | 'movimientos'>>) => void;
  reiniciar: () => void;
}

const copiar = () => ({ pedidos: structuredClone(pedidosIniciales), movimientos: structuredClone(movimientosIniciales) });

export const usePedidosStore = create<EstadoPedidos>((set) => ({
  ...copiar(),
  establecer: (cambios) => set(cambios),
  reiniciar: () => set(copiar()),
}));
