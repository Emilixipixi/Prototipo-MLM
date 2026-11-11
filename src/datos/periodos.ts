import type { Periodo } from '../tipos/reglas';

export const periodosIniciales: Periodo[] = [
  { id: 'DEMO-C01', nombre: 'Ciclo DEMO-C01', tipo: 'ciclo', fechaInicio: '2026-10-19', fechaFin: '2026-11-01', duracionDias: 14, estado: 'cerrado', versionReglasId: 'DEMO-VR-1' },
  { id: 'DEMO-C02', nombre: 'Ciclo DEMO-C02', tipo: 'ciclo', fechaInicio: '2026-11-02', fechaFin: '2026-11-15', duracionDias: 14, estado: 'abierto', versionReglasId: 'DEMO-VR-1' },
  { id: 'DEMO-C03', nombre: 'Ciclo DEMO-C03', tipo: 'ciclo', fechaInicio: '2026-11-16', fechaFin: '2026-11-29', duracionDias: 14, estado: 'programado', versionReglasId: 'DEMO-VR-2' },
  { id: 'DEMO-M10', nombre: 'Evaluación mensual octubre 2026', tipo: 'mensual', fechaInicio: '2026-10-01', fechaFin: '2026-10-31', duracionDias: 31, estado: 'cerrado', versionReglasId: 'DEMO-VR-1' },
  { id: 'DEMO-M11', nombre: 'Evaluación mensual noviembre 2026', tipo: 'mensual', fechaInicio: '2026-11-01', fechaFin: '2026-11-30', duracionDias: 30, estado: 'abierto', versionReglasId: 'DEMO-VR-1' },
];
