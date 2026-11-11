import { formatearMonto, formatearNumero } from '../../utilidades/formatos';
import { TerminoInfo } from '../ui/TerminoInfo';

interface PropsResumenTotales {
  precio: number;
  vp: number;
  vc: number;
  mostrarVolumen: boolean;
  articulos: number;
}

export function ResumenTotales({ precio, vp, vc, mostrarVolumen, articulos }: PropsResumenTotales) {
  return (
    <dl className="flex flex-col gap-2.5 text-[13.5px]">
      <div className="flex items-center justify-between gap-3"><dt className="text-texto-2">Artículos</dt><dd className="cifra font-medium text-texto">{articulos}</dd></div>
      <div className="flex items-center justify-between gap-3"><dt className="text-texto-2">Subtotal</dt><dd className="cifra font-medium text-texto">{formatearMonto(precio)}</dd></div>
      <div className="flex items-center justify-between gap-3"><dt className="text-texto-2">Envío e impuestos</dt><dd className="text-xs text-texto-3">No aplica en la demostración</dd></div>
      {mostrarVolumen && (
        <>
          <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-1 text-texto-2">VP del pedido <TerminoInfo termino="vp" /></dt><dd className="cifra font-semibold text-acento">{formatearNumero(vp)}</dd></div>
          <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-1 text-texto-2">VC del pedido <TerminoInfo termino="vc" /></dt><dd className="cifra font-semibold text-primario">{formatearNumero(vc)}</dd></div>
        </>
      )}
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-borde pt-3"><dt className="font-bold text-texto">Total</dt><dd className="cifra text-lg font-semibold text-texto">{formatearMonto(precio)}</dd></div>
    </dl>
  );
}
