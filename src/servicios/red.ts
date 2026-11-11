import { usePersonasStore } from '../store/usePersonasStore';
import { useRedStore } from '../store/useRedStore';
import type { Persona, TipoPersona } from '../tipos/persona';
import type { Brazo, Patrocinio, PosicionTrinaria } from '../tipos/red';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { validarCicloPatrocinio, validarPosicionLibre } from '../validaciones/red';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { notificar, registrarBitacora } from './registro';

export interface DatosRegistro {
  nombres: string; apellidos: string; correo: string; telefono: string; documento: string;
  tipo: Exclude<TipoPersona, 'corporativo'>; patrocinadorId: string | null;
}

function siguienteCodigo(prefijo: string, personas: Persona[]): string {
  const numeros = personas.filter((persona) => persona.id.startsWith(prefijo)).map((persona) => Number(persona.id.replace(prefijo, '')));
  return `${prefijo}${String(Math.max(0, ...numeros) + 1).padStart(2, '0')}`;
}

export function registrarPersona(datos: DatosRegistro): Resultado<Persona> {
  const { personas, agregar, buscarPorId } = usePersonasStore.getState();
  if (personas.some((persona) => persona.correo.toLowerCase() === datos.correo.trim().toLowerCase())) {
    return fallo('Ya existe una cuenta con ese correo.');
  }
  const patrocinador = datos.patrocinadorId ? buscarPorId(datos.patrocinadorId) : undefined;
  if (datos.patrocinadorId && (!patrocinador || patrocinador.tipo !== 'empresario')) return fallo('El enlace de patrocinador no es válido.');
  const prefijo = datos.tipo === 'empresario' ? 'DEMO-A' : datos.tipo === 'alumno' ? 'DEMO-L' : 'DEMO-C';
  const id = siguienteCodigo(prefijo, personas);
  const fecha = fechaHoraActualIso();
  const persona: Persona = {
    id, codigo: id, nombres: datos.nombres.trim(), apellidos: datos.apellidos.trim(),
    tipo: datos.tipo, perfil: datos.tipo === 'empresario' ? 'afiliado' : 'cliente_alumno',
    estado: datos.tipo === 'empresario' ? 'pendiente' : 'activo',
    correo: datos.correo.trim(), telefono: datos.telefono.trim(), documento: datos.documento.trim(),
    pais: 'Perú', moneda: 'USD', idioma: 'es', fechaAlta: fecha.slice(0, 10), referenteId: datos.patrocinadorId,
  };
  agregar(persona);
  if (datos.tipo === 'empresario') {
    const { patrocinios, establecer } = useRedStore.getState();
    const relacion: Patrocinio = {
      id: `DEMO-PAT-${String(patrocinios.length).padStart(3, '0')}`,
      personaId: id, patrocinadorId: datos.patrocinadorId, fechaRelacion: fecha.slice(0, 10),
      historial: [{ fecha, actorId: id, motivo: 'Registro desde enlace de patrocinador', antes: null, despues: datos.patrocinadorId }],
    };
    establecer({ patrocinios: [...patrocinios, relacion] });
  }
  registrarBitacora({ actorId: id, accion: 'Registro de persona', modulo: 'usuarios', referenciaId: id, despues: { tipo: datos.tipo, patrocinador: datos.patrocinadorId } });
  if (datos.patrocinadorId) {
    notificar({ personaId: datos.patrocinadorId, tipo: 'estado', titulo: 'Nuevo registro con tu enlace', mensaje: `${persona.nombres} ${persona.apellidos} (${id}) se registró como ${datos.tipo}.` });
  }
  notificar({ personaId: null, tipo: 'estado', titulo: 'Registro pendiente de revisión', mensaje: `${id} se registró como ${datos.tipo}${datos.tipo === 'empresario' ? ' y espera asignación de posición Trinaria' : ''}.` });
  return exito(persona);
}

