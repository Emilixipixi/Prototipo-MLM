export type EstadoFormacion = 'matriculado' | 'cursando' | 'aprobado';

export interface EstadoFormativo {
  id: string; personaId: string; programaExterno: string; proveedor: string;
  estado: EstadoFormacion; fechaActualizacion: string;
}
