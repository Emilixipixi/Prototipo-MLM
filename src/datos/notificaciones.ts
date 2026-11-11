import type { Notificacion } from '../tipos/notificacion';

export const notificacionesIniciales: Notificacion[] = [
  {
    id: 'DEMO-NOT-01', personaId: 'DEMO-L01', tipo: 'compra',
    titulo: 'Compra confirmada',
    mensaje: 'Tu pedido DEMO-P01 del Programa Liderazgo Comercial - Nivel 1 fue confirmado (simulado).',
    fecha: '2026-11-04T10:15:00', leida: false,
  },
  {
    id: 'DEMO-NOT-02', personaId: 'DEMO-A01', tipo: 'liquidacion',
    titulo: 'Liquidación disponible',
    mensaje: 'Ya puedes revisar el detalle de tu liquidación del ciclo DEMO-C01. Sin transferencia monetaria.',
    fecha: '2026-11-03T09:00:00', leida: false,
  },
  {
    id: 'DEMO-NOT-03', personaId: null, tipo: 'cierre',
    titulo: 'Cierre de período aprobado',
    mensaje: 'El ciclo DEMO-C01 (19/10/2026 - 01/11/2026) fue cerrado con la versión de reglas DEMO-VR-1.',
    fecha: '2026-11-02T18:30:00', leida: false,
  },
  {
    id: 'DEMO-NOT-04', personaId: null, tipo: 'estado',
    titulo: 'Cambio de estado de cuenta',
    mensaje: 'La cuenta DEMO-A05 pasó a estado suspendido. Sus comisiones quedan retenidas.',
    fecha: '2026-11-03T11:20:00', leida: true,
  },
];
