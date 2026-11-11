import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { unirClases } from '../../utilidades/clases';
import { useCapaModal } from './useCapaModal';

interface PropsModal {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion?: ReactNode;
  children?: ReactNode;
  pie?: ReactNode;
  ancho?: 'sm' | 'md' | 'lg';
}

const anchos = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

export function Modal({ abierto, alCerrar, titulo, descripcion, children, pie, ancho = 'md' }: PropsModal) {
  const referencia = useCapaModal<HTMLDivElement>(abierto, alCerrar);
  if (!abierto) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="animar-aparecer absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={alCerrar} aria-hidden />
      <div
        ref={referencia}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={unirClases(
          'animar-entrada-abajo relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-superficie shadow-flotante outline-none sm:rounded-tarjeta',
          anchos[ancho],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-borde px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-texto">{titulo}</h2>
            {descripcion && <div className="mt-0.5 text-[13px] text-texto-2">{descripcion}</div>}
          </div>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="grid size-11 shrink-0 place-items-center rounded-xl text-texto-2 hover:bg-fondo md:size-9">
            <X className="size-[18px]" aria-hidden />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {pie && <footer className="flex flex-col-reverse gap-2 border-t border-borde px-5 py-4 sm:flex-row sm:justify-end">{pie}</footer>}
      </div>
    </div>,
    document.body,
  );
}
