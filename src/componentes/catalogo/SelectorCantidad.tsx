import { Minus, Plus } from 'lucide-react';

interface PropsSelectorCantidad {
  valor: number;
  alCambiar: (valor: number) => void;
  etiqueta: string;
}

export function SelectorCantidad({ valor, alCambiar, etiqueta }: PropsSelectorCantidad) {
  return (
    <div className="inline-flex items-center rounded-xl border border-borde bg-superficie" role="group" aria-label={etiqueta}>
      <button type="button" onClick={() => alCambiar(valor - 1)} disabled={valor <= 1} aria-label="Disminuir cantidad" className="grid size-11 place-items-center rounded-l-xl text-texto-2 hover:bg-fondo disabled:opacity-40 md:size-10">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="cifra min-w-10 text-center text-sm font-semibold text-texto" aria-live="polite">{valor}</span>
      <button type="button" onClick={() => alCambiar(valor + 1)} disabled={valor >= 99} aria-label="Aumentar cantidad" className="grid size-11 place-items-center rounded-r-xl text-texto-2 hover:bg-fondo disabled:opacity-40 md:size-10">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
