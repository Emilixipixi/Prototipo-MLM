import type { Bitacora } from '../tipos/bitacora';

type Fila = [string, string, string, string, string, string | null, unknown, unknown];

const filas: Fila[] = [
  ['2026-10-15T10:00:00', 'DEMO-U01', 'Nueva versión de reglas', 'configuracion', 'Configuración inicial de demostración', 'DEMO-VR-1', null, { vigenteDesde: '2026-10-19' }],
  ['2026-10-19T08:00:00', 'DEMO-U01', 'Apertura de período', 'periodos', 'Inicio del ciclo comercial de 14 días', 'DEMO-C01', 'programado', 'abierto'],
  ['2026-10-20T10:00:00', 'DEMO-U01', 'Asignación de posición Trinaria', 'redes', 'Colocación administrativa en posición disponible', 'DEMO-A06', null, { posicion: 'DEMO-POS-006', padrePosicionId: 'DEMO-POS-005', brazo: 'A', patrocinador: 'sin cambios (DEMO-A01)' }],
  ['2026-10-20T10:02:00', 'DEMO-U02', 'Colocación bloqueada por validación', 'redes', 'El brazo A de DEMO-POS-001 ya está ocupado por DEMO-A03.', 'DEMO-A06', null, { padrePosicionId: 'DEMO-POS-001', brazo: 'A' }],
  ['2026-10-21T10:00:00', 'DEMO-U01', 'Asignación de posición Trinaria', 'redes', 'Colocación administrativa en posición disponible', 'DEMO-A12', null, { posicion: 'DEMO-POS-011', padrePosicionId: 'DEMO-POS-010', brazo: 'A', patrocinador: 'sin cambios (DEMO-A10)' }],
  ['2026-10-28T10:52:00', 'DEMO-U02', 'Alerta de integridad generada', 'compliance', '5 pedidos en menos de una hora', 'DEMO-ALR-02', null, 'en_revision'],
  ['2026-10-30T11:20:00', 'DEMO-U01', 'Registro de devolución', 'compliance', 'Devolución registrada por el cliente final (DEMOSTRACIÓN)', 'DEMO-P30', { estado: 'confirmada' }, { estado: 'devuelta' }],
  ['2026-11-02T08:00:00', 'DEMO-U01', 'Inicio de cierre de período', 'periodos', 'Fin del ciclo DEMO-C01', 'DEMO-C01', 'abierto', 'en_cierre'],
  ['2026-11-02T16:00:00', 'DEMO-U01', 'Corrida de cálculo simulada', 'simulador', 'Corrida del ciclo DEMO-C01 con reglas DEMO-VR-1', 'DEMO-CR-C01-01', null, { reglas: 'DEMO-VR-1' }],
  ['2026-11-02T17:10:00', 'DEMO-U01', 'Corrida enviada a revisión', 'liquidaciones', '', 'DEMO-CR-C01-01', 'simulada', 'en_revision'],
  ['2026-11-02T18:00:00', 'DEMO-U01', 'Corrida aprobada', 'liquidaciones', 'Revisión de partidas completada', 'DEMO-CR-C01-01', 'en_revision', 'aprobada'],
  ['2026-11-02T18:00:00', 'DEMO-U01', 'Liquidaciones generadas (simulado)', 'liquidaciones', '', 'DEMO-CR-C01-01', null, { periodo: 'DEMO-C01' }],
  ['2026-11-02T18:30:00', 'DEMO-U01', 'Cierre de período aprobado', 'periodos', '', 'DEMO-C01', 'en_cierre', 'cerrado'],
  ['2026-11-02T18:31:00', 'DEMO-U01', 'Apertura de período', 'periodos', 'Inicio del ciclo siguiente', 'DEMO-C02', 'programado', 'abierto'],
  ['2026-11-03T11:20:00', 'DEMO-U01', 'Cambio de estado de cuenta', 'compliance', 'Revisión por patrón atípico de pedidos (DEMOSTRACIÓN)', 'DEMO-A05', 'activo', 'suspendido'],
  ['2026-11-03T11:21:00', 'DEMO-U01', 'Pago retenido', 'liquidaciones', 'Cuenta suspendida: la comisión queda retenida sin borrar la historia', 'DEMO-LIQ-C01-A05', 'aprobada', 'retenida'],
  ['2026-11-04T12:00:00', 'DEMO-U01', 'Marcada como liquidada (simulado, sin transferencia)', 'liquidaciones', '', 'DEMO-LIQ-C01-A01', 'apta_para_desembolso', 'liquidada_simulada'],
  ['2026-11-05T09:40:00', 'DEMO-U01', 'Registro de devolución', 'compliance', 'Devolución del bien físico registrada por corporativo', 'DEMO-P02', { estado: 'confirmada' }, { estado: 'devuelta', reversion: 'DEMO-MV-0053' }],
  ['2026-11-05T10:15:00', 'DEMO-U02', 'Ajuste propuesto', 'compliance', 'Ajuste por devolución del pedido DEMO-P02 sin reescribir el cierre de DEMO-C01', 'DEMO-P02', null, 'propuesto'],
  ['2026-11-05T10:40:00', 'DEMO-U01', 'Ajuste autorizado', 'compliance', 'Ajustes por devolución revisados y autorizados para la liquidación de DEMO-C02', 'DEMO-P02', 'propuesto', 'autorizado'],
  ['2026-11-08T17:45:00', 'DEMO-U02', 'Alerta de integridad generada', 'compliance', 'Posible cuenta duplicada', 'DEMO-ALR-01', null, 'abierta'],
  ['2026-11-09T16:20:00', 'DEMO-U01', 'Nueva versión de reglas', 'configuracion', 'Ejemplo de cambio versionado: Unilevel nivel 3 pasa de 3% a 2,5%', 'DEMO-VR-2', 'DEMO-VR-1', { vigenteDesde: '2026-11-16' }],
];

export const bitacoraInicial: Bitacora[] = filas
  .map(([fechaHora, actorId, accion, modulo, motivo, referenciaId, antes, despues], indice) => ({
    id: `DEMO-BIT-${String(indice + 1).padStart(3, '0')}`,
    fechaHora, actorId, accion, modulo, motivo, referenciaId, antes, despues,
  }))
  .reverse();
