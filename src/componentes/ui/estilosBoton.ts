import { unirClases } from '../../utilidades/clases';

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'acento';
export type TamanoBoton = 'sm' | 'md';

const estilosVariante: Record<VarianteBoton, string> = {
  primario: 'bg-primario text-white hover:bg-primario-hover shadow-sm',
  acento: 'bg-acento text-white hover:brightness-110 shadow-sm',
  secundario: 'bg-superficie text-texto border border-borde hover:bg-fondo hover:border-texto-3',
  fantasma: 'bg-transparent text-texto-2 hover:bg-primario-suave hover:text-primario',
  peligro: 'bg-error text-white hover:brightness-110 shadow-sm',
};

const estilosTamano: Record<TamanoBoton, string> = {
  sm: 'min-h-11 md:min-h-9 px-3 text-[13px] gap-1.5 rounded-[10px]',
  md: 'min-h-11 px-4 text-sm gap-2 rounded-xl',
};

export function clasesBoton(variante: VarianteBoton, tamano: TamanoBoton, anchoCompleto = false, extra?: string): string {
  return unirClases(
    'inline-flex items-center justify-center font-semibold transition-colors duration-150 select-none',
    'disabled:opacity-50 disabled:pointer-events-auto',
    estilosVariante[variante], estilosTamano[tamano], anchoCompleto && 'w-full', extra,
  );
}
