import { useCatalogoStore } from '../store/useCatalogoStore';
import { useCompensacionStore } from '../store/useCompensacionStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { Ajuste } from '../tipos/compensacion';
import type { EstadoPedido, ItemPedido, MovimientoVolumen, Pedido } from '../tipos/pedidos';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { transicionesPedido, validarTransicion } from '../validaciones/transiciones';
import { calcularAjustesPorDevolucion } from './calculosCompensacion';
import { calcularPrecio } from './descuentos';
import { useDescuentosStore } from '../store/useDescuentosStore';
import { periodoAbiertoActual } from './consultas';
import { obtenerFuente } from './fuente';
import { notificar, registrarBitacora } from './registro';

function siguienteId(prefijo: string, existentes: string[], digitos: number): string {
  const numeros = existentes.map((id) => Number(id.replace(prefijo, ''))).filter((numero) => !Number.isNaN(numero));
  return `${prefijo}${String(Math.max(0, ...numeros) + 1).padStart(digitos, '0')}`;
}

function cambiarEstado(pedido: Pedido, hacia: EstadoPedido, actorId: string, detalle: string): Pedido {
  return { ...pedido, estado: hacia, eventos: [...pedido.eventos, { estado: hacia, fecha: fechaHoraActualIso(), actorId, detalle }] };
}

export interface LineaPedido { productoId: string; cantidad: number; }

export function crearPedido(compradorId: string, lineas: LineaPedido[], actorId = compradorId): Resultado<Pedido> {
  const comprador = usePersonasStore.getState().buscarPorId(compradorId);
  if (!comprador) return fallo('El comprador no existe.');
  if (comprador.estado !== 'activo') return fallo(`La cuenta ${comprador.codigo} está ${comprador.estado} y no puede comprar.`);
  const periodo = periodoAbiertoActual();
  if (!periodo) return fallo('No hay un ciclo comercial abierto para asociar el pedido.');
  const productos = useCatalogoStore.getState().productos;
  const items: ItemPedido[] = [];
  for (const linea of lineas) {
    const producto = productos.find((item) => item.id === linea.productoId);
    if (!producto || !producto.activo) return fallo(`El producto ${linea.productoId} no está disponible.`);
    if (linea.cantidad < 1) return fallo('La cantidad debe ser mayor a cero.');
    const precio = calcularPrecio(producto, useDescuentosStore.getState().descuentos);
    items.push({
      productoId: producto.id, cantidad: linea.cantidad, precioUnitario: precio.precioFinal, vpUnitario: producto.vp, vcUnitario: producto.vc,
      ...(precio.descuento ? { descuento: { precioLista: precio.precioLista, descuentoId: precio.descuento.id, nombreDescuento: precio.descuento.nombre } } : {}),
    });
  }
  if (items.length === 0) return fallo('El pedido no tiene artículos.');
  const { pedidos, establecer } = usePedidosStore.getState();
  const fecha = fechaHoraActualIso();
  const pedido: Pedido = {
    id: siguienteId('DEMO-P', pedidos.map((item) => item.id), 2),
    compradorId,
    referenteId: comprador.tipo === 'empresario' ? null : comprador.referenteId,
    periodoId: periodo.id,
    items,
    totalPrecio: items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0),
    totalVp: items.reduce((suma, item) => suma + item.vpUnitario * item.cantidad, 0),
    totalVc: items.reduce((suma, item) => suma + item.vcUnitario * item.cantidad, 0),
    estado: 'borrador',
    fecha,
    comprobante: '',
    eventos: [{ estado: 'borrador', fecha, actorId, detalle: 'Pedido creado' }],
  };
  establecer({ pedidos: [...pedidos, pedido] });
  registrarBitacora({ actorId, accion: 'Creación de pedido', modulo: 'pedidos', referenciaId: pedido.id, despues: { estado: 'borrador', total: pedido.totalPrecio } });
  return exito(pedido);
}

