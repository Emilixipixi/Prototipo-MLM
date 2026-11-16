import type { PerfilAcceso } from './persona';

export type AccionPermiso = 'consultar' | 'crear' | 'editar' | 'aprobar' | 'liquidar' | 'exportar' | 'auditar';

export type ModuloPermiso = 'usuarios' | 'catalogo' | 'pedidos' | 'redes' | 'periodos' | 'rangos' | 'bonos'
  | 'simulador' | 'liquidaciones' | 'compliance' | 'auditoria' | 'reportes' | 'integraciones'
  | 'configuracion' | 'permisos'
  | 'academico' | 'matriculas' | 'certificados'
  | 'calendario' | 'docentes' | 'contenidos' | 'configuracion_erick';

export interface MatrizPermisos { perfil: PerfilAcceso; permisos: Record<string, string[]>; }
