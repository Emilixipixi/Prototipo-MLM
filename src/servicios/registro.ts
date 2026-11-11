import { useBitacoraStore, type DatosRegistroBitacora } from '../store/useBitacoraStore';
import { useNotificacionesStore } from '../store/useNotificacionesStore';
import type { Notificacion } from '../tipos/notificacion';

export function registrarBitacora(datos: DatosRegistroBitacora): void {
  useBitacoraStore.getState().registrar(datos);
}

export function notificar(datos: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
  useNotificacionesStore.getState().agregar(datos);
}
