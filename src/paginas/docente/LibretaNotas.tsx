import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BookOpenCheck, CircleCheck, Clock3, Download, FileText, MessageSquarePlus, Plus, Users, X } from 'lucide-react';
import { SinProgramaAsignado } from '../../componentes/campus/SinProgramaAsignado';
import { Avatar } from '../../componentes/ui/Avatar';
import { Boton } from '../../componentes/ui/Boton';
import { Cajon } from '../../componentes/ui/Cajon';
import { ChipsFiltro } from '../../componentes/ui/ChipsFiltro';
import { Insignia, type TonoInsignia } from '../../componentes/ui/Insignia';
import { Selector } from '../../componentes/ui/Selector';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { useToast } from '../../componentes/ui/useToast';
import { useLibretas } from '../../hooks/useLibreta';
import { useProgramasDocente } from '../../hooks/useProgramasDocente';
import { descargarCsv } from '../../servicios/exportar';
import { agregarObservacion, filasExportablesLibreta, otorgarIntentoDocente, type FilaLibreta } from '../../servicios/notasDocente';
import { descargarPdfTabla } from '../../servicios/pdfCertificados';
import { useAcademicoStore } from '../../store/useAcademicoStore';
import { useCampusStore } from '../../store/useCampusStore';
import { useErickStore } from '../../store/useErickStore';
import { usePersonasStore } from '../../store/usePersonasStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { EstadoNota } from '../../tipos/academico';
import { formatearFecha, formatearFechaHora } from '../../utilidades/fechas';

type Filtro = 'todos' | 'en_curso' | 'aprobados' | 'bloqueados' | 'inactivos';

const estados: Record<EstadoNota, { texto: string; tono: TonoInsignia }> = {
  aprobado: { texto: 'Aprobado', tono: 'exito' },
  desaprobado: { texto: 'Desaprobado', tono: 'error' },
  pendiente: { texto: 'En curso', tono: 'info' },
};

const claseArea = 'w-full rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave';

