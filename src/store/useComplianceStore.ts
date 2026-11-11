import { create } from 'zustand';
import { alertasIniciales } from '../datos/alertas';
import type { AlertaIntegridad } from '../tipos/compliance';

interface EstadoCompliance {
  alertas: AlertaIntegridad[];
  establecer: (alertas: AlertaIntegridad[]) => void;
  reiniciar: () => void;
}

export const useComplianceStore = create<EstadoCompliance>((set) => ({
  alertas: structuredClone(alertasIniciales),
  establecer: (alertas) => set({ alertas }),
  reiniciar: () => set({ alertas: structuredClone(alertasIniciales) }),
}));
