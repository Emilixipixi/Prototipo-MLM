import { Ban, CircleCheck, Clock, PauseCircle, type LucideIcon } from 'lucide-react';
import type { TonoInsignia } from '../componentes/ui/Insignia';
import type { EstadoCuenta, TipoPersona } from '../tipos/persona';
import type { EstadoPeriodo } from '../tipos/reglas';
import { CalendarCheck, CalendarClock, Hourglass, Lock } from 'lucide-react';

export const estadosCuenta: Record<EstadoCuenta, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon; efecto: string }> = {
  activo: { etiqueta: 'Activo', tono: 'exito', icono: CircleCheck, efecto: 'Ingresa, compra, genera volumen y es elegible a bonos según reglas.' },
  pendiente: { etiqueta: 'Pendiente', tono: 'advertencia', icono: Clock, efecto: 'Ingreso limitado; no compra, no genera volumen ni comisiones.' },
  suspendido: { etiqueta: 'Suspendido', tono: 'retenida', icono: PauseCircle, efecto: 'Solo lectura; sus comisiones se calculan pero quedan retenidas.' },
  bloqueado: { etiqueta: 'Bloqueado', tono: 'error', icono: Ban, efecto: 'No ingresa ni opera; comisiones retenidas.' },
};

export const nombresTipo: Record<TipoPersona, string> = {
  cliente: 'Cliente', alumno: 'Alumno', empresario: 'Empresario', corporativo: 'Corporativo',
};

export const estadosPeriodo: Record<EstadoPeriodo, { etiqueta: string; tono: TonoInsignia; icono: LucideIcon }> = {
  programado: { etiqueta: 'Programado', tono: 'neutra', icono: CalendarClock },
  abierto: { etiqueta: 'Abierto', tono: 'info', icono: CalendarCheck },
  en_cierre: { etiqueta: 'En cierre', tono: 'advertencia', icono: Hourglass },
  cerrado: { etiqueta: 'Cerrado', tono: 'exito', icono: Lock },
};
