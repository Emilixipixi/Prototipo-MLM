export interface Notificacion {
  id: string; personaId: string | null; tipo: 'compra' | 'estado' | 'cierre' | 'liquidacion';
  titulo: string; mensaje: string; fecha: string; leida: boolean;
}
