import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

interface PropsEstadoVacio {
  icono: LucideIcon;
  titulo: string;
  texto?: ReactNode;
  accion?: ReactNode;
  className?: string;
}

export function EstadoVacio({ icono: Icono, titulo, texto, accion, className }: PropsEstadoVacio) {
  return (
    <div className={unirClases('flex flex-col items-center justify-center px-4 py-10 text-center', className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-primario-suave text-primario">
        <Icono className="size-7" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-bold text-texto">{titulo}</h3>
      {texto && <div className="mt-1 max-w-md text-[13.5px] text-texto-2">{texto}</div>}
      {accion && <div className="mt-5 flex flex-wrap justify-center gap-2">{accion}</div>}
    </div>
  );
}
