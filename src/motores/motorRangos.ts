import { ordenRuns } from '../datos/reglas';
import type { CalificacionRun, ResultadoRequisito } from '../tipos/calificacion';
import type { CodigoRun, DefinicionRango, RequisitoRango } from '../tipos/reglas';
import { formatearNumero, redondear } from '../utilidades/formatos';
import type { ContextoCalculo } from './tipos';
import {
  empresariosEvaluables, hijosUnilevel, indiceRun, maximoRun, produccionPorBrazo, totalesPorPersona, type ProduccionBrazo,
} from './utilidadesMotor';

interface Metricas {
  vpPersonal: number; vcPersonal: number; vpGrupal: number; vcGrupal: number;
  brazos: ProduccionBrazo[]; directosActivos: string[]; equilibrio: number; brazoMenor: string;
  lideres: string[]; formacionAprobada: boolean;
}

const RUN_LIDER: CodigoRun = 'RUN3K';

function evaluarRequisito(requisito: RequisitoRango, metricas: Metricas, periodoId: string): ResultadoRequisito {
  const base = { requisitoId: requisito.id, descripcion: requisito.descripcion, requerido: requisito.valor };
  switch (requisito.tipo) {
    case 'vp_grupal':
      return { ...base, logrado: metricas.vpGrupal, cumple: metricas.vpGrupal >= requisito.valor, fuente: `Movimientos de volumen ${periodoId}: VP personal ${formatearNumero(metricas.vpPersonal)} + brazos A, B y C ${formatearNumero(metricas.vpGrupal - metricas.vpPersonal)}` };
    case 'vc_grupal':
      return { ...base, logrado: metricas.vcGrupal, cumple: metricas.vcGrupal >= requisito.valor, fuente: `Movimientos de volumen ${periodoId} (VC)` };
    case 'vp_personal':
      return { ...base, logrado: metricas.vpPersonal, cumple: metricas.vpPersonal >= requisito.valor, fuente: `Movimientos personales ${periodoId} (incluye reversiones)` };
    case 'directos_activos':
      return { ...base, logrado: metricas.directosActivos.length, cumple: metricas.directosActivos.length >= requisito.valor, fuente: `Patrocinios directos con estado activo: ${metricas.directosActivos.join(', ') || 'ninguno'}` };
    case 'equilibrio_brazos':
      return { ...base, logrado: metricas.equilibrio, cumple: metricas.equilibrio >= requisito.valor, fuente: `Producción por brazo ${periodoId} (brazo menor: ${metricas.brazoMenor})` };
    case 'lideres_calificados':
      return { ...base, logrado: metricas.lideres.length, cumple: metricas.lideres.length >= requisito.valor, fuente: `Directos con RUN de Cobro ${RUN_LIDER} o superior en ${periodoId}: ${metricas.lideres.join(', ') || 'ninguno'}` };
    case 'formacion_aprobada':
      return { ...base, logrado: metricas.formacionAprobada ? 1 : 0, cumple: metricas.formacionAprobada, fuente: 'Estado formativo del LMS (dato de prueba)' };
    default:
      return { ...base, logrado: 0, cumple: false, fuente: 'Requisito no reconocido' };
  }
}

function evaluarRango(rango: DefinicionRango, metricas: Metricas, periodoId: string): ResultadoRequisito[] {
  return rango.requisitos.map((requisito) => evaluarRequisito(requisito, metricas, periodoId));
}

function profundidades(ids: string[], padres: Map<string, string | null>): Map<string, number> {
  const resultado = new Map<string, number>();
  ids.forEach((id) => {
    let profundidad = 0;
    let actual = padres.get(id) ?? null;
    const visitados = new Set<string>([id]);
    while (actual && !visitados.has(actual)) {
      visitados.add(actual);
      profundidad += 1;
      actual = padres.get(actual) ?? null;
    }
    resultado.set(id, profundidad);
  });
  return resultado;
}

