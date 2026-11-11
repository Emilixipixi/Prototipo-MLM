import { useEffect, useRef } from 'react';

export function useClicFuera<T extends HTMLElement>(activo: boolean, alClicFuera: () => void) {
  const referencia = useRef<T>(null);
  const callback = useRef(alClicFuera);

  useEffect(() => {
    callback.current = alClicFuera;
  }, [alClicFuera]);

  useEffect(() => {
    if (!activo) return undefined;
    const manejar = (evento: MouseEvent | TouchEvent) => {
      if (referencia.current && !referencia.current.contains(evento.target as Node)) callback.current();
    };
    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') callback.current();
    };
    document.addEventListener('mousedown', manejar);
    document.addEventListener('touchstart', manejar);
    document.addEventListener('keydown', manejarTecla);
    return () => {
      document.removeEventListener('mousedown', manejar);
      document.removeEventListener('touchstart', manejar);
      document.removeEventListener('keydown', manejarTecla);
    };
  }, [activo]);

  return referencia;
}
