import { unirClases } from '../../utilidades/clases';
import { obtenerIniciales } from '../../utilidades/texto';

interface PropsAvatar {
  nombres: string;
  apellidos: string;
  tamano?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tamanos = { sm: 'size-8 text-[11px]', md: 'size-9 text-[13px]', lg: 'size-12 text-base' };
const fondos = ['bg-acento', 'bg-primario', 'bg-brazo-a', 'bg-brazo-b', 'bg-brazo-c', 'bg-emerald-700'];

export function Avatar({ nombres, apellidos, tamano = 'md', className }: PropsAvatar) {
  const iniciales = obtenerIniciales(nombres, apellidos);
  const indice = (iniciales.charCodeAt(0) + (iniciales.charCodeAt(1) || 0)) % fondos.length;
  return (
    <span className={unirClases('inline-grid shrink-0 place-items-center rounded-full font-bold text-white', tamanos[tamano], fondos[indice], className)} aria-hidden>
      {iniciales}
    </span>
  );
}
