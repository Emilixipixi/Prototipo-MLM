import { Ban, CircleCheck, CircleDot, Clock, FileCheck2, PauseCircle, Undo2, Wallet, type LucideIcon } from 'lucide-react';
import type { TonoInsignia } from '../componentes/ui/Insignia';
import type { EstadoBono, EstadoLiquidacion } from '../tipos/compensacion';

export const estadosBono: Record<EstadoBono, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon }> = {
  estimada: { etiqueta: 'Estimada', tono: 'info', icono: CircleDot },
  en_revision: { etiqueta: 'En revisión', tono: 'advertencia', icono: Clock },
  aprobada: { etiqueta: 'Aprobada', tono: 'exito', icono: CircleCheck },
  retenida: { etiqueta: 'Retenida', tono: 'retenida', icono: PauseCircle },
  liquidada: { etiqueta: 'Liquidada', tono: 'exito', icono: Wallet },
  revertida: { etiqueta: 'Revertida', tono: 'error', icono: Undo2 },
};

export const estadosLiquidacion: Record<EstadoLiquidacion, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon }> = {
  borrador: { etiqueta: 'Borrador', tono: 'neutra', icono: CircleDot },
  en_revision: { etiqueta: 'En revisión', tono: 'advertencia', icono: Clock },
  aprobada: { etiqueta: 'Aprobada', tono: 'exito', icono: CircleCheck },
  apta_para_desembolso: { etiqueta: 'Apta para desembolso', tono: 'acento', icono: FileCheck2 },
  retenida: { etiqueta: 'Retenida', tono: 'retenida', icono: PauseCircle },
  liquidada_simulada: { etiqueta: 'Liquidada (simulada)', tono: 'exito', icono: Wallet },
};

export const iconoNoElegible = Ban;
