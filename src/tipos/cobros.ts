export type MetodoCobro = 'transferencia' | 'billetera';
export type EstadoDatosCobro = 'pendiente_verificacion' | 'verificado' | 'rechazado';
export type EstadoRetiro = 'solicitada' | 'aprobada' | 'rechazada' | 'pagada_simulada';

export interface DatosCobro {
  personaId: string; metodo: MetodoCobro; titular: string; documentoTitular: string;
  entidad: string; tipoCuenta: 'ahorros' | 'corriente' | null; ultimosDigitos: string;
  moneda: string; estado: EstadoDatosCobro; observacion: string | null; fechaActualizacion: string;
}

export interface SolicitudRetiro {
  id: string; personaId: string; liquidacionIds: string[]; monto: number; moneda: string;
  estado: EstadoRetiro; fechaSolicitud: string; destino: string;
  historial: Array<{ fecha: string; actorId: string; accion: string }>;
  motivoRechazo: string | null; comprobante: string | null;
}
