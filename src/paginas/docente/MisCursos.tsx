import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpenCheck, CalendarDays, ClipboardPen, Clock3, Film, GraduationCap, Microscope, Users } from 'lucide-react';
import { BarraProgreso } from '../../componentes/rangos/BarraProgreso';
import { EstadoVacio } from '../../componentes/ui/EstadoVacio';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { relativoHoy, sumarDias } from '../../datos/academico/fechasCampus';
import { useLibretas } from '../../hooks/useLibreta';
import { useProgramasDocente } from '../../hooks/useProgramasDocente';
import { nombresTipoEvento } from '../../servicios/calendario';
import { origenVideo } from '../../servicios/contenidosDocente';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearNumero } from '../../utilidades/formatos';

const claseEnlace = 'inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-borde px-3 text-[13px] font-semibold text-texto hover:border-acento hover:text-acento md:min-h-10';

export default function MisCursos() {
  const persona = usePersonaSesion();
  const ids = useProgramasDocente();
  const programas = useAcademicoStore((estado) => estado.programas);
  const modulos = useAcademicoStore((estado) => estado.modulos);
  const temas = useAcademicoStore((estado) => estado.temas);
  const sustentaciones = useCampusStore((estado) => estado.sustentaciones);
  const eventos = useErickStore((estado) => estado.eventosCalendario);
  const evaluables = programas.filter((programa) => ids.includes(programa.id) && programa.tipo !== 'mid');
  const libretas = useLibretas(evaluables.map((programa) => programa.id));
  const hoy = relativoHoy(0);
  const limite = sumarDias(hoy, 14);
  const misSustentaciones = sustentaciones.filter((item) => item.evaluadorId === persona?.id);
  const pendientes = misSustentaciones.filter((item) => item.estado === 'asignado').length;
  const estudiantes = new Set(Object.values(libretas).flatMap((libreta) => libreta.filas.map((fila) => fila.persona.id)));
  const filasTodas = Object.values(libretas).flatMap((libreta) => libreta.filas);
  const proximas = eventos.filter((evento) => ids.includes(evento.programaId) && evento.estado === 'programado' && evento.fecha >= hoy && evento.fecha <= limite);
  const temasDe = (programaId: string) => temas.filter((tema) => modulos.some((modulo) => modulo.programaId === programaId && modulo.id === tema.moduloId));
  const conVideo = evaluables.flatMap((programa) => temasDe(programa.id)).filter((tema) => origenVideo(tema.video) !== 'simulado').length;

  if (ids.length === 0) {
    return <Tarjeta><EstadoVacio icono={BookOpenCheck} titulo="Aún no tienes programas asignados" texto="Cuando el administrador educativo te asigne un curso o diplomado aparecerá aquí." /></Tarjeta>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Estudiantes a cargo" valor={formatearNumero(estudiantes.size)} icono={Users} tono="primario" />
        <TarjetaKpi etiqueta="Avance promedio" valor={`${filasTodas.length ? Math.round(filasTodas.reduce((suma, fila) => suma + fila.avance, 0) / filasTodas.length) : 0}%`} icono={GraduationCap} tono="acento" />
        <TarjetaKpi etiqueta="MID por calificar" valor={pendientes} icono={ClipboardPen} tono="oro" />
        <TarjetaKpi etiqueta="Clases con video real" valor={conVideo} icono={Film} tono="info" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        {evaluables.map((programa) => {
          const libreta = libretas[programa.id];
          const filas = libreta?.filas ?? [];
          const avance = filas.length ? Math.round(filas.reduce((suma, fila) => suma + fila.avance, 0) / filas.length) : 0;
          const bloqueados = filas.filter((fila) => fila.bloqueados.length > 0).length;
          const inactivos = filas.filter((fila) => fila.sinActividad).length;
          const siguiente = eventos.filter((evento) => evento.programaId === programa.id && evento.estado === 'programado' && evento.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
          const videos = temasDe(programa.id).filter((tema) => origenVideo(tema.video) !== 'simulado').length;
          return (
            <article key={programa.id} className="overflow-hidden rounded-tarjeta border border-borde bg-superficie shadow-tarjeta">
              <div className="px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${programa.colores[0]}, ${programa.colores[1]})` }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11.5px] font-semibold">{programa.tipo === 'diplomado' ? 'Diplomado' : 'Curso'} · {programa.horas} h</span>
                  <span className="cifra text-[11px] text-white/80">{programa.codigo}</span>
                </div>
                <h3 className="mt-2 text-[17px] font-extrabold leading-tight">{programa.nombre}</h3>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['Estudiantes', filas.length], ['Aprobados', filas.filter((fila) => fila.estado === 'aprobado').length], ['Videos reales', programa.tipo === 'curso' ? videos : '-']].map(([texto, valor]) => (
                    <div key={texto} className="rounded-xl bg-fondo px-2 py-2"><p className="text-[11px] text-texto-2">{texto}</p><p className="cifra text-[18px] font-bold text-texto">{valor}</p></div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[12.5px]"><span className="text-texto-2">Avance promedio del grupo</span><b className="cifra">{avance}%</b></div>
                  <BarraProgreso valor={avance} maximo={100} etiqueta={`Avance promedio de ${programa.nombre}`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {bloqueados > 0 && <Insignia tono="error" icono={AlertTriangle}>{bloqueados} {bloqueados === 1 ? 'bloqueado' : 'bloqueados'} por intentos</Insignia>}
                  {inactivos > 0 && <Insignia tono="advertencia" icono={Clock3}>{inactivos} sin actividad en 14 días</Insignia>}
                  {bloqueados === 0 && inactivos === 0 && <Insignia tono="exito">Grupo al día</Insignia>}
                </div>
                {siguiente && <p className="flex items-center gap-1.5 text-[12.5px] text-texto-2"><CalendarDays className="size-3.5" aria-hidden />Próximo: <b className="text-texto">{nombresTipoEvento[siguiente.tipo]}</b> el {formatearFecha(siguiente.fecha)}</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  {programa.tipo === 'curso' && <Link to={`/docente/cursos/${programa.id}/clases`} className={claseEnlace}><Film className="size-4" aria-hidden />Clases en video</Link>}
                  <Link to={`/docente/cursos/${programa.id}/notas`} className={claseEnlace}><BookOpenCheck className="size-4" aria-hidden />Libreta de notas</Link>
                  <Link to="/docente/calendario" className={claseEnlace}><CalendarDays className="size-4" aria-hidden />Calendario</Link>
                </div>
              </div>
            </article>
          );
        })}
        {ids.some((id) => programas.find((programa) => programa.id === id)?.tipo === 'mid') && (
          <article className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-superficie p-5 shadow-tarjeta">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-oro-suave text-oro"><Microscope className="size-5" aria-hidden /></span><div><h3 className="text-[16px] font-bold text-texto">Módulo de Investigación y Desarrollo</h3><p className="text-[12.5px] text-texto-2">Sustentaciones MID asignadas a ti</p></div></div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-fondo px-2 py-2"><p className="text-[11px] text-texto-2">Por calificar</p><p className="cifra text-[18px] font-bold">{pendientes}</p></div>
              <div className="rounded-xl bg-fondo px-2 py-2"><p className="text-[11px] text-texto-2">Calificadas</p><p className="cifra text-[18px] font-bold">{misSustentaciones.length - pendientes}</p></div>
            </div>
            <Link to="/docente/sustentaciones" className={claseEnlace}><ClipboardPen className="size-4" aria-hidden />Ir a la bandeja MID</Link>
          </article>
        )}
      </div>
      {proximas.length > 0 && <p className="text-[12.5px] text-texto-2">Tienes {proximas.length} {proximas.length === 1 ? 'fecha' : 'fechas'} en los próximos 14 días. Revísalas en el calendario.</p>}
    </div>
  );
}
