import { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPlus, CalendarRange, ChevronLeft, ChevronRight, Hourglass, Lock, Pencil, ScrollText } from 'lucide-react';
import { Boton } from '../../componentes/ui/Boton';
import { BotonIcono } from '../../componentes/ui/BotonIcono';
import { Campo } from '../../componentes/ui/Campo';
import { Confirmacion } from '../../componentes/ui/Confirmacion';
import { ConPermiso } from '../../componentes/ui/ConPermiso';
import { EstadoError } from '../../componentes/ui/EstadoError';
import { Insignia } from '../../componentes/ui/Insignia';
import { Modal } from '../../componentes/ui/Modal';
import { Tabla, type ColumnaTabla } from '../../componentes/ui/Tabla';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { estadosPeriodo } from '../../datos/presentacionCuentas';
import { usePermiso } from '../../hooks/usePermiso';
import { aprobarCierre, iniciarCierre } from '../../servicios/compensacion';
import { actualizarDuracionCiclo, crearSiguienteCiclo } from '../../servicios/reglas';
import { useBitacoraStore } from '../../store/useBitacoraStore';
import { usePeriodosStore } from '../../store/usePeriodosStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { Periodo } from '../../tipos/reglas';
import { unirClases } from '../../utilidades/clases';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';

