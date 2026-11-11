import { unirClases } from '../../utilidades/clases';

interface PropsChipsFiltro<T extends string> {
  opciones: Array<{ valor: T; texto: string }>;
  activo: T;
  alCambiar: (valor: T) => void;
  etiqueta: string;
}

export function ChipsFiltro<T extends string>({ opciones, activo, alCambiar, etiqueta }: PropsChipsFiltro<T>) {
  return (
    <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          aria-pressed={activo === opcion.valor}
          onClick={() => alCambiar(opcion.valor)}
          className={unirClases('inline-flex min-h-11 items-center rounded-full border px-3.5 text-[12.5px] font-semibold md:min-h-9', activo === opcion.valor ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie text-texto-2 hover:border-texto-3')}
        >
          {opcion.texto}
        </button>
      ))}
    </div>
  );
}
