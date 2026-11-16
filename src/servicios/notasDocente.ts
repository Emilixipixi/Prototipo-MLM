import { relativoHoy, sumarDias } from '../datos/academico/fechasCampus';
import { cursosDePrograma } from '../motores/academico/desbloqueo';
import { resumirPrograma, type EstructuraAcademica, type RegistroCampus } from '../motores/academico/progreso';
import { useErickStore } from '../store/useErickStore';
import type { EstadoNota, IntentoEvaluacion, Matricula, ObservacionDocente } from '../tipos/academico';
import type { Persona } from '../tipos/persona';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { matriculadosDePrograma } from './calendario';
import { puedeGestionarPrograma } from './docentes';
import { registrarBitacora } from './registro';
import { otorgarIntentoExtra } from './evaluaciones';

export interface ColumnaLibreta { id: string; titulo: string }

export interface FilaLibreta {
  persona: Persona; matricula: Matricula | null; notas: Record<string, number | null>; nota: number | null; estado: EstadoNota;
  avance: number; aprobados: number; total: number; intentos: number; bloqueados: string[]; ultima: string | null; sinActividad: boolean;
}

export interface Libreta { columnas: ColumnaLibreta[]; filas: FilaLibreta[] }

export function construirLibreta(programaId: string, personas: Persona[], estructura: EstructuraAcademica, registro: RegistroCampus & { intentos: IntentoEvaluacion[] }, hoy = relativoHoy(0)): Libreta {
  const programa = estructura.programas.find((item) => item.id === programaId);
  if (!programa) return { columnas: [], filas: [] };
  const esDiplomado = programa.tipo === 'diplomado';
  const cursos = cursosDePrograma(programa, estructura.programas);
  const columnas: ColumnaLibreta[] = esDiplomado
    ? cursos.map((curso) => ({ id: curso.id, titulo: curso.nombre.replace('Curso ', '') }))
    : estructura.modulos.filter((modulo) => modulo.programaId === programaId).sort((a, b) => a.orden - b.orden).map((modulo) => ({ id: modulo.id, titulo: `Módulo ${modulo.orden}` }));
  const limite = sumarDias(hoy, -14);
  const filas = matriculadosDePrograma(programaId, registro.matriculas, estructura.programas).flatMap((personaId): FilaLibreta[] => {
    const persona = personas.find((item) => item.id === personaId);
    const resumen = resumirPrograma(personaId, programaId, estructura, registro);
    if (!persona || !resumen) return [];
    const notas: Record<string, number | null> = esDiplomado
      ? Object.fromEntries(resumen.cursos.map((curso) => [curso.programa.id, curso.nota.nota]))
      : Object.fromEntries((resumen.cursos[0]?.modulos ?? []).map((modulo) => [modulo.modulo.id, modulo.nota.nota]));
    const elementos = new Set(resumen.ruta.map((elemento) => elemento.id));
    const propios = registro.intentos.filter((intento) => intento.personaId === personaId && elementos.has(intento.ambitoId));
    const ultima = propios.map((intento) => intento.fin).sort().at(-1) ?? null;
    const matricula = registro.matriculas.find((item) => item.personaId === personaId && item.programaId === programaId)
      ?? registro.matriculas.find((item) => item.personaId === personaId && estructura.programas.find((otro) => otro.id === item.programaId)?.cursoIds.includes(programaId)) ?? null;
    return [{
      persona, matricula, notas, nota: resumen.nota.nota, estado: resumen.nota.estado, avance: resumen.avance, aprobados: resumen.aprobados, total: resumen.total,
      intentos: propios.length, bloqueados: Object.entries(resumen.estados).filter(([, estado]) => estado === 'bloqueado_por_intentos').map(([id]) => id),
      ultima, sinActividad: resumen.nota.estado !== 'aprobado' && (!ultima || ultima.slice(0, 10) < limite),
    }];
  });
  return { columnas, filas: filas.sort((a, b) => a.persona.apellidos.localeCompare(b.persona.apellidos)) };
}

export function agregarObservacion(docenteId: string, personaId: string, programaId: string, texto: string): Resultado<ObservacionDocente> {
  if (texto.trim().length < 10) return fallo('La observación debe tener al menos 10 caracteres.');
  if (!puedeGestionarPrograma(docenteId, programaId)) return fallo('Solo puedes registrar observaciones en tus programas asignados.');
  const { observacionesDocentes, actualizar } = useErickStore.getState();
  const numeros = observacionesDocentes.map((item) => Number(item.id.replace('DEMO-OBS-', ''))).filter((numero) => !Number.isNaN(numero));
  const observacion: ObservacionDocente = {
    id: `DEMO-OBS-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`, docenteId, personaId, programaId,
    fecha: new Date().toISOString().slice(0, 19), texto: texto.trim(),
  };
  actualizar({ observacionesDocentes: [...observacionesDocentes, observacion] });
  registrarBitacora({ actorId: docenteId, accion: 'Observación docente registrada', modulo: 'academico', referenciaId: personaId, motivo: texto.trim() });
  return exito(observacion);
}

export function otorgarIntentoDocente(docenteId: string, programaId: string, matriculaId: string, elementoId: string, cantidad: number, motivo: string): Resultado<number> {
  if (!puedeGestionarPrograma(docenteId, programaId)) return fallo('Solo puedes otorgar intentos en tus programas asignados.');
  return otorgarIntentoExtra(matriculaId, elementoId, cantidad, docenteId, motivo);
}

export function filasExportablesLibreta(libreta: Libreta): Array<Record<string, string | number | null>> {
  return libreta.filas.map((fila) => ({
    Estudiante: `${fila.persona.nombres} ${fila.persona.apellidos}`,
    ...Object.fromEntries(libreta.columnas.map((columna) => [columna.titulo, fila.notas[columna.id] ?? '-'])),
    Nota: fila.nota ?? '-', Estado: fila.estado, Avance: `${fila.avance}%`, Intentos: fila.intentos, Bloqueos: fila.bloqueados.length,
    'Última actividad': fila.ultima ? fila.ultima.slice(0, 10) : '-',
  }));
}
