export type EstadoPedido = 'borrador' | 'pendiente' | 'confirmada' | 'cancelada' | 'devuelta';

export interface ItemPedido { productoId: string; cantidad: number; precioUnitario: number; vpUnitario: number; vcUnitario: number; }

export interface EventoPedido { estado: EstadoPedido; fecha: string; actorId: string; detalle: string; }

export interface Pedido {
  id: string; compradorId: string; referenteId: string | null; periodoId: string;
  items: ItemPedido[]; totalPrecio: number; totalVp: number; totalVc: number;
  estado: EstadoPedido;
  fecha: string; comprobante: string; eventos: EventoPedido[];
}

export interface MovimientoVolumen {
  id: string; tipo: 'origen' | 'reversion' | 'ajuste'; pedidoId: string | null;
  movimientoOrigenId: string | null; personaId: string; periodoId: string;
  vp: number; vc: number; fecha: string; motivo: string;
}
