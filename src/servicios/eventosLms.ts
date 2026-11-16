import { useCampusStore } from '../store/useCampusStore';
import type { EventoIntegracion, TipoEventoLms } from '../tipos/academico';
import { fechaHoraActualIso } from '../utilidades/fechas';

export function fechaActualLocal(): string {
  return fechaHoraActualIso().slice(0, 19);
}

function siguienteIdEvento(eventos: EventoIntegracion[]): string {
  const numeros = eventos.map((evento) => Number(evento.id.replace('DEMO-EVL-', ''))).filter((numero) => !Number.isNaN(numero));
  return `DEMO-EVL-${String(Math.max(0, ...numeros) + 1).padStart(3, '0')}`;
}

export function registrarEventoLms(
  tipo: TipoEventoLms, personaId: string, programaId: string | null, carga: EventoIntegracion['carga'], detalle: string,
  estado: EventoIntegracion['estado'] = 'procesado',
): EventoIntegracion {
  const { eventos, actualizar } = useCampusStore.getState();
  const evento: EventoIntegracion = { id: siguienteIdEvento(eventos), tipo, personaId, programaId, fecha: fechaActualLocal(), carga, estado, detalle };
  actualizar({ eventos: [...eventos, evento] });
  return evento;
}
