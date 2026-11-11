import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowRight, Ban, CircleCheck, CreditCard, FileText, Info, Lock, PackageSearch, Receipt, Repeat, ShoppingBag, Undo2,
} from 'lucide-react';
import { ImagenProducto } from '../../componentes/catalogo/ImagenProducto';
import { Boton } from '../../componentes/ui/Boton';
import { Confirmacion } from '../../componentes/ui/Confirmacion';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { LineaTiempo, type HitoLineaTiempo } from '../../componentes/ui/LineaTiempo';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TerminoInfo } from '../../componentes/ui/TerminoInfo';
import { useToast } from '../../componentes/ui/useToast';
import { estadosPedido, iconoEstadoFuturo } from '../../datos/presentacionEstados';
import { cancelarPedido, confirmarPedido } from '../../servicios/pedidos';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { EstadoPedido } from '../../tipos/pedidos';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';
import { esCorporativo, puedeVerVolumen } from '../../utilidades/visibilidad';

const tonoHito: Record<EstadoPedido, HitoLineaTiempo['tono']> = {
  borrador: 'neutra', pendiente: 'advertencia', confirmada: 'exito', cancelada: 'neutra', devuelta: 'error',
};

export default function DetallePedido() {
  const { id } = useParams();
  const pedido = usePedidosStore((estado) => estado.pedidos.find((item) => item.id === id));
  const todosMovimientos = usePedidosStore((estado) => estado.movimientos);
  const productos = useCatalogoStore((estado) => estado.productos);
  const personas = usePersonasStore((estado) => estado.personas);
  const persona = usePersonaSesion();
  const toast = useToast();
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pedido) {
    return <EstadoVacio icono={PackageSearch} titulo="Pedido no encontrado" texto="Revisa el código del pedido." accion={<EnlaceBoton to="/catalogo" variante="secundario">Ir al catálogo</EnlaceBoton>} />;
  }

  const movimientos = todosMovimientos.filter((movimiento) => movimiento.pedidoId === pedido.id);
  const autorizado = Boolean(persona) && (
    esCorporativo(persona) || pedido.compradorId === persona?.id || pedido.referenteId === persona?.id
    || movimientos.some((movimiento) => movimiento.personaId === persona?.id)
  );
  if (!autorizado) {
    return (
      <EstadoVacio
        icono={Lock}
        titulo="No puedes ver este pedido"
        texto="Solo el comprador, su referente y el personal corporativo pueden consultar el detalle."
        accion={persona ? undefined : <EnlaceBoton to="/ingresar">Ingresar</EnlaceBoton>}
      />
    );
  }

  const comprador = personas.find((item) => item.id === pedido.compradorId);
  const referente = personas.find((item) => item.id === pedido.referenteId);
  const estado = estadosPedido[pedido.estado];
  const mostrarVolumen = puedeVerVolumen(persona);
  const puedeActuar = pedido.compradorId === persona?.id || esCorporativo(persona);
  const nombre = (personaId: string) => {
    const item = personas.find((candidata) => candidata.id === personaId);
    return item ? `${item.nombres} ${item.apellidos}` : personaId;
  };

  const hitos: HitoLineaTiempo[] = pedido.eventos.map((evento, indice) => ({
    id: `${evento.estado}-${indice}`,
    titulo: estadosPedido[evento.estado].etiqueta,
    detalle: `${evento.detalle} · ${nombre(evento.actorId)}`,
    fecha: formatearFechaHora(evento.fecha),
    icono: estadosPedido[evento.estado].icono,
    tono: tonoHito[evento.estado],
  }));
  if (pedido.estado === 'borrador' || pedido.estado === 'pendiente') {
    hitos.push({ id: 'futuro', titulo: 'Confirmada', detalle: 'Pendiente de la confirmación de cobro (simulada).', icono: iconoEstadoFuturo, tono: 'pendiente' });
  }

  const confirmar = () => {
    if (!persona) return;
    setError(null);
    const resultado = confirmarPedido(pedido.id, persona.id);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Cobro confirmado (simulado)', `${pedido.id} generó ${resultado.valor.movimiento.vp} VP y ${resultado.valor.movimiento.vc} VC.`);
  };

  const cancelar = (motivo: string) => {
    if (!persona) return;
    setCancelando(false);
    const resultado = cancelarPedido(pedido.id, persona.id, motivo);
    if (!resultado.ok) setError(resultado.error);
    else toast.info('Pedido cancelado', 'El pedido no generó volumen.');
  };

  const historial = persona?.perfil === 'afiliado' ? '/afiliado/compras' : esCorporativo(persona) ? '/corporativo/reportes' : '/cuenta';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-texto-3">Pedido</p>
          <h2 className="cifra text-2xl font-semibold tracking-tight text-texto sm:text-[28px]">{pedido.id}</h2>
          <p className="mt-1 text-[13px] text-texto-2">Creado el {formatearFechaHora(pedido.fecha)}{pedido.comprobante ? <> · Comprobante <span className="cifra">{pedido.comprobante}</span></> : null}</p>
        </div>
        <Insignia tono={estado.tono} icono={estado.icono} className="px-3 py-1 text-[13px]">{estado.etiqueta}</Insignia>
      </div>

      {error && <EstadoError queOcurrio={error} />}

      {pedido.estado === 'pendiente' && puedeActuar && (
        <Tarjeta variante="simulacion" titulo="Confirmación de cobro simulada" subtitulo="No se realiza ninguna transacción real. Al confirmar, el pedido genera sus movimientos de VP y VC." icono={CreditCard}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Boton icono={CircleCheck} onClick={confirmar}>Simular confirmación de cobro</Boton>
            <Boton variante="secundario" icono={Ban} onClick={() => setCancelando(true)}>Cancelar pedido</Boton>
          </div>
        </Tarjeta>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Tarjeta titulo="Artículos" icono={ShoppingBag}>
            <ul className="divide-y divide-borde">
              {pedido.items.map((item) => {
                const producto = productos.find((candidato) => candidato.id === item.productoId);
                return (
                  <li key={item.productoId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {producto && <ImagenProducto producto={producto} tamano="sm" className="size-14 shrink-0 rounded-xl" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-texto">{producto?.nombre ?? item.productoId}</p>
                      <p className="cifra text-xs text-texto-2">{item.cantidad} x {formatearMonto(item.precioUnitario)}{mostrarVolumen ? ` · ${formatearNumero(item.vpUnitario)} VP · ${formatearNumero(item.vcUnitario)} VC` : ''}</p>
                    </div>
                    <span className="cifra font-semibold text-texto">{formatearMonto(item.precioUnitario * item.cantidad)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-fondo p-3 text-center">
              <div><dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">Precio</dt><dd className="cifra mt-0.5 font-semibold text-texto">{formatearMonto(pedido.totalPrecio)}</dd></div>
              <div><dt className="flex items-center justify-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">VP {mostrarVolumen && <TerminoInfo termino="vp" />}</dt><dd className="cifra mt-0.5 font-semibold text-acento">{mostrarVolumen ? formatearNumero(pedido.totalVp) : 'Reservado'}</dd></div>
              <div><dt className="flex items-center justify-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">VC {mostrarVolumen && <TerminoInfo termino="vc" />}</dt><dd className="cifra mt-0.5 font-semibold text-primario">{mostrarVolumen ? formatearNumero(pedido.totalVc) : 'Reservado'}</dd></div>
            </dl>
          </Tarjeta>

          <Tarjeta titulo="Movimientos de volumen" subtitulo="Origen y reversiones generados por este pedido (MLM-013)." icono={Repeat}>
            {movimientos.length === 0 ? (
              <p className="flex items-start gap-2 text-[13px] text-texto-2"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />{pedido.estado === 'cancelada' ? 'El pedido se canceló antes de confirmarse: no generó volumen.' : 'El volumen se registra cuando se confirma el cobro.'}</p>
            ) : mostrarVolumen ? (
              <ul className="flex flex-col gap-2">
                {movimientos.map((movimiento) => (
                  <li key={movimiento.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-borde p-3">
                    <Insignia tono={movimiento.tipo === 'origen' ? 'acento' : 'error'} icono={movimiento.tipo === 'origen' ? ArrowRight : Undo2}>{movimiento.tipo === 'origen' ? 'Origen' : 'Reversión'}</Insignia>
                    <span className="cifra text-xs text-texto-2">{movimiento.id} · {movimiento.periodoId}</span>
                    <span className="text-[13px] text-texto">Asignado a {nombre(movimiento.personaId)}</span>
                    <span className="cifra ml-auto text-[13px] font-semibold text-texto">{formatearNumero(movimiento.vp)} VP · {formatearNumero(movimiento.vc)} VC</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-start gap-2 text-[13px] text-texto-2"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />El volumen de esta compra se asignó a tu referente. El detalle de puntos es visible para afiliados.</p>
            )}
          </Tarjeta>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Tarjeta titulo="Estados del pedido" icono={Receipt}>
            <LineaTiempo hitos={hitos} />
          </Tarjeta>
          <Tarjeta titulo="Asociación comercial" icono={FileText}>
            <dl className="flex flex-col gap-3 text-[13.5px]">
              <div className="flex justify-between gap-3"><dt className="text-texto-2">Comprador</dt><dd className="text-right font-semibold text-texto">{comprador ? `${comprador.nombres} ${comprador.apellidos}` : pedido.compradorId}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-texto-2">Referente</dt><dd className="text-right font-semibold text-texto">{referente ? `${referente.nombres} ${referente.apellidos}` : 'Compra propia'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-texto-2">Período</dt><dd className="cifra text-right font-semibold text-texto">{pedido.periodoId}</dd></div>
            </dl>
          </Tarjeta>
          <EnlaceBoton to={historial} variante="secundario" iconoDerecha={ArrowRight}>Ver historial de compras</EnlaceBoton>
        </div>
      </div>

      <Confirmacion
        abierto={cancelando}
        alCerrar={() => setCancelando(false)}
        alConfirmar={cancelar}
        titulo={`Cancelar ${pedido.id}`}
        textoConfirmar="Cancelar pedido"
        peligro
        requiereMotivo
        resumen={<p>El pedido pasará a estado cancelado y no generará volumen. La acción queda registrada en la bitácora.</p>}
      />
    </div>
  );
}
