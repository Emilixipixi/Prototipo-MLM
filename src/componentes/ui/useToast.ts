import { create } from 'zustand';
import { generarId } from '../../utilidades/ids';

export type TipoToast = 'exito' | 'error' | 'advertencia' | 'info';

export interface Toast { id: string; tipo: TipoToast; titulo: string; mensaje?: string; }

interface EstadoToast {
  avisos: Toast[];
  mostrar: (tipo: TipoToast, titulo: string, mensaje?: string) => void;
  quitar: (id: string) => void;
}

const DURACION_MS = 4500;

export const useToastStore = create<EstadoToast>((set, get) => ({
  avisos: [],
  mostrar: (tipo, titulo, mensaje) => {
    const id = generarId('TST');
    set((estado) => ({ avisos: [...estado.avisos, { id, tipo, titulo, mensaje }].slice(-4) }));
    window.setTimeout(() => get().quitar(id), DURACION_MS);
  },
  quitar: (id) => set((estado) => ({ avisos: estado.avisos.filter((aviso) => aviso.id !== id) })),
}));

export function useToast() {
  const mostrar = useToastStore((estado) => estado.mostrar);
  return {
    exito: (titulo: string, mensaje?: string) => mostrar('exito', titulo, mensaje),
    error: (titulo: string, mensaje?: string) => mostrar('error', titulo, mensaje),
    advertencia: (titulo: string, mensaje?: string) => mostrar('advertencia', titulo, mensaje),
    info: (titulo: string, mensaje?: string) => mostrar('info', titulo, mensaje),
  };
}