function Nota({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="text-texto-3">-</span>;
  return <b className={`cifra ${valor >= 14 ? 'text-exito' : valor >= 11 ? 'text-texto' : 'text-error'}`}>{valor.toFixed(1)}</b>;
}

export default function LibretaNotas() {
  const { programaId = '' } = useParams();
  const persona = usePersonaSesion();
  const ids = useProgramasDocente();
  const programa = useAcademicoStore((estado) => estado.programas.find((item) => item.id === programaId));
  const temas = useAcademicoStore((estado) => estado.temas);
  const tims = useAcademicoStore((estado) => estado.tims);
  const intentos = useCampusStore((estado) => estado.intentos);
  const observaciones = useErickStore((estado) => estado.observacionesDocentes);
  const personas = usePersonasStore((estado) => estado.personas);
  const permitido = Boolean(programa) && ids.includes(programaId) && programa?.tipo !== 'mid';
  const libreta = useLibretas(permitido ? [programaId] : [])[programaId];
  const toast = useToast();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [elemento, setElemento] = useState('');
  const [motivo, setMotivo] = useState('');
  const [texto, setTexto] = useState('');

  const filas = useMemo(() => (libreta?.filas ?? []).filter((fila) => {
    if (filtro === 'en_curso') return fila.estado === 'pendiente';
    if (filtro === 'aprobados') return fila.estado === 'aprobado';
    if (filtro === 'bloqueados') return fila.bloqueados.length > 0;
    if (filtro === 'inactivos') return fila.sinActividad;
    return true;
  }), [libreta, filtro]);

  if (!programa || !permitido || !libreta) return <SinProgramaAsignado />;
  const todas = libreta.filas;
  const actual = todas.find((fila) => fila.persona.id === seleccion) ?? null;
  const nombreElemento = (id: string) => temas.find((tema) => tema.id === id)?.nombre ?? tims.find((tim) => tim.id === id)?.nombre ?? id;
  const notas = todas.map((fila) => fila.nota).filter((nota): nota is number => nota !== null);
  const archivo = `libreta-${programa.codigo.toLowerCase()}`;

  const abrir = (fila: FilaLibreta) => { setSeleccion(fila.persona.id); setElemento(fila.bloqueados[0] ?? ''); setMotivo(''); setTexto(''); };

  const otorgar = () => {
    if (!actual?.matricula || !persona) return;
    const resultado = otorgarIntentoDocente(persona.id, programaId, actual.matricula.id, elemento, 1, motivo);
    if (!resultado.ok) { toast.error('No se otorgó el intento', resultado.error); return; }
    toast.exito('Intento adicional otorgado', `${actual.persona.nombres} puede volver a rendir ${nombreElemento(elemento)}. La nota automática no cambia.`);
    setMotivo('');
  };

  const observar = () => {
    if (!actual || !persona) return;
    const resultado = agregarObservacion(persona.id, actual.persona.id, programaId, texto);
    if (!resultado.ok) { toast.error('No se guardó la observación', resultado.error); return; }
    toast.exito('Observación registrada');
    setTexto('');
  };

  const historial = actual ? intentos.filter((intento) => intento.personaId === actual.persona.id && (temas.some((tema) => tema.id === intento.ambitoId) || tims.some((tim) => tim.id === intento.ambitoId)))
    .filter((intento) => actual.matricula ? intento.matriculaId === actual.matricula.id : true).sort((a, b) => b.fin.localeCompare(a.fin)) : [];
  const notasDe = actual ? observaciones.filter((item) => item.personaId === actual.persona.id && item.programaId === programaId).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];

  return (
    <div className="flex flex-col gap-5">
      <Link to="/docente/cursos" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-acento"><ArrowLeft className="size-4" aria-hidden />Mis cursos</Link>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Estudiantes" valor={todas.length} icono={Users} tono="primario" />
        <TarjetaKpi etiqueta="Promedio" valor={notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '-'} icono={BookOpenCheck} tono="acento" />
        <TarjetaKpi etiqueta="Aprobados" valor={todas.filter((fila) => fila.estado === 'aprobado').length} icono={CircleCheck} tono="exito" />
        <TarjetaKpi etiqueta="Bloqueados" valor={todas.filter((fila) => fila.bloqueados.length > 0).length} icono={AlertTriangle} tono="error" />
      </div>
      <Tarjeta titulo="Libreta de notas" subtitulo="Las notas se calculan solas a partir de las evaluaciones; el docente acompaña con intentos y observaciones." icono={BookOpenCheck}
        acciones={<div className="flex flex-wrap gap-2">
          <Boton tamano="sm" variante="secundario" icono={Download} onClick={() => descargarCsv(archivo, filasExportablesLibreta(libreta))}>CSV</Boton>
          <Boton tamano="sm" variante="secundario" icono={FileText} onClick={() => descargarPdfTabla(`Libreta de notas · ${programa.nombre}`, filasExportablesLibreta(libreta), archivo)}>PDF</Boton>
        </div>}>
        <div className="flex flex-col gap-4">
          <ChipsFiltro etiqueta="Filtrar estudiantes" activo={filtro} alCambiar={setFiltro} opciones={[
            { valor: 'todos', texto: `Todos (${todas.length})` },
            { valor: 'en_curso', texto: 'En curso' },
            { valor: 'aprobados', texto: 'Aprobados' },
            { valor: 'bloqueados', texto: 'Bloqueados' },
            { valor: 'inactivos', texto: 'Sin actividad 14 días' },
          ]} />
          {filas.length === 0 && <p className="py-6 text-center text-[13px] text-texto-2">Ningún estudiante en este filtro.</p>}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-borde text-left text-[11.5px] uppercase tracking-wide text-texto-2">
                  <th className="py-2 pr-3 font-semibold">Estudiante</th>
                  {libreta.columnas.map((columna) => <th key={columna.id} className="px-2 py-2 text-center font-semibold">{columna.titulo}</th>)}
                  <th className="px-2 py-2 text-center font-semibold">Nota</th>
                  <th className="px-2 py-2 font-semibold">Estado</th>
                  <th className="px-2 py-2 text-center font-semibold">Avance</th>
                  <th className="px-2 py-2 text-center font-semibold">Intentos</th>
                  <th className="px-2 py-2 font-semibold">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.persona.id} className="cursor-pointer border-b border-borde last:border-0 hover:bg-fondo" onClick={() => abrir(fila)}>
                    <td className="py-2.5 pr-3">
                      <button type="button" className="flex items-center gap-2 text-left font-semibold text-texto" onClick={(evento) => { evento.stopPropagation(); abrir(fila); }}>
                        <Avatar nombres={fila.persona.nombres} apellidos={fila.persona.apellidos} tamano="sm" />{fila.persona.nombres} {fila.persona.apellidos}
                      </button>
                    </td>
                    {libreta.columnas.map((columna) => <td key={columna.id} className="px-2 text-center"><Nota valor={fila.notas[columna.id] ?? null} /></td>)}
                    <td className="px-2 text-center"><Nota valor={fila.nota} /></td>
                    <td className="px-2"><div className="flex flex-wrap gap-1"><Insignia tono={estados[fila.estado].tono}>{estados[fila.estado].texto}</Insignia>{fila.bloqueados.length > 0 && <Insignia tono="error" icono={AlertTriangle}>Bloqueo</Insignia>}</div></td>
                    <td className="cifra px-2 text-center">{fila.avance}%</td>
                    <td className="cifra px-2 text-center">{fila.intentos}</td>
                    <td className="px-2 text-texto-2">{fila.ultima ? formatearFecha(fila.ultima.slice(0, 10)) : 'Sin actividad'}{fila.sinActividad && <Clock3 className="ml-1 inline size-3.5 text-advertencia" aria-label="Sin actividad en 14 días" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 md:hidden">
            {filas.map((fila) => (
              <li key={fila.persona.id}>
                <button type="button" onClick={() => abrir(fila)} className="flex w-full flex-col gap-2 rounded-2xl border border-borde p-3 text-left">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2"><Avatar nombres={fila.persona.nombres} apellidos={fila.persona.apellidos} tamano="sm" /><span className="truncate text-[14px] font-semibold text-texto">{fila.persona.nombres} {fila.persona.apellidos}</span></span>
                    <Nota valor={fila.nota} />
                  </span>
                  <span className="flex flex-wrap gap-1"><Insignia tono={estados[fila.estado].tono}>{estados[fila.estado].texto}</Insignia>{fila.bloqueados.length > 0 && <Insignia tono="error" icono={AlertTriangle}>Bloqueo</Insignia>}{fila.sinActividad && <Insignia tono="advertencia" icono={Clock3}>Inactivo</Insignia>}</span>
                  <span className="grid grid-cols-3 gap-2 text-[12px] text-texto-2">
                    {libreta.columnas.slice(0, 3).map((columna, indice) => <span key={columna.id} title={columna.titulo}>{programa.tipo === 'diplomado' ? 'C' : 'M'}{indice + 1}: <Nota valor={fila.notas[columna.id] ?? null} /></span>)}
                  </span>
                  <span className="text-[12px] text-texto-2">Avance {fila.avance}% · {fila.intentos} intentos</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Tarjeta>

      <Cajon abierto={Boolean(actual)} alCerrar={() => setSeleccion(null)} etiqueta="Detalle del estudiante" lado="derecha" ancho="w-[92vw] max-w-[420px]" className="bg-superficie">
        {actual && (
          <div className="flex h-full flex-col gap-5 overflow-y-auto p-5">
            <div className="flex items-center gap-3">
              <Avatar nombres={actual.persona.nombres} apellidos={actual.persona.apellidos} />
              <div className="min-w-0 flex-1"><p className="truncate text-[16px] font-bold text-texto">{actual.persona.nombres} {actual.persona.apellidos}</p><p className="text-[12.5px] text-texto-2">{programa.nombre}</p></div>
              <button type="button" onClick={() => setSeleccion(null)} aria-label="Cerrar detalle" className="grid size-11 shrink-0 place-items-center rounded-xl text-texto-2 hover:bg-fondo md:size-9"><X className="size-[18px]" aria-hidden /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-fondo p-2"><p className="text-[11px] text-texto-2">Nota</p><Nota valor={actual.nota} /></div>
              <div className="rounded-xl bg-fondo p-2"><p className="text-[11px] text-texto-2">Avance</p><b className="cifra">{actual.avance}%</b></div>
              <div className="rounded-xl bg-fondo p-2"><p className="text-[11px] text-texto-2">Aprobados</p><b className="cifra">{actual.aprobados}/{actual.total}</b></div>
            </div>
            <section className="flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-texto">Otorgar intento extra</h3>
              {actual.bloqueados.length === 0 ? <p className="text-[12.5px] text-texto-2">El estudiante no tiene evaluaciones bloqueadas por intentos.</p> : (
                <>
                  <Selector etiqueta="Evaluación bloqueada" value={elemento} onChange={(evento) => setElemento(evento.target.value)} opciones={actual.bloqueados.map((id) => ({ valor: id, texto: nombreElemento(id) }))} />
                  <label htmlFor="motivo-intento" className="text-[13px] font-semibold">Motivo</label>
                  <textarea id="motivo-intento" rows={2} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} className={claseArea} placeholder="Por qué otorgas el intento (mínimo 10 caracteres)" />
                  <Boton icono={Plus} onClick={otorgar} disabled={!actual.matricula || motivo.trim().length < 10}>Otorgar 1 intento</Boton>
                </>
              )}
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-texto">Observaciones del docente</h3>
              <textarea aria-label="Nueva observación" rows={3} value={texto} onChange={(evento) => setTexto(evento.target.value)} className={claseArea} placeholder="Escribe una observación sobre el desempeño" />
              <Boton variante="secundario" icono={MessageSquarePlus} onClick={observar} disabled={texto.trim().length < 10}>Agregar observación</Boton>
              {notasDe.map((item) => (
                <article key={item.id} className="rounded-xl bg-fondo p-3 text-[12.5px]">
                  <p className="text-texto">{item.texto}</p>
                  <p className="mt-1 text-texto-2">{formatearFechaHora(item.fecha)} · {(() => { const autor = personas.find((otra) => otra.id === item.docenteId); return autor ? `${autor.nombres} ${autor.apellidos}` : item.docenteId; })()}</p>
                </article>
              ))}
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-texto">Historial de intentos</h3>
              {historial.length === 0 && <p className="text-[12.5px] text-texto-2">Aún no rinde evaluaciones.</p>}
              <ul className="flex flex-col divide-y divide-borde">
                {historial.slice(0, 12).map((intento) => (
                  <li key={intento.id} className="flex items-center justify-between gap-2 py-2 text-[12.5px]">
                    <span className="min-w-0"><span className="block truncate font-semibold text-texto">{nombreElemento(intento.ambitoId)}</span><span className="text-texto-2">{formatearFechaHora(intento.fin)}</span></span>
                    <Insignia tono={intento.aprobado ? 'exito' : 'error'}>{intento.nota.toFixed(1)}</Insignia>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </Cajon>
    </div>
  );
}
