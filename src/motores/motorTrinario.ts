import type { SaldoBrazo } from '../tipos/calificacion';
import type { BonoComision } from '../tipos/compensacion';
import { formatearNumero, redondear } from '../utilidades/formatos';
import type { ContextoCalculo, Motor } from './tipos';
import {
  brazos, configuracionMotor, crearBono, empresariosEvaluables, parametroNumero, posicionesActivas, produccionPorBrazo, totalesPorPersona,
} from './utilidadesMotor';

export function calcularSaldosBrazos(contexto: ContextoCalculo): SaldoBrazo[] {
  const totales = totalesPorPersona(contexto.movimientos);
  const conPosicion = new Set(posicionesActivas(contexto.posiciones).map((posicion) => posicion.personaId));
  return empresariosEvaluables(contexto.personas)
    .filter((persona) => conPosicion.has(persona.id))
    .flatMap((persona) => {
      const produccion = produccionPorBrazo(persona.id, contexto.posiciones, totales);
      const utilizado = Math.max(0, Math.min(...produccion.map((brazo) => brazo.vp)));
      return produccion.map((brazo) => {
        const anterior = contexto.saldosAnteriores.find((saldo) => saldo.personaId === persona.id && saldo.brazo === brazo.brazo);
        const previo = contexto.remanentesPrevios.find((saldo) => saldo.personaId === persona.id && saldo.brazo === brazo.brazo);
        const remanenteAnterior = anterior ? anterior.acumulado : previo?.remanente ?? 0;
        const caducado = previo && previo.caducaEnPeriodoId === contexto.periodo.id ? previo.montoQueCaduca : 0;
        const restante = brazo.vp - utilizado;
        return {
          personaId: persona.id,
          periodoId: contexto.periodo.id,
          brazo: brazo.brazo,
          generadoVp: brazo.vp,
          generadoVc: brazo.vc,
          utilizado,
          restante,
          remanenteAnterior,
          caducado,
          acumulado: remanenteAnterior + restante - caducado,
        };
      });
    });
}

export const motorTrinario: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'trinario');
  const porcentaje = parametroNumero(configuracion, 'porcentaje');
  const tope = parametroNumero(configuracion, 'topePorCiclo');
  const personasConSaldo = [...new Set(entrada.saldos.map((saldo) => saldo.personaId))];
  return personasConSaldo.flatMap((personaId): BonoComision[] => {
    const saldos = brazos.map((brazo) => entrada.saldos.find((saldo) => saldo.personaId === personaId && saldo.brazo === brazo)!);
    const generadoTotal = saldos.reduce((suma, saldo) => suma + saldo.generadoVp, 0);
    if (generadoTotal === 0) return [];
    const detalle = saldos.map((saldo) => {
      const proporcion = saldo.generadoVp > 0 ? saldo.generadoVc / saldo.generadoVp : 0;
      const baseVc = redondear(saldo.utilizado * proporcion);
      return {
        etiqueta: `Brazo ${saldo.brazo}`,
        base: baseVc,
        porcentaje,
        monto: redondear((baseVc * porcentaje) / 100),
        fuente: `Utilizado ${formatearNumero(saldo.utilizado)} VP de ${formatearNumero(saldo.generadoVp)} VP generados (VC ${formatearNumero(saldo.generadoVc)})`,
      };
    });
    const base = redondear(detalle.reduce((suma, fila) => suma + fila.base, 0));
    const bruto = redondear((base * porcentaje) / 100);
    const monto = Math.min(bruto, tope);
    const sinProduccion = saldos.some((saldo) => saldo.generadoVp === 0);
    return [crearBono(entrada, 'trinario', personaId, {
      base,
      regla: `${entrada.reglas.id}: ${entrada.reglas.trinario.reglaConsumo} ${formatearNumero(porcentaje)}% sobre el VC equivalente, tope ${formatearNumero(tope)} por ciclo`,
      fuente: saldos.map((saldo) => `Brazo ${saldo.brazo}: ${formatearNumero(saldo.generadoVp)} VP / ${formatearNumero(saldo.generadoVc)} VC`),
      calculo: sinProduccion
        ? 'Al menos un brazo no tiene producción en el ciclo: el volumen utilizado es 0.'
        : `VC equivalente utilizado ${formatearNumero(base, 2)} x ${formatearNumero(porcentaje)}% = ${formatearNumero(bruto, 2)}${bruto > tope ? `; se aplica el tope de ${formatearNumero(tope, 2)}` : ''}`,
      monto: sinProduccion ? 0 : monto,
      detalle,
    })];
  });
};