function actualizarPedido(pedidoId: string, transformar: (pedido: Pedido) => Pedido): void {
  const { pedidos, establecer } = usePedidosStore.getState();
  establecer({ pedidos: pedidos.map((pedido) => (pedido.id === pedidoId ? transformar(pedido) : pedido)) });
}

export function enviarPedido(pedidoId: string, actorId: string): Resultado<Pedido> {
  const pedido = usePedidosStore.getState().pedidos.find((item) => item.id === pedidoId);
  if (!pedido) return fallo('Pedido no encontrado.');
  const error = validarTransicion(transicionesPedido, pedido.estado, 'pendiente', 'el pedido');
  if (error) return fallo(error);
  const actualizado = cambiarEstado(pedido, 'pendiente', actorId, 'Pedido enviado a confirmación de cobro');
  actualizarPedido(pedidoId, () => actualizado);
  registrarBitacora({ actorId, accion: 'Pedido enviado a confirmación', modulo: 'pedidos', referenciaId: pedidoId, antes: pedido.estado, despues: 'pendiente' });
  return exito(actualizado);
}

export function confirmarPedido(pedidoId: string, actorId: string): Resultado<{ pedido: Pedido; movimiento: MovimientoVolumen }> {
  const { pedidos, movimientos, establecer } = usePedidosStore.getState();
  const pedido = pedidos.find((item) => item.id === pedidoId);
  if (!pedido) return fallo('Pedido no encontrado.');
  const error = validarTransicion(transicionesPedido, pedido.estado, 'confirmada', 'el pedido');
  if (error) return fallo(error);
  const comprador = usePersonasStore.getState().buscarPorId(pedido.compradorId);
  const destinoId = comprador?.tipo === 'empresario' ? pedido.compradorId : pedido.referenteId;
  if (!destinoId) return fallo('El pedido no tiene una persona a la que asignar el volumen.');
  const fecha = fechaHoraActualIso();
  const comprobante = siguienteId('DEMO-CMP-', pedidos.map((item) => item.comprobante).filter(Boolean), 4);
  const confirmado = { ...cambiarEstado(pedido, 'confirmada', actorId, 'Confirmación de cobro simulada (sin transacción real)'), comprobante };
  const movimiento: MovimientoVolumen = {
    id: siguienteId('DEMO-MV-', movimientos.map((item) => item.id), 4),
    tipo: 'origen', pedidoId, movimientoOrigenId: null, personaId: destinoId, periodoId: pedido.periodoId,
    vp: pedido.totalVp, vc: pedido.totalVc, fecha, motivo: 'Pedido confirmado',
  };
  establecer({
    pedidos: pedidos.map((item) => (item.id === pedidoId ? confirmado : item)),
    movimientos: [...movimientos, movimiento],
  });
  registrarBitacora({ actorId, accion: 'Confirmación de pedido (simulada)', modulo: 'pedidos', referenciaId: pedidoId, antes: pedido.estado, despues: { estado: 'confirmada', movimiento: movimiento.id, vp: movimiento.vp, vc: movimiento.vc } });
  notificar({ personaId: pedido.compradorId, tipo: 'compra', titulo: 'Compra confirmada', mensaje: `Tu pedido ${pedidoId} fue confirmado (simulado). Generó ${pedido.totalVp} VP y ${pedido.totalVc} VC.` });
  if (destinoId !== pedido.compradorId) {
    notificar({ personaId: destinoId, tipo: 'compra', titulo: 'Compra de un cliente referido', mensaje: `El pedido ${pedidoId} de tu cliente sumó ${pedido.totalVp} VP y ${pedido.totalVc} VC a tu volumen.` });
  }
  return exito({ pedido: confirmado, movimiento });
}

export function cancelarPedido(pedidoId: string, actorId: string, motivo: string): Resultado<Pedido> {
  const pedido = usePedidosStore.getState().pedidos.find((item) => item.id === pedidoId);
  if (!pedido) return fallo('Pedido no encontrado.');
  const error = validarTransicion(transicionesPedido, pedido.estado, 'cancelada', 'el pedido');
  if (error) return fallo(error);
  const actualizado = cambiarEstado(pedido, 'cancelada', actorId, motivo || 'Pedido cancelado');
  actualizarPedido(pedidoId, () => actualizado);
  registrarBitacora({ actorId, accion: 'Cancelación de pedido', modulo: 'pedidos', motivo, referenciaId: pedidoId, antes: pedido.estado, despues: 'cancelada' });
  return exito(actualizado);
}

