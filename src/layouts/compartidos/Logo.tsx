import { Network } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

interface PropsLogo {
  subtitulo?: string;
  soloIconoEnMovil?: boolean;
  oscuro?: boolean;
  className?: string;
}

export function Logo({ subtitulo, oscuro = false, soloIconoEnMovil = false, className }: PropsLogo) {
  return (
    <span className={unirClases('flex items-center gap-2.5', className)}>
      <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-acento to-brazo-a text-white shadow-sm">
        <Network className="size-[18px]" aria-hidden />
      </span>
      <span className={unirClases('min-w-0 leading-tight', soloIconoEnMovil && 'hidden min-[420px]:block')}>
        <span className={unirClases('block text-[17px] font-extrabold tracking-tight', oscuro ? 'text-white' : 'text-primario')}>MLM 2027</span>
        {subtitulo && <span className={unirClases('block truncate text-[11px] font-medium', oscuro ? 'text-[#8FA3C2]' : 'text-texto-2')}>{subtitulo}</span>}
      </span>
    </span>
  );
}
