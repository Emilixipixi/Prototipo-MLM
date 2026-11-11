import { ejecutarCorrida } from '../motores/ejecutarCorrida';
import { useCompensacionStore } from '../store/useCompensacionStore';
import { usePeriodosStore } from '../store/usePeriodosStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { Ajuste, BonoComision, CorridaCalculo, EstadoLiquidacion, Liquidacion } from '../tipos/compensacion';
import type { VersionReglas } from '../tipos/reglas';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { redondear } from '../utilidades/formatos';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import {
  transicionesAjuste, transicionesCorrida, transicionesLiquidacion, transicionesPeriodo, validarTransicion,
} from '../validaciones/transiciones';
import { construirLiquidaciones } from './calculosCompensacion';
import { construirContexto } from './contexto';
import { obtenerFuente } from './fuente';
import { notificar, registrarBitacora } from './registro';

function actualizarCorrida(corridaId: string, transformar: (corrida: CorridaCalculo) => CorridaCalculo): void {
  const estado = useCompensacionStore.getState();
  estado.establecer({ corridas: estado.corridas.map((corrida) => (corrida.id === corridaId ? transformar(corrida) : corrida)) });
}

export interface OpcionesNuevaCorrida { reglasId?: string; reglasTemporales?: VersionReglas; }

export function crearCorrida(periodoId: string, actorId: string, opciones: OpcionesNuevaCorrida = {}): Resultado<CorridaCalculo> {
  const fuente = obtenerFuente();
  const periodo = fuente.periodos.find((item) => item.id === periodoId);
  if (!periodo) return fallo('Período no encontrado.');
  if (periodo.estado === 'cerrado' || periodo.estado === 'programado') return fallo(`El período ${periodoId} está ${periodo.estado}: solo se simulan períodos abiertos o en cierre.`);
  const reglas = opciones.reglasTemporales ?? fuente.versiones.find((version) => version.id === (opciones.reglasId ?? periodo.versionReglasId));
  if (!reglas) return fallo('Versión de reglas no encontrada.');
  const { corridas, establecer } = useCompensacionStore.getState();
  const numero = corridas.filter((corrida) => corrida.periodoId === periodoId).length + 1;
  const corridaId = `DEMO-CR-${periodoId.replace('DEMO-', '')}-${String(numero).padStart(2, '0')}`;
  const resultado = ejecutarCorrida(construirContexto(fuente, periodoId, { reglas }), {
    corridaId, creadaPor: actorId, fecha: fechaHoraActualIso(), parametrosTemporales: Boolean(opciones.reglasTemporales),
  });
  const corrida: CorridaCalculo = { ...resultado.corrida, reglasUsadas: reglas };
  establecer({ corridas: [...corridas, corrida] });
  registrarBitacora({ actorId, accion: 'Corrida de cálculo simulada', modulo: 'simulador', referenciaId: corridaId, despues: { periodoId, reglas: reglas.id, temporales: corrida.parametrosTemporales, movimientos: corrida.movimientoIds.length, clave: corrida.claveIdempotencia } });
  return exito(corrida);
}

export function reproducirCorrida(corridaId: string): Resultado<{ coincide: boolean; diferencias: string[] }> {
  const corrida = useCompensacionStore.getState().corridas.find((item) => item.id === corridaId);
  if (!corrida) return fallo('Corrida no encontrada.');
  const fuente = obtenerFuente();
  const reglas = corrida.reglasUsadas ?? fuente.versiones.find((version) => version.id === corrida.versionReglasId);
  const repetida = ejecutarCorrida(construirContexto(fuente, corrida.periodoId, { reglas, movimientoIds: corrida.movimientoIds }), {
    corridaId: corrida.id, creadaPor: corrida.creadaPor, fecha: corrida.fecha,
  });
  const montos = new Map(repetida.corrida.resultados.map((bono) => [bono.id, bono.monto]));
  const diferencias = corrida.resultados
    .filter((bono) => Math.abs((montos.get(bono.id) ?? 0) - bono.monto) >= 0.01)
    .map((bono) => `${bono.personaId} ${bono.motor}: ${bono.monto} frente a ${montos.get(bono.id) ?? 0}`);
  return exito({ coincide: diferencias.length === 0 && repetida.corrida.resultados.length === corrida.resultados.length, diferencias });
}

