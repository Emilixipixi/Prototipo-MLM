import { GraduationCap, Network } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';

interface PropsLogo {
  subtitulo?: string;
  soloIconoEnMovil?: boolean;
  oscuro?: boolean;
  className?: string;
  marca?: 'mlm' | 'campus' | 'erick';
}

export function Logo({ subtitulo, oscuro = false, soloIconoEnMovil = false, className, marca = 'mlm' }: PropsLogo) {
  const esCampus = marca === 'campus' || marca === 'erick';
  const titulo = marca === 'erick' ? 'ERICK S.A.C.' : esCampus ? 'Campus ERICK' : 'MLM 2027';
  const IconoMarca = esCampus ? GraduationCap : Network;
  return (
    <span className={unirClases('flex items-center gap-2.5', className)}>
      <span className={unirClases('grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-gradient-to-br text-white shadow-sm', esCampus ? 'from-[#E2C46E] to-[#B8862B]' : 'from-acento to-brazo-a')}>
        <IconoMarca className="size-[18px]" aria-hidden />
      </span>
      <span className={unirClases('min-w-0 leading-tight', soloIconoEnMovil && 'hidden min-[420px]:block')}>
        <span className={unirClases('block text-[17px] font-extrabold tracking-tight', oscuro ? 'text-white' : 'text-primario')}>{titulo}</span>
        {subtitulo && <span className={unirClases('block truncate text-[11px] font-medium', oscuro ? 'text-[#8FA3C2]' : 'text-texto-2')}>{subtitulo}</span>}
      </span>
    </span>
  );
}
