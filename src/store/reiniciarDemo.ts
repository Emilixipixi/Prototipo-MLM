import { useGuiaStore } from './useGuiaStore';
import { useBitacoraStore } from './useBitacoraStore';
import { useCarritoStore } from './useCarritoStore';
import { useCatalogoStore } from './useCatalogoStore';
import { useCompensacionStore } from './useCompensacionStore';
import { useComplianceStore } from './useComplianceStore';
import { useFormacionStore } from './useFormacionStore';
import { useIntegracionesStore } from './useIntegracionesStore';
import { useNotificacionesStore } from './useNotificacionesStore';
import { usePedidosStore } from './usePedidosStore';
import { usePeriodosStore } from './usePeriodosStore';
import { usePermisosStore } from './usePermisosStore';
import { usePersonasStore } from './usePersonasStore';
import { useRedStore } from './useRedStore';
import { useSesionStore } from './useSesionStore';

export function reiniciarDemo(): void {
  usePersonasStore.getState().reiniciar();
  useRedStore.getState().reiniciar();
  useCatalogoStore.getState().reiniciar();
  usePedidosStore.getState().reiniciar();
  usePeriodosStore.getState().reiniciar();
  useFormacionStore.getState().reiniciar();
  useComplianceStore.getState().reiniciar();
  useIntegracionesStore.getState().reiniciar();
  useCompensacionStore.getState().reiniciar();
  usePermisosStore.getState().reiniciar();
  useNotificacionesStore.getState().reiniciar();
  useBitacoraStore.getState().reiniciar();
  useCarritoStore.getState().reiniciar();
  useSesionStore.getState().reiniciar();
  useGuiaStore.getState().reiniciar();
}