function cambiarEstadoCorrida(corridaId: string, hacia: CorridaCalculo['estado'], actorId: string, estadoBonos: (bono: BonoComision) => BonoComision['estado']): Resultado<CorridaCalculo> {
  const corrida = useCompensacionStore.getState().corridas.find((item) => item.id === corridaId);
  if (!corrida) return fallo('Corrida no encontrada.');
  const error = validarTransicion(transicionesCorrida, corrida.estado, hacia, 'la corrida');
  if (error) return fallo(error);
  const actualizada = { ...corrida, estado: hacia, resultados: corrida.resultados.map((bono) => ({ ...bono, estado: estadoBonos(bono) })) };
  actualizarCorrida(corridaId, () => actualizada);
  registrarBitacora({ actorId, accion: `Corrida ${hacia === 'en_revision' ? 'enviada a revisión' : hacia}`, modulo: 'liquidaciones', referenciaId: corridaId, antes: corrida.estado, despues: hacia });
  return exito(actualizada);
}

export function enviarCorridaARevision(corridaId: string, actorId: string): Resultado<CorridaCalculo> {
  return cambiarEstadoCorrida(corridaId, 'en_revision', actorId, (bono) => (bono.estado === 'estimada' ? 'en_revision' : bono.estado));
}

export function revisarPartida(corridaId: string, bonoId: string, accion: 'aprobar' | 'retener', actorId: string, motivo: string): Resultado<BonoComision> {
  const corrida = useCompensacionStore.getState().corridas.find((item) => item.id === corridaId);
  if (!corrida) return fallo('Corrida no encontrada.');
  if (corrida.estado !== 'en_revision') return fallo('Solo se revisan partidas de corridas en revisión.');
  const bono = corrida.resultados.find((item) => item.id === bonoId);
  if (!bono) return fallo('Partida no encontrada.');
  if (accion === 'retener' && motivo.trim().length < 10) return fallo('El motivo de la retención debe tener al menos 10 caracteres.');
  const hacia = accion === 'aprobar' ? 'aprobada' : 'retenida';
  const actualizado = { ...bono, estado: hacia } as BonoComision;
  actualizarCorrida(corridaId, (item) => ({ ...item, resultados: item.resultados.map((partida) => (partida.id === bonoId ? actualizado : partida)) }));
  registrarBitacora({ actorId, accion: accion === 'aprobar' ? 'Partida aprobada' : 'Partida retenida', modulo: 'liquidaciones', motivo, referenciaId: bonoId, antes: bono.estado, despues: hacia });
  return exito(actualizado);
}

export function aprobarCorrida(corridaId: string, actorId: string): Resultado<CorridaCalculo> {
  return cambiarEstadoCorrida(corridaId, 'aprobada', actorId, (bono) => (bono.estado === 'en_revision' ? 'aprobada' : bono.estado));
}

export function rechazarCorrida(corridaId: string, actorId: string): Resultado<CorridaCalculo> {
  return cambiarEstadoCorrida(corridaId, 'rechazada', actorId, (bono) => bono.estado);
}

export function generarLiquidaciones(corridaId: string, actorId: string): Resultado<{ liquidaciones: Liquidacion[]; yaExistian: boolean }> {
  const estado = useCompensacionStore.getState();
  const corrida = estado.corridas.find((item) => item.id === corridaId);
  if (!corrida) return fallo('Corrida no encontrada.');
  if (corrida.estado !== 'aprobada') return fallo('Solo una corrida aprobada puede generar liquidaciones.');
  const existentes = estado.liquidaciones.filter((liquidacion) => liquidacion.corridaId === corridaId);
  if (existentes.length > 0) {
    registrarBitacora({ actorId, accion: 'Reintento de generación de liquidaciones (sin duplicar)', modulo: 'liquidaciones', referenciaId: corridaId, motivo: `Clave de idempotencia ${corrida.claveIdempotencia}` });
    return exito({ liquidaciones: existentes, yaExistian: true });
  }
  const fecha = fechaHoraActualIso();
  const ajustesAplicables = estado.ajustes.filter((ajuste) => ajuste.periodoId === corrida.periodoId && ajuste.estado === 'autorizado');
  const nuevas = construirLiquidaciones(corrida, ajustesAplicables, usePersonasStore.getState().personas, { actorId, fecha });
  const aplicados = new Set(nuevas.flatMap((liquidacion) => liquidacion.ajustes));
  estado.establecer({
    liquidaciones: [...estado.liquidaciones.filter((liquidacion) => !nuevas.some((nueva) => nueva.id === liquidacion.id)), ...nuevas],
    ajustes: estado.ajustes.map((ajuste) => (aplicados.has(ajuste.id) ? { ...ajuste, estado: 'aplicado' } : ajuste)),
  });
  registrarBitacora({ actorId, accion: 'Liquidaciones generadas (simulado)', modulo: 'liquidaciones', referenciaId: corridaId, despues: { cantidad: nuevas.length, total: redondear(nuevas.reduce((suma, item) => suma + item.total, 0)), ajustesAplicados: [...aplicados] } });
  nuevas.forEach((liquidacion) => notificar({ personaId: liquidacion.personaId, tipo: 'liquidacion', titulo: 'Liquidación disponible', mensaje: `Tu liquidación del ${liquidacion.periodoId} está ${liquidacion.estado === 'retenida' ? 'retenida' : 'aprobada'}. Sin transferencia monetaria.` }));
  return exito({ liquidaciones: nuevas, yaExistian: false });
}

