import type { BonoComision } from '../tipos/compensacion';
import type { CodigoRun } from '../tipos/reglas';
import { formatearNumero } from '../utilidades/formatos';
import type { Motor } from './tipos';
import { buscarCalificacion, configuracionMotor, crearBono, empresariosEvaluables, indiceRun, maximoRun, parametroNumero, parametroTexto } from './utilidadesMotor';

export const motorBonoRango: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'bono_rango');
  const mantenimiento = parametroNumero(configuracion, 'montoMantenimiento');
  const rangoMinimo = parametroTexto(configuracion, 'rangoMinimoMantenimiento', 'RUN5K') as CodigoRun;

  return empresariosEvaluables(entrada.personas).flatMap((persona): BonoComision[] => {
    const runCobro = buscarCalificacion(entrada.calificaciones, persona.id)?.runCobro ?? null;
    if (!runCobro) return [];
    const previo = entrada.historialPrevio.find((item) => item.personaId === persona.id);
    const anterior = entrada.calificacionesAnteriores.find((item) => item.personaId === persona.id);
    const historicoAntes = maximoRun(previo?.runHistoricoPrevio, anterior?.runHistorico);
    const cobroAnterior = anterior ? anterior.runCobro : previo?.runCobroCicloAnterior ?? null;
    const montoAscenso = parametroNumero(configuracion, `ascenso${runCobro}`);

    if (indiceRun(runCobro) > indiceRun(historicoAntes) && montoAscenso > 0) {
      return [crearBono(entrada, 'bono_rango', persona.id, {
        base: montoAscenso,
        regla: `${entrada.reglas.id}: monto fijo ilustrativo por primer logro de ${runCobro}`,
        fuente: [`RUN de Cobro ${runCobro}; RUN Histórico anterior ${historicoAntes ?? 'sin rango'}`],
        calculo: `Ascenso a ${runCobro} = ${formatearNumero(montoAscenso, 2)}`,
        monto: montoAscenso,
      })];
    }
    if (runCobro === cobroAnterior && indiceRun(runCobro) >= indiceRun(rangoMinimo)) {
      return [crearBono(entrada, 'bono_rango', persona.id, {
        base: mantenimiento,
        regla: `${entrada.reglas.id}: mantenimiento de RUN de Cobro ${rangoMinimo} o superior en 2 ciclos consecutivos`,
        fuente: [`RUN de Cobro ${runCobro} en este ciclo y en el ciclo anterior`],
        calculo: `Mantenimiento de ${runCobro} = ${formatearNumero(mantenimiento, 2)}`,
        monto: mantenimiento,
      })];
    }
    return [];
  });
};
