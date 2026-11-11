import type { BonoComision } from '../tipos/compensacion';
import { formatearNumero, redondear } from '../utilidades/formatos';
import type { Motor } from './tipos';
import { configuracionMotor, crearBono, parametroNumero } from './utilidadesMotor';

export const motorPatrocinioActivacion: Motor = (entrada) => {
  const configuracion = configuracionMotor(entrada.reglas, 'patrocinio_activacion');
  const porcentaje = parametroNumero(configuracion, 'porcentaje');
  const { fechaInicio, fechaFin } = entrada.periodo;
  const enPeriodo = (fecha: string) => fecha.slice(0, 10) >= fechaInicio && fecha.slice(0, 10) <= fechaFin;
  const nuevos = entrada.patrocinios.filter((relacion) => relacion.patrocinadorId && enPeriodo(relacion.fechaRelacion));
  const porPatrocinador = new Map<string, typeof nuevos>();
  nuevos.forEach((relacion) => {
    const directo = entrada.personas.find((persona) => persona.id === relacion.personaId);
    if (directo?.tipo !== 'empresario') return;
    porPatrocinador.set(relacion.patrocinadorId!, [...(porPatrocinador.get(relacion.patrocinadorId!) ?? []), relacion]);
  });

  return [...porPatrocinador.entries()].map(([patrocinadorId, relaciones]): BonoComision => {
    const detalle = relaciones.map((relacion) => {
      const primerPedido = entrada.pedidos
        .filter((pedido) => pedido.compradorId === relacion.personaId && (pedido.estado === 'confirmada' || pedido.estado === 'devuelta'))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
      const activo = primerPedido && enPeriodo(primerPedido.fecha);
      const base = activo ? primerPedido.totalVc : 0;
      return {
        etiqueta: relacion.personaId,
        base,
        porcentaje,
        monto: redondear((base * porcentaje) / 100),
        fuente: activo
          ? `Primer pedido confirmado ${primerPedido.id} (${formatearNumero(primerPedido.totalVc)} VC)`
          : 'Alta sin pedido confirmado en el ciclo: el alta aislada no genera bono',
      };
    });
    const base = detalle.reduce((suma, fila) => suma + fila.base, 0);
    const monto = redondear(detalle.reduce((suma, fila) => suma + fila.monto, 0));
    return crearBono(entrada, 'patrocinio_activacion', patrocinadorId, {
      base,
      regla: `${entrada.reglas.id}: ${formatearNumero(porcentaje)}% sobre el VC del primer pedido confirmado de cada nuevo directo`,
      fuente: detalle.map((fila) => `${fila.etiqueta}: ${fila.fuente}`),
      calculo: detalle.map((fila) => `${fila.etiqueta}: ${formatearNumero(fila.base)} x ${formatearNumero(porcentaje)}% = ${formatearNumero(fila.monto, 2)}`).join('; '),
      monto,
      detalle,
    });
  });
};
