import { useCompensacionStore } from '../store/useCompensacionStore';
import type { Ajuste } from '../tipos/compensacion';
import type { Pedido } from '../tipos/pedidos';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { calcularAjustesPorDevolucion } from './calculosCompensacion';
import { periodoAbiertoActual } from './consultas';
import { obtenerFuente } from './fuente';

export interface VistaPreviaDevolucion {
  pedido: Pedido;
  periodoReversionId: string;
  reversiones: Array<{ personaId: string; vp: number; vc: number; movimientoOrigenId: string }>;
  ajustes: Ajuste[];
  corridaAfectadaId: string | null;
}

export function previsualizarDevolucion(pedidoId: string): Resultado<VistaPreviaDevolucion> {
  const fuente = obtenerFuente();
  const pedido = fuente.pedidos.find((item) => item.id === pedidoId);
  if (!pedido) return fallo('Pedido no encontrado.');
  if (pedido.estado !== 'confirmada') return fallo(`El pedido ${pedidoId} está ${pedido.estado}: solo se devuelven pedidos confirmados.`);
  const periodo = periodoAbiertoActual();
  if (!periodo) return fallo('No hay un ciclo abierto donde registrar la reversión.');
  const reversiones = fuente.movimientos
    .filter((movimiento) => movimiento.pedidoId === pedidoId && movimiento.tipo === 'origen')
    .map((movimiento) => ({ personaId: movimiento.personaId, vp: -movimiento.vp, vc: -movimiento.vc, movimientoOrigenId: movimiento.id }));
  const corrida = useCompensacionStore.getState().corridas.find((item) => item.periodoId === pedido.periodoId && item.estado === 'aprobada');
  const ajustes = corrida
    ? calcularAjustesPorDevolucion(fuente, corrida, {
      pedidoId, periodoAplicacionId: periodo.id, propuestoPor: 'vista-previa', autorizadoPor: null, fecha: fechaHoraActualIso(),
      generarId: (indice) => `PREVIA-${indice}`,
    })
    : [];
  return exito({ pedido, periodoReversionId: periodo.id, reversiones, ajustes, corridaAfectadaId: corrida?.id ?? null });
}