export function cambiarEstadoLiquidacion(liquidacionId: string, hacia: EstadoLiquidacion, actorId: string, motivo = ''): Resultado<Liquidacion> {
  const estado = useCompensacionStore.getState();
  const liquidacion = estado.liquidaciones.find((item) => item.id === liquidacionId);
  if (!liquidacion) return fallo('Liquidación no encontrada.');
  const error = validarTransicion(transicionesLiquidacion, liquidacion.estado, hacia, 'la liquidación');
  if (error) return fallo(error);
  if (hacia === 'retenida' && motivo.trim().length < 10) return fallo('El motivo de la retención debe tener al menos 10 caracteres.');
  if (hacia === 'aprobada' && liquidacion.estado === 'retenida') {
    const persona = usePersonasStore.getState().buscarPorId(liquidacion.personaId);
    if (persona && persona.estado !== 'activo') return fallo(`No se puede liberar: la cuenta ${persona.codigo} sigue ${persona.estado}.`);
  }
  const fecha = fechaHoraActualIso();
  const acciones: Record<EstadoLiquidacion, string> = {
    borrador: 'Borrador', en_revision: 'Enviada a revisión', aprobada: 'Aprobada', retenida: 'Pago retenido',
    apta_para_desembolso: 'Marcada como apta para desembolso', liquidada_simulada: 'Marcada como liquidada (simulado, sin transferencia)',
  };
  const actualizada: Liquidacion = {
    ...liquidacion,
    estado: hacia,
    comprobante: hacia === 'liquidada_simulada' ? `DEMO-CMP-LIQ-${liquidacion.periodoId.replace('DEMO-', '')}-${liquidacion.personaId.replace('DEMO-', '')}` : liquidacion.comprobante,
    motivoRetencion: hacia === 'retenida' ? motivo : hacia === 'aprobada' ? null : liquidacion.motivoRetencion,
    aprobaciones: [...liquidacion.aprobaciones, { actorId, fecha, accion: motivo ? `${acciones[hacia]}: ${motivo}` : acciones[hacia] }],
  };
  estado.establecer({
    liquidaciones: estado.liquidaciones.map((item) => (item.id === liquidacionId ? actualizada : item)),
    corridas: hacia !== 'liquidada_simulada' ? estado.corridas : estado.corridas.map((corrida) => (corrida.id !== liquidacion.corridaId ? corrida : {
      ...corrida,
      resultados: corrida.resultados.map((bono) => (bono.personaId === liquidacion.personaId && bono.estado === 'aprobada' ? { ...bono, estado: 'liquidada' } : bono)),
    })),
  });
  registrarBitacora({ actorId, accion: acciones[hacia], modulo: 'liquidaciones', motivo, referenciaId: liquidacionId, antes: liquidacion.estado, despues: hacia });
  if (hacia === 'liquidada_simulada' || hacia === 'retenida') {
    notificar({ personaId: liquidacion.personaId, tipo: 'liquidacion', titulo: hacia === 'retenida' ? 'Liquidación retenida' : 'Liquidación marcada como liquidada', mensaje: hacia === 'retenida' ? `Tu liquidación ${liquidacionId} quedó retenida: ${motivo}` : `Tu liquidación ${liquidacionId} figura como liquidada (simulado, sin transferencia).` });
  }
  return exito(actualizada);
}

export function iniciarCierre(periodoId: string, actorId: string): Resultado<undefined> {
  const { periodos, establecer } = usePeriodosStore.getState();
  const periodo = periodos.find((item) => item.id === periodoId);
  if (!periodo) return fallo('Período no encontrado.');
  const error = validarTransicion(transicionesPeriodo, periodo.estado, 'en_cierre', 'el período');
  if (error) return fallo(error);
  establecer({ periodos: periodos.map((item) => (item.id === periodoId ? { ...item, estado: 'en_cierre' } : item)) });
  registrarBitacora({ actorId, accion: 'Inicio de cierre de período', modulo: 'periodos', referenciaId: periodoId, antes: periodo.estado, despues: 'en_cierre' });
  return exito(undefined);
}

