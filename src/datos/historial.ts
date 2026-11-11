import type { HistorialRunPrevio, RemanentePrevio } from '../tipos/calificacion';

const nota = 'Trayectoria anterior al ciclo DEMO-C01 (dato de demostración)';

export const historialRunPrevio: HistorialRunPrevio[] = [
  { personaId: 'DEMO-A00', runHistoricoPrevio: 'RUN300K', runCobroCicloAnterior: 'RUN5K', nota },
  { personaId: 'DEMO-A01', runHistoricoPrevio: 'RUN100K', runCobroCicloAnterior: 'RUN10K', nota },
  { personaId: 'DEMO-A02', runHistoricoPrevio: 'RUN5K', runCobroCicloAnterior: 'RUN3K', nota },
  { personaId: 'DEMO-A03', runHistoricoPrevio: 'RUN5K', runCobroCicloAnterior: 'RUN5K', nota },
  { personaId: 'DEMO-A04', runHistoricoPrevio: 'RUN3K', runCobroCicloAnterior: 'RUN3K', nota },
  { personaId: 'DEMO-A05', runHistoricoPrevio: 'RUN3K', runCobroCicloAnterior: 'RUN1K', nota },
  { personaId: 'DEMO-A06', runHistoricoPrevio: null, runCobroCicloAnterior: null, nota },
  { personaId: 'DEMO-A07', runHistoricoPrevio: 'RUN1K', runCobroCicloAnterior: 'RUN1K', nota },
  { personaId: 'DEMO-A08', runHistoricoPrevio: 'RUN300', runCobroCicloAnterior: 'RUN300', nota },
  { personaId: 'DEMO-A09', runHistoricoPrevio: 'RUN1K', runCobroCicloAnterior: 'RUN300', nota },
  { personaId: 'DEMO-A10', runHistoricoPrevio: 'RUN300', runCobroCicloAnterior: 'RUN300', nota },
  { personaId: 'DEMO-A12', runHistoricoPrevio: null, runCobroCicloAnterior: null, nota },
  { personaId: 'DEMO-A13', runHistoricoPrevio: null, runCobroCicloAnterior: null, nota },
  { personaId: 'DEMO-A14', runHistoricoPrevio: null, runCobroCicloAnterior: null, nota },
  { personaId: 'DEMO-A15', runHistoricoPrevio: null, runCobroCicloAnterior: null, nota },
];

export const remanentesPrevios: RemanentePrevio[] = [
  { personaId: 'DEMO-A01', brazo: 'A', remanente: 850, caducaEnPeriodoId: 'DEMO-C01', montoQueCaduca: 150 },
  { personaId: 'DEMO-A01', brazo: 'C', remanente: 200, caducaEnPeriodoId: null, montoQueCaduca: 0 },
];
