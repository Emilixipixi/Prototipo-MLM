import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { EstadoMatricula, Matricula, Membresia, Programa } from '../../tipos/academico';

export const DIAS_AVISO_VENCIMIENTO = 7;

export function diasRestantes(vencimiento: string, fecha: string): number {
  return differenceInCalendarDays(parseISO(vencimiento.slice(0, 10)), parseISO(fecha.slice(0, 10)));
}

export function estadoVigencia(vencimiento: string, suspendida: boolean, fecha: string): EstadoMatricula {
  if (suspendida) return 'suspendida';
  const dias = diasRestantes(vencimiento, fecha);
  if (dias < 0) return 'vencida';
  if (dias <= DIAS_AVISO_VENCIMIENTO) return 'por_vencer';
  return 'activa';
}

export function estadoMatricula(matricula: Matricula, fecha: string): EstadoMatricula {
  return estadoVigencia(matricula.vencimiento, matricula.suspendida, fecha);
}

export function estadoMembresia(membresia: Membresia, fecha: string): EstadoMatricula {
  return estadoVigencia(membresia.vencimiento, membresia.suspendida, fecha);
}

export function esVigente(estado: EstadoMatricula): boolean {
  return estado === 'activa' || estado === 'por_vencer';
}

export function tieneAccesoVigente(matricula: Matricula, fecha: string): boolean {
  return esVigente(estadoMatricula(matricula, fecha));
}

export type ViaAcceso = 'matricula' | 'diplomado' | 'membresia';

export interface AccesoPrograma { acceso: boolean; via: ViaAcceso | null; matricula: Matricula | null; membresia: Membresia | null; vencimiento: string | null }

export function accesoPrograma(
  personaId: string, programaId: string, matriculas: Matricula[], membresias: Membresia[], programas: Programa[], fecha: string,
): AccesoPrograma {
  const propias = matriculas.filter((matricula) => matricula.personaId === personaId);
  const directa = propias.find((matricula) => matricula.programaId === programaId && tieneAccesoVigente(matricula, fecha));
  if (directa) return { acceso: true, via: 'matricula', matricula: directa, membresia: null, vencimiento: directa.vencimiento };
  const diplomados = programas.filter((programa) => programa.tipo === 'diplomado' && programa.cursoIds.includes(programaId)).map((programa) => programa.id);
  const porDiplomado = propias.find((matricula) => diplomados.includes(matricula.programaId) && tieneAccesoVigente(matricula, fecha));
  if (porDiplomado) return { acceso: true, via: 'diplomado', matricula: porDiplomado, membresia: null, vencimiento: porDiplomado.vencimiento };
  const programa = programas.find((item) => item.id === programaId);
  const membresia = programa?.incluidoEnMembresia
    ? membresias.find((item) => item.personaId === personaId && esVigente(estadoMembresia(item, fecha)))
    : undefined;
  if (membresia) return { acceso: true, via: 'membresia', matricula: null, membresia, vencimiento: membresia.vencimiento };
  return { acceso: false, via: null, matricula: null, membresia: null, vencimiento: null };
}
