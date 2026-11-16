import { CalendarCheck, CalendarX, GraduationCap, Video } from 'lucide-react';
import { CalendarioAcademico } from '../../componentes/campus/CalendarioAcademico';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { relativoHoy, sumarDias } from '../../datos/academico/fechasCampus';
import { agendaCompleta } from '../../servicios/calendario';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonaSesion } from '../../store/useSesionStore';

export default function CalendarioErick() {
  const persona = usePersonaSesion();
  const eventos = useErickStore((estado) => estado.eventosCalendario);
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const programas = useAcademicoStore((estado) => estado.programas);
  const agenda = agendaCompleta(eventos, sustentaciones);
  const hoy = relativoHoy(0);
  const limite = sumarDias(hoy, 30);
  const proximas = agenda.filter((evento) => evento.estado === 'programado' && evento.fecha >= hoy && evento.fecha <= limite);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Próximos 30 días" valor={proximas.length} icono={CalendarCheck} tono="primario" />
        <TarjetaKpi etiqueta="Exámenes finales" valor={proximas.filter((evento) => evento.tipo === 'examen_final').length} icono={GraduationCap} tono="oro" />
        <TarjetaKpi etiqueta="Clases en vivo" valor={proximas.filter((evento) => evento.tipo === 'clase_en_vivo').length} icono={Video} tono="acento" />
        <TarjetaKpi etiqueta="Fechas canceladas" valor={eventos.filter((evento) => evento.estado === 'cancelado').length} icono={CalendarX} tono="error" />
      </div>
      <CalendarioAcademico eventos={agenda} actorId={persona?.id} programasEditables={programas.filter((programa) => programa.estado !== 'archivado').map((programa) => programa.id)} />
    </div>
  );
}
