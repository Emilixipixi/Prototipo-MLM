import { useEffect, useRef } from 'react';

const SELECTOR_ENFOCABLES = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function useCapaModal<T extends HTMLElement>(abierto: boolean, alCerrar: () => void) {
  const referencia = useRef<T>(null);
  const alCerrarRef = useRef(alCerrar);

  useEffect(() => {
    alCerrarRef.current = alCerrar;
  }, [alCerrar]);

  useEffect(() => {
    if (!abierto) return undefined;
    const enfocadoAntes = document.activeElement as HTMLElement | null;
    const desbordeAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const contenedor = referencia.current;
    const primero = contenedor?.querySelector<HTMLElement>(SELECTOR_ENFOCABLES);
    (primero ?? contenedor)?.focus();

    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        alCerrarRef.current();
        return;
      }
      if (evento.key !== 'Tab' || !contenedor) return;
      const enfocables = Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES));
      if (enfocables.length === 0) return;
      const inicial = enfocables[0];
      const final = enfocables[enfocables.length - 1];
      if (evento.shiftKey && document.activeElement === inicial) {
        evento.preventDefault();
        final.focus();
      } else if (!evento.shiftKey && document.activeElement === final) {
        evento.preventDefault();
        inicial.focus();
      }
    };

    document.addEventListener('keydown', manejarTecla);
    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = desbordeAnterior;
      enfocadoAntes?.focus();
    };
  }, [abierto]);

  return referencia;
}
