import { create } from 'zustand';
import type { PerfilAcceso, Persona } from '../tipos/persona';
import { useBitacoraStore } from './useBitacoraStore';
import { usePersonasStore } from './usePersonasStore';

interface EstadoSesion {
  personaId: string | null;
  iniciarSesion: (personaId: string) => Persona | null;
  cerrarSesion: () => void;
  cambiarRol: (personaId: string) => Persona | null;
  reiniciar: () => void;
}

export const useSesionStore = create<EstadoSesion>((set, get) => ({
  personaId: null,
  iniciarSesion: (personaId) => {
    const persona = usePersonasStore.getState().buscarPorId(personaId);
    if (!persona || persona.estado === 'bloqueado') return null;
    set({ personaId: persona.id });
    useBitacoraStore.getState().registrar({
      actorId: persona.id, accion: 'Inicio de sesión', modulo: 'sesion',
      motivo: `Ingreso con perfil ${persona.perfil}`, referenciaId: persona.id,
    });
    return persona;
  },
  cerrarSesion: () => {
    const actual = get().personaId;
    if (actual) {
      useBitacoraStore.getState().registrar({
        actorId: actual, accion: 'Cierre de sesión', modulo: 'sesion', referenciaId: actual,
      });
    }
    set({ personaId: null });
  },
  cambiarRol: (personaId) => {
    const anterior = get().personaId;
    const persona = usePersonasStore.getState().buscarPorId(personaId);
    if (!persona || persona.estado === 'bloqueado') return null;
    set({ personaId: persona.id });
    useBitacoraStore.getState().registrar({
      actorId: persona.id, accion: 'Cambio de rol de demostración', modulo: 'sesion',
      motivo: 'Cambio de sesión desde el selector de rol', antes: anterior, despues: persona.id,
      referenciaId: persona.id,
    });
    return persona;
  },
  reiniciar: () => set({ personaId: null }),
}));

export function usePersonaSesion(): Persona | null {
  const personaId = useSesionStore((estado) => estado.personaId);
  const personas = usePersonasStore((estado) => estado.personas);
  return personas.find((persona) => persona.id === personaId) ?? null;
}

export function rutaInicioPorPerfil(perfil: PerfilAcceso | null | undefined): string {
  if (perfil === 'superadministrador' || perfil === 'operador') return '/corporativo/resumen';
  if (perfil === 'afiliado') return '/afiliado/inicio';
  if (perfil === 'cliente_alumno') return '/cuenta';
  return '/';
}
