import { useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

export interface OpcionSelector { valor: string; texto: string; }

interface PropsSelector extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  opciones: OpcionSelector[];
  error?: string | null;
  ayuda?: string;
  ocultarEtiqueta?: boolean;
}

export function Selector({ etiqueta, opciones, error, ayuda, ocultarEtiqueta = false, id, className, ...resto }: PropsSelector) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  return (
    <div className={unirClases('flex flex-col gap-1.5', className)}>
      <label htmlFor={idCampo} className={ocultarEtiqueta ? 'sr-only' : 'text-[13px] font-semibold text-texto'}>{etiqueta}</label>
      <div className="relative">
        <select
          id={idCampo}
          aria-invalid={Boolean(error)}
          className={unirClases(
            'min-h-11 w-full appearance-none rounded-xl border bg-superficie py-2.5 pl-3 pr-10 text-sm text-texto outline-none transition-colors focus:ring-2',
            error ? 'border-error focus:ring-red-100' : 'border-borde focus:border-acento focus:ring-acento-suave',
          )}
          {...resto}
        >
          {opciones.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-texto-3" aria-hidden />
      </div>
      {(error || ayuda) && <p className={unirClases('text-xs', error ? 'font-medium text-error' : 'text-texto-2')}>{error ?? ayuda}</p>}
    </div>
  );
}