export interface ResultadoDevolucion { pedido: Pedido; reversiones: MovimientoVolumen[]; ajustes: Ajuste[]; }

export function registrarDevolucion(pedidoId: string, actorId: string, motivo: string): Resultado<ResultadoDevolucion> {
  if (motivo.trim().length < 10) return fallo('El motivo de la devolución debe tener al menos 10 caracteres.');
  const { pedidos, movimientos, establecer } = usePedidosStore.getState();
  const pedido = pedidos.find((item) => item.id === pedidoId);
  if (!pedido) return fallo('Pedido no encontrado.');
  const error = validarTransicion(transicionesPedido, pedido.estado, 'devuelta', 'el pedido');
  if (error) return fallo(error);
  const periodo = periodoAbiertoActual();
  if (!periodo) return fallo('No hay un ciclo abierto donde registrar la reversión.');
  const fecha = fechaHoraActualIso();
  const origenes = movimientos.filter((movimiento) => movimiento.pedidoId === pedidoId && movimiento.tipo === 'origen');
  const reversiones: MovimientoVolumen[] = [];
  origenes.forEach((origen) => {
    reversiones.push({
      id: siguienteId('DEMO-MV-', [...movimientos, ...reversiones].map((item) => item.id), 4),
      tipo: 'reversion', pedidoId, movimientoOrigenId: origen.id, personaId: origen.personaId, periodoId: periodo.id,
      vp: -origen.vp, vc: -origen.vc, fecha, motivo: `Reversión por devolución del pedido ${pedidoId}`,
    });
  });
  const devuelto = cambiarEstado(pedido, 'devuelta', actorId, motivo);
  establecer({
    pedidos: pedidos.map((item) => (item.id === pedidoId ? devuelto : item)),
    movimientos: [...movimientos, ...reversiones],
  });

  const compensacion = useCompensacionStore.getState();
  const corridaAprobada = compensacion.corridas.find((corrida) => corrida.periodoId === pedido.periodoId && corrida.estado === 'aprobada');
  let ajustes: Ajuste[] = [];
  if (corridaAprobada) {
    const existentes = compensacion.ajustes.map((ajuste) => ajuste.id);
    ajustes = calcularAjustesPorDevolucion(obtenerFuente(), corridaAprobada, {
      pedidoId, periodoAplicacionId: periodo.id, propuestoPor: actorId, autorizadoPor: null, fecha,
      generarId: (indice) => `DEMO-AJ-${String(existentes.length + indice).padStart(2, '0')}`,
    });
    compensacion.establecer({
      ajustes: [...compensacion.ajustes, ...ajustes],
      corridas: compensacion.corridas.map((corrida) => (corrida.id !== corridaAprobada.id ? corrida : {
        ...corrida,
        resultados: corrida.resultados.map((bono) => ({
          ...bono,
          ajustes: [...bono.ajustes, ...ajustes.filter((ajuste) => ajuste.personaId === bono.personaId && ajuste.motor === bono.motor).map((ajuste) => ajuste.id)],
        })),
      })),
    });
  }
  registrarBitacora({
    actorId, accion: 'Registro de devolución', modulo: 'compliance', motivo, referenciaId: pedidoId,
    antes: { estado: pedido.estado }, despues: { estado: 'devuelta', reversiones: reversiones.map((item) => item.id), ajustes: ajustes.map((item) => item.id) },
  });
  notificar({ personaId: null, tipo: 'estado', titulo: 'Devolución registrada', mensaje: `El pedido ${pedidoId} fue devuelto. Se crearon ${reversiones.length} reversiones de volumen y ${ajustes.length} ajustes propuestos.` });
  return exito({ pedido: devuelto, reversiones, ajustes });
}
