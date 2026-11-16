import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ClipboardList, Users } from 'lucide-react';
import { TarjetaEvento } from '../../componentes/campus/CalendarioAcademico';
import { Avatar } from '../../componentes/ui/Avatar';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { agendaCompleta } from '../../servicios/calendario';
import { programasDeDocente } from '../../servicios/docentes';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { formatearFecha } from '../../utilidades/fechas';
import ResumenAcademico from '../corporativo/academico/ResumenAcademico';

export default function ResumenErick() {
  const eventos = useErickStore((estado) => estado.eventosCalendario);
  const asignaciones = useErickStore((estado) => estado.asignacionesDocentes);
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const programas = useAcademicoStore((estado) => estado.programas);
  const personas = usePersonasStore((estado) => estado.personas);
  const hoy = relativoHoy(0);
  const proximas = agendaCompleta(eventos, sustentaciones).filter((evento) => evento.estado === 'programado' && evento.fecha >= hoy).slice(0, 4);
  const porAsignar = sustentaciones.filter((item) => item.estado === 'solicitado');
  const docentes = personas.filter((persona) => persona.perfil === 'evaluador');
  const nombre = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };
  const nombrePrograma = (id: string) => programas.find((item) => item.id === id)?.nombre ?? id;
  const enlace = (ruta: string, texto: string) => <Link to={ruta} className="inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-acento md:min-h-0">{texto}<ArrowRight className="size-3.5" aria-hidden /></Link>;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-3">
        <Tarjeta className="xl:col-span-2" titulo="Próximas fechas académicas" subtitulo="Exámenes, clases en vivo, entregas y sustentaciones" icono={CalendarDays} acciones={enlace('/erick/calendario', 'Ver calendario')}>
          <div className="grid gap-2 md:grid-cols-2">
            {proximas.map((evento) => <TarjetaEvento key={evento.id} evento={evento} programa={nombrePrograma(evento.programaId)} autor={nombre(evento.creadoPor)} compacta />)}
          </div>
        </Tarjeta>
        <Tarjeta titulo="Sustentaciones por asignar" subtitulo="Solicitudes MID sin evaluador" icono={ClipboardList} acciones={enlace('/erick/mid', 'Asignar')}>
          {porAsignar.length === 0 ? <p className="text-[13px] text-texto-2">Todas las solicitudes tienen evaluador.</p> : (
            <ul className="flex flex-col gap-2">
              {porAsignar.map((item) => (
                <li key={item.id} className="rounded-xl bg-fondo px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-texto">{item.titulo}</p>
                  <p className="mt-0.5 text-[12px] text-texto-2">{nombre(item.personaId)} · propone {formatearFecha(item.fechaPropuesta)}</p>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
      <Tarjeta titulo="Carga docente" subtitulo="Programas y sustentaciones por docente" icono={Users} acciones={enlace('/erick/docentes', 'Gestionar docentes')}>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {docentes.map((docente) => {
            const programasDocente = programasDeDocente(docente.id, asignaciones, programas);
            const pendientes = sustentaciones.filter((item) => item.evaluadorId === docente.id && item.estado === 'asignado').length;
            return (
              <li key={docente.id} className="flex items-center gap-3 rounded-xl border border-borde p-3">
                <Avatar nombres={docente.nombres} apellidos={docente.apellidos} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-texto">{docente.nombres} {docente.apellidos}</p>
                  <p className="text-[12px] text-texto-2">{programasDocente.length} {programasDocente.length === 1 ? 'programa' : 'programas'}</p>
                </div>
                {pendientes > 0 && <Insignia tono="oro">{pendientes} MID</Insignia>}
              </li>
            );
          })}
        </ul>
      </Tarjeta>
      <ResumenAcademico />
    </div>
  );
}
