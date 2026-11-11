import type { DatosCobro, SolicitudRetiro } from '../tipos/cobros';

export const MONTO_MINIMO_RETIRO = 50;

export const datosCobroIniciales: DatosCobro[] = [
  { personaId: 'DEMO-A01', metodo: 'transferencia', titular: 'Mariana Vega Ruiz', documentoTitular: 'DEMO-DOC-011', entidad: 'Banco Demostración', tipoCuenta: 'ahorros', ultimosDigitos: '4821', moneda: 'USD', estado: 'verificado', observacion: null, fechaActualizacion: '2026-10-20T10:00:00' },
  { personaId: 'DEMO-A03', metodo: 'transferencia', titular: 'Diego Paredes Luna', documentoTitular: 'DEMO-DOC-013', entidad: 'Banco Demostración', tipoCuenta: 'corriente', ultimosDigitos: '7730', moneda: 'USD', estado: 'verificado', observacion: null, fechaActualizacion: '2026-10-22T09:30:00' },
  { personaId: 'DEMO-A04', metodo: 'billetera', titular: 'Sofía Ramos Celi', documentoTitular: 'DEMO-DOC-014', entidad: 'Billetera Demo', tipoCuenta: null, ultimosDigitos: '0915', moneda: 'USD', estado: 'pendiente_verificacion', observacion: null, fechaActualizacion: '2026-11-09T16:15:00' },
];

export const solicitudesRetiroIniciales: SolicitudRetiro[] = [
  {
    id: 'DEMO-RET-01', personaId: 'DEMO-A03', liquidacionIds: ['DEMO-LIQ-C01-A03'], monto: 172.8, moneda: 'USD', estado: 'solicitada',
    fechaSolicitud: '2026-11-10T11:20:00', destino: 'Banco Demostración · cuenta corriente terminada en 7730',
    historial: [{ fecha: '2026-11-10T11:20:00', actorId: 'DEMO-A03', accion: 'Solicitud de retiro creada' }], motivoRechazo: null, comprobante: null,
  },
];
