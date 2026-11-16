import { Ban, CalendarX2, CircleCheck, CircleDot, CirclePause, Clock, Lock, PlayCircle, RotateCcw, type LucideIcon } from 'lucide-react';
import type { TonoInsignia } from '../../componentes/ui/Insignia';
import type { EstadoElemento, EstadoMatricula, EstadoNota, PoliticaNota, TipoEventoLms, TipoPregunta, TipoPrograma } from '../../tipos/academico';

export const estadosAcceso: Record<EstadoMatricula, { texto: string; tono: TonoInsignia; icono: LucideIcon }> = {
  activa: { texto: 'Acceso activo', tono: 'exito', icono: CircleCheck },
  por_vencer: { texto: 'Por vencer', tono: 'advertencia', icono: Clock },
  vencida: { texto: 'Acceso vencido', tono: 'error', icono: CalendarX2 },
  suspendida: { texto: 'Suspendido', tono: 'retenida', icono: CirclePause },
};

export const nombresTipoPrograma: Record<TipoPrograma, string> = { curso: 'Curso', diplomado: 'Diplomado', mid: 'MID' };

export const estadosNota: Record<EstadoNota, { texto: string; tono: TonoInsignia }> = {
  pendiente: { texto: 'En curso', tono: 'info' },
  aprobado: { texto: 'Aprobado', tono: 'exito' },
  desaprobado: { texto: 'Desaprobado', tono: 'error' },
};

export const estadosElemento: Record<EstadoElemento, { texto: string; tono: TonoInsignia; icono: LucideIcon; clase: string }> = {
  bloqueado: { texto: 'Bloqueado', tono: 'neutra', icono: Lock, clase: 'bg-slate-100 text-texto-3' },
  disponible: { texto: 'Disponible', tono: 'acento', icono: PlayCircle, clase: 'bg-acento-suave text-acento' },
  en_curso: { texto: 'En curso', tono: 'info', icono: CircleDot, clase: 'bg-blue-100 text-info' },
  aprobado: { texto: 'Aprobado', tono: 'exito', icono: CircleCheck, clase: 'bg-green-100 text-exito' },
  desaprobado: { texto: 'Desaprobado', tono: 'error', icono: RotateCcw, clase: 'bg-red-100 text-error' },
  bloqueado_por_intentos: { texto: 'Sin intentos', tono: 'error', icono: Ban, clase: 'bg-red-100 text-error' },
};

export const nombresTipoPregunta: Record<TipoPregunta, string> = {
  opcion_multiple: 'Opción múltiple', seleccion_multiple: 'Selección múltiple', verdadero_falso: 'Verdadero o falso',
  emparejar: 'Emparejar', ordenar: 'Ordenar', numerica: 'Numérica',
};

export const nombresPolitica: Record<PoliticaNota, string> = { mejor: 'Mejor nota', ultimo: 'Último intento', promedio: 'Promedio de intentos' };

export const nombresEventoLms: Record<TipoEventoLms, string> = {
  matricula_creada: 'Matrícula creada', avance_actualizado: 'Avance actualizado', curso_aprobado: 'Curso aprobado',
  diploma_emitido: 'Diploma emitido', certificado_anulado: 'Documento anulado', acceso_vencido: 'Acceso vencido',
  mid_aprobado: 'MID aprobado', acceso_suspendido: 'Acceso suspendido', membresia_activada: 'Membresía activada',
};
