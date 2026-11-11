export interface AlertaIntegridad {
  id: string; tipo: 'duplicado' | 'patron_atipico' | 'estructura_inconsistente';
  personasIds: string[]; descripcion: string; severidad: 'baja' | 'media' | 'alta';
  estado: 'abierta' | 'en_revision' | 'resuelta'; resolucion: string | null;
  fecha: string;
}
