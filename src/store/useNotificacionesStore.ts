import { create } from 'zustand';
import { notificacionesIniciales } from '../datos/notificaciones';
import type { Notificacion } from '../tipos/notificacion';
import type { Persona } from '../tipos/persona';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { generarId } from '../utilidades/ids';

interface EstadoNotificaciones {
  notificaciones: Notificacion[];
  agregar: (datos: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: (persona: Persona | null) => void;
  reiniciar: () => void;
}

export function esCorporativa(persona: Persona | null): boolean {
  return persona?.perfil === 'superadministrador' || persona?.perfil === 'operador';
}

export function filtrarPorPersona(notificaciones: Notificacion[], persona: Persona | null): Notificacion[] {
  if (!persona) return [];
  return notificaciones
    .filter((item) => (item.personaId === null ? esCorporativa(persona) : item.personaId === persona.id))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export const useNotificacionesStore = create<EstadoNotificaciones>((set) => ({
  notificaciones: notificacionesIniciales.map((item) => ({ ...item })),
  agregar: (datos) => set((estado) => ({
    notificaciones: [{ ...datos, id: generarId('NOT'), fecha: fechaHoraActualIso(), leida: false }, ...estado.notificaciones],
  })),
  marcarLeida: (id) => set((estado) => ({
    notificaciones: estado.notificaciones.map((item) => (item.id === id ? { ...item, leida: true } : item)),
  })),
  marcarTodasLeidas: (persona) => set((estado) => {
    const visibles = new Set(filtrarPorPersona(estado.notificaciones, persona).map((item) => item.id));
    return {
      notificaciones: estado.notificaciones.map((item) => (visibles.has(item.id) ? { ...item, leida: true } : item)),
    };
  }),
  reiniciar: () => set({ notificaciones: notificacionesIniciales.map((item) => ({ ...item })) }),
}));
