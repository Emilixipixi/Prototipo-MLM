import { useComplianceStore } from '../store/useComplianceStore';
import type { AlertaIntegridad } from '../tipos/compliance';
import { exito, fallo, type Resultado } from '../validaciones/resultado';
import { registrarBitacora } from './registro';

export function actualizarAlerta(alertaId: string, estado: AlertaIntegridad['estado'], actorId: string, resolucion: string): Resultado<AlertaIntegridad> {
  if (resolucion.trim().length < 10) return fallo('Describe la decisión con al menos 10 caracteres.');
  const { alertas, establecer } = useComplianceStore.getState();
  const alerta = alertas.find((item) => item.id === alertaId);
  if (!alerta) return fallo('Alerta no encontrada.');
  const actualizada = { ...alerta, estado, resolucion };
  establecer(alertas.map((item) => (item.id === alertaId ? actualizada : item)));
  registrarBitacora({ actorId, accion: `Alerta ${estado === 'resuelta' ? 'resuelta' : 'en revisión'}`, modulo: 'compliance', motivo: resolucion, referenciaId: alertaId, antes: alerta.estado, despues: estado });
  return exito(actualizada);
}
