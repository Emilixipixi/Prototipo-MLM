import { useEffect } from 'react';

export function useTemaErick(): void {
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tema = 'erick';
    return () => {
      delete raiz.dataset.tema;
    };
  }, []);
}
