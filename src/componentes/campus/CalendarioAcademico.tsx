import { useMemo, useState, type FormEvent } from 'react';
import { addDays, addMonths, endOfMonth, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock, ExternalLink, List, Pencil, XCircle } from 'lucide-react';
import { estilosTipoEvento } from './estilosEvento';
import { Boton } from '../ui/Boton';
import { Campo } from '../ui/Campo';
import { Confirmacion } from '../ui/Confirmacion';
import { EstadoVacio } from '../ui/EstadoVacio';
import { Modal } from '../ui/Modal';
import { Selector } from '../ui/Selector';
import { useToast } from '../ui/useToast';
import { relativoHoy } from '../../datos/academico/fechasCampus';
import { cancelarEvento, crearEvento, editarEvento, nombresTipoEvento, type DatosEventoCalendario, type EventoAgenda } from '../../servicios/calendario';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import type { TipoEventoCalendario } from '../../tipos/academico';
import { unirClases } from '../../utilidades/clases';


const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const tiposEditables: TipoEventoCalendario[] = ['examen_final', 'clase_en_vivo', 'entrega', 'recordatorio'];

interface PropsCalendario {
  eventos: EventoAgenda[];
  programasEditables?: string[];
  actorId?: string;
  vistaInicial?: 'mes' | 'lista';
}

const vacio = (programaId: string): DatosEventoCalendario => ({
  programaId, tipo: 'examen_final', titulo: '', descripcion: '', fecha: relativoHoy(7), horaInicio: '10:00', horaFin: '11:00', enlace: null,
});

