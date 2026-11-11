export type TipoPersona = 'cliente' | 'alumno' | 'empresario' | 'corporativo';
export type PerfilAcceso = 'superadministrador' | 'operador' | 'afiliado' | 'cliente_alumno';
export type EstadoCuenta = 'activo' | 'pendiente' | 'suspendido' | 'bloqueado';

export interface Persona {
  id: string; codigo: string; nombres: string; apellidos: string;
  tipo: TipoPersona; perfil: PerfilAcceso; estado: EstadoCuenta;
  correo: string; telefono: string; documento: string;
  pais: string; moneda: string; idioma: string;
  fechaAlta: string; referenteId: string | null;
}