export function confirmarPatrocinador(personaId: string, actorId: string): Resultado<Patrocinio> {
  const { patrocinios, establecer } = useRedStore.getState();
  const relacion = patrocinios.find((item) => item.personaId === personaId);
  if (!relacion) return fallo('La persona no tiene relación de patrocinio.');
  const actualizada: Patrocinio = {
    ...relacion,
    historial: [...relacion.historial, { fecha: fechaHoraActualIso(), actorId, motivo: 'Patrocinador confirmado', antes: relacion.patrocinadorId, despues: relacion.patrocinadorId }],
  };
  establecer({ patrocinios: patrocinios.map((item) => (item.id === relacion.id ? actualizada : item)) });
  registrarBitacora({ actorId, accion: 'Confirmación de patrocinador', modulo: 'redes', referenciaId: personaId, despues: relacion.patrocinadorId });
  return exito(actualizada);
}

export function cambiarPatrocinador(personaId: string, nuevoPatrocinadorId: string, actorId: string, motivo: string): Resultado<Patrocinio> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { patrocinios, establecer } = useRedStore.getState();
  const relacion = patrocinios.find((item) => item.personaId === personaId);
  if (!relacion) return fallo('La persona no tiene relación de patrocinio.');
  const error = validarCicloPatrocinio(patrocinios, personaId, nuevoPatrocinadorId);
  if (error) {
    registrarBitacora({ actorId, accion: 'Cambio de patrocinador bloqueado', modulo: 'redes', motivo: error, referenciaId: personaId });
    return fallo(error);
  }
  const actualizada: Patrocinio = {
    ...relacion,
    patrocinadorId: nuevoPatrocinadorId,
    historial: [...relacion.historial, { fecha: fechaHoraActualIso(), actorId, motivo, antes: relacion.patrocinadorId, despues: nuevoPatrocinadorId }],
  };
  establecer({ patrocinios: patrocinios.map((item) => (item.id === relacion.id ? actualizada : item)) });
  registrarBitacora({ actorId, accion: 'Cambio de patrocinador', modulo: 'redes', motivo, referenciaId: personaId, antes: relacion.patrocinadorId, despues: nuevoPatrocinadorId });
  return exito(actualizada);
}

export function asignarPosicion(personaId: string, padrePosicionId: string, brazo: Brazo, actorId: string, motivo: string): Resultado<PosicionTrinaria> {
  if (motivo.trim().length < 10) return fallo('El motivo debe tener al menos 10 caracteres.');
  const { posiciones, establecer } = useRedStore.getState();
  const error = validarPosicionLibre(posiciones, personaId, padrePosicionId, brazo);
  if (error) {
    registrarBitacora({ actorId, accion: 'Colocación bloqueada por validación', modulo: 'redes', motivo: error, referenciaId: personaId, despues: { padrePosicionId, brazo } });
    return fallo(error);
  }
  const numeros = posiciones.map((posicion) => Number(posicion.id.replace('DEMO-POS-', '')));
  const fecha = fechaHoraActualIso();
  const posicion: PosicionTrinaria = {
    id: `DEMO-POS-${String(Math.max(...numeros) + 1).padStart(3, '0')}`,
    personaId, padrePosicionId, brazo, fecha: fecha.slice(0, 10), estado: 'activa', version: 1,
    cambios: [{ fecha, actorId, motivo, antes: null, despues: { padrePosicionId, brazo } }],
  };
  establecer({ posiciones: [...posiciones, posicion] });
  const persona = usePersonasStore.getState().buscarPorId(personaId);
  if (persona?.estado === 'pendiente') usePersonasStore.getState().actualizar(personaId, { estado: 'activo' });
  registrarBitacora({ actorId, accion: 'Asignación de posición Trinaria', modulo: 'redes', motivo, referenciaId: personaId, antes: null, despues: { posicion: posicion.id, padrePosicionId, brazo, patrocinador: 'sin cambios' } });
  notificar({ personaId, tipo: 'estado', titulo: 'Posición Trinaria asignada', mensaje: `Se te asignó la posición ${posicion.id} en el brazo ${brazo} de ${padrePosicionId}. Tu patrocinador no cambia.` });
  return exito(posicion);
}
