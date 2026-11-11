import { formatearNumero, redondear } from '../utilidades/formatos';
import type { Motor } from './tipos';
import { configuracionMotor, crearBono, empresariosEvaluables, parametroNumero, totalesPorPersona } from './utilidadesMotor';

export const motorActividadComercial: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'actividad_comercial');
  const porcentaje = parametroNumero(configuracion, 'porcentaje');
  const minimo = parametroNumero(configuracion, 'vpPersonalMinimo');
  const totales = totalesPorPersona(entrada.movimientos);
  return empresariosEvaluables(entrada.personas)
    .filter((persona) => (totales.get(persona.id)?.vp ?? 0) !== 0 || (totales.get(persona.id)?.vc ?? 0) !== 0)
    .map((persona) => {
      const total = totales.get(persona.id)!;
      const cumpleMinimo = total.vp >= minimo;
      const monto = redondear((Math.max(0, total.vc) * porcentaje) / 100);
      const movimientos = entrada.movimientos.filter((movimiento) => movimiento.personaId === persona.id);
      return crearBono(entrada, 'actividad_comercial', persona.id, {
        base: total.vc,
        regla: `${entrada.reglas.id}: ${formatearNumero(porcentaje)}% sobre el VC personal; VP personal mínimo ${formatearNumero(minimo)}`,
        fuente: movimientos.map((movimiento) => `${movimiento.id} (${movimiento.pedidoId ?? 'ajuste'}): ${formatearNumero(movimiento.vp)} VP / ${formatearNumero(movimiento.vc)} VC`),
        calculo: `VC personal ${formatearNumero(total.vc)} x ${formatearNumero(porcentaje)}% = ${formatearNumero(monto, 2)}`,
        monto: cumpleMinimo ? monto : 0,
        elegible: cumpleMinimo,
        motivosNoElegible: cumpleMinimo ? [] : [`VP personal ${formatearNumero(total.vp)} menor al mínimo de ${formatearNumero(minimo)}`],
      });
    });
};
