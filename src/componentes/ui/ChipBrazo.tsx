import { unirClases } from '../../utilidades/clases';

export type LetraBrazo = 'A' | 'B' | 'C';

const colores: Record<LetraBrazo, string> = {
  A: 'bg-brazo-a',
  B: 'bg-brazo-b',
  C: 'bg-brazo-c',
};

export function ChipBrazo({ brazo, className }: { brazo: LetraBrazo; className?: string }) {
  return (
    <span
      className={unirClases('inline-grid size-[22px] shrink-0 place-items-center rounded-[7px] text-xs font-extrabold text-white', colores[brazo], className)}
      aria-label={`Brazo ${brazo}`}
    >
      {brazo}
    </span>
  );
}
