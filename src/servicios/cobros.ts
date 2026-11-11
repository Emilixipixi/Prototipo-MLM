import { MONTO_MINIMO_RETIRO } from '../datos/cobros';
import { useCobrosStore } from '../store/useCobrosStore';
import { useCompensacionStore } from '../store/useCompensacionStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { DatosCobro, MetodoCobro, SolicitudRetiro } from '../tipos/cobros';
import type { Liquidacion } from '../tipos/compensacion';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { redondear } from '../utilidades/formatos';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { cambiarEstadoLiquidacion } from './compensacion';
import { notificar, registrarBitacora } from './registro';

export interface EntradaDatosCobro {
  metodo: MetodoCobro; titular: string; documentoTitular: string; entidad: string;
  tipoCuenta: 'ahorros' | 'corriente' | null; numeroCuenta: string;
}

export function describirDestino(datos: DatosCobro): string {
  return datos.metodo === 'transferencia'
    ? `${datos.entidad} · cuenta ${datos.tipoCuenta ?? ''} terminada en ${datos.ultimosDigitos}`.replace('  ', ' ')
    : `${datos.entidad} · billetera terminada en ${datos.ultimosDigitos}`;
}

export function guardarDatosCobro(personaId: string, entrada: EntradaDatosCobro): Resultado<DatosCobro> {
  if (entrada.titular.trim().length < 5) return fallo('Ingresa el nombre completo del titular.');
  if (entrada.documentoTitular.trim().length < 5) return fallo('Ingresa el documento del titular.');
  if (entrada.entidad.trim().length < 3) return fallo(entrada.metodo === 'transferencia' ? 'Ingresa el banco.' : 'Ingresa el proveedor de la billetera.');
  if (entrada.metodo === 'transferencia' && !entrada.tipoCuenta) return fallo('Elige el tipo de cuenta.');
  const digitos = entrada.numeroCuenta.replace(/\D/g, '');
  if (digitos.length < 8 || digitos.length > 20) return fallo(entrada.metodo === 'transferencia' ? 'El número de cuenta debe tener entre 8 y 20 dígitos.' : 'El número de la billetera debe tener entre 8 y 20 dígitos.');
  const persona = usePersonasStore.getState().buscarPorId(personaId);
  if (!persona) return fallo('Persona no encontrada.');
  const { datos, establecer } = useCobrosStore.getState();
  const anterior = datos.find((item) => item.personaId === personaId);
  const nuevos: DatosCobro = {
    personaId, metodo: entrada.metodo, titular: entrada.titular.trim(), documentoTitular: entrada.documentoTitular.trim(), entidad: entrada.entidad.trim(),
    tipoCuenta: entrada.metodo === 'transferencia' ? entrada.tipoCuenta : null, ultimosDigitos: digitos.slice(-4), moneda: persona.moneda,
    estado: 'pendiente_verificacion', observacion: null, fechaActualizacion: fechaHoraActualIso(),
  };
  establecer({ datos: [...datos.filter((item) => item.personaId !== personaId), nuevos] });
  registrarBitacora({ actorId: personaId, accion: anterior ? 'Actualización de datos de cobro' : 'Registro de datos de cobro', modulo: 'liquidaciones', referenciaId: personaId, antes: anterior ? describirDestino(anterior) : null, despues: describirDestino(nuevos) });
  notificar({ personaId: null, tipo: 'liquidacion', titulo: 'Datos de cobro por verificar', mensaje: `${persona.codigo} registró datos de cobro (${describirDestino(nuevos)}).` });
  return exito(nuevos);
}

