import { TerminoInfo } from '../ui/TerminoInfo';
import { formatearMonto, formatearNumero } from '../../utilidades/formatos';
import { unirClases } from '../../utilidades/clases';

interface PropsValoresProducto {
  precio: number;
  vp: number;
  vc: number;
  moneda?: string;
  mostrarVolumen: boolean;
  compacto?: boolean;
  precioLista?: number;
  etiquetaDescuento?: string;
}

export function ValoresProducto({ precio, vp, vc, moneda = 'USD', mostrarVolumen, compacto = false, precioLista, etiquetaDescuento }: PropsValoresProducto) {
  const conDescuento = precioLista !== undefined && precioLista > precio;
  return (
    <div className={unirClases('flex flex-wrap items-end gap-x-4 gap-y-2', compacto ? '' : 'mt-1')}>
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-texto-3">Precio</p>
        <p className={unirClases('cifra font-semibold', conDescuento ? 'text-exito' : 'text-texto', compacto ? 'text-lg' : 'text-2xl')}>{formatearMonto(precio, moneda)}</p>
        {conDescuento && (
          <p className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
            <span className="cifra text-texto-3 line-through">{formatearMonto(precioLista, moneda)}</span>
            {etiquetaDescuento && <span className="rounded-md bg-green-50 px-1.5 py-0.5 font-bold text-exito">{etiquetaDescuento}</span>}
          </p>
        )}
      </div>
      {mostrarVolumen && (
        <>
          <div>
            <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-texto-3">VP <TerminoInfo termino="vp" /></p>
            <p className={unirClases('cifra font-semibold text-acento', compacto ? 'text-base' : 'text-lg')}>{formatearNumero(vp)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-texto-3">VC <TerminoInfo termino="vc" /></p>
            <p className={unirClases('cifra font-semibold text-primario', compacto ? 'text-base' : 'text-lg')}>{formatearNumero(vc)}</p>
          </div>
        </>
      )}
    </div>
  );
}
