import { usePermisosStore } from '../store/usePermisosStore';
import { usePersonaSesion } from '../store/useSesionStore';
import type { AccionPermiso, ModuloPermiso } from '../tipos/permisos';

export function usePermiso(modulo: ModuloPermiso, accion: AccionPermiso): boolean {
  const persona = usePersonaSesion();
  const tabla = usePermisosStore((estado) => estado.tabla);
  if (!persona) return false;
  return tabla[persona.perfil][modulo].includes(accion);
}
