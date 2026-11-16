import { CalendarCheck, ClipboardPen, GraduationCap, Video } from 'lucide-react';
import { CalendarioAcademico } from '../../componentes/campus/CalendarioAcademico';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { relativoHoy, sumarDias } from '../../datos/academico/fechasCampus';
import { useProgramasDocente } from '../../hooks/useProgramasDocente';
import { agendaCompleta } from '../../servicios/calendario';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonaSesion } from '../../store/useSesionStore';

export default function CalendarioDocente() {
  const persona = usePersonaSesion();
  const ids = useProgramasDocente();
  const eventos = useErickStore((estado) => estado.eventosCalendario);
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const propias = sustentaciones.filter((item) => item.evaluadorId === persona?.id);
  const agenda = agendaCompleta(eventos.filter((evento) => ids.includes(evento.programaId)), propias);
  const hoy = relativoHoy(0);
  const limite = sumarDias(hoy, 30);
  const proximas = agenda.filter((evento) => evento.estado === 'programado' && evento.fecha >= hoy && evento.fecha <= limite);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Próximos 30 días" valor={proximas.length} icono={CalendarCheck} tono="primario" />
        <TarjetaKpi etiqueta="Exámenes finales" valor={proximas.filter((evento) => evento.tipo === 'examen_final').length} icono={GraduationCap} tono="oro" />
        <TarjetaKpi etiqueta="Clases en vivo" valor={proximas.filter((evento) => evento.tipo === 'clase_en_vivo').length} icono={Video} tono="acento" />
        <TarjetaKpi etiqueta="Sustentaciones" valor={proximas.filter((evento) => evento.virtual).length} icono={ClipboardPen} tono="info" />
      </div>
      <p className="text-[13px] text-texto-2">Las fechas que crees aquí se notifican a los alumnos matriculados y aparecen en su campus. Solo puedes editar las de tus programas.</p>
      <CalendarioAcademico eventos={agenda} actorId={persona?.id} programasEditables={ids} />
    </div>
  );
}
