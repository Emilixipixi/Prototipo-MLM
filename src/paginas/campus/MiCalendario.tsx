import { CalendarCheck, GraduationCap, Microscope, Video } from 'lucide-react';
import { CalendarioAcademico } from '../../componentes/campus/CalendarioAcademico';
import { ProximasFechas } from '../../componentes/campus/ProximasFechas';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { relativoHoy, sumarDias } from '../../datos/academico/fechasCampus';
import { useAgendaPersona } from '../../hooks/useAgendaPersona';
import { diasHasta } from '../../servicios/proximasFechas';
import { usePersonaSesion } from '../../store/useSesionStore';

export default function MiCalendario() {
  const persona = usePersonaSesion();
  const agenda = useAgendaPersona(persona?.id);
  if (!persona) return null;
  const hoy = relativoHoy(0);
  const limite = sumarDias(hoy, 30);
  const proximas = agenda.filter((evento) => evento.estado === 'programado' && evento.fecha >= hoy && evento.fecha <= limite);
  const examen = agenda.filter((evento) => evento.estado === 'programado' && evento.tipo === 'examen_final' && evento.fecha >= hoy)[0];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Próximos 30 días" valor={proximas.length} icono={CalendarCheck} tono="primario" />
        <TarjetaKpi etiqueta="Examen final" valor={examen ? (diasHasta(examen.fecha, hoy) <= 0 ? 'Hoy' : `${diasHasta(examen.fecha, hoy)} d`) : '-'} icono={GraduationCap} tono="oro" />
        <TarjetaKpi etiqueta="Clases en vivo" valor={proximas.filter((evento) => evento.tipo === 'clase_en_vivo').length} icono={Video} tono="acento" />
        <TarjetaKpi etiqueta="Sustentaciones" valor={proximas.filter((evento) => evento.tipo === 'sustentacion').length} icono={Microscope} tono="info" />
      </div>
      <ProximasFechas personaId={persona.id} />
      {agenda.length === 0
        ? <p className="text-[13px] text-texto-2">Cuando te matricules en un programa verás aquí sus fechas importantes.</p>
        : <CalendarioAcademico eventos={agenda} />}
    </div>
  );
}
