import { Ban, CircleCheck, CircleDashed, Clock, FilePen, Undo2, type LucideIcon } from 'lucide-react';
import type { TonoInsignia } from '../componentes/ui/Insignia';
import type { EstadoPedido } from '../tipos/pedidos';

export const estadosPedido: Record<EstadoPedido, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon; descripcion: string }> = {
  borrador: { etiqueta: 'Borrador', tono: 'neutra', icono: FilePen, descripcion: 'Pedido creado, aún no enviado.' },
  pendiente: { etiqueta: 'Pendiente', tono: 'advertencia', icono: Clock, descripcion: 'Esperando la confirmación de cobro (simulada).' },
  confirmada: { etiqueta: 'Confirmada', tono: 'exito', icono: CircleCheck, descripcion: 'Cobro confirmado (simulado). El pedido generó VP y VC.' },
  cancelada: { etiqueta: 'Cancelada', tono: 'neutra', icono: Ban, descripcion: 'Pedido cancelado antes de confirmarse; no generó volumen.' },
  devuelta: { etiqueta: 'Devuelta', tono: 'error', icono: Undo2, descripcion: 'Pedido devuelto: su volumen fue revertido con un movimiento inverso.' },
};

export const iconoEstadoFuturo = CircleDashed;
