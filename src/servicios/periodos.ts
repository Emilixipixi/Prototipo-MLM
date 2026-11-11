import { usePeriodosStore } from '../store/usePeriodosStore';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { transicionesPeriodo, validarTransicion } from '../validaciones/transiciones';
import { registrarBitacora } from './registro';

export function reabrirPeriodo(periodoId: string, actorId: string): Resultado<undefined> {
  const { periodos, establecer } = usePeriodosStore.getState();
  const periodo = periodos.find((item) => item.id === periodoId);
  if (!periodo) return fallo('Período no encontrado.');
  const error = validarTransicion(transicionesPeriodo, periodo.estado, 'abierto', 'el período');
  if (error) return fallo(error);
  establecer({ periodos: periodos.map((item) => (item.id === periodoId ? { ...item, estado: 'abierto' } : item)) });
  registrarBitacora({ actorId, accion: 'Reapertura de período', modulo: 'periodos', referenciaId: periodoId, antes: periodo.estado, despues: 'abierto', motivo: 'Cierre cancelado antes de aprobarse' });
  return exito(undefined);
}
