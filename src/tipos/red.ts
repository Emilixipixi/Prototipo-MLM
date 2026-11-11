export type Brazo = 'A' | 'B' | 'C';

export interface CambioRegistro { fecha: string; actorId: string; motivo: string; antes: unknown; despues: unknown; }

export interface Patrocinio {
  id: string; personaId: string; patrocinadorId: string | null;
  fechaRelacion: string; historial: CambioRegistro[];
}

export interface PosicionTrinaria {
  id: string; personaId: string; padrePosicionId: string | null; brazo: Brazo | null;
  fecha: string; estado: 'activa' | 'inactiva'; version: number; cambios: CambioRegistro[];
}
