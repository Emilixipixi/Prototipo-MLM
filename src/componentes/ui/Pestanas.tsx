import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

export interface Pestana { id: string; texto: string; icono?: LucideIcon; contador?: number; }

interface PropsPestanas {
  pestanas: Pestana[];
  activa: string;
  alCambiar: (id: string) => void;
  etiqueta: string;
}

export function Pestanas({ pestanas, activa, alCambiar, etiqueta }: PropsPestanas) {
  return (
    <div className="-mx-1 overflow-x-auto px-1" role="tablist" aria-label={etiqueta}>
      <div className="flex min-w-max gap-1 border-b border-borde">
        {pestanas.map(({ id, texto, icono: Icono, contador }) => {
          const seleccionada = id === activa;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              onClick={() => alCambiar(id)}
              className={unirClases(
                '-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-[13.5px] font-semibold transition-colors',
                seleccionada ? 'border-acento text-primario' : 'border-transparent text-texto-2 hover:text-texto',
              )}
            >
              {Icono && <Icono className="size-4" aria-hidden />}
              {texto}
              {contador !== undefined && (
                <span className={unirClases('rounded-full px-1.5 text-[11px]', seleccionada ? 'bg-acento-suave text-acento' : 'bg-slate-100 text-texto-2')}>{contador}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