export function aprobarCierre(periodoId: string, actorId: string): Resultado<undefined> {
  const { periodos, establecer } = usePeriodosStore.getState();
  const periodo = periodos.find((item) => item.id === periodoId);
  if (!periodo) return fallo('Período no encontrado.');
  const error = validarTransicion(transicionesPeriodo, periodo.estado, 'cerrado', 'el período');
  if (error) return fallo(error);
  const compensacion = useCompensacionStore.getState();
  const corrida = compensacion.corridas.find((item) => item.periodoId === periodoId && item.estado === 'aprobada');
  if (!corrida) return fallo('Para cerrar el período debe existir una corrida aprobada.');
  const fuente = obtenerFuente();
  const contexto = construirContexto(fuente, periodoId, { reglas: corrida.reglasUsadas, movimientoIds: corrida.movimientoIds });
  const resultado = ejecutarCorrida(contexto, { corridaId: corrida.id, creadaPor: corrida.creadaPor, fecha: corrida.fecha });
  compensacion.establecer({
    calificacionesCerradas: [...compensacion.calificacionesCerradas.filter((item) => item.periodoId !== periodoId), ...resultado.calificaciones],
    saldosCerrados: [...compensacion.saldosCerrados.filter((item) => item.periodoId !== periodoId), ...resultado.saldos],
  });
  const siguiente = periodos.filter((item) => item.tipo === periodo.tipo && item.estado === 'programado').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];
  establecer({
    periodos: periodos.map((item) => {
      if (item.id === periodoId) return { ...item, estado: 'cerrado', versionReglasId: corrida.versionReglasId };
      if (siguiente && item.id === siguiente.id) return { ...item, estado: 'abierto' };
      return item;
    }),
  });
  registrarBitacora({ actorId, accion: 'Cierre de período aprobado', modulo: 'periodos', referenciaId: periodoId, antes: 'en_cierre', despues: { estado: 'cerrado', corrida: corrida.id, reglas: corrida.versionReglasId, siguienteAbierto: siguiente?.id ?? null } });
  notificar({ personaId: null, tipo: 'cierre', titulo: 'Cierre de período aprobado', mensaje: `El ${periodoId} quedó cerrado con la corrida ${corrida.id}.` });
  return exito(undefined);
}

export function proponerAjuste(datos: Omit<Ajuste, 'id' | 'estado' | 'autorizadoPor' | 'fecha'>): Resultado<Ajuste> {
  if (datos.motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  if (!datos.evidencia || datos.evidencia.trim().length === 0) return fallo('Adjunta una evidencia o soporte (simulado).');
  const estado = useCompensacionStore.getState();
  const ajuste: Ajuste = {
    ...datos,
    id: `DEMO-AJ-${String(estado.ajustes.length + 1).padStart(2, '0')}`,
    estado: 'propuesto', autorizadoPor: null, fecha: fechaHoraActualIso(),
  };
  estado.establecer({ ajustes: [...estado.ajustes, ajuste] });
  registrarBitacora({ actorId: datos.propuestoPor, accion: 'Ajuste propuesto', modulo: 'compliance', motivo: datos.motivo, referenciaId: ajuste.id, despues: { persona: ajuste.personaId, monto: ajuste.monto, evidencia: ajuste.evidencia } });
  return exito(ajuste);
}

export function resolverAjuste(ajusteId: string, decision: 'autorizado' | 'rechazado', actorId: string, motivo: string): Resultado<Ajuste> {
  const estado = useCompensacionStore.getState();
  const ajuste = estado.ajustes.find((item) => item.id === ajusteId);
  if (!ajuste) return fallo('Ajuste no encontrado.');
  const error = validarTransicion(transicionesAjuste, ajuste.estado, decision, 'el ajuste');
  if (error) return fallo(error);
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const actualizado: Ajuste = { ...ajuste, estado: decision, autorizadoPor: decision === 'autorizado' ? actorId : null };
  estado.establecer({ ajustes: estado.ajustes.map((item) => (item.id === ajusteId ? actualizado : item)) });
  registrarBitacora({ actorId, accion: decision === 'autorizado' ? 'Ajuste autorizado' : 'Ajuste rechazado', modulo: 'compliance', motivo, referenciaId: ajusteId, antes: ajuste.estado, despues: decision });
  return exito(actualizado);
}
