import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

interface PropsBotonIcono extends ButtonHTMLAttributes<HTMLButtonElement> {
  icono: LucideIcon;
  etiqueta: string;
  oscuro?: boolean;
  indicador?: ReactNode;
}

export function BotonIcono({ icono: Icono, etiqueta, oscuro = false, indicador, className, type = 'button', ...resto }: PropsBotonIcono) {
  return (
    <button
      type={type}
      aria-label={etiqueta}
      title={etiqueta}
      className={unirClases(
        'relative grid size-11 md:size-10 shrink-0 place-items-center rounded-xl border transition-colors',
        oscuro
          ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
          : 'border-borde bg-superficie text-texto-2 hover:text-primario hover:border-texto-3',
        className,
      )}
      {...resto}
    >
      <Icono className="size-[18px]" aria-hidden />
      {indicador}
    </button>
  );
}
