import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

export type TonoInsignia = 'exito' | 'advertencia' | 'error' | 'info' | 'retenida' | 'neutra' | 'primaria' | 'oro' | 'acento';

interface PropsInsignia {
  tono?: TonoInsignia;
  icono?: LucideIcon;
  children: ReactNode;
  className?: string;
}

const tonos: Record<TonoInsignia, string> = {
  exito: 'bg-green-100 text-exito',
  advertencia: 'bg-amber-100 text-advertencia',
  error: 'bg-red-100 text-error',
  info: 'bg-blue-100 text-info',
  retenida: 'bg-gray-100 text-retenida',
  neutra: 'bg-slate-100 text-texto-2',
  primaria: 'bg-primario-suave text-primario',
  oro: 'bg-oro-suave text-oro',
  acento: 'bg-acento-suave text-acento',
};

export function Insignia({ tono = 'neutra', icono: Icono, children, className }: PropsInsignia) {
  return (
    <span className={unirClases('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold', tonos[tono], className)}>
      {Icono && <Icono className="size-3" aria-hidden />}
      {children}
    </span>
  );
}
