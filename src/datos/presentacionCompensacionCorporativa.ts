import { CircleCheck, CircleX, Clock, FlaskConical, type LucideIcon } from 'lucide-react';
import type { TonoInsignia } from '../componentes/ui/Insignia';
import type { AlertaIntegridad } from '../tipos/compliance';
import type { Ajuste, CorridaCalculo } from '../tipos/compensacion';
import type { EstadoDatosCobro, EstadoRetiro } from '../tipos/cobros';
import { ShieldCheck, Wallet } from 'lucide-react';

export const estadosCorrida: Record<CorridaCalculo['estado'], { etiqueta: string; tono: TonoInsignia; icono: LucideIcon }> = {
  simulada: { etiqueta: 'Simulada', tono: 'info', icono: FlaskConical },
  en_revision: { etiqueta: 'En revisión', tono: 'advertencia', icono: Clock },
  aprobada: { etiqueta: 'Aprobada', tono: 'exito', icono: CircleCheck },
  rechazada: { etiqueta: 'Rechazada', tono: 'error', icono: CircleX },
};

export const estadosAjuste: Record<Ajuste['estado'], { etiqueta: string; tono: TonoInsignia }> = {
  propuesto: { etiqueta: 'Propuesto', tono: 'advertencia' },
  autorizado: { etiqueta: 'Autorizado', tono: 'info' },
  aplicado: { etiqueta: 'Aplicado', tono: 'exito' },
  rechazado: { etiqueta: 'Rechazado', tono: 'error' },
};

export const tiposAjuste: Record<Ajuste['tipo'], string> = {
  devolucion: 'Devolución', correccion: 'Corrección', retencion: 'Retención', liberacion: 'Liberación',
};

export const tiposAlerta: Record<AlertaIntegridad['tipo'], string> = {
  duplicado: 'Posible duplicado', patron_atipico: 'Patrón atípico', estructura_inconsistente: 'Estructura inconsistente',
};

export const severidades: Record<AlertaIntegridad['severidad'], { etiqueta: string; tono: TonoInsignia }> = {
  alta: { etiqueta: 'Alta', tono: 'error' }, media: { etiqueta: 'Media', tono: 'advertencia' }, baja: { etiqueta: 'Baja', tono: 'neutra' },
};

export const estadosAlerta: Record<AlertaIntegridad['estado'], { etiqueta: string; tono: TonoInsignia }> = {
  abierta: { etiqueta: 'Abierta', tono: 'error' }, en_revision: { etiqueta: 'En revisión', tono: 'advertencia' }, resuelta: { etiqueta: 'Resuelta', tono: 'exito' },
};

export const estadosRetiro: Record<EstadoRetiro, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon }> = {
  solicitada: { etiqueta: 'Solicitada', tono: 'advertencia', icono: Clock },
  aprobada: { etiqueta: 'Aprobada', tono: 'info', icono: CircleCheck },
  rechazada: { etiqueta: 'Rechazada', tono: 'error', icono: CircleX },
  pagada_simulada: { etiqueta: 'Pagada (simulada)', tono: 'exito', icono: Wallet },
};

export const estadosDatosCobro: Record<EstadoDatosCobro, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon }> = {
  pendiente_verificacion: { etiqueta: 'Pendiente de verificación', tono: 'advertencia', icono: Clock },
  verificado: { etiqueta: 'Verificado', tono: 'exito', icono: ShieldCheck },
  rechazado: { etiqueta: 'Rechazado', tono: 'error', icono: CircleX },
};
