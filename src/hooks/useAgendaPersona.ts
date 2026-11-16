import { useMemo } from 'react';
import { agendaCompleta, programasDePersona, type EventoAgenda } from '../servicios/calendario';
import { useAcademicoStore } from '../store/useAcademicoStore';
import { useCampusStore } from '../store/useCampusStore';
import { useErickStore } from '../store/useErickStore';

export function useAgendaPersona(personaId: string | null | undefined): EventoAgenda[] {
  const eventos = useErickStore((estado) => estado.eventosCalendario);
  const matriculas = useCampusStore((estado) => estado.matriculas);
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const programas = useAcademicoStore((estado) => estado.programas);
  return useMemo(() => {
    if (!personaId) return [];
    const propios = programasDePersona(personaId, matriculas, programas);
    return agendaCompleta(eventos.filter((evento) => propios.includes(evento.programaId)), sustentaciones.filter((item) => item.personaId === personaId));
  }, [personaId, eventos, matriculas, sustentaciones, programas]);
}
