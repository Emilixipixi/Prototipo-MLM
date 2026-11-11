import { useId, useState, type ReactNode } from 'react';
import { unirClases } from '../../utilidades/clases';

interface PropsTooltip {
  contenido: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ contenido, children, className }: PropsTooltip) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <span
      className={unirClases('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && (
        <span
          id={id}
          role="tooltip"
          className="animar-aparecer pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-texto px-3 py-2 text-left text-xs font-medium leading-snug text-white shadow-flotante"
        >
          {contenido}
        </span>
      )}
    </span>
  );
}
