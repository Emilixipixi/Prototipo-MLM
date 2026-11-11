import { create } from 'zustand';
import { crearPermisosIniciales, type TablaPermisos } from '../datos/permisosIniciales';
import type { AccionPermiso, ModuloPermiso } from '../tipos/permisos';
import type { PerfilAcceso } from '../tipos/persona';

interface EstadoPermisos {
  tabla: TablaPermisos;
  tienePermiso: (perfil: PerfilAcceso, modulo: ModuloPermiso, accion: AccionPermiso) => boolean;
  alternarPermiso: (perfil: PerfilAcceso, modulo: ModuloPermiso, accion: AccionPermiso) => void;
  reiniciar: () => void;
}

export const usePermisosStore = create<EstadoPermisos>((set, get) => ({
  tabla: crearPermisosIniciales(),
  tienePermiso: (perfil, modulo, accion) => get().tabla[perfil][modulo].includes(accion),
  alternarPermiso: (perfil, modulo, accion) => {
    if (perfil === 'superadministrador') return;
    set((estado) => {
      const actuales = estado.tabla[perfil][modulo];
      const nuevas = actuales.includes(accion)
        ? actuales.filter((existente) => existente !== accion)
        : [...actuales, accion];
      return {
        tabla: { ...estado.tabla, [perfil]: { ...estado.tabla[perfil], [modulo]: nuevas } },
      };
    });
  },
  reiniciar: () => set({ tabla: crearPermisosIniciales() }),
}));