const coloresCiclo = ['bg-[#DBEAFE] text-[#1E3A8A]', 'bg-[#EDE9FE] text-[#4C1D95]', 'bg-[#FCE7F3] text-[#831843]', 'bg-[#E0F2F6] text-[#155E75]'];
const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function Periodos() {
  const periodos = usePeriodosStore((estado) => estado.periodos);
  const registros = useBitacoraStore((estado) => estado.registros);
  const actor = usePersonaSesion();
  const toast = useToast();
  const puedeEditar = usePermiso('periodos', 'editar');
  const puedeAprobar = usePermiso('periodos', 'aprobar');
  const [editando, setEditando] = useState<Periodo | null>(null);
  const [cerrando, setCerrando] = useState<Periodo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ordenados = useMemo(() => [...periodos].sort((a, b) => a.tipo.localeCompare(b.tipo) || a.fechaInicio.localeCompare(b.fechaInicio)), [periodos]);
  const historial = useMemo(() => registros.filter((registro) => registro.modulo === 'periodos').sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)), [registros]);
  const idActor = actor?.id ?? 'DEMO-U01';

  const ejecutar = (accion: () => { ok: boolean; error?: string }, exito: string) => {
    const resultado = accion();
    if (resultado.ok) {
      setError(null);
      toast.exito(exito);
    } else setError(resultado.error ?? 'No se pudo completar la acción.');
  };

  const columnas: ColumnaTabla<Periodo>[] = [
    { clave: 'id', titulo: 'Período', principalEnMovil: true, render: (fila) => <div><p className="cifra font-semibold">{fila.id}</p><p className="text-xs text-texto-2">{fila.nombre}</p></div> },
    { clave: 'tipo', titulo: 'Tipo', render: (fila) => (fila.tipo === 'ciclo' ? 'Ciclo de cálculo' : 'Evaluación mensual') },
    { clave: 'fechas', titulo: 'Fechas', valorOrden: (fila) => fila.fechaInicio, render: (fila) => <span className="text-[12.5px]">{formatearFecha(fila.fechaInicio)} - {formatearFecha(fila.fechaFin)}</span> },
    { clave: 'duracion', titulo: 'Duración', alinear: 'derecha', render: (fila) => <span className="cifra">{fila.duracionDias} d</span> },
    { clave: 'reglas', titulo: 'Reglas', render: (fila) => <span className="cifra text-[12.5px]">{fila.versionReglasId}</span> },
    { clave: 'estado', titulo: 'Estado', render: (fila) => <Insignia tono={estadosPeriodo[fila.estado].tono} icono={estadosPeriodo[fila.estado].icono}>{estadosPeriodo[fila.estado].etiqueta}</Insignia> },
  ];

  return (
    <div className="flex flex-col gap-5">
      {error && <EstadoError queOcurrio={error} comoSeguir="El cierre exige una corrida aprobada del período (Bonos y Simulador, fase siguiente). Los períodos cerrados no se modifican." />}
      <Tabla
        columnas={columnas}
        filas={ordenados}
        claveFila={(fila) => fila.id}
        accionesCabecera={<ConPermiso modulo="periodos" accion="crear"><Boton icono={CalendarPlus} onClick={() => ejecutar(() => crearSiguienteCiclo(idActor), 'Ciclo programado creado')}>Crear siguiente ciclo</Boton></ConPermiso>}
        accionesFila={(fila) => (
          <div className="flex flex-wrap justify-end gap-1">
            {fila.tipo === 'ciclo' && (fila.estado === 'abierto' || fila.estado === 'programado') && puedeEditar && <BotonIcono icono={Pencil} etiqueta={`Editar duración de ${fila.id}`} onClick={() => setEditando(fila)} />}
            {fila.estado === 'abierto' && puedeAprobar && <Boton tamano="sm" variante="secundario" icono={Hourglass} onClick={() => setCerrando(fila)}>Iniciar cierre</Boton>}
            {fila.estado === 'en_cierre' && puedeAprobar && <Boton tamano="sm" icono={Lock} onClick={() => ejecutar(() => aprobarCierre(fila.id, idActor), `${fila.id} cerrado`)}>Aprobar cierre</Boton>}
          </div>
        )}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Calendario periodos={periodos.filter((periodo) => periodo.tipo === 'ciclo')} />
        <Tarjeta titulo="Historial de cierres y cambios" icono={ScrollText}>
          <ul className="flex flex-col gap-3">
            {historial.slice(0, 10).map((registro) => (
              <li key={registro.id} className="border-l-2 border-acento pl-3">
                <p className="text-[13px] font-semibold">{registro.accion} <span className="cifra font-normal text-texto-2">{registro.referenciaId}</span></p>
                <p className="cifra text-xs text-texto-2">{formatearFechaHora(registro.fechaHora)} · {registro.actorId}{registro.motivo ? <span className="font-sans"> · {registro.motivo}</span> : null}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
      {editando && <DialogoDuracion periodo={editando} alCerrar={() => setEditando(null)} />}
      <Confirmacion
        abierto={Boolean(cerrando)}
        alCerrar={() => setCerrando(null)}
        titulo={`Iniciar cierre de ${cerrando?.id ?? ''}`}
        resumen="El período deja de recibir movimientos nuevos y pasa a revisión. Para cerrarlo debe existir una corrida aprobada."
        textoConfirmar="Iniciar cierre"
        alConfirmar={() => {
          if (cerrando) ejecutar(() => iniciarCierre(cerrando.id, idActor), `${cerrando.id} en cierre`);
          setCerrando(null);
        }}
      />
    </div>
  );
}

function DialogoDuracion({ periodo, alCerrar }: { periodo: Periodo; alCerrar: () => void }) {
  const actor = usePersonaSesion();
  const toast = useToast();
  const [dias, setDias] = useState(String(periodo.duracionDias));
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const guardar = () => {
    const resultado = actualizarDuracionCiclo(periodo.id, Number(dias), actor?.id ?? 'DEMO-U01', motivo);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.exito('Duración actualizada', `${periodo.id}: ${dias} días. Los ciclos programados siguientes se recorren.`);
    alCerrar();
  };
  return (
    <Modal abierto alCerrar={alCerrar} titulo={`Duración de ${periodo.id}`} descripcion="La duración del ciclo es configurable. Los períodos cerrados no se modifican." ancho="sm" pie={<><Boton variante="secundario" onClick={alCerrar}>Cancelar</Boton><Boton onClick={guardar}>Guardar</Boton></>}>
      <div className="flex flex-col gap-4">
        {error && <EstadoError queOcurrio={error} />}
        <Campo etiqueta="Duración en días" type="number" min={1} max={31} value={dias} onChange={(evento) => setDias(evento.target.value)} ayuda="Entre 1 y 31 días." />
        <Campo etiqueta="Motivo (obligatorio)" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
      </div>
    </Modal>
  );
}

function Calendario({ periodos }: { periodos: Periodo[] }) {
  const [mes, setMes] = useState(() => startOfMonth(parseISO('2026-11-01')));
  const dias = eachDayOfInterval({ start: mes, end: endOfMonth(mes) });
  const desplazamiento = (getDay(mes) + 6) % 7;
  const ciclos = [...periodos].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  const cicloDe = (fecha: string) => ciclos.findIndex((ciclo) => ciclo.fechaInicio <= fecha && ciclo.fechaFin >= fecha);
  return (
    <Tarjeta
      titulo="Calendario de ciclos"
      subtitulo={format(mes, "MMMM 'de' yyyy", { locale: es })}
      icono={CalendarRange}
      acciones={<div className="flex gap-1"><BotonIcono icono={ChevronLeft} etiqueta="Mes anterior" onClick={() => setMes(addMonths(mes, -1))} /><BotonIcono icono={ChevronRight} etiqueta="Mes siguiente" onClick={() => setMes(addMonths(mes, 1))} /></div>}
    >
      <div className="grid grid-cols-7 gap-1 text-center text-[12px]">
        {diasSemana.map((dia) => <span key={dia} className="py-1 text-[10.5px] font-bold uppercase text-texto-3">{dia}</span>)}
        {Array.from({ length: desplazamiento }, (_, indice) => <span key={`v-${indice}`} />)}
        {dias.map((dia) => {
          const fecha = format(dia, 'yyyy-MM-dd');
          const indice = cicloDe(fecha);
          const ciclo = ciclos[indice];
          const esInicio = ciclo?.fechaInicio === fecha;
          return (
            <span key={fecha} title={ciclo ? `${ciclo.id} · ${estadosPeriodo[ciclo.estado].etiqueta}` : 'Sin ciclo'} className={unirClases('cifra relative grid min-h-10 place-items-center rounded-lg', ciclo ? coloresCiclo[indice % coloresCiclo.length] : 'text-texto-3', fecha === '2026-11-11' && 'ring-2 ring-acento', esInicio && 'font-bold')}>
              {format(dia, 'd')}
            </span>
          );
        })}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2 text-[12px]">
        {ciclos.filter((ciclo) => ciclo.fechaFin >= format(mes, 'yyyy-MM-dd') && ciclo.fechaInicio <= format(endOfMonth(mes), 'yyyy-MM-dd')).map((ciclo) => (
          <li key={ciclo.id} className={unirClases('cifra rounded-lg px-2 py-1', coloresCiclo[ciclos.indexOf(ciclo) % coloresCiclo.length])}>{ciclo.id} · <span className="font-sans">{estadosPeriodo[ciclo.estado].etiqueta}</span></li>
        ))}
      </ul>
    </Tarjeta>
  );
}
