import { ejecutarCorrida } from '../motores/ejecutarCorrida';
import { evaluarElegibilidad } from '../motores/utilidadesMotor';
import type { Ajuste, BonoComision, CorridaCalculo, Liquidacion } from '../tipos/compensacion';
import type { Persona } from '../tipos/persona';
import { redondear } from '../utilidades/formatos';
import { construirContexto, type FuenteDatos } from './contexto';

export interface OpcionesAjusteDevolucion {
  pedidoId: string;
  periodoAplicacionId: string;
  propuestoPor: string;
  autorizadoPor: string | null;
  fecha: string;
  generarId: (indice: number) => string;
}

export function calcularAjustesPorDevolucion(fuente: FuenteDatos, corrida: CorridaCalculo, opciones: OpcionesAjusteDevolucion): Ajuste[] {
  const origenes = fuente.movimientos.filter((movimiento) => (
    movimiento.pedidoId === opciones.pedidoId && movimiento.tipo === 'origen' && corrida.movimientoIds.includes(movimiento.id)
  ));
  if (origenes.length === 0) return [];
  const reglas = fuente.versiones.find((version) => version.id === corrida.versionReglasId);
  const contexto = construirContexto(fuente, corrida.periodoId, {
    reglas, movimientoIds: corrida.movimientoIds, excluirMovimientoIds: origenes.map((movimiento) => movimiento.id),
  });
  const recalculo = ejecutarCorrida(contexto, { corridaId: `${corrida.id}-SIN-${opciones.pedidoId}`, creadaPor: opciones.propuestoPor, fecha: opciones.fecha });
  const clave = (bono: BonoComision) => `${bono.personaId}|${bono.motor}`;
  const originales = new Map(corrida.resultados.map((bono) => [clave(bono), bono]));
  const nuevos = new Map(recalculo.corrida.resultados.map((bono) => [clave(bono), bono]));
  const claves = new Set([...originales.keys(), ...nuevos.keys()]);
  const dueno = origenes[0].personaId;
  const vp = origenes.reduce((suma, movimiento) => suma + movimiento.vp, 0);
  const vc = origenes.reduce((suma, movimiento) => suma + movimiento.vc, 0);
  const ajustes: Ajuste[] = [];
  [...claves].sort().forEach((llave) => {
    const antes = originales.get(llave)?.monto ?? 0;
    const despues = nuevos.get(llave)?.monto ?? 0;
    const diferencia = redondear(despues - antes);
    if (Math.abs(diferencia) < 0.01) return;
    const [personaId, motor] = llave.split('|') as [string, BonoComision['motor']];
    ajustes.push({
      id: opciones.generarId(ajustes.length + 1),
      tipo: 'devolucion',
      personaId,
      periodoId: opciones.periodoAplicacionId,
      periodoAfectadoId: corrida.periodoId,
      motor,
      referenciaId: opciones.pedidoId,
      monto: diferencia,
      vp: personaId === dueno ? -vp : 0,
      vc: personaId === dueno ? -vc : 0,
      motivo: `Ajuste por devolución del pedido ${opciones.pedidoId}: recálculo de ${motor} en ${corrida.periodoId} sin el volumen devuelto. El cierre de ${corrida.periodoId} no se modifica.`,
      evidencia: `Registro de devolución del pedido ${opciones.pedidoId}`,
      estado: opciones.autorizadoPor ? 'autorizado' : 'propuesto',
      propuestoPor: opciones.propuestoPor,
      autorizadoPor: opciones.autorizadoPor,
      fecha: opciones.fecha,
    });
  });
  return ajustes;
}

export interface OpcionesLiquidacion {
  actorId: string;
  fecha: string;
}

export function construirLiquidaciones(corrida: CorridaCalculo, ajustes: Ajuste[], personas: Persona[], opciones: OpcionesLiquidacion): Liquidacion[] {
  const porPersona = new Map<string, BonoComision[]>();
  corrida.resultados.forEach((bono) => porPersona.set(bono.personaId, [...(porPersona.get(bono.personaId) ?? []), bono]));
  ajustes
    .filter((ajuste) => ajuste.periodoId === corrida.periodoId && ajuste.estado === 'autorizado' && !porPersona.has(ajuste.personaId))
    .forEach((ajuste) => porPersona.set(ajuste.personaId, []));

  return [...porPersona.entries()].flatMap(([personaId, bonos]): Liquidacion[] => {
    const conceptos = bonos.filter((bono) => bono.monto > 0).map((bono) => ({ motor: bono.motor, monto: bono.monto }));
    const ajustesPersona = ajustes.filter((ajuste) => ajuste.personaId === personaId && ajuste.periodoId === corrida.periodoId && ajuste.estado === 'autorizado');
    const total = redondear(conceptos.reduce((suma, concepto) => suma + concepto.monto, 0) + ajustesPersona.reduce((suma, ajuste) => suma + ajuste.monto, 0));
    if (conceptos.length === 0 && ajustesPersona.length === 0) return [];
    const persona = personas.find((item) => item.id === personaId);
    const elegibilidad = evaluarElegibilidad(persona);
    const retenida = elegibilidad.retener || bonos.some((bono) => bono.estado === 'retenida');
    return [{
      id: `DEMO-LIQ-${corrida.periodoId.replace('DEMO-', '')}-${personaId.replace('DEMO-', '')}`,
      personaId,
      periodoId: corrida.periodoId,
      corridaId: corrida.id,
      conceptos,
      ajustes: ajustesPersona.map((ajuste) => ajuste.id),
      total,
      moneda: persona?.moneda ?? 'USD',
      estado: retenida ? 'retenida' : 'aprobada',
      aprobaciones: [{ actorId: opciones.actorId, fecha: opciones.fecha, accion: 'Liquidación generada desde la corrida aprobada' }],
      comprobante: null,
      motivoRetencion: retenida ? elegibilidad.motivos.join('. ') || 'Partida retenida en la revisión' : null,
    }];
  });
}
