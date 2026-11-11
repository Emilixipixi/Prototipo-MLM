import { useCompensacionStore } from '../store/useCompensacionStore';
import { usePersonasStore } from '../store/usePersonasStore';
import type { EstadoCuenta, Persona } from '../tipos/persona';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { transicionesCuenta, validarTransicion } from '../validaciones/transiciones';
import { notificar, registrarBitacora } from './registro';

export function cambiarEstadoCuenta(personaId: string, nuevoEstado: EstadoCuenta, actorId: string, motivo: string): Resultado<Persona> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { buscarPorId, actualizar } = usePersonasStore.getState();
  const persona = buscarPorId(personaId);
  if (!persona) return fallo('Persona no encontrada.');
  const error = validarTransicion(transicionesCuenta, persona.estado, nuevoEstado, 'la cuenta');
  if (error) return fallo(error);
  actualizar(personaId, { estado: nuevoEstado });
  const retener = nuevoEstado === 'suspendido' || nuevoEstado === 'bloqueado';
  const compensacion = useCompensacionStore.getState();
  const fecha = fechaHoraActualIso();
  compensacion.establecer({
    liquidaciones: compensacion.liquidaciones.map((liquidacion) => {
      if (liquidacion.personaId !== personaId) return liquidacion;
      if (retener && ['en_revision', 'aprobada', 'apta_para_desembolso'].includes(liquidacion.estado)) {
        return { ...liquidacion, estado: 'retenida', motivoRetencion: motivo, aprobaciones: [...liquidacion.aprobaciones, { actorId, fecha, accion: `Pago retenido por cuenta ${nuevoEstado}` }] };
      }
      return liquidacion;
    }),
  });
  registrarBitacora({ actorId, accion: 'Cambio de estado de cuenta', modulo: 'compliance', motivo, referenciaId: personaId, antes: persona.estado, despues: nuevoEstado });
  notificar({ personaId: null, tipo: 'estado', titulo: 'Cambio de estado de cuenta', mensaje: `La cuenta ${personaId} pasó de ${persona.estado} a ${nuevoEstado}.${retener ? ' Sus comisiones quedan retenidas.' : ''}` });
  notificar({ personaId, tipo: 'estado', titulo: 'Estado de tu cuenta actualizado', mensaje: `Tu cuenta ahora está ${nuevoEstado}.` });
  return exito({ ...persona, estado: nuevoEstado });
}

export interface DatosUsuarioCorporativo {
  nombres: string; apellidos: string; correo: string; telefono: string; documento: string;
  perfil: 'superadministrador' | 'operador';
}

export function crearUsuarioCorporativo(datos: DatosUsuarioCorporativo, actorId: string): Resultado<Persona> {
  const { personas, agregar } = usePersonasStore.getState();
  if (datos.nombres.trim().length < 2 || datos.apellidos.trim().length < 2) return fallo('Ingresa nombres y apellidos.');
  if (!/^\S+@\S+\.\S+$/.test(datos.correo.trim())) return fallo('Ingresa un correo válido.');
  if (personas.some((persona) => persona.correo.toLowerCase() === datos.correo.trim().toLowerCase())) return fallo('Ya existe una cuenta con ese correo.');
  const numeros = personas.filter((persona) => persona.id.startsWith('DEMO-U')).map((persona) => Number(persona.id.replace('DEMO-U', '')));
  const id = `DEMO-U${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`;
  const persona: Persona = {
    id, codigo: id, nombres: datos.nombres.trim(), apellidos: datos.apellidos.trim(), tipo: 'corporativo', perfil: datos.perfil, estado: 'activo',
    correo: datos.correo.trim(), telefono: datos.telefono.trim(), documento: datos.documento.trim(), pais: 'Perú', moneda: 'USD', idioma: 'es',
    fechaAlta: fechaHoraActualIso().slice(0, 10), referenteId: null,
  };
  agregar(persona);
  registrarBitacora({ actorId, accion: 'Alta de usuario corporativo', modulo: 'usuarios', referenciaId: id, despues: { perfil: datos.perfil } });
  return exito(persona);
}
