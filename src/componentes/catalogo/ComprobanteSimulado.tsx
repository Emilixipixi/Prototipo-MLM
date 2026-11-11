import { Printer } from 'lucide-react';
import { useCatalogoStore } from '../../store/useCatalogoStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { Pedido } from '../../tipos/pedidos';
import { formatearFechaHora } from '../../utilidades/fechas';
import { formatearMonto } from '../../utilidades/formatos';
import { Boton } from '../ui/Boton';
import { Modal } from '../ui/Modal';

interface PropsComprobante { pedido: Pedido | null; alCerrar: () => void; }

export function ComprobanteSimulado({ pedido, alCerrar }: PropsComprobante) {
  const productos = useCatalogoStore((estado) => estado.productos);
  const personas = usePersonasStore((estado) => estado.personas);
  if (!pedido) return null;
  const comprador = personas.find((persona) => persona.id === pedido.compradorId);
  return (
    <Modal
      abierto
      alCerrar={alCerrar}
      titulo={`Comprobante ${pedido.comprobante}`}
      descripcion="Comprobante simulado de demostración. No tiene validez tributaria."
      pie={<Boton variante="secundario" icono={Printer} onClick={() => window.print()}>Imprimir</Boton>}
    >
      <div className="rounded-xl border border-dashed border-borde p-4 text-[13px]">
        <div className="flex justify-between gap-3"><span className="text-texto-2">Pedido</span><span className="cifra font-semibold">{pedido.id}</span></div>
        <div className="mt-1 flex justify-between gap-3"><span className="text-texto-2">Fecha</span><span className="cifra">{formatearFechaHora(pedido.fecha)}</span></div>
        <div className="mt-1 flex justify-between gap-3"><span className="text-texto-2">Cliente</span><span>{comprador ? `${comprador.nombres} ${comprador.apellidos}` : pedido.compradorId}</span></div>
        <ul className="my-3 divide-y divide-borde border-y border-borde">
          {pedido.items.map((item) => (
            <li key={item.productoId} className="flex justify-between gap-3 py-2">
              <span>{item.cantidad} x {productos.find((producto) => producto.id === item.productoId)?.nombre ?? item.productoId}</span>
              <span className="cifra">{formatearMonto(item.cantidad * item.precioUnitario)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3 text-[15px] font-bold"><span>Total</span><span className="cifra">{formatearMonto(pedido.totalPrecio)}</span></div>
        <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-demo-texto">DEMOSTRACIÓN · Sin cobro real</p>
      </div>
    </Modal>
  );
}
