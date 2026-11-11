import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

export interface HitoLineaTiempo {
  id: string;
  titulo: string;
  detalle?: string;
  fecha?: string;
  icono: LucideIcon;
  tono: 'exito' | 'advertencia' | 'error' | 'info' | 'neutra' | 'pendiente';
}

const tonos: Record<HitoLineaTiempo['tono'], string> = {
  exito: 'bg-green-100 text-exito border-green-200',
  advertencia: 'bg-amber-100 text-advertencia border-amber-200',
  error: 'bg-red-100 text-error border-red-200',
  info: 'bg-blue-100 text-info border-blue-200',
  neutra: 'bg-slate-100 text-texto-2 border-slate-200',
  pendiente: 'bg-superficie text-texto-3 border-dashed border-borde',
};

export function LineaTiempo({ hitos }: { hitos: HitoLineaTiempo[] }) {
  return (
    <ol className="relative flex flex-col">
      {hitos.map((hito, indice) => {
        const Icono = hito.icono;
        const ultimo = indice === hitos.length - 1;
        return (
          <li key={hito.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!ultimo && <span className="absolute left-[17px] top-9 h-[calc(100%-36px)] w-px bg-borde" aria-hidden />}
            <span className={unirClases('relative z-10 grid size-9 shrink-0 place-items-center rounded-full border', tonos[hito.tono])}>
              <Icono className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 pt-1">
              <p className={unirClases('text-[13.5px] font-bold', hito.tono === 'pendiente' ? 'text-texto-3' : 'text-texto')}>{hito.titulo}</p>
              {hito.detalle && <p className="text-[12.5px] text-texto-2">{hito.detalle}</p>}
              {hito.fecha && <p className="cifra mt-0.5 text-[11px] text-texto-3">{hito.fecha}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
