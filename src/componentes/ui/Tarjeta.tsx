import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

type VarianteTarjeta = 'normal' | 'oscura' | 'simulacion';

interface PropsTarjeta extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  icono?: LucideIcon;
  acciones?: ReactNode;
  variante?: VarianteTarjeta;
  sinRelleno?: boolean;
  children?: ReactNode;
}

const estilos: Record<VarianteTarjeta, string> = {
  normal: 'bg-superficie border border-borde shadow-tarjeta',
  oscura: 'fondo-calificacion text-white shadow-tarjeta relative overflow-hidden',
  simulacion: 'fondo-simulacion border-[1.5px] border-dashed border-blue-300 shadow-tarjeta',
};

export function Tarjeta({
  titulo, subtitulo, icono: Icono, acciones, variante = 'normal', sinRelleno = false, className, children, ...resto
}: PropsTarjeta) {
  const tieneCabecera = Boolean(titulo || subtitulo || acciones);
  return (
    <section className={unirClases('rounded-tarjeta min-w-0', estilos[variante], !sinRelleno && 'p-4 sm:p-5', className)} {...resto}>
      {tieneCabecera && (
        <header className={unirClases('flex flex-wrap items-start justify-between gap-3', children ? 'mb-4' : '', sinRelleno && 'p-4 sm:p-5 pb-0')}>
          <div className="min-w-0">
            {titulo && (
              <h3 className={unirClases('flex items-center gap-2 text-[15px] font-bold tracking-tight', variante === 'oscura' ? 'text-white' : 'text-texto')}>
                {Icono && <Icono className="size-[18px] shrink-0" aria-hidden />}
                {titulo}
              </h3>
            )}
            {subtitulo && (
              <p className={unirClases('mt-0.5 text-[12.5px]', variante === 'oscura' ? 'text-[#A9BCD9]' : 'text-texto-2')}>{subtitulo}</p>
            )}
          </div>
          {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
