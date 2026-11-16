import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, CalendarCheck, CalendarDays, ExternalLink } from 'lucide-react';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { useAgendaPersona } from '../../hooks/useAgendaPersona';
import { nombresTipoEvento } from '../../servicios/calendario';
import { diasHasta, proximasFechas, textoCuentaRegresiva } from '../../servicios/proximasFechas';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { unirClases } from '../../utilidades/clases';
import { Tarjeta } from '../ui/Tarjeta';
import { estilosTipoEvento } from './estilosEvento';

interface PropsProximasFechas {
  personaId: string;
  programaId?: string;
}

export function ProximasFechas({ personaId, programaId }: PropsProximasFechas) {
  const agenda = useAgendaPersona(personaId);
  const programas = useAcademicoStore((estado) => estado.programas);
  const programa = programaId ? programas.find((item) => item.id === programaId) : undefined;
  const hoy = relativoHoy(0);
  const lista = proximasFechas(agenda, hoy, 3, programa, programas);
  const nombrePrograma = (id: string) => programas.find((item) => item.id === id)?.nombre ?? id;

  return (
    <Tarjeta titulo="Próximas fechas" subtitulo={programa ? 'De este programa' : 'Exámenes, clases en vivo, entregas y sustentaciones'} icono={CalendarDays}
      acciones={<Link to="/campus/calendario" className="inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-acento md:min-h-0">Mi calendario<ArrowRight className="size-4" aria-hidden /></Link>}>
      {lista.length === 0 ? (
        <p className="flex items-center gap-2 text-[13px] text-texto-2"><CalendarCheck className="size-4" aria-hidden />No tienes fechas programadas por ahora.</p>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {lista.map((evento) => {
            const estilo = estilosTipoEvento[evento.tipo];
            const Icono = estilo.icono;
            const dias = diasHasta(evento.fecha, hoy);
            const examen = evento.tipo === 'examen_final';
            return (
              <li key={evento.id} className={unirClases('flex min-w-0 flex-col gap-2 rounded-2xl border p-3', examen ? 'border-[#E9A95B] bg-[#FDF0E1]' : 'border-borde bg-superficie')}>
                <div className="flex items-center justify-between gap-2">
                  <span className={unirClases('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', estilo.clase)}><Icono className="size-3" aria-hidden />{nombresTipoEvento[evento.tipo]}</span>
                  <span className={unirClases('cifra rounded-full px-2 py-0.5 text-[11.5px] font-bold', dias <= 3 ? 'bg-[#7A410B] text-white' : 'bg-fondo text-texto')}>{textoCuentaRegresiva(dias)}</span>
                </div>
                <p className="text-[13.5px] font-semibold leading-snug text-texto">{evento.titulo}</p>
                <p className="text-[12px] text-texto-2"><span className="first-letter:uppercase inline-block">{format(parseISO(evento.fecha), "EEEE d 'de' MMMM", { locale: es })}</span> · {evento.horaInicio}</p>
                {!programa && <p className="truncate text-[12px] text-texto-2">{nombrePrograma(evento.programaId)}</p>}
                {evento.enlace && <a href={evento.enlace} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[12.5px] font-semibold text-acento md:min-h-0"><ExternalLink className="size-3.5" aria-hidden />Abrir enlace de la clase</a>}
              </li>
            );
          })}
        </ul>
      )}
    </Tarjeta>
  );
}
