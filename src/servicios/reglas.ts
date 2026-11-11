import { addDays, format, parseISO } from 'date-fns';
import { calcularCalificaciones } from '../motores/motorRangos';
import { usePeriodosStore } from '../store/usePeriodosStore';
import type { CodigoRun, Periodo, VersionReglas } from '../tipos/reglas';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { construirContexto } from './contexto';
import { obtenerFuente } from './fuente';
import { registrarBitacora } from './registro';

const sumarDias = (fecha: string, dias: number) => format(addDays(parseISO(fecha), dias), 'yyyy-MM-dd');

export type CambiosReglas = Partial<Pick<VersionReglas, 'rangos' | 'motores' | 'trinario' | 'topes'>>;

export function crearVersionReglas(baseId: string, cambios: CambiosReglas, vigenteDesde: string, motivo: string, actorId: string): Resultado<VersionReglas> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { versiones, periodos, establecer } = usePeriodosStore.getState();
  const base = versiones.find((version) => version.id === baseId);
  if (!base) return fallo('Versión base no encontrada.');
  const cerradoAfectado = periodos.find((periodo) => periodo.estado === 'cerrado' && periodo.fechaFin >= vigenteDesde);
  if (cerradoAfectado) return fallo(`La vigencia no puede iniciar dentro del período cerrado ${cerradoAfectado.id}: una regla nueva no reescribe un cierre anterior.`);
  const numero = Math.max(...versiones.map((version) => version.numero)) + 1;
  const nueva: VersionReglas = {
    ...structuredClone(base), ...structuredClone(cambios),
    id: `DEMO-VR-${numero}`, numero, vigenteDesde, vigenteHasta: null, actorId, fecha: fechaHoraActualIso(), motivo, esDemostracion: true,
  };
  establecer({
    versiones: [
      ...versiones.map((version) => (version.vigenteHasta === null || version.vigenteHasta >= vigenteDesde
        ? { ...version, vigenteHasta: version.vigenteDesde < vigenteDesde ? sumarDias(vigenteDesde, -1) : version.vigenteHasta }
        : version)),
      nueva,
    ],
    periodos: periodos.map((periodo) => (periodo.estado !== 'cerrado' && periodo.fechaInicio >= vigenteDesde ? { ...periodo, versionReglasId: nueva.id } : periodo)),
  });
  registrarBitacora({ actorId, accion: 'Nueva versión de reglas', modulo: 'configuracion', motivo, referenciaId: nueva.id, antes: baseId, despues: { version: nueva.id, vigenteDesde } });
  return exito(nueva);
}

export function previsualizarRangos(periodoId: string, reglas: VersionReglas): Array<{ personaId: string; actual: CodigoRun | null; nuevo: CodigoRun | null }> {
  const fuente = obtenerFuente();
  const actuales = calcularCalificaciones(construirContexto(fuente, periodoId));
  const nuevas = calcularCalificaciones(construirContexto(fuente, periodoId, { reglas }));
  return actuales
    .map((actual) => ({ personaId: actual.personaId, actual: actual.runCobro, nuevo: nuevas.find((item) => item.personaId === actual.personaId)?.runCobro ?? null }))
    .filter((fila) => fila.actual !== fila.nuevo);
}

export function actualizarDuracionCiclo(periodoId: string, dias: number, actorId: string, motivo: string): Resultado<Periodo[]> {
  if (dias < 1 || dias > 31) return fallo('La duración debe estar entre 1 y 31 días.');
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { periodos, establecer } = usePeriodosStore.getState();
  const periodo = periodos.find((item) => item.id === periodoId);
  if (!periodo) return fallo('Período no encontrado.');
  if (periodo.estado === 'cerrado' || periodo.estado === 'en_cierre') return fallo('No se modifica la duración de un período cerrado o en cierre.');
  const ciclos = periodos.filter((item) => item.tipo === 'ciclo').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  const desde = ciclos.findIndex((item) => item.id === periodoId);
  const actualizados = new Map<string, Periodo>();
  let inicio = periodo.fechaInicio;
  ciclos.slice(desde).forEach((ciclo, indice) => {
    if (indice > 0 && ciclo.estado !== 'programado') return;
    const duracion = indice === 0 ? dias : ciclo.duracionDias;
    actualizados.set(ciclo.id, { ...ciclo, fechaInicio: inicio, duracionDias: duracion, fechaFin: sumarDias(inicio, duracion - 1) });
    inicio = sumarDias(inicio, duracion);
  });
  establecer({ periodos: periodos.map((item) => actualizados.get(item.id) ?? item) });
  registrarBitacora({ actorId, accion: 'Cambio de duración de ciclo', modulo: 'periodos', motivo, referenciaId: periodoId, antes: periodo.duracionDias, despues: dias });
  return exito([...actualizados.values()]);
}

export function crearSiguienteCiclo(actorId: string): Resultado<Periodo> {
  const { periodos, establecer } = usePeriodosStore.getState();
  const ultimo = periodos.filter((item) => item.tipo === 'ciclo').sort((a, b) => b.fechaFin.localeCompare(a.fechaFin))[0];
  const numero = periodos.filter((item) => item.tipo === 'ciclo').length + 1;
  const id = `DEMO-C${String(numero).padStart(2, '0')}`;
  const fechaInicio = sumarDias(ultimo.fechaFin, 1);
  const nuevo: Periodo = {
    id, nombre: `Ciclo ${id}`, tipo: 'ciclo', fechaInicio, fechaFin: sumarDias(fechaInicio, ultimo.duracionDias - 1),
    duracionDias: ultimo.duracionDias, estado: 'programado', versionReglasId: ultimo.versionReglasId,
  };
  establecer({ periodos: [...periodos, nuevo] });
  registrarBitacora({ actorId, accion: 'Creación de ciclo', modulo: 'periodos', referenciaId: id, despues: { fechaInicio, fechaFin: nuevo.fechaFin } });
  return exito(nuevo);
}
