import { nombresModulos } from '../datos/permisosIniciales';
import { usePermisosStore } from '../store/usePermisosStore';
import type { AccionPermiso, ModuloPermiso } from '../tipos/permisos';
import type { PerfilAcceso } from '../tipos/persona';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { registrarBitacora } from './registro';

export function alternarPermiso(perfil: PerfilAcceso, modulo: ModuloPermiso, accion: AccionPermiso, actorId: string): Resultado<boolean> {
  if (perfil === 'superadministrador') return fallo('El superadministrador conserva todos los permisos.');
  const estado = usePermisosStore.getState();
  const antes = estado.tienePermiso(perfil, modulo, accion);
  estado.alternarPermiso(perfil, modulo, accion);
  registrarBitacora({
    actorId, accion: antes ? 'Permiso retirado' : 'Permiso otorgado', modulo: 'permisos',
    motivo: `${perfil}: ${accion} en ${nombresModulos[modulo]}`, antes, despues: !antes, referenciaId: perfil,
  });
  return exito(!antes);
}
