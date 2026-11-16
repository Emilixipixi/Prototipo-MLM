import type { AccionPermiso, ModuloPermiso } from '../tipos/permisos';
import type { PerfilAcceso } from '../tipos/persona';

export const acciones: AccionPermiso[] = ['consultar', 'crear', 'editar', 'aprobar', 'liquidar', 'exportar', 'auditar'];

export const modulos: ModuloPermiso[] = [
  'usuarios', 'catalogo', 'pedidos', 'redes', 'periodos', 'rangos', 'bonos', 'simulador',
  'liquidaciones', 'compliance', 'auditoria', 'reportes', 'integraciones', 'configuracion', 'permisos',
  'academico', 'matriculas', 'certificados',
  'calendario', 'docentes', 'contenidos', 'configuracion_erick',
];

export const modulosErick: ModuloPermiso[] = ['academico', 'matriculas', 'certificados', 'calendario', 'docentes', 'contenidos', 'configuracion_erick'];

export const nombresModulos: Record<ModuloPermiso, string> = {
  usuarios: 'Usuarios', catalogo: 'Catálogo', pedidos: 'Pedidos', redes: 'Redes', periodos: 'Períodos',
  rangos: 'Rangos', bonos: 'Bonos', simulador: 'Simulador', liquidaciones: 'Liquidaciones',
  compliance: 'Compliance', auditoria: 'Auditoría', reportes: 'Reportes', integraciones: 'Integraciones',
  configuracion: 'Configuración', permisos: 'Permisos',
  academico: 'Académico', matriculas: 'Matrículas', certificados: 'Certificados',
  calendario: 'Calendario académico', docentes: 'Docentes', contenidos: 'Contenidos y clases', configuracion_erick: 'Configuración ERICK',
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
  tabla.academico = ['consultar'];
  tabla.matriculas = ['consultar', 'crear', 'editar'];
  tabla.certificados = ['consultar', 'exportar'];
  return tabla;
}

function crearEvaluador(): Record<ModuloPermiso, AccionPermiso[]> {
  const tabla = crearVacia();
  tabla.academico = ['consultar', 'aprobar'];
  tabla.contenidos = ['consultar', 'editar'];
  tabla.calendario = ['consultar', 'crear', 'editar'];
  tabla.reportes = ['consultar', 'exportar'];
  return tabla;
}

function crearAdminEducativo(): Record<ModuloPermiso, AccionPermiso[]> {
  const tabla = crearVacia();
  modulosErick.forEach((modulo) => { tabla[modulo] = [...acciones]; });
  tabla.reportes = ['consultar', 'exportar'];
  tabla.integraciones = ['consultar', 'exportar'];
  return tabla;
}

function limitarErickEnMlm(tabla: Record<ModuloPermiso, AccionPermiso[]>): Record<ModuloPermiso, AccionPermiso[]> {
  (['academico', 'matriculas', 'certificados'] as ModuloPermiso[]).forEach((modulo) => { tabla[modulo] = ['consultar']; });
  (['calendario', 'docentes', 'contenidos', 'configuracion_erick'] as ModuloPermiso[]).forEach((modulo) => { tabla[modulo] = []; });
  return tabla;
}

export function crearPermisosIniciales(): TablaPermisos {
  return {
    superadministrador: limitarErickEnMlm(crearSuperadministrador()),
    operador: limitarErickEnMlm(crearOperador()),
    afiliado: crearVacia(),
    cliente_alumno: crearVacia(),
    evaluador: crearEvaluador(),
    admin_educativo: crearAdminEducativo(),
  };
}
