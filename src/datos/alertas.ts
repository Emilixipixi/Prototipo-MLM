import type { AlertaIntegridad } from '../tipos/compliance';

export const alertasIniciales: AlertaIntegridad[] = [
  {
    id: 'DEMO-ALR-01', tipo: 'duplicado', personasIds: ['DEMO-A09', 'DEMO-A11'], severidad: 'alta', estado: 'abierta', resolucion: null,
    descripcion: 'Posible cuenta duplicada: DEMO-A09 y DEMO-A11 comparten documento y teléfono, y sus nombres son casi iguales.',
    fecha: '2026-11-08T17:45:00',
  },
  {
    id: 'DEMO-ALR-02', tipo: 'patron_atipico', personasIds: ['DEMO-A05'], severidad: 'media', estado: 'en_revision', resolucion: null,
    descripcion: 'DEMO-A05 registró 5 pedidos en menos de una hora el 28/10/2026, seguidos de una devolución.',
    fecha: '2026-10-30T12:10:00',
  },
  {
    id: 'DEMO-ALR-03', tipo: 'estructura_inconsistente', personasIds: ['DEMO-A06'], severidad: 'baja', estado: 'resuelta',
    resolucion: 'La validación bloqueó automáticamente el intento de colocar una segunda persona en DEMO-POS-001 brazo A.',
    descripcion: 'Intento de colocación en una posición ocupada (DEMO-POS-001, brazo A).',
    fecha: '2026-10-20T10:02:00',
  },
];
