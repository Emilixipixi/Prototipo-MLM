import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

interface PropsCampo extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: string | null;
  icono?: LucideIcon;
  accionDerecha?: ReactNode;
}

export function Campo({ etiqueta, ayuda, error, icono: Icono, accionDerecha, id, className, ...resto }: PropsCampo) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idAyuda = `${idCampo}-ayuda`;
  return (
    <div className={unirClases('flex flex-col gap-1.5', className)}>
      <label htmlFor={idCampo} className="text-[13px] font-semibold text-texto">{etiqueta}</label>
      <div
        className={unirClases(
          'flex min-h-11 items-center gap-2 rounded-xl border bg-superficie px-3 transition-colors focus-within:ring-2',
          error ? 'border-error focus-within:ring-red-100' : 'border-borde focus-within:border-acento focus-within:ring-acento-suave',
        )}
      >
        {Icono && <Icono className="size-[18px] shrink-0 text-texto-3" aria-hidden />}
        <input
          id={idCampo}
          aria-invalid={Boolean(error)}
          aria-describedby={ayuda || error ? idAyuda : undefined}
          className="h-full min-w-0 flex-1 bg-transparent py-2.5 text-sm text-texto outline-none placeholder:text-texto-3 focus-visible:outline-none"
          {...resto}
        />
        {accionDerecha}
      </div>
      {(error || ayuda) && (
        <p id={idAyuda} className={unirClases('text-xs', error ? 'font-medium text-error' : 'text-texto-2')}>{error ?? ayuda}</p>
      )}
    </div>
  );
}
