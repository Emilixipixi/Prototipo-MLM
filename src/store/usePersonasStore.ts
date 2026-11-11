import { create } from 'zustand';
import { personasIniciales } from '../datos/personas';
import type { Persona } from '../tipos/persona';

interface EstadoPersonas {
  personas: Persona[];
  buscarPorId: (id: string) => Persona | undefined;
  buscarPorCorreo: (correo: string) => Persona | undefined;
  agregar: (persona: Persona) => void;
  actualizar: (id: string, cambios: Partial<Persona>) => void;
  reiniciar: () => void;
}

export const usePersonasStore = create<EstadoPersonas>((set, get) => ({
  personas: personasIniciales.map((persona) => ({ ...persona })),
  buscarPorId: (id) => get().personas.find((persona) => persona.id === id),
  buscarPorCorreo: (correo) => get().personas.find(
    (persona) => persona.correo.toLowerCase() === correo.trim().toLowerCase(),
  ),
  agregar: (persona) => set((estado) => ({ personas: [...estado.personas, persona] })),
  actualizar: (id, cambios) => set((estado) => ({
    personas: estado.personas.map((persona) => (persona.id === id ? { ...persona, ...cambios } : persona)),
  })),
  reiniciar: () => set({ personas: personasIniciales.map((persona) => ({ ...persona })) }),
}));
