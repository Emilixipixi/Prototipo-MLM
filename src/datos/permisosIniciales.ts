import type { AccionPermiso, ModuloPermiso } from '../tipos/permisos';
import type { PerfilAcceso } from '../tipos/persona';

export const acciones: AccionPermiso[] = ['consultar', 'crear', 'editar', 'aprobar', 'liquidar', 'exportar', 'auditar'];

export const modulos: ModuloPermiso[] = [
  'usuarios', 'catalogo', 'pedidos', 'redes', 'periodos', 'rangos', 'bonos', 'simulador',
  'liquidaciones', 'compliance', 'auditoria', 'reportes', 'integraciones', 'configuracion', 'permisos',
];

export const nombresModulos: Record<ModuloPermiso, string> = {
  usuarios: 'Usuarios', catalogo: 'Catálogo', pedidos: 'Pedidos', redes: 'Redes', periodos: 'Períodos',
  rangos: 'Rangos', bonos: 'Bonos', simulador: 'Simulador', liquidaciones: 'Liquidaciones',
  compliance: 'Compliance', auditoria: 'Auditoría', reportes: 'Reportes', integraciones: 'Integraciones',
  configuracion: 'Configuración', permisos: 'Permisos',
};

export const nombresAcciones: Record<AccionPermiso, string> = {
  consultar: 'consultar', crear: 'crear', editar: 'editar', aprobar: 'aprobar',
  liquidar: 'liquidar', exportar: 'exportar', auditar: 'auditar',
};

export type TablaPermisos = Record<PerfilAcceso, Record<ModuloPermiso, AccionPermiso[]>>;

function crearVacia(): Record<ModuloPermiso, AccionPermiso[]> {
  return modulos.reduce((tabla, modulo) => ({ ...tabla, [modulo]: [] }), {} as Record<ModuloPermiso, AccionPermiso[]>);
}

function crearSuperadministrador(): Record<ModuloPermiso, AccionPermiso[]> {
  return modulos.reduce((tabla, modulo) => ({ ...tabla, [modulo]: [...acciones] }), {} as Record<ModuloPermiso, AccionPermiso[]>);
}

function crearOperador(): Record<ModuloPermiso, AccionPermiso[]> {
  const tabla = crearVacia();
  modulos
    .filter((modulo) => modulo !== 'permisos' && modulo !== 'configuracion')
    .forEach((modulo) => { tabla[modulo] = ['consultar']; });
  (['usuarios', 'pedidos', 'redes'] as ModuloPermiso[]).forEach((modulo) => {
    tabla[modulo] = ['consultar', 'crear', 'editar'];
  });
  tabla.compliance = ['consultar', 'crear'];
  tabla.reportes = ['consultar', 'exportar'];
  return tabla;
}

export function crearPermisosIniciales(): TablaPermisos {
  return {
    superadministrador: crearSuperadministrador(),
    operador: crearOperador(),
    afiliado: crearVacia(),
    cliente_alumno: crearVacia(),
  };
}
