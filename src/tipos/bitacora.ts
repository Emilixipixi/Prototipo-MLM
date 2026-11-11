export interface Bitacora {
  id: string; actorId: string; accion: string; modulo: string; fechaHora: string;
  motivo: string; antes: unknown; despues: unknown; referenciaId: string | null;
}