function FormularioEvento({ inicial, programas, alGuardar, alCerrar, titulo }: {
  inicial: DatosEventoCalendario; programas: Array<{ id: string; nombre: string }>; titulo: string;
  alGuardar: (datos: DatosEventoCalendario) => string | null; alCerrar: () => void;
}) {
  const [datos, setDatos] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const enviar = (evento?: FormEvent) => {
    evento?.preventDefault();
    setError(alGuardar({ ...datos, horaFin: datos.horaFin || null, enlace: datos.enlace || null }));
  };
  return (
    <Modal abierto alCerrar={alCerrar} titulo={titulo} descripcion="Los estudiantes matriculados reciben un aviso y la ven en Mi calendario." ancho="lg"
      pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton icono={CalendarPlus} onClick={() => enviar()}>Guardar fecha</Boton></>}>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={enviar}>
        <Selector etiqueta="Programa" value={datos.programaId} onChange={(evento) => setDatos({ ...datos, programaId: evento.target.value })} opciones={programas.map((programa) => ({ valor: programa.id, texto: programa.nombre }))} />
        <Selector etiqueta="Tipo" value={datos.tipo} onChange={(evento) => setDatos({ ...datos, tipo: evento.target.value as TipoEventoCalendario })} opciones={tiposEditables.map((tipo) => ({ valor: tipo, texto: nombresTipoEvento[tipo] }))} />
        <Campo className="sm:col-span-2" etiqueta="Título" value={datos.titulo} onChange={(evento) => setDatos({ ...datos, titulo: evento.target.value })} placeholder="Examen final del curso" />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="descripcion-evento" className="text-[13px] font-semibold text-texto">Indicaciones para los estudiantes</label>
          <textarea id="descripcion-evento" rows={3} value={datos.descripcion} onChange={(evento) => setDatos({ ...datos, descripcion: evento.target.value })} className="rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
        </div>
        <Campo etiqueta="Fecha" type="date" value={datos.fecha} onChange={(evento) => setDatos({ ...datos, fecha: evento.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Hora inicio" type="time" value={datos.horaInicio} onChange={(evento) => setDatos({ ...datos, horaInicio: evento.target.value })} />
          <Campo etiqueta="Hora fin" type="time" value={datos.horaFin ?? ''} onChange={(evento) => setDatos({ ...datos, horaFin: evento.target.value })} />
        </div>
        {datos.tipo === 'clase_en_vivo' && <Campo className="sm:col-span-2" etiqueta="Enlace de la clase (opcional)" value={datos.enlace ?? ''} placeholder="https://" onChange={(evento) => setDatos({ ...datos, enlace: evento.target.value })} />}
        {error && <p role="alert" className="text-[13px] font-medium text-error sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}

export function TarjetaEvento({ evento, programa, autor, editable, alEditar, alCancelar, compacta = false }: {
  evento: EventoAgenda; programa: string; autor?: string; editable?: boolean; alEditar?: () => void; alCancelar?: () => void; compacta?: boolean;
}) {
  const estilo = estilosTipoEvento[evento.tipo];
  const Icono = estilo.icono;
  const cancelado = evento.estado === 'cancelado';
  const dias = Math.round((parseISO(evento.fecha).getTime() - parseISO(relativoHoy(0)).getTime()) / 86400000);
  return (
    <article className={unirClases('flex gap-3 rounded-xl border bg-superficie p-3', cancelado ? 'border-borde opacity-70' : 'border-borde')}>
      <span className={unirClases('grid size-10 shrink-0 place-items-center rounded-xl border', estilo.clase)}><Icono className="size-[18px]" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={unirClases('rounded-full border px-2 py-0.5 text-[11px] font-semibold', estilo.clase)}>{nombresTipoEvento[evento.tipo]}</span>
          {cancelado && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-error"><XCircle className="size-3" aria-hidden />Cancelada</span>}
          {!cancelado && dias >= 0 && dias <= 14 && <span className="text-[11px] font-semibold text-texto-2">{dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}</span>}
        </div>
        <p className={unirClases('mt-1 text-[13.5px] font-semibold text-texto', cancelado && 'line-through')}>{evento.titulo}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-texto-2">
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden />{format(parseISO(evento.fecha), "EEEE d 'de' MMMM", { locale: es })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{evento.horaInicio}{evento.horaFin ? ` a ${evento.horaFin}` : ''}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-texto-2">{programa}{autor ? ` · ${autor}` : ''}</p>
        {!compacta && evento.descripcion && <p className="mt-1.5 text-[12.5px] text-texto-2">{evento.descripcion}</p>}
        <div className="mt-1.5 flex flex-wrap gap-2">
          {evento.enlace && !cancelado && <a href={evento.enlace} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[12.5px] font-semibold text-acento md:min-h-0"><ExternalLink className="size-3.5" aria-hidden />Abrir enlace de la clase</a>}
          {editable && !cancelado && !evento.virtual && (
            <>
              <Boton tamano="sm" variante="fantasma" icono={Pencil} onClick={alEditar}>Editar</Boton>
              <Boton tamano="sm" variante="fantasma" icono={XCircle} onClick={alCancelar}>Cancelar fecha</Boton>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function CalendarioAcademico({ eventos, programasEditables = [], actorId, vistaInicial = 'mes' }: PropsCalendario) {
  const toast = useToast();
  const programas = useAcademicoStore((estado) => estado.programas);
  const personas = usePersonasStore((estado) => estado.personas);
  const hoy = relativoHoy(0);
  const [mes, setMes] = useState(() => startOfMonth(parseISO(hoy)));
  const [vista, setVista] = useState<'mes' | 'lista'>(vistaInicial);
  const [programa, setPrograma] = useState('');
  const [tipo, setTipo] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => eventos.find((evento) => evento.fecha >= hoy && evento.estado === 'programado')?.fecha ?? hoy);
  const [formulario, setFormulario] = useState<{ id: string | null; datos: DatosEventoCalendario } | null>(null);
  const [cancelando, setCancelando] = useState<EventoAgenda | null>(null);
  const editables = programas.filter((item) => programasEditables.includes(item.id));
  const nombrePrograma = (id: string) => programas.find((item) => item.id === id)?.nombre ?? id;
  const nombreAutor = (id: string) => { const persona = personas.find((item) => item.id === id); return persona ? `${persona.nombres} ${persona.apellidos}` : id; };
  const filtrados = useMemo(() => eventos.filter((evento) => (!programa || evento.programaId === programa) && (!tipo || evento.tipo === tipo)), [eventos, programa, tipo]);
  const porDia = useMemo(() => {
    const mapa = new Map<string, EventoAgenda[]>();
    filtrados.forEach((evento) => mapa.set(evento.fecha, [...(mapa.get(evento.fecha) ?? []), evento]));
    return mapa;
  }, [filtrados]);
  const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
  const semanas = Math.ceil((endOfMonth(mes).getTime() - inicio.getTime()) / (7 * 86400000));
  const dias = Array.from({ length: Math.max(5, semanas) * 7 }, (_, indice) => addDays(inicio, indice));
  const proximos = filtrados.filter((evento) => evento.fecha >= hoy);
  const delDia = porDia.get(diaSeleccionado) ?? [];
  const puedeEditar = (evento: EventoAgenda) => Boolean(actorId) && programasEditables.includes(evento.programaId);
  const programasFiltro = [...new Set(eventos.map((evento) => evento.programaId))];

  const guardar = (datos: DatosEventoCalendario): string | null => {
    if (!actorId || !formulario) return 'Sin sesión.';
    if (formulario.id) {
      const resultado = editarEvento(formulario.id, datos, actorId);
      if (!resultado.ok) return resultado.error;
      toast.exito('Fecha actualizada', resultado.valor.titulo);
    } else {
      const resultado = crearEvento(datos, actorId);
      if (!resultado.ok) return resultado.error;
      toast.exito('Fecha agendada', `${resultado.valor.evento.titulo}. Se avisó a ${resultado.valor.avisados} estudiantes.`);
      setDiaSeleccionado(resultado.valor.evento.fecha);
      setMes(startOfMonth(parseISO(resultado.valor.evento.fecha)));
    }
    setFormulario(null);
    return null;
  };

  const tarjeta = (evento: EventoAgenda) => (
    <TarjetaEvento key={evento.id} evento={evento} programa={nombrePrograma(evento.programaId)} autor={nombreAutor(evento.creadoPor)} editable={puedeEditar(evento)}
      alEditar={() => setFormulario({ id: evento.id, datos: { programaId: evento.programaId, tipo: evento.tipo, titulo: evento.titulo, descripcion: evento.descripcion, fecha: evento.fecha, horaInicio: evento.horaInicio, horaFin: evento.horaFin, enlace: evento.enlace } })}
      alCancelar={() => setCancelando(evento)} />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-tarjeta border border-borde bg-superficie p-4 shadow-tarjeta sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex gap-1 rounded-xl bg-fondo p-1" role="group" aria-label="Vista del calendario">
          {([['mes', 'Mes', CalendarDays], ['lista', 'Próximas', List]] as const).map(([valor, texto, Icono]) => (
            <button key={valor} type="button" aria-pressed={vista === valor} onClick={() => setVista(valor)}
              className={unirClases('inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold', vista === valor ? 'bg-superficie text-primario shadow-sm' : 'text-texto-2 hover:text-texto')}>
              <Icono className="size-4" aria-hidden />{texto}
            </button>
          ))}
        </div>
        <Selector className="sm:w-64" etiqueta="Programa" value={programa} onChange={(evento) => setPrograma(evento.target.value)} opciones={[{ valor: '', texto: 'Todos los programas' }, ...programasFiltro.map((id) => ({ valor: id, texto: nombrePrograma(id) }))]} />
        <Selector className="sm:w-48" etiqueta="Tipo" value={tipo} onChange={(evento) => setTipo(evento.target.value)} opciones={[{ valor: '', texto: 'Todos los tipos' }, ...Object.entries(nombresTipoEvento).map(([valor, texto]) => ({ valor, texto }))]} />
        {editables.length > 0 && actorId && <Boton className="sm:ml-auto" icono={CalendarPlus} onClick={() => setFormulario({ id: null, datos: vacio(programa && programasEditables.includes(programa) ? programa : editables[0].id) })}>Agendar fecha</Boton>}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-texto-2" aria-label="Leyenda de tipos">
        {Object.entries(estilosTipoEvento).map(([clave, estilo]) => {
          const Icono = estilo.icono;
          return <li key={clave} className="inline-flex items-center gap-1.5"><span className={unirClases('grid size-5 place-items-center rounded-md border', estilo.clase)}><Icono className="size-3" aria-hidden /></span>{nombresTipoEvento[clave as TipoEventoCalendario]}</li>;
        })}
      </ul>

      {vista === 'mes' ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-tarjeta border border-borde bg-superficie p-3 shadow-tarjeta sm:p-4" aria-label="Calendario mensual">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => setMes(addMonths(mes, -1))} className="grid size-11 place-items-center rounded-xl border border-borde text-texto-2 hover:bg-fondo" aria-label="Mes anterior"><ChevronLeft className="size-4" aria-hidden /></button>
              <h3 className="text-[15px] font-bold capitalize text-texto">{format(mes, 'MMMM yyyy', { locale: es })}</h3>
              <button type="button" onClick={() => setMes(addMonths(mes, 1))} className="grid size-11 place-items-center rounded-xl border border-borde text-texto-2 hover:bg-fondo" aria-label="Mes siguiente"><ChevronRight className="size-4" aria-hidden /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-bold uppercase tracking-wide text-texto-3">
              {diasSemana.map((dia) => <span key={dia} className="py-1">{dia}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dias.map((dia) => {
                const clave = format(dia, 'yyyy-MM-dd');
                const lista = porDia.get(clave) ?? [];
                const fuera = !isSameMonth(dia, mes);
                const esHoy = clave === hoy;
                const elegido = clave === diaSeleccionado;
                return (
                  <button key={clave} type="button" onClick={() => setDiaSeleccionado(clave)} aria-pressed={elegido}
                    aria-label={`${format(dia, "d 'de' MMMM", { locale: es })}: ${lista.length} ${lista.length === 1 ? 'fecha' : 'fechas'}`}
                    className={unirClases('flex min-h-14 flex-col items-stretch gap-1 rounded-lg border p-1 text-left transition-colors sm:min-h-24 sm:p-1.5',
                      elegido ? 'border-acento bg-acento-suave' : 'border-transparent hover:bg-fondo', fuera && 'opacity-45')}>
                    <span className={unirClases('cifra grid size-6 place-items-center self-start rounded-full text-[12px]', esHoy ? 'bg-primario font-bold text-white' : 'text-texto')}>{format(dia, 'd')}</span>
                    <span className="flex flex-wrap gap-0.5 sm:hidden">{lista.slice(0, 4).map((evento) => <span key={evento.id} className={unirClases('size-1.5 rounded-full', estilosTipoEvento[evento.tipo].punto, evento.estado === 'cancelado' && 'opacity-40')} />)}</span>
                    <span className="hidden flex-col gap-0.5 sm:flex">
                      {lista.slice(0, 2).map((evento) => {
                        const Icono = estilosTipoEvento[evento.tipo].icono;
                        return <span key={evento.id} className={unirClases('flex items-center gap-1 truncate rounded border-l-2 px-1 py-0.5 text-[10.5px] font-medium', estilosTipoEvento[evento.tipo].clase, evento.estado === 'cancelado' && 'line-through opacity-60')}><Icono className="size-3 shrink-0" aria-hidden /><span className="truncate">{evento.titulo}</span></span>;
                      })}
                      {lista.length > 2 && <span className="text-[10.5px] font-semibold text-texto-2">+{lista.length - 2} más</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="flex flex-col gap-2" aria-label="Fechas del día seleccionado">
            <h3 className="text-[14px] font-bold text-texto first-letter:uppercase">{format(parseISO(diaSeleccionado), "EEEE d 'de' MMMM", { locale: es })}</h3>
            {delDia.length === 0 ? <EstadoVacio icono={CalendarDays} titulo="Sin fechas este día" texto="Elige otro día o cambia a Próximas para ver la agenda." /> : delDia.map(tarjeta)}
          </section>
        </div>
      ) : (
        <section className="flex flex-col gap-2" aria-label="Próximas fechas">
          {proximos.length === 0 ? <EstadoVacio icono={CalendarDays} titulo="Sin próximas fechas" texto="Cuando se agende un examen, clase o entrega aparecerá aquí." /> : proximos.map(tarjeta)}
        </section>
      )}

      {formulario && (
        <FormularioEvento inicial={formulario.datos} programas={editables.map((item) => ({ id: item.id, nombre: item.nombre }))}
          titulo={formulario.id ? 'Editar fecha' : 'Agendar fecha'} alGuardar={guardar} alCerrar={() => setFormulario(null)} />
      )}
      <Confirmacion abierto={Boolean(cancelando)} alCerrar={() => setCancelando(null)} titulo="Cancelar fecha" peligro requiereMotivo textoConfirmar="Cancelar fecha"
        resumen={cancelando ? `${cancelando.titulo} del ${cancelando.fecha}. Se avisará a los estudiantes matriculados.` : ''}
        alConfirmar={(motivo) => {
          if (!cancelando || !actorId) return;
          const resultado = cancelarEvento(cancelando.id, actorId, motivo);
          if (resultado.ok) toast.info('Fecha cancelada', resultado.valor.titulo);
          else toast.error('No se pudo cancelar', resultado.error);
          setCancelando(null);
        }} />
    </div>
  );
}
