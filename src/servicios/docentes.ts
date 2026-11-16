import { relativoHoy } from '../datos/academico/fechasCampus';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useErickStore } from '../store/useErickStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { AsignacionDocente, Programa } from '../tipos/academico';
import type { Persona } from '../tipos/persona';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { notificar, registrarBitacora } from './registro';

export function programasQueIncluye(programa: Programa, programas: Programa[]): string[] {
  const incluidos = [programa.id, ...programa.cursoIds];
  if (programa.midId) incluidos.push(programa.midId);
  return [...new Set(incluidos.filter((id) => programas.some((item) => item.id === id)))];
}

export function programasDeDocente(docenteId: string, asignaciones: AsignacionDocente[], programas: Programa[]): string[] {
  const directos = asignaciones.filter((asignacion) => asignacion.activa && asignacion.docenteId === docenteId).map((asignacion) => asignacion.programaId);
  return [...new Set(directos.flatMap((programaId) => {
    const programa = programas.find((item) => item.id === programaId);
    return programa ? programasQueIncluye(programa, programas) : [];
  }))];
}

export function puedeGestionarPrograma(docenteId: string, programaId: string): boolean {
  const persona = usePersonasStore.getState().buscarPorId(docenteId);
  if (persona?.perfil === 'admin_educativo') return true;
  if (persona?.perfil !== 'evaluador') return false;
  return programasDeDocente(docenteId, useErickStore.getState().asignacionesDocentes, useAcademicoStore.getState().programas).includes(programaId);
}

export function docentesDePrograma(programaId: string, asignaciones: AsignacionDocente[], programas: Programa[]): string[] {
  const docentes = [...new Set(asignaciones.filter((asignacion) => asignacion.activa).map((asignacion) => asignacion.docenteId))];
  return docentes.filter((docenteId) => programasDeDocente(docenteId, asignaciones, programas).includes(programaId));
}

export function asignarDocente(docenteId: string, programaId: string, actorId: string): Resultado<AsignacionDocente> {
  const docente = usePersonasStore.getState().buscarPorId(docenteId);
  if (!docente || docente.perfil !== 'evaluador') return fallo('Selecciona una persona con perfil de docente.');
  if (docente.estado !== 'activo') return fallo('El docente no está activo.');
  const programa = useAcademicoStore.getState().programas.find((item) => item.id === programaId);
  if (!programa) return fallo('Programa no encontrado.');
  if (programa.estado === 'archivado') return fallo('No se asignan docentes a programas archivados.');
  const { asignacionesDocentes, actualizar } = useErickStore.getState();
  if (asignacionesDocentes.some((item) => item.activa && item.docenteId === docenteId && item.programaId === programaId)) return fallo('El docente ya está asignado a este programa.');
  const numeros = asignacionesDocentes.map((item) => Number(item.id.replace('DEMO-ASD-', ''))).filter((numero) => !Number.isNaN(numero));
  const asignacion: AsignacionDocente = {
    id: `DEMO-ASD-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`, docenteId, programaId, desde: relativoHoy(0), activa: true,
  };
  actualizar({ asignacionesDocentes: [...asignacionesDocentes, asignacion] });
  registrarBitacora({ actorId, accion: 'Docente asignado a programa', modulo: 'docentes', referenciaId: programaId, despues: { docente: docenteId } });
  notificar({ personaId: docenteId, tipo: 'estado', titulo: 'Nuevo programa asignado', mensaje: `Ahora tienes a cargo ${programa.nombre}. Lo verás en Mis cursos.` });
  return exito(asignacion);
}

export function retirarDocente(asignacionId: string, actorId: string, motivo: string): Resultado<AsignacionDocente> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { asignacionesDocentes, actualizar } = useErickStore.getState();
  const actual = asignacionesDocentes.find((item) => item.id === asignacionId);
  if (!actual || !actual.activa) return fallo('Asignación no encontrada o ya retirada.');
  const retirada = { ...actual, activa: false };
  actualizar({ asignacionesDocentes: asignacionesDocentes.map((item) => (item.id === asignacionId ? retirada : item)) });
  registrarBitacora({ actorId, accion: 'Asignación de docente retirada', modulo: 'docentes', motivo: motivo.trim(), referenciaId: actual.programaId, antes: { docente: actual.docenteId }, despues: null });
  notificar({ personaId: actual.docenteId, tipo: 'estado', titulo: 'Programa retirado de tu carga', mensaje: `${actual.programaId}: ${motivo.trim()}` });
  return exito(retirada);
}

export interface DatosNuevoDocente { nombres: string; apellidos: string; correo: string; telefono: string }

export function crearDocente(datos: DatosNuevoDocente, actorId: string): Resultado<Persona> {
  const personas = usePersonasStore.getState();
  if (datos.nombres.trim().length < 2 || datos.apellidos.trim().length < 2) return fallo('Ingresa nombres y apellidos.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) return fallo('Ingresa un correo válido.');
  if (personas.buscarPorCorreo(datos.correo)) return fallo('Ya existe una persona con ese correo.');
  const numeros = personas.personas.filter((persona) => persona.id.startsWith('DEMO-U')).map((persona) => Number(persona.id.replace('DEMO-U', ''))).filter((numero) => !Number.isNaN(numero));
  const numero = Math.max(0, ...numeros) + 1;
  const id = `DEMO-U${String(numero).padStart(2, '0')}`;
  const persona: Persona = {
    id, codigo: id, nombres: datos.nombres.trim(), apellidos: datos.apellidos.trim(), tipo: 'corporativo', perfil: 'evaluador', estado: 'activo',
    correo: datos.correo.trim().toLowerCase(), telefono: datos.telefono.trim() || '+593 99 000 000', documento: `DEMO-DOC-${String(numero).padStart(3, '0')}`,
    pais: 'Ecuador', moneda: 'USD', idioma: 'es', fechaAlta: relativoHoy(0), referenteId: null,
  };
  personas.agregar(persona);
  registrarBitacora({ actorId, accion: 'Docente registrado', modulo: 'docentes', referenciaId: id, despues: { nombre: `${persona.nombres} ${persona.apellidos}` } });
  return exito(persona);
}
