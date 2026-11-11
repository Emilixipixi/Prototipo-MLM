import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

type TonoKpi = 'primario' | 'acento' | 'exito' | 'error' | 'oro' | 'info';
type Tendencia = 'sube' | 'baja' | 'neutra';

interface PropsTarjetaKpi {
  etiqueta: string;
  valor: ReactNode;
  icono: LucideIcon;
  tono?: TonoKpi;
  tendencia?: Tendencia;
  textoTendencia?: string;
  ayuda?: ReactNode;
  grafico?: ReactNode;
}

const tonos: Record<TonoKpi, string> = {
  primario: 'bg-primario-suave text-primario',
  acento: 'bg-acento-suave text-acento',
  exito: 'bg-green-50 text-exito',
  error: 'bg-red-50 text-error',
  oro: 'bg-oro-suave text-oro',
  info: 'bg-blue-50 text-info',
};

const tendencias: Record<Tendencia, { icono: LucideIcon; clase: string }> = {
  sube: { icono: ArrowUpRight, clase: 'text-exito' },
  baja: { icono: ArrowDownRight, clase: 'text-error' },
  neutra: { icono: Minus, clase: 'text-texto-2' },
};

export function TarjetaKpi({ etiqueta, valor, icono: Icono, tono = 'primario', tendencia, textoTendencia, ayuda, grafico }: PropsTarjetaKpi) {
  const IconoTendencia = tendencia ? tendencias[tendencia].icono : null;
  return (
    <div className="min-w-0 rounded-tarjeta border border-borde bg-superficie p-4 shadow-tarjeta sm:p-5">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-texto-2">
        <span className={unirClases('grid size-8 shrink-0 place-items-center rounded-[10px]', tonos[tono])}>
          <Icono className="size-[18px]" aria-hidden />
        </span>
        <span className="truncate">{etiqueta}</span>
        {ayuda}
      </div>
      <div className="cifra mt-2.5 text-[26px] font-semibold tracking-tight text-texto sm:text-[28px]">{valor}</div>
      {tendencia && IconoTendencia && (
        <span className={unirClases('mt-0.5 inline-flex items-center gap-1 text-xs font-semibold', tendencias[tendencia].clase)}>
          <IconoTendencia className="size-3.5" aria-hidden />
          {textoTendencia}
        </span>
      )}
      {grafico && <div className="mt-2 h-9">{grafico}</div>}
    </div>
  );
}