export function verificarDatosCobro(personaId: string, decision: 'verificado' | 'rechazado', actorId: string, observacion: string): Resultado<DatosCobro> {
  const { datos, establecer } = useCobrosStore.getState();
  const actuales = datos.find((item) => item.personaId === personaId);
  if (!actuales) return fallo('La persona no tiene datos de cobro.');
  if (decision === 'rechazado' && observacion.trim().length < 10) return fallo('Explica el rechazo en al menos 10 caracteres.');
  const actualizados: DatosCobro = { ...actuales, estado: decision, observacion: observacion.trim() || null };
  establecer({ datos: datos.map((item) => (item.personaId === personaId ? actualizados : item)) });
  registrarBitacora({ actorId, accion: decision === 'verificado' ? 'Datos de cobro verificados' : 'Datos de cobro rechazados', modulo: 'liquidaciones', referenciaId: personaId, motivo: observacion, antes: actuales.estado, despues: decision });
  notificar({ personaId, tipo: 'liquidacion', titulo: decision === 'verificado' ? 'Datos de cobro verificados' : 'Datos de cobro rechazados', mensaje: decision === 'verificado' ? 'Ya puedes solicitar retiros de tus liquidaciones disponibles.' : `Revisa tus datos de cobro: ${observacion}` });
  return exito(actualizados);
}

export function liquidacionesDisponibles(personaId: string, liquidaciones: Liquidacion[], solicitudes: SolicitudRetiro[]): Liquidacion[] {
  const comprometidas = new Set(solicitudes.filter((solicitud) => solicitud.estado === 'solicitada' || solicitud.estado === 'aprobada').flatMap((solicitud) => solicitud.liquidacionIds));
  return liquidaciones.filter((liquidacion) => liquidacion.personaId === personaId && liquidacion.estado === 'apta_para_desembolso' && !comprometidas.has(liquidacion.id));
}

export function solicitarRetiro(personaId: string): Resultado<SolicitudRetiro> {
  const persona = usePersonasStore.getState().buscarPorId(personaId);
  if (!persona) return fallo('Persona no encontrada.');
  if (persona.estado !== 'activo') return fallo(`Tu cuenta está ${persona.estado}: los retiros quedan en pausa mientras se revisa.`);
  const { datos, solicitudes, establecer } = useCobrosStore.getState();
  const destino = datos.find((item) => item.personaId === personaId);
  if (!destino) return fallo('Registra primero tus datos de cobro.');
  if (destino.estado !== 'verificado') return fallo('Tus datos de cobro aún no están verificados por corporativo.');
  const disponibles = liquidacionesDisponibles(personaId, useCompensacionStore.getState().liquidaciones, solicitudes);
  const monto = redondear(disponibles.reduce((suma, liquidacion) => suma + liquidacion.total, 0));
  if (monto < MONTO_MINIMO_RETIRO) return fallo(`El saldo disponible (USD ${monto.toFixed(2)}) es menor al mínimo de retiro de USD ${MONTO_MINIMO_RETIRO}.`);
  const numeros = solicitudes.map((solicitud) => Number(solicitud.id.replace('DEMO-RET-', '')));
  const fecha = fechaHoraActualIso();
  const solicitud: SolicitudRetiro = {
    id: `DEMO-RET-${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`, personaId, liquidacionIds: disponibles.map((liquidacion) => liquidacion.id),
    monto, moneda: 'USD', estado: 'solicitada', fechaSolicitud: fecha, destino: describirDestino(destino),
    historial: [{ fecha, actorId: personaId, accion: 'Solicitud de retiro creada' }], motivoRechazo: null, comprobante: null,
  };
  establecer({ solicitudes: [...solicitudes, solicitud] });
  registrarBitacora({ actorId: personaId, accion: 'Solicitud de retiro', modulo: 'liquidaciones', referenciaId: solicitud.id, despues: { monto, liquidaciones: solicitud.liquidacionIds, destino: solicitud.destino } });
  notificar({ personaId: null, tipo: 'liquidacion', titulo: 'Nueva solicitud de retiro', mensaje: `${persona.codigo} solicitó un retiro de USD ${monto.toFixed(2)}.` });
  return exito(solicitud);
}

function actualizarSolicitud(solicitudId: string, cambios: (solicitud: SolicitudRetiro, fecha: string) => SolicitudRetiro): SolicitudRetiro | null {
  const { solicitudes, establecer } = useCobrosStore.getState();
  const actual = solicitudes.find((item) => item.id === solicitudId);
  if (!actual) return null;
  const nueva = cambios(actual, fechaHoraActualIso());
  establecer({ solicitudes: solicitudes.map((item) => (item.id === solicitudId ? nueva : item)) });
  return nueva;
}