export function calcularCalificaciones(contexto: ContextoCalculo): CalificacionRun[] {
  const { periodo, reglas, personas, patrocinios, posiciones, movimientos, formacion } = contexto;
  const empresarios = empresariosEvaluables(personas);
  const totales = totalesPorPersona(movimientos);
  const hijos = hijosUnilevel(patrocinios);
  const padres = new Map(patrocinios.map((relacion) => [relacion.personaId, relacion.patrocinadorId]));
  const profundidad = profundidades(empresarios.map((persona) => persona.id), padres);
  const ordenados = [...empresarios].sort((a, b) => (profundidad.get(b.id) ?? 0) - (profundidad.get(a.id) ?? 0));
  const rangos = [...reglas.rangos].sort((a, b) => a.orden - b.orden);
  const runCobroPorPersona = new Map<string, CodigoRun | null>();
  const resultados: CalificacionRun[] = [];

  ordenados.forEach((persona) => {
    const personal = totales.get(persona.id) ?? { vp: 0, vc: 0 };
    const produccion = produccionPorBrazo(persona.id, posiciones, totales);
    const sumaBrazosVp = produccion.reduce((suma, brazo) => suma + brazo.vp, 0);
    const sumaBrazosVc = produccion.reduce((suma, brazo) => suma + brazo.vc, 0);
    const menor = produccion.reduce((minimo, brazo) => (brazo.vp < minimo.vp ? brazo : minimo), produccion[0]);
    const directos = (hijos.get(persona.id) ?? []).filter((id) => {
      const directo = personas.find((item) => item.id === id);
      return directo?.tipo === 'empresario' && directo.estado === 'activo';
    });
    const lideres = (hijos.get(persona.id) ?? []).filter((id) => indiceRun(runCobroPorPersona.get(id)) >= indiceRun(RUN_LIDER));
    const metricas: Metricas = {
      vpPersonal: personal.vp, vcPersonal: personal.vc,
      vpGrupal: personal.vp + sumaBrazosVp, vcGrupal: personal.vc + sumaBrazosVc,
      brazos: produccion, directosActivos: directos,
      equilibrio: sumaBrazosVp > 0 ? redondear((menor.vp / sumaBrazosVp) * 100, 1) : 0,
      brazoMenor: menor.brazo, lideres,
      formacionAprobada: formacion.some((item) => item.personaId === persona.id && item.estado === 'aprobado'),
    };

    let runCobro: CodigoRun | null = null;
    let desglose: ResultadoRequisito[] = evaluarRango(rangos[0], metricas, periodo.id);
    for (const rango of rangos) {
      const evaluacion = evaluarRango(rango, metricas, periodo.id);
      if (!evaluacion.every((resultado) => resultado.cumple)) break;
      runCobro = rango.codigo;
      desglose = evaluacion;
    }
    runCobroPorPersona.set(persona.id, runCobro);

    const previo = contexto.historialPrevio.find((item) => item.personaId === persona.id);
    const anterior = contexto.calificacionesAnteriores.find((item) => item.personaId === persona.id);
    const runHistorico = maximoRun(previo?.runHistoricoPrevio, anterior?.runHistorico, runCobro);
    const cobroAnterior = anterior ? anterior.runCobro : previo?.runCobroCicloAnterior ?? null;
    const referencia = maximoRun(runCobro, cobroAnterior);
    const siguienteRun = ordenRuns[indiceRun(referencia) + 1] ?? null;
    const rangoSiguiente = rangos.find((rango) => rango.codigo === siguienteRun);

    resultados.push({
      id: `CAL-${periodo.id}-${persona.id}`,
      personaId: persona.id,
      periodoId: periodo.id,
      runCobro,
      runHistorico,
      desglose,
      siguienteRun,
      desgloseSiguiente: rangoSiguiente ? evaluarRango(rangoSiguiente, metricas, periodo.id) : [],
      vpPersonal: metricas.vpPersonal,
      vcPersonal: metricas.vcPersonal,
      vpGrupal: metricas.vpGrupal,
      vcGrupal: metricas.vcGrupal,
    });
  });

  return resultados.sort((a, b) => a.personaId.localeCompare(b.personaId));
}
