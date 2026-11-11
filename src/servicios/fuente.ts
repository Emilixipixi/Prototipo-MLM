import { useCompensacionStore } from '../store/useCompensacionStore';
import { useFormacionStore } from '../store/useFormacionStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { usePeriodosStore } from '../store/usePeriodosStore';
import { usePersonasStore } from '../store/usePersonasStore';
import { useRedStore } from '../store/useRedStore';
import type { FuenteDatos } from './contexto';

export function obtenerFuente(): FuenteDatos {
  const red = useRedStore.getState();
  const pedidos = usePedidosStore.getState();
  const periodos = usePeriodosStore.getState();
  const compensacion = useCompensacionStore.getState();
  return {
    personas: usePersonasStore.getState().personas,
    patrocinios: red.patrocinios,
    posiciones: red.posiciones,
    movimientos: pedidos.movimientos,
    pedidos: pedidos.pedidos,
    formacion: useFormacionStore.getState().estados,
    periodos: periodos.periodos,
    versiones: periodos.versiones,
    calificacionesCerradas: compensacion.calificacionesCerradas,
    saldosCerrados: compensacion.saldosCerrados,
  };
}