export function resolverRetiro(solicitudId: string, decision: 'aprobada' | 'rechazada', actorId: string, motivo: string): Resultado<SolicitudRetiro> {
  const actual = useCobrosStore.getState().solicitudes.find((item) => item.id === solicitudId);
  if (!actual) return fallo('Solicitud no encontrada.');
  if (actual.estado !== 'solicitada') return fallo(`La solicitud ya está ${actual.estado.replace('_', ' ')}.`);
  if (decision === 'rechazada' && motivo.trim().length < 10) return fallo('Explica el rechazo en al menos 10 caracteres.');
  if (decision === 'aprobada') {
    const persona = usePersonasStore.getState().buscarPorId(actual.personaId);
    if (persona && persona.estado !== 'activo') return fallo(`No se puede aprobar: la cuenta ${persona.codigo} está ${persona.estado}.`);
  }
  const nueva = actualizarSolicitud(solicitudId, (solicitud, fecha) => ({
    ...solicitud, estado: decision, motivoRechazo: decision === 'rechazada' ? motivo.trim() : null,
    historial: [...solicitud.historial, { fecha, actorId, accion: decision === 'aprobada' ? 'Retiro aprobado' : `Retiro rechazado: ${motivo.trim()}` }],
  }))!;
  registrarBitacora({ actorId, accion: decision === 'aprobada' ? 'Retiro aprobado' : 'Retiro rechazado', modulo: 'liquidaciones', referenciaId: solicitudId, motivo, antes: 'solicitada', despues: decision });
  notificar({ personaId: actual.personaId, tipo: 'liquidacion', titulo: decision === 'aprobada' ? 'Retiro aprobado' : 'Retiro rechazado', mensaje: decision === 'aprobada' ? `Tu retiro ${solicitudId} fue aprobado y está en proceso de pago (simulado).` : `Tu retiro ${solicitudId} fue rechazado: ${motivo.trim()}. El saldo vuelve a estar disponible.` });
  return exito(nueva);
}

export function pagarRetiro(solicitudId: string, actorId: string): Resultado<SolicitudRetiro> {
  const actual = useCobrosStore.getState().solicitudes.find((item) => item.id === solicitudId);
  if (!actual) return fallo('Solicitud no encontrada.');
  if (actual.estado !== 'aprobada') return fallo('Solo se pagan solicitudes aprobadas.');
  const liquidaciones = useCompensacionStore.getState().liquidaciones;
  for (const id of actual.liquidacionIds) {
    const liquidacion = liquidaciones.find((item) => item.id === id);
    if (liquidacion && liquidacion.estado === 'apta_para_desembolso') {
      const resultado = cambiarEstadoLiquidacion(id, 'liquidada_simulada', actorId, `Pagada con el retiro ${solicitudId}`);
      if (!resultado.ok) return fallo(resultado.error);
    }
  }
  const comprobante = `DEMO-CMP-${solicitudId.replace('DEMO-', '')}`;
  const nueva = actualizarSolicitud(solicitudId, (solicitud, fecha) => ({
    ...solicitud, estado: 'pagada_simulada', comprobante,
    historial: [...solicitud.historial, { fecha, actorId, accion: 'Pago registrado (simulado, sin transferencia)' }],
  }))!;
  registrarBitacora({ actorId, accion: 'Retiro pagado (simulado)', modulo: 'liquidaciones', referenciaId: solicitudId, antes: 'aprobada', despues: { estado: 'pagada_simulada', comprobante, liquidaciones: actual.liquidacionIds } });
  notificar({ personaId: actual.personaId, tipo: 'liquidacion', titulo: 'Retiro pagado (simulado)', mensaje: `Tu retiro ${solicitudId} figura como pagado. Comprobante ${comprobante}. Sin transferencia monetaria.` });
  return exito(nueva);
}
