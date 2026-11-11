import type { CodigoRun } from '../tipos/reglas';
import { formatearNumero, redondear } from '../utilidades/formatos';
import type { Motor } from './tipos';
import { buscarCalificacion, configuracionMotor, crearBono, empresariosEvaluables, evaluarElegibilidad, indiceRun, parametroNumero, parametroTexto } from './utilidadesMotor';

export const motorFondoLiderazgo: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'fondo_liderazgo');
  const porcentaje = parametroNumero(configuracion, 'porcentajeBolsa');
  const rangoMinimo = parametroTexto(configuracion, 'rangoMinimo', 'RUN10K') as CodigoRun;
  const vcTotal = entrada.movimientos.reduce((suma, movimiento) => suma + movimiento.vc, 0);
  const bolsa = redondear((vcTotal * porcentaje) / 100);
  const participantes = empresariosEvaluables(entrada.personas).filter((persona) => (
    indiceRun(buscarCalificacion(entrada.calificaciones, persona.id)?.runCobro) >= indiceRun(rangoMinimo)
    && evaluarElegibilidad(persona).elegible
  ));
  if (participantes.length === 0) return [];
  const parte = redondear(bolsa / participantes.length);
  return participantes.map((persona) => crearBono(entrada, 'fondo_liderazgo', persona.id, {
    base: bolsa,
    regla: `${entrada.reglas.id}: bolsa de ${formatearNumero(porcentaje)}% del VC total del ciclo, repartida entre RUN de Cobro ${rangoMinimo} o superior`,
    fuente: [`VC total de la compañía en ${entrada.periodo.id}: ${formatearNumero(vcTotal)}`, `Participantes: ${participantes.map((item) => item.id).join(', ')}`],
    calculo: `Bolsa ${formatearNumero(vcTotal)} x ${formatearNumero(porcentaje)}% = ${formatearNumero(bolsa, 2)}; ${formatearNumero(bolsa, 2)} / ${participantes.length} = ${formatearNumero(parte, 2)}`,
    monto: parte,
  }));
};
