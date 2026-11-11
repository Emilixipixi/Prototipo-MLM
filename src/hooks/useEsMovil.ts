import { useSyncExternalStore } from 'react';

const CONSULTA = '(max-width: 767px)';

function suscribir(callback: () => void) {
  const lista = window.matchMedia(CONSULTA);
  lista.addEventListener('change', callback);
  return () => lista.removeEventListener('change', callback);
}

export function useEsMovil(): boolean {
  return useSyncExternalStore(suscribir, () => window.matchMedia(CONSULTA).matches, () => false);
}
