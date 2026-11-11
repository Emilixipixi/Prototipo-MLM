import { useFormacionStore } from '../store/useFormacionStore';
import type { EstadoFormacion, EstadoFormativo } from '../tipos/formacion';
import { fechaHoraActualIso } from '../utilidades/fechas';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { transicionesFormacion, validarTransicion } from '../validaciones/transiciones';
import { notificar, registrarBitacora } from './registro';

export function simularActualizacionLms(estadoFormativoId: string, hacia: EstadoFormacion, actorId: string): Resultado<EstadoFormativo> {
  const { estados, establecer } = useFormacionStore.getState();
  const actual = estados.find((item) => item.id === estadoFormativoId);
  if (!actual) return fallo('Registro formativo no encontrado.');
  const error = validarTransicion(transicionesFormacion, actual.estado, hacia, 'el estado formativo');
  if (error) return fallo(error);
  const actualizado = { ...actual, estado: hacia, fechaActualizacion: fechaHoraActualIso().slice(0, 10) };
  establecer(estados.map((item) => (item.id === estadoFormativoId ? actualizado : item)));
  registrarBitacora({ actorId, accion: 'Actualización simulada desde LMS', modulo: 'integraciones', referenciaId: actual.personaId, antes: actual.estado, despues: hacia, motivo: 'Dato de prueba: conector LMS pendiente de integración' });
  notificar({ personaId: actual.personaId, tipo: 'estado', titulo: 'Estado formativo actualizado', mensaje: `${actual.programaExterno}: ahora figura como ${hacia} (dato de prueba).` });
  return exito(actualizado);
}
