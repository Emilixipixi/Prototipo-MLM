import type { Patrocinio, PosicionTrinaria } from '../tipos/red';

const relaciones: Array<[string, string | null, string]> = [
  ['DEMO-A00', null, '2024-01-15'],
  ['DEMO-A01', 'DEMO-A00', '2025-03-14'],
  ['DEMO-A02', 'DEMO-A00', '2025-04-02'],
  ['DEMO-A03', 'DEMO-A01', '2025-05-19'],
  ['DEMO-A04', 'DEMO-A01', '2025-07-08'],
  ['DEMO-A05', 'DEMO-A01', '2025-09-11'],
  ['DEMO-A06', 'DEMO-A01', '2026-10-20'],
  ['DEMO-A07', 'DEMO-A03', '2025-11-03'],
  ['DEMO-A08', 'DEMO-A04', '2026-01-22'],
  ['DEMO-A09', 'DEMO-A06', '2026-03-14'],
  ['DEMO-A10', 'DEMO-A07', '2026-02-09'],
  ['DEMO-A11', 'DEMO-A06', '2026-11-08'],
  ['DEMO-A12', 'DEMO-A10', '2026-10-21'],
  ['DEMO-A13', 'DEMO-A12', '2026-04-27'],
  ['DEMO-A14', 'DEMO-A13', '2026-06-05'],
  ['DEMO-A15', 'DEMO-A14', '2026-08-17'],
];

export const patrociniosIniciales: Patrocinio[] = relaciones.map(([personaId, patrocinadorId, fecha], indice) => ({
  id: `DEMO-PAT-${String(indice).padStart(3, '0')}`,
  personaId,
  patrocinadorId,
  fechaRelacion: fecha,
  historial: [{
    fecha: `${fecha}T09:00:00`, actorId: 'DEMO-U01', motivo: 'Alta con patrocinador registrado (DEMOSTRACIÓN)',
    antes: null, despues: patrocinadorId,
  }],
}));

const ubicaciones: Array<[string, string, string | null, 'A' | 'B' | 'C' | null, string]> = [
  ['DEMO-POS-000', 'DEMO-A00', null, null, '2024-01-15'],
  ['DEMO-POS-001', 'DEMO-A01', 'DEMO-POS-000', 'A', '2025-03-15'],
  ['DEMO-POS-002', 'DEMO-A02', 'DEMO-POS-001', 'C', '2025-04-03'],
  ['DEMO-POS-003', 'DEMO-A03', 'DEMO-POS-001', 'A', '2025-05-20'],
  ['DEMO-POS-004', 'DEMO-A04', 'DEMO-POS-003', 'A', '2025-07-09'],
  ['DEMO-POS-005', 'DEMO-A05', 'DEMO-POS-001', 'B', '2025-09-12'],
  ['DEMO-POS-006', 'DEMO-A06', 'DEMO-POS-005', 'A', '2026-10-20'],
  ['DEMO-POS-007', 'DEMO-A07', 'DEMO-POS-002', 'A', '2025-11-04'],
  ['DEMO-POS-008', 'DEMO-A08', 'DEMO-POS-004', 'A', '2026-01-23'],
  ['DEMO-POS-009', 'DEMO-A09', 'DEMO-POS-006', 'A', '2026-03-15'],
  ['DEMO-POS-010', 'DEMO-A10', 'DEMO-POS-003', 'B', '2026-02-10'],
  ['DEMO-POS-011', 'DEMO-A12', 'DEMO-POS-010', 'A', '2026-10-21'],
  ['DEMO-POS-012', 'DEMO-A13', 'DEMO-POS-011', 'A', '2026-04-28'],
  ['DEMO-POS-013', 'DEMO-A14', 'DEMO-POS-012', 'A', '2026-06-06'],
  ['DEMO-POS-014', 'DEMO-A15', 'DEMO-POS-013', 'A', '2026-08-18'],
];

export const posicionesIniciales: PosicionTrinaria[] = ubicaciones.map(([id, personaId, padrePosicionId, brazo, fecha]) => ({
  id, personaId, padrePosicionId, brazo, fecha, estado: 'activa', version: 1,
  cambios: [{
    fecha: `${fecha}T10:00:00`, actorId: 'DEMO-U01',
    motivo: 'Colocación administrativa en posición disponible (DEMOSTRACIÓN)',
    antes: null, despues: { padrePosicionId, brazo },
  }],
}));
