import { create } from 'zustand';
import { bitacoraInicial } from '../datos/bitacoraInicial';
import type { Bitacora } from '../tipos/bitacora';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { generarId } from '../utilidades/ids';

export interface DatosRegistroBitacora {
  actorId: string;
  accion: string;
  modulo: string;
  motivo?: string;
  antes?: unknown;
  despues?: unknown;
  referenciaId?: string | null;
}

interface EstadoBitacora {
  registros: Bitacora[];
  registrar: (datos: DatosRegistroBitacora) => Bitacora;
  reiniciar: () => void;
}

export const useBitacoraStore = create<EstadoBitacora>((set) => ({
  registros: structuredClone(bitacoraInicial),
  registrar: (datos) => {
    const registro: Bitacora = {
      id: generarId('BIT'),
      actorId: datos.actorId,
      accion: datos.accion,
      modulo: datos.modulo,
      fechaHora: fechaHoraActualIso(),
      motivo: datos.motivo ?? '',
      antes: datos.antes ?? null,
      despues: datos.despues ?? null,
      referenciaId: datos.referenciaId ?? null,
    };
    set((estado) => ({ registros: [registro, ...estado.registros] }));
    return registro;
  },
  reiniciar: () => set({ registros: structuredClone(bitacoraInicial) }),
}));
