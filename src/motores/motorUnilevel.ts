import type { CodigoRun } from '../tipos/reglas';
import { formatearNumero, redondear } from '../utilidades/formatos';
import type { Motor } from './tipos';
import {
  buscarCalificacion, configuracionMotor, crearBono, empresariosEvaluables, hijosUnilevel, indiceRun, nivelesUnilevel,
  parametroNumero, totalesPorPersona,
} from './utilidadesMotor';

const clavesNiveles: Array<[CodigoRun | null, string]> = [
  ['RUN10K', 'nivelesRUN10K'], ['RUN5K', 'nivelesRUN5K'], ['RUN3K', 'nivelesRUN3K'], ['RUN1K', 'nivelesRUN1K'], ['RUN300', 'nivelesRUN300'],
];

export const motorUnilevel: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'unilevel');
  const profundidad = Math.min(7, Math.max(1, parametroNumero(configuracion, 'profundidadMaxima', 7)));
  const minimo = parametroNumero(configuracion, 'vpPersonalMinimo');
  const totales = totalesPorPersona(entrada.movimientos);
  const hijos = hijosUnilevel(entrada.patrocinios);

  return empresariosEvaluables(entrada.personas)
    .filter((persona) => (hijos.get(persona.id) ?? []).length > 0)
    .map((persona) => {
      const calificacion = buscarCalificacion(entrada.calificaciones, persona.id);
      const runCobro = calificacion?.runCobro ?? null;
      const clave = clavesNiveles.find(([run]) => indiceRun(runCobro) >= indiceRun(run))?.[1] ?? 'nivelesSinRango';
      const habilitados = Math.min(profundidad, parametroNumero(configuracion, clave));
      const niveles = nivelesUnilevel(persona.id, hijos, profundidad);
      const detalle = niveles.map((ids, indice) => {
        const nivel = indice + 1;
        const base = ids.reduce((suma, id) => suma + (totales.get(id)?.vc ?? 0), 0);
        const porcentaje = nivel <= habilitados ? parametroNumero(configuracion, `nivel${nivel}`) : 0;
        return {
          etiqueta: `Nivel ${nivel}`,
          base,
          porcentaje,
          monto: redondear((base * porcentaje) / 100),
          fuente: nivel <= habilitados
            ? (ids.length > 0 ? ids.join(', ') : 'Sin personas en este nivel')
            : `Nivel no habilitado por RUN de Cobro ${runCobro ?? 'sin rango'}`,
        };
      });
      const vpPersonal = totales.get(persona.id)?.vp ?? 0;
      const cumpleMinimo = vpPersonal >= minimo;
      const monto = redondear(detalle.reduce((suma, fila) => suma + fila.monto, 0));
      return crearBono(entrada, 'unilevel', persona.id, {
        base: detalle.reduce((suma, fila) => suma + fila.base, 0),
        regla: `${entrada.reglas.id}: porcentajes por nivel sobre VC personal; ${habilitados} de ${profundidad} niveles habilitados con ${runCobro ?? 'sin rango'}`,
        fuente: detalle.filter((fila) => fila.base > 0).map((fila) => `${fila.etiqueta}: ${fila.fuente}`),
        calculo: detalle.filter((fila) => fila.porcentaje > 0).map((fila) => `${fila.etiqueta} ${formatearNumero(fila.base)} x ${formatearNumero(fila.porcentaje, fila.porcentaje % 1 ? 1 : 0)}% = ${formatearNumero(fila.monto, 2)}`).join('; ') || 'Sin niveles habilitados',
        monto: cumpleMinimo ? monto : 0,
        elegible: cumpleMinimo,
        motivosNoElegible: cumpleMinimo ? [] : [`VP personal ${formatearNumero(vpPersonal)} menor al mínimo de ${formatearNumero(minimo)}`],
        detalle,
      });
    });
};
