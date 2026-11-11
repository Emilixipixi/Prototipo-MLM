import { useMemo } from 'react';
import type { FuenteDatos } from '../servicios/contexto';
import { useCompensacionStore } from '../store/useCompensacionStore';
import { useFormacionStore } from '../store/useFormacionStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { usePeriodosStore } from '../store/usePeriodosStore';
import { usePersonasStore } from '../store/usePersonasStore';
import { useRedStore } from '../store/useRedStore';

export function useFuente(): FuenteDatos {
  const personas = usePersonasStore((estado) => estado.personas);
  const patrocinios = useRedStore((estado) => estado.patrocinios);
  const posiciones = useRedStore((estado) => estado.posiciones);
  const movimientos = usePedidosStore((estado) => estado.movimientos);
  const pedidos = usePedidosStore((estado) => estado.pedidos);
  const formacion = useFormacionStore((estado) => estado.estados);
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const versiones = usePeriodosStore((estado) => estado.versiones);
  const calificacionesCerradas = useCompensacionStore((estado) => estado.calificacionesCerradas);
  const saldosCerrados = useCompensacionStore((estado) => estado.saldosCerrados);
  return useMemo(() => ({
    personas, patrocinios, posiciones, movimientos, pedidos, formacion, periodos, versiones, calificacionesCerradas, saldosCerrados,
  }), [personas, patrocinios, posiciones, movimientos, pedidos, formacion, periodos, versiones, calificacionesCerradas, saldosCerrados]);
}
