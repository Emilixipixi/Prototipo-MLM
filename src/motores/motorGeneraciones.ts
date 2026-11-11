import type { CodigoRun } from '../tipos/reglas';
import { formatearNumero, redondear } from '../utilidades/formatos';
import type { Motor } from './tipos';
import {
  buscarCalificacion, configuracionMotor, crearBono, empresariosEvaluables, hijosUnilevel, indiceRun, parametroNumero, parametroTexto,
  totalesPorPersona,
} from './utilidadesMotor';

export const motorGeneraciones: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'generaciones');
  const rangoLider = parametroTexto(configuracion, 'rangoLider', 'RUN5K') as CodigoRun;
  const rangoMinimo = parametroTexto(configuracion, 'rangoMinimo', 'RUN30K') as CodigoRun;
  const porcentajes = [1, 2, 3].map((generacion) => parametroNumero(configuracion, `generacion${generacion}`));
  const totales = totalesPorPersona(entrada.movimientos);
  const hijos = hijosUnilevel(entrada.patrocinios);
  const esLider = (id: string) => indiceRun(buscarCalificacion(entrada.calificaciones, id)?.runCobro) >= indiceRun(rangoLider);

  return empresariosEvaluables(entrada.personas)
    .filter((persona) => esLider(persona.id))
    .map((persona) => {
      const bases = [0, 0, 0];
      const integrantes: string[][] = [[], [], []];
      const recorrer = (id: string, generacion: number) => {
        (hijos.get(id) ?? []).forEach((hijo) => {
          const siguiente = generacion + (esLider(hijo) ? 1 : 0);
          if (siguiente >= 1 && siguiente <= 3) {
            bases[siguiente - 1] += totales.get(hijo)?.vc ?? 0;
            integrantes[siguiente - 1].push(hijo);
          }
          if (siguiente <= 3) recorrer(hijo, siguiente);
        });
      };
      recorrer(persona.id, 0);
      const detalle = bases.map((base, indice) => ({
        etiqueta: `Generación ${indice + 1}`,
        base,
        porcentaje: porcentajes[indice],
        monto: redondear((base * porcentajes[indice]) / 100),
        fuente: integrantes[indice].join(', ') || 'Sin líderes en esta generación',
      }));
      const runCobro = buscarCalificacion(entrada.calificaciones, persona.id)?.runCobro ?? null;
      const califica = indiceRun(runCobro) >= indiceRun(rangoMinimo);
      return crearBono(entrada, 'generaciones', persona.id, {
        base: bases.reduce((suma, base) => suma + base, 0),
        regla: `${entrada.reglas.id}: hasta 3 generaciones de líderes ${rangoLider} o superior; requiere RUN de Cobro ${rangoMinimo}`,
        fuente: detalle.map((fila) => `${fila.etiqueta}: ${fila.fuente}`),
        calculo: detalle.map((fila) => `${fila.etiqueta} ${formatearNumero(fila.base)} x ${formatearNumero(fila.porcentaje)}% = ${formatearNumero(fila.monto, 2)}`).join('; '),
        monto: califica ? redondear(detalle.reduce((suma, fila) => suma + fila.monto, 0)) : 0,
        elegible: califica,
        motivosNoElegible: califica ? [] : [`Requiere RUN de Cobro ${rangoMinimo} o superior (valor ilustrativo); RUN de Cobro actual: ${runCobro ?? 'sin rango'}`],
        detalle,
      });
    });
};
