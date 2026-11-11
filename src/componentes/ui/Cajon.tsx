import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { unirClases } from '../../utilidades/clases';
import { useCapaModal } from './useCapaModal';

interface PropsCajon {
  abierto: boolean;
  alCerrar: () => void;
  etiqueta: string;
  lado?: 'izquierda' | 'derecha';
  ancho?: string;
  className?: string;
  children: ReactNode;
}

export function Cajon({ abierto, alCerrar, etiqueta, lado = 'izquierda', ancho = 'w-[86vw] max-w-[300px]', className, children }: PropsCajon) {
  const referencia = useCapaModal<HTMLDivElement>(abierto, alCerrar);
  if (!abierto) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animar-aparecer absolute inset-0 bg-slate-900/50" onClick={alCerrar} aria-hidden />
      <div
        ref={referencia}
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        tabIndex={-1}
        className={unirClases(
          'absolute top-0 flex h-full flex-col overflow-y-auto shadow-flotante outline-none',
          lado === 'izquierda' ? 'left-0 animar-entrada-lateral' : 'right-0 animar-entrada-lateral-derecha',
          ancho, className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
